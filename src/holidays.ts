/**
 * 日本の祝日と休日。I-16。
 *
 * 「国民の祝日に関する法律」（1948 年施行）の改正を年ごとに当てはめて計算する。表を持たないので、
 * 法の決まりが変わらない限り先の年も引ける。
 *   - 移る祝日（ハッピーマンデー。2000 年〜・2003 年〜）と、東京 2020 大会の特例（2020・2021 年）
 *   - 振替休日（1973-04-12〜）。2006 年までは「日曜の翌日」、2007 年からは「後ろの最初の休日でない日」
 *   - 国民の休日（1985-12-27〜）。祝日に挟まれた日。2006 年までは日曜を除く
 *   - 一度きりの休日（結婚の儀・大喪の礼・即位の礼など）
 * 春分の日・秋分の日は広く使われている近似式で求める。正式な日は国立天文台が前年の 2 月に公表するので、
 * 遠い先の年は公表を待って確かめる。引ける範囲は 1949〜2150 年で、範囲の外は祝日が無いものとして扱う。
 * 日付は 'YYYY-MM-DD'。計算は UTC の 0 時で行い、端末の時差の影響を受けない。
 */

export type JapaneseHolidayKey =
  | 'newYear'
  | 'comingOfAge'
  | 'foundation'
  | 'emperorBirthday'
  | 'vernalEquinox'
  | 'showa'
  | 'greenery'
  | 'constitution'
  | 'children'
  | 'marine'
  | 'mountain'
  | 'respectForAged'
  | 'autumnalEquinox'
  | 'healthSports'
  | 'sports'
  | 'culture'
  | 'laborThanksgiving'
  | 'substitute'
  | 'citizens'
  | 'wedding1959'
  | 'funeral1989'
  | 'enthronementCeremony'
  | 'wedding1993'
  | 'enthronement';

export interface Holiday {
  /** 'YYYY-MM-DD' */
  date: string;
  key: JapaneseHolidayKey;
  /** 表示名（渡した名前の表から引いたもの）。 */
  name: string;
}

/** 日付から祝日の名前を引く関数。祝日でなければ null。カレンダーの holidays と labels.holidays が受ける形。 */
export type HolidayResolver = (date: string) => string | null;

/** 祝日の名前。日本語は法律の表記、英語は内閣府の英語版の表記に合わせた。 */
export const japaneseHolidayNames: Record<'ja' | 'en', Record<JapaneseHolidayKey, string>> = {
  ja: {
    newYear: '元日',
    comingOfAge: '成人の日',
    foundation: '建国記念の日',
    emperorBirthday: '天皇誕生日',
    vernalEquinox: '春分の日',
    showa: '昭和の日',
    greenery: 'みどりの日',
    constitution: '憲法記念日',
    children: 'こどもの日',
    marine: '海の日',
    mountain: '山の日',
    respectForAged: '敬老の日',
    autumnalEquinox: '秋分の日',
    healthSports: '体育の日',
    sports: 'スポーツの日',
    culture: '文化の日',
    laborThanksgiving: '勤労感謝の日',
    substitute: '振替休日',
    citizens: '国民の休日',
    wedding1959: '皇太子明仁親王の結婚の儀',
    funeral1989: '昭和天皇の大喪の礼',
    enthronementCeremony: '即位礼正殿の儀',
    wedding1993: '皇太子徳仁親王の結婚の儀',
    enthronement: '天皇の即位の日',
  },
  en: {
    newYear: "New Year's Day",
    comingOfAge: 'Coming of Age Day',
    foundation: 'National Foundation Day',
    emperorBirthday: "The Emperor's Birthday",
    vernalEquinox: 'Vernal Equinox Day',
    showa: 'Showa Day',
    greenery: 'Greenery Day',
    constitution: 'Constitution Memorial Day',
    children: "Children's Day",
    marine: 'Marine Day',
    mountain: 'Mountain Day',
    respectForAged: 'Respect for the Aged Day',
    autumnalEquinox: 'Autumnal Equinox Day',
    healthSports: 'Health and Sports Day',
    sports: 'Sports Day',
    culture: 'Culture Day',
    laborThanksgiving: 'Labor Thanksgiving Day',
    substitute: 'Substitute Holiday',
    citizens: "Citizens' Holiday",
    wedding1959: 'Wedding of Crown Prince Akihito',
    funeral1989: 'Funeral of Emperor Showa',
    enthronementCeremony: 'Ceremony of the Enthronement',
    wedding1993: 'Wedding of Crown Prince Naruhito',
    enthronement: 'Accession of the Emperor',
  },
};

