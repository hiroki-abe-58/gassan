import { useEffect, useId, useRef, type ReactNode } from 'react';

import { ScrollArea } from '@genelab/gassan';

import { LANGS, LANG_NAMES, useLang, useT } from '../i18n';
import { to, useRoute } from '../router';

/**
 * トップバーの言語の切り替え。
 *
 * 言語ごとにリンク（URL）を持たせる。選んだ言語のページを共有でき、戻るボタンで前の言語に戻れる。
 * 言語の名前はその言語自身で書き（LANG_NAMES）、lang を付ける。読めない言語で開いてしまった人も、
 * 地球の印と自分の言語の名前を頼りに戻れるように。テーマと同じく、背景を不活性にしないポップオーバー。
 */
export function LangPicker(): ReactNode {
  const t = useT().common.lang;
  const current = useLang();
  const { segments } = useRoute();
  const panelId = `lang-panel-${useId().replace(/[^\w-]/g, '')}`;
  const titleId = `${panelId}-title`;
  const panel = useRef<HTMLDivElement>(null);
  const path = `/${segments.join('/')}`;

  // 言語を選んだら閉じる。リンクの遷移ではポップオーバーは閉じない
  useEffect(() => {
    const el = panel.current;
    if (el?.matches(':popover-open')) el.hidePopover();
  }, [current]);

  return (
    <>
      <button type="button" className="s-theme-btn s-lang-btn" popoverTarget={panelId}>
        <svg className="s-lang-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        <span className="s-sr-only">{t.button}: </span>
        <span className="s-lang-name">{LANG_NAMES[current]}</span>
      </button>

      <div
        id={panelId}
        ref={panel}
        popover="auto"
        className="s-theme-panel s-lang-panel"
        role="dialog"
        aria-labelledby={titleId}
      >
        <ScrollArea className="s-theme-scroll" viewportClassName="s-theme-body">
          <h2 id={titleId} className="s-lang-title">
            {t.title}
          </h2>
          <ul className="s-lang-list">
            {LANGS.map((lang) => (
              <li key={lang}>
                <a
                  className="s-lang-option"
                  href={to(path, lang)}
                  hrefLang={lang}
                  lang={lang}
                  aria-current={lang === current ? 'true' : undefined}
                >
                  {LANG_NAMES[lang]}
                </a>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </>
  );
}
