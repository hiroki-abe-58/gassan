import { createContext, useContext, useSyncExternalStore, type ComponentType, type MouseEventHandler, type ReactNode } from 'react';

import { ButtonBody } from '../internal/button-body';
import { useLabels } from '../labels';
import { usePhrase } from '../phrase';
import { englishTemplateLabels, japaneseTemplateLabels, type TemplateLabels } from './labels';
import type { RegistrationLabels } from './registration-labels';

/**
 * テンプレートが描くリンクの props。Next.js の Link などを linkComponent に渡せる形。
 * ボタンの見た目のリンクは data-variant などの data-* も渡す（Link は a 要素へそのまま渡す）。
 */
export interface SiteLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
  /** 押したとき（アプリの枠では、狭い器で開いた案内の面を閉じる）。行き先へ移るのはリンクの既定の動き。 */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  [data: `data-${string}`]: string | undefined;
}

/** テンプレートが案内する行き先。渡さなかった行き先へのリンクは出さない。 */
export interface SiteLinks {
  home?: string;
  signIn?: string;
  signUp?: string;
  forgotPassword?: string;
  terms?: string;
  privacy?: string;
  help?: string;
  contact?: string;
  pricing?: string;
  faq?: string;
  changelog?: string;
  /** 稼働状況のページ（障害とメンテナンスの知らせ）。 */
  status?: string;
  /** 請求の設定（402 のページが「請求の設定を開く」で案内する）。 */
  billing?: string;
}

/** ヘッダとフッタに並べるリンク。 */
export interface SiteNavLink {
  label: ReactNode;
  href: string;
}

/** フッタのリンクの列（「製品」「会社」など）。 */
export interface SiteFooterColumn {
  title: string;
  links: readonly SiteNavLink[];
}

export interface SiteProviderProps {
  /** 製品の名前（「Atlas」）。ロゴを渡さないときは、この名前を文字で出す。 */
  name?: string;
  /** ロゴ。画像なら alt に製品の名前を入れる（ロゴの横に name は重ねて出さない）。 */
  logo?: ReactNode;
  links?: SiteLinks;
  /** リンクを描く部品（Next.js の Link など）。既定は a 要素。 */
  linkComponent?: ComponentType<SiteLinkProps>;
  /** テンプレートの文言。既定は GassanProvider の言語（labels.locale が ja で始まれば日本語、ほかは英語）。 */
  labels?: TemplateLabels;
  /** 業種ごとの登録（P-31）とその欄の文言。既定は labels と同じ選び方。 */
  registrationLabels?: RegistrationLabels;
  /** フッタの著作権の表記（「© 2026 Genelab Inc.」）。 */
  copyright?: ReactNode;
  /** 公開ページ（SiteLayout）のヘッダの案内（料金・よくある質問など）。 */
  nav?: readonly SiteNavLink[];
  /** 公開ページのフッタのリンクの列。 */
  footer?: readonly SiteFooterColumn[];
  /**
   * 日時を見せる時間帯（'Asia/Tokyo'。利用者のプロフィールの時間帯など）。既定は見ている人の時間帯。
   * 見ている人の時間帯はサーバーでは分からないので、渡さなければ、サーバーで描いてから hydration を終えるまでは UTC で描く。
   */
  timeZone?: string;
  children: ReactNode;
}

type SiteConfig = Omit<SiteProviderProps, 'children'>;

const SiteContext = createContext<SiteConfig>({});

/**
 * ページのテンプレートが共有する、製品の名前・ロゴ・行き先・文言。P-01。
 *
 * アプリのルートに 1 つ置けば、ログインからエラーページまで同じ名前とリンクで描かれる。
 * 各テンプレートの props で、ページごとに上書きできる。
 */
export function SiteProvider({ children, ...config }: SiteProviderProps): ReactNode {
  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
}

export interface Site extends Omit<SiteConfig, 'labels'> {
  links: SiteLinks;
  /** 解決したテンプレートの文言。 */
  labels: TemplateLabels;
}