/** 一度きりの休日。 */
const SPECIAL: Readonly<Record<string, JapaneseHolidayKey>> = {
  '1959-04-10': 'wedding1959',
  '1989-02-24': 'funeral1989',
  '1990-11-12': 'enthronementCeremony',
  '1993-06-09': 'wedding1993',
  '2019-05-01': 'enthronement',
  '2019-10-22': 'enthronementCeremony',
};

const FIRST_YEAR = 1949;
const LAST_YEAR = 2150;

const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (year: number, month: number, day: number): string => `${String(year)}-${pad(month)}-${pad(day)}`;
const weekday = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();
function shift(date: string, days: number): string {
  const time = new Date(`${date}T00:00:00Z`);
  time.setUTCDate(time.getUTCDate() + days);
  return time.toISOString().slice(0, 10);
}

/** その月の第 n 月曜日の日。 */
function nthMonday(year: number, month: number, n: number): number {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((8 - first) % 7) + (n - 1) * 7;
}

/**
 * 春分日・秋分日の近似式。
 * 1979 年までの閏年の補正は 0 の側へ切り捨てる（floor ではない）。floor にすると 1973 年の秋分が 1 日ずれる。
 */
function equinox(year: number, constants: readonly [number, number, number]): number {
  const [until1979, until2099, after2099] = constants;
  const constant = year <= 1979 ? until1979 : year <= 2099 ? until2099 : after2099;
  const leap = year <= 1979 ? Math.trunc((year - 1983) / 4) : Math.floor((year - 1980) / 4);
  return Math.floor(constant + 0.242194 * (year - 1980) - leap);
}
const vernal = (year: number): number => equinox(year, [20.8357, 20.8431, 21.851]);
const autumnal = (year: number): number => equinox(year, [23.2588, 23.2488, 24.2488]);

/** 法律が日付で定める祝日（振替休日と国民の休日を除く）。 */
function statutory(year: number): Map<string, JapaneseHolidayKey> {
  const out = new Map<string, JapaneseHolidayKey>();
  // 否定で書く。year が NaN（日付でない文字列を渡された）でも、範囲の外として空を返す（例外にしない）。
  if (!(year >= FIRST_YEAR && year <= LAST_YEAR)) return out;
  const add = (month: number, day: number, key: JapaneseHolidayKey): void => {
    out.set(iso(year, month, day), key);
  };
  add(1, 1, 'newYear');
  add(1, year >= 2000 ? nthMonday(year, 1, 2) : 15, 'comingOfAge');
  if (year >= 1967) add(2, 11, 'foundation');
  if (year >= 2020) add(2, 23, 'emperorBirthday');
  add(3, vernal(year), 'vernalEquinox');
  add(4, 29, year <= 1988 ? 'emperorBirthday' : year <= 2006 ? 'greenery' : 'showa');
  add(5, 3, 'constitution');
  if (year >= 2007) add(5, 4, 'greenery');
  add(5, 5, 'children');
  // 東京 2020 大会の特例。海の日・スポーツの日・山の日を、開会式と閉会式の前後へ移した。
  const olympic = year === 2020 || year === 2021;
  if (year >= 1996) {
    if (olympic) add(7, year === 2020 ? 23 : 22, 'marine');
    else add(7, year >= 2003 ? nthMonday(year, 7, 3) : 20, 'marine');
  }
  if (year >= 2016) add(8, year === 2020 ? 10 : year === 2021 ? 8 : 11, 'mountain');
  if (year >= 1966) add(9, year >= 2003 ? nthMonday(year, 9, 3) : 15, 'respectForAged');
  add(9, autumnal(year), 'autumnalEquinox');
  if (year >= 1966) {
    if (olympic) add(7, year === 2020 ? 24 : 23, 'sports');
    else add(10, year >= 2000 ? nthMonday(year, 10, 2) : 10, year >= 2020 ? 'sports' : 'healthSports');
  }
  add(11, 3, 'culture');
  add(11, 23, 'laborThanksgiving');
  if (year >= 1989 && year <= 2018) add(12, 23, 'emperorBirthday');
  for (const [date, key] of Object.entries(SPECIAL)) if (date.startsWith(`${String(year)}-`)) out.set(date, key);
  return out;
}

