import { useId, type CSSProperties, type ReactNode } from 'react';

import { MOTION_PRESETS, Modal, Phrase, SCROLLBAR_VISIBILITIES, ScrollArea, type MotionPreset, type ScrollbarVisibility } from '@genelab/gassan';

import { useT } from '../i18n';
import { CUSTOM_PRESET_ID, PRESETS, TINTS, type Tint } from '../theme/engine';
import { resolveScheme, setTheme, themeFor, useTheme, type SchemeChoice } from '../theme/store';
import { to } from '../router';

const SCHEMES: readonly SchemeChoice[] = ['light', 'dark', 'system'];

/** 表示・背景の色づけ・動き・プライマリカラーを選ぶ部品。トップバーのポップオーバーとテーマのページの両方で使う。 */
export function ThemeControls(): ReactNode {
  const t = useT().common.theme;
  const { state, theme } = useTheme();
  const name = useId().replace(/:/g, '');
  const scheme = resolveScheme(state.scheme);
  const worst = theme.checks.reduce((min, c) => Math.min(min, c.ratio / c.min), Infinity);
  const allPass = theme.checks.every((c) => c.pass);

  return (
    <div className="s-theme-controls">
      <fieldset className="s-theme-group">
        <legend>{t.scheme}</legend>
        <Modal.Segmented
          value={state.scheme}
          onValueChange={(value) => setTheme({ scheme: value as SchemeChoice })}
          options={SCHEMES.map((value) => ({ value, label: t.schemes[value] }))}
        />
      </fieldset>

      <fieldset className="s-theme-group">
        <legend>{t.background}</legend>
        <Modal.Segmented
          value={state.tint}
          onValueChange={(value) => setTheme({ tint: value as Tint })}
          options={TINTS.map((value) => ({ value, label: t.tints[value] }))}
        />
      </fieldset>

      <fieldset className="s-theme-group">
        <legend>{t.motion}</legend>
        <Modal.Segmented
          value={state.motion}
          onValueChange={(value) => setTheme({ motion: value as MotionPreset })}
          options={MOTION_PRESETS.map((value) => ({ value, label: t.motions[value] }))}
        />
      </fieldset>

      <fieldset className="s-theme-group">
        <legend>{t.scrollbars}</legend>
        <Modal.Segmented
          value={state.scrollbars}
          onValueChange={(value) => setTheme({ scrollbars: value as ScrollbarVisibility })}
          options={SCROLLBAR_VISIBILITIES.map((value) => ({ value, label: t.scrollbarModes[value] }))}
        />
      </fieldset>

      <fieldset className="s-theme-group">
        <legend>{t.primary}</legend>
        <div className="s-swatch-grid">
          {[...PRESETS.map((p) => p.id), CUSTOM_PRESET_ID].map((id) => (
            <label key={id} className="s-swatch-option">
              <input
                type="radio"
                name={`${name}-preset`}
                value={id}
                checked={state.preset === id}
                onChange={() => setTheme({ preset: id })}
              />
              {/* 見本はその表示で実際に使う色（明度を調整した後の色）を出す */}
              <span
                className="s-swatch-dot"
                style={{ background: themeFor({ ...state, preset: id }, scheme).accent.accent }}
                aria-hidden="true"
              />
              <span>
                <Phrase>{t.presets[id]}</Phrase>
              </span>
            </label>
          ))}
        </div>
        {/* ネイティブの色の入力はポップアップがテーマに従わないので、gassan の ColorPicker（I-23）で選ぶ */}
        <div className="s-custom-color">
          <span id={`${name}-custom`}>{t.pickCustom}</span>
          <Modal.ColorPicker
            aria-labelledby={`${name}-custom`}
            value={state.custom}
            onValueChange={(custom) => setTheme({ preset: CUSTOM_PRESET_ID, custom })}
          />
        </div>
      </fieldset>

      <p className="s-theme-summary" data-pass={allPass ? '' : undefined} role="status">
        <Phrase>{allPass ? t.summaryPass(theme.checks.length, worst.toFixed(2)) : t.summaryFail}</Phrase>
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
  const t = useT().common.theme;
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
        <span className="s-theme-name">{t.button}</span>
      </button>

      <div id={panelId} popover="auto" className="s-theme-panel" role="dialog" aria-labelledby={titleId}>
        {/* 背の低い画面では窓の中だけを送る（自前のバー。U-35） */}
        <ScrollArea className="s-theme-scroll" viewportClassName="s-theme-body">
          <div className="s-theme-head">
            <h2 id={titleId}>{t.button}</h2>
            <button
              type="button"
              className="s-icon-btn"
              popoverTarget={panelId}
              popoverTargetAction="hide"
              aria-label={t.close}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ThemeControls />
          <p className="s-theme-more">
            <a href={to('/styles/theme')}>
              <Phrase>{t.more}</Phrase>
            </a>
          </p>
        </ScrollArea>
      </div>
    </>
  );
}