/** テンプレートが読む、解決済みの設定。 */
export function useSite(): Site {
  const config = useContext(SiteContext);
  const { locale } = useLabels();
  const labels = config.labels ?? (locale.toLowerCase().startsWith('ja') ? japaneseTemplateLabels : englishTemplateLabels);
  return { ...config, links: config.links ?? {}, labels };
}

const subscribeNothing = (): (() => void) => () => undefined;

/**
 * 日時を見せる時間帯。SiteProvider の timeZone か、無ければ見ている人の時間帯（undefined）。
 * サーバーと hydration の間は UTC にする。サーバー（多くは UTC）とブラウザで時間帯が違っても文字が食い違わず、
 * hydration を終えたら見ている人の時間帯で描き直す。ブラウザだけで描くときは初めから見ている人の時間帯。
 */
export function useTimeZone(): string | undefined {
  const { timeZone } = useContext(SiteContext);
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return timeZone ?? (hydrated ? undefined : 'UTC');
}

/**
 * linkComponent（無ければ a 要素）でリンクを描く。
 *
 * SiteLink は a 要素そのものの代わりなので、aria-current と data-* は濾過せずにそのまま渡す
 * （gassan の部品の器ではないので、守るべき予約の data-* が無い。ボタンの見た目の data-variant は SiteButtonLink が渡す）。
 */
export function SiteLink({ href, className, children, ...attributes }: SiteLinkProps): ReactNode {
  const { linkComponent: Link } = useContext(SiteContext);
  if (Link) {
    return (
      <Link href={href} className={className} {...attributes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...attributes}>
      {children}
    </a>
  );
}

/** ボタンの見た目のリンク（行き先が別のページのとき）。役割はリンクのまま。U-01 の ButtonLink を SiteLink で描く。 */
export function SiteButtonLink({ href, variant = 'secondary', block = false, children }: { href: string; variant?: 'primary' | 'secondary' | 'tertiary'; block?: boolean; children: ReactNode }): ReactNode {
  return (
    <SiteLink href={href} className="g-btn" data-variant={variant} data-block={block ? '' : undefined}>
      <ButtonBody>{children}</ButtonBody>
    </SiteLink>
  );
}

/** ロゴか製品の名前を、ホームへのリンクとして出す。どちらも無ければ何も出さない。 */
export function Brand(): ReactNode {
  const { name, logo, links } = useSite();
  if (!logo && !name) return null;
  const mark = logo ?? <span className="g-brand-name">{name}</span>;
  return links.home ? (
    <SiteLink href={links.home} className="g-brand">
      {mark}
    </SiteLink>
  ) : (
    <span className="g-brand">{mark}</span>
  );
}

/**
 * ページの足元（footer）。children（SiteLayout の列）の下に、利用規約・プライバシーポリシー・ヘルプ・著作権の行を置く。
 * 行き先は渡されたものだけを並べる。置くものが何も無ければ footer ごと出さない（空のランドマークを作らない）。
 */
export function PageFooter({ className, children }: { className: string; children?: ReactNode }): ReactNode {
  const { links, labels, copyright } = useSite();
  const phrase = usePhrase();
  const items = [
    links.terms ? { href: links.terms, label: labels.common.terms } : null,
    links.privacy ? { href: links.privacy, label: labels.common.privacy } : null,
    links.help ? { href: links.help, label: labels.common.help } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);
  const legal = items.length > 0 || Boolean(copyright);
  if (!children && !legal) return null;
  return (
    <footer className={className}>
      {children}
      {legal ? (
        <div className="g-legal">
          {items.length > 0 ? (
            <ul className="g-legal-links">
              {items.map((item) => (
                <li key={item.href}>
                  <SiteLink href={item.href}>{phrase(item.label)}</SiteLink>
                </li>
              ))}
            </ul>
          ) : null}
          {copyright ? <p className="g-legal-copyright">{copyright}</p> : null}
        </div>
      ) : null}
    </footer>
  );
}