const cache = new Map<number, ReadonlyMap<string, JapaneseHolidayKey>>();

/** その年の祝日・休日（日付 → 種類）。年の境目をまたぐ振替と国民の休日のために、前後の年の祝日も見る。 */
function yearTable(year: number): ReadonlyMap<string, JapaneseHolidayKey> {
  const hit = cache.get(year);
  if (hit) return hit;
  const law = new Map([...statutory(year - 1), ...statutory(year), ...statutory(year + 1)]);
  const all = new Map(law);
  // 国民の休日: 前日と翌日が国民の祝日で、本人は祝日でない日。2006 年までは日曜を除く。
  for (const date of law.keys()) {
    const between = shift(date, 1);
    if (between < '1985-12-27' || law.has(between) || !law.has(shift(between, 1))) continue;
    if (between < '2007-01-01' && weekday(between) === 0) continue;
    all.set(between, 'citizens');
  }
  // 振替休日: 祝日が日曜なら、2006 年までは翌日（その日がすでに国民の休日なら振替休日として数える）、
  // 2007 年からは後ろの最初の休日でない日。
  for (const date of [...law.keys()].sort()) {
    if (weekday(date) !== 0 || date < '1973-04-12') continue;
    let substitute = shift(date, 1);
    if (date >= '2007-01-01') {
      while (all.has(substitute)) substitute = shift(substitute, 1);
    } else if (all.has(substitute)) {
      if (all.get(substitute) === 'citizens') all.set(substitute, 'substitute');
      continue;
    }
    all.set(substitute, 'substitute');
  }
  const prefix = `${String(year)}-`;
  const table = new Map([...all].filter(([date]) => date.startsWith(prefix)).sort(([a], [b]) => (a < b ? -1 : 1)));
  cache.set(year, table);
  return table;
}

/**
 * その日が日本の祝日・休日なら、その種類と名前。違えば null。
 * 名前は既定で日本語。`japaneseHolidayNames.en` か、同じ形の表を渡せば差し替えられる。
 */
export function japaneseHoliday(
  date: string,
  names: Record<JapaneseHolidayKey, string> = japaneseHolidayNames.ja,
): Holiday | null {
  const key = yearTable(Number(date.slice(0, 4))).get(date);
  return key ? { date, key, name: names[key] } : null;
}

/** その年の祝日・休日を日付順に。 */
export function japaneseHolidays(
  year: number,
  names: Record<JapaneseHolidayKey, string> = japaneseHolidayNames.ja,
): Holiday[] {
  return [...yearTable(year)].map(([date, key]) => ({ date, key, name: names[key] }));
}

/** 名前の表を決めて、カレンダーが受ける形（日付 → 名前）にする。labels.holidays の既定にも使う。 */
export function japaneseHolidayResolver(
  names: Record<JapaneseHolidayKey, string> = japaneseHolidayNames.ja,
): HolidayResolver {
  return (date) => japaneseHoliday(date, names)?.name ?? null;
}
