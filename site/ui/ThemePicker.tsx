import { useId, type CSSProperties, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { CUSTOM_PRESET_ID, PRESETS } from '../theme/engine';
import { resolveScheme, setTheme, themeFor, useTheme, type SchemeChoice } from '../theme/store';
import { to } from '../router';

const SCHEMES: readonly { value: SchemeChoice; label: string }[] = [
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
  { value: 'system', label: 'OS に合わせる' },
];

/** 表示とプライマリカラーを選ぶ部品。トップバーのポップオーバーとテーマのページの両方で使う。 */
export function ThemeControls(): ReactNode {
  const { state, theme } = useTheme();
  const name = useId().replace(/:/g, '');
  const scheme = resolveScheme(state.scheme);
  const worst = theme.checks.reduce((min, c) => Math.min(min, c.ratio / c.min), Infinity);
  const allPass = theme.checks.every((c) => c.pass);

  return (
    <div className="s-theme-controls">
      <fieldset className="s-theme-group">
        <legend>表示</legend>
        <div className="s-segmented">
          {SCHEMES.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={`${name}-scheme`}
                value={option.value}
                checked={state.scheme === option.value}
                onChange={() => setTheme({ scheme: option.value })}
              />
              <span>
                <Phrase>{option.label}</Phrase>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="s-theme-group">
        <legend>プライマリカラー</legend>
        <div className="s-swatch-grid">
          {[...PRESETS.map((p) => ({ id: p.id, label: p.label })), { id: CUSTOM_PRESET_ID, label: '任意の色' }].map(
            (option) => (
              <label key={option.id} className="s-swatch-option">
                <input
                  type="radio"
                  name={`${name}-preset`}
                  value={option.id}
                  checked={state.preset === option.id}
                  onChange={() => setTheme({ preset: option.id })}
                />
                {/* 見本はその表示で実際に使う色（明度を調整した後の色）を出す */}
                <span
                  className="s-swatch-dot"
                  style={{ background: themeFor({ ...state, preset: option.id }, scheme).accent.accent }}
                  aria-hidden="true"
                />
                <span>
                  <Phrase>{option.label}</Phrase>
                </span>
              </label>
            ),
          )}
        </div>
        <label className="s-custom-color">
          <span>任意の色を選ぶ</span>
          <input
            type="color"
            value={state.custom}
            onChange={(event) => setTheme({ preset: CUSTOM_PRESET_ID, custom: event.target.value })}
          />
          <code>{state.custom}</code>
        </label>
      </fieldset>

      <p className="s-theme-summary" data-pass={allPass ? '' : undefined} role="status">
        <Phrase>
          {allPass
            ? `文字と塗りの ${String(theme.checks.length)} 項目すべてが WCAG の基準を満たしている（いちばん厳しい組でも基準の ${worst.toFixed(2)} 倍）`
            : '基準を満たさない組がある'}
        </Phrase>
      </p>
    </div>
  );
}

/**
 * トップバーのテーマ切り替え。
 *
 * モーダルではなくポップオーバー（popover 属性）にしている。一時的な選択で、
 * 選びながら背後のページの色が変わるのを見たいので、背景を不活性にする理由が無い（§1-1）。
 * Esc と外側のクリックで閉じるのはブラウザが行う。
 */
export function ThemePicker(): ReactNode {
  const { theme } = useTheme();
  const panelId = `theme-panel-${useId().replace(/[^\w-]/g, '')}`;
  const titleId = `${panelId}-title`;

  return (
    <>
      <button
        type="button"
        className="s-theme-btn"
        popoverTarget={panelId}
        style={{ '--s-theme-dot': theme.accent.accent } as CSSProperties}
      >
        <span className="s-theme-dot" aria-hidden="true" />
        テーマ
      </button>

      <div id={panelId} popover="auto" className="s-theme-panel" role="dialog" aria-labelledby={titleId}>
        <div className="s-theme-head">
          <h2 id={titleId}>テーマ</h2>
          <button
            type="button"
            className="s-icon-btn"
            popoverTarget={panelId}
            popoverTargetAction="hide"
            aria-label="閉じる"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <ThemeControls />
        <p className="s-theme-more">
          <a href={to('/styles/theme')}>
            <Phrase>選んだ色をどう調整しているか →</Phrase>
          </a>
        </p>
      </div>
    </>
  );
}
