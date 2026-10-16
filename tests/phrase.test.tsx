/**
 * 日本語の文節折り返し（W-01〜W-05）。
 *
 * 「プロフィールを編｜集」「プロフィール｜を編集」を出さず、「プロフィールを｜編集」でだけ改行する。
 * 改行の位置そのもの（レイアウト）は jsdom では測れないので、ここで固定するのは
 * 「どこに改行の機会を置くか」「名前と文字列を変えないか」「どこに効かせるか」の 3 つ。
 * 実ブラウザでの改行位置は VERIFICATION.md の検品票と、ドキュメントサイトの比較ページで確かめる。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GassanProvider, Modal, Phrase, splitPhrases } from '../src';
import { renderModal } from './utils';

const noop = (): void => {};

describe('W-01 文節に分ける（splitPhrases）', () => {
  const cases: readonly [string, string[]][] = [
    ['プロフィールを編集', ['プロフィールを', '編集']],
    ['同意して続ける', ['同意して', '続ける']],
    ['最後まで読んでください', ['最後まで', '読んでください']],
    ['本文を最後までお読みください。', ['本文を', '最後まで', 'お読みください。']],
    ['更新後の規約に同意します', ['更新後の', '規約に', '同意します']],
    ['データを削除すると元に戻せません', ['データを', '削除すると', '元に', '戻せません']],
    ['「同意しない」を選んだ場合は閉じます', ['「同意しない」を', '選んだ', '場合は', '閉じます']],
    ['3月が最大の120万円。4月以降は横ばい。', ['3月が', '最大の', '120万円。', '4月以降は', '横ばい。']],
    ['変更はすぐに反映されます', ['変更は', 'すぐに', '反映されます']],
    ['規約について確認することができます', ['規約について', '確認することが', 'できます']],
  ];

  // ループで it() を作らない。check-trace はテストを it( の出現で数えるので、件数が文書とずれる。
  it('代表的な UI の文言を、読んで自然な位置で文節に分ける', () => {
    expect(cases.map(([input]) => splitPhrases(input))).toEqual(cases.map(([, expected]) => expected));
  });

  it('助詞を行頭に送らない（「プロフィール｜を編集」にしない）', () => {
    for (const text of ['プロフィールを編集', 'メンバーを招待', '下書きを削除']) {
      for (const phrase of splitPhrases(text).slice(1)) {
        expect(phrase).not.toMatch(/^[をはがにでともへのや]/);
      }
    }
  });

  it('句読点と閉じ括弧を行頭に置かない（禁則）', () => {
    const text = '保存しました。次へ進みます、よろしいですか（任意）。';
    for (const phrase of splitPhrases(text).slice(1)) {
      expect(phrase).not.toMatch(/^[、。）」』]/);
    }
  });

  it('複合語の中の送り仮名では折らない（置き｜配・読み｜込み）', () => {
    expect(splitPhrases('置き配の写真')).toEqual(['置き配の', '写真']);
    expect(splitPhrases('読み込みに失敗しました')).toEqual(['読み込みに', '失敗しました']);
  });

  it('接頭辞と連体詞は後ろの語に付ける（ご｜注文・この｜内容）', () => {
    expect(splitPhrases('ご注文の手続き')).toEqual(['ご注文の', '手続き']);
    expect(splitPhrases('この内容で保存')).toEqual(['この内容で', '保存']);
  });

  it('つなぎ直すと必ず元の文字列に戻る（文字を足さない・削らない）', () => {
    const texts = ['プロフィールを編集', 'JPEG / PNG、1枚まで', '2026年度 第3四半期 東北エリア', '（任意）を選ぶ'];
    for (const text of texts) expect(splitPhrases(text).join('')).toBe(text);
  });

  it('W-04: かなを含まない文字列（英語・中国語）には手を出さない', () => {
    expect(splitPhrases('Agree and continue')).toEqual(['Agree and continue']);
    expect(splitPhrases('编辑个人资料')).toEqual(['编辑个人资料']);
    expect(splitPhrases('12,345')).toEqual(['12,345']);
  });
});

describe('W-03 名前と文字列を変えない', () => {
  it('ボタンの名前と文字列は元のまま（<wbr> も空白も名前に混ざらない）', () => {
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary">プロフィールを編集</Modal.Button>
        </Modal.Footer>
      ),
    });
    const button = screen.getByRole('button', { name: 'プロフィールを編集' });
    expect(button).toHaveAccessibleName('プロフィールを編集');
    expect(button.textContent).toBe('プロフィールを編集');
  });

  it('<wbr> には必ず aria-hidden を付ける（Chrome は素の <wbr> を名前の空白として読む）', () => {
    // 実測: Chrome のアクセシビリティツリーで <button>プロフィールを<wbr>編集</button> の名前は
    // 「プロフィールを 編集」になる。jsdom はこれを再現しないので、属性そのものを固定する。
    const { container } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>利用規約の更新について確認する</Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Modal.Button variant="primary">同意して続ける</Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    const breaks = container.querySelectorAll('wbr');
    expect(breaks.length).toBeGreaterThan(0);
    for (const wbr of breaks) expect(wbr).toHaveAttribute('aria-hidden', 'true');
  });

  it('ダイアログの名前（タイトル）は元のまま', () => {
    render(
      <Modal.Root open onOpenChange={noop}>
        <Modal.Header>
          <Modal.Title>利用規約の更新</Modal.Title>
        </Modal.Header>
      </Modal.Root>,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('利用規約の更新');
  });

  it('ゼロ幅スペースを入れない（コピーした文字列が変わらない）', () => {
    const { container } = renderModal({
      children: (
        <Modal.Footer note="変更はすぐに反映されます">
          <Modal.Button variant="primary">同意して続ける</Modal.Button>
        </Modal.Footer>
      ),
    });
    const zeroWidth = String.fromCharCode(0x200b);
    expect(container.innerHTML).not.toContain(zeroWidth);
  });
});

describe('W-05 効かせる場所', () => {
  it('ボタン・タイトル・説明・フッタの補足が文節で折れる', () => {
    const { container } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>プロフィールを編集</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>変更はすぐに反映されます</Modal.Description>
          </Modal.Body>
          <Modal.Footer note="あとから変更できます">
            <Modal.Button variant="primary">同意して続ける</Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    for (const selector of ['.g-title-text', '.g-desc', '.g-footer-note', '.g-btn-label']) {
      expect(container.querySelector(`${selector} .g-phrase wbr`)).not.toBeNull();
    }
  });

  it('表のセルの文字列にも効く（素の HTML 要素の中まで潜る）', () => {
    const { container } = renderModal({
      children: (
        <Modal.Body>
          <Modal.Table label="記録">
            <table>
              <tbody>
                <tr>
                  <td>プロフィールを編集した</td>
                  <td>
                    <code>setOpen(を)</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </Modal.Table>
        </Modal.Body>
      ),
    });
    expect(container.querySelector('td .g-phrase wbr')).not.toBeNull();
    // コードは見たままの文字列でなければならない。中には潜らない。
    expect(container.querySelector('code .g-phrase')).toBeNull();
  });

  it('グラフの名前と傾向の要約にも効く', () => {
    const { container } = renderModal({
      children: (
        <Modal.Body>
          <Modal.Chart label="月別の売上の推移" summary="3月が最大の120万円。4月以降は横ばい。">
            <svg />
          </Modal.Chart>
        </Modal.Body>
      ),
    });
    expect(container.querySelector('.g-chart-caption .g-phrase')).not.toBeNull();
    expect(container.querySelector('.g-chart-summary .g-phrase wbr')).not.toBeNull();
  });

  it('同意文・ゲートの理由・チップ・スイッチ・ラベル・エラーにも効く', () => {
    const { container } = renderModal({
      children: (
        <Modal.Body>
          <Modal.Consent gate="terms">更新後の規約に同意します</Modal.Consent>
          <Modal.GateStatus />
          <Modal.Chips label="分野" options={[{ value: 'a', label: 'アクセシビリティを学ぶ' }]} value={[]} onChange={noop} />
          <Modal.Switch checked={false} onCheckedChange={noop}>
            新着があれば知らせる
          </Modal.Switch>
          <Modal.Field label="表示名を入力" error="表示名を入力してください" help="全角で入力します">
            {(control) => <input {...control} />}
          </Modal.Field>
        </Modal.Body>
      ),
    });
    for (const selector of ['.g-consent', '.g-gate-status', '.g-chip', '.g-switch-label', '.g-label-text', '.g-error', '.g-help']) {
      expect(container.querySelector(`${selector} .g-phrase`)).not.toBeNull();
    }
  });

  it('英語と中国語の文言には span も <wbr> も足さない', () => {
    const { container } = renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="secondary">Agree and continue</Modal.Button>
          <Modal.Button variant="primary">编辑个人资料</Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(container.querySelector('.g-phrase')).toBeNull();
  });
});

describe('W-06 折り返し方の切り替え', () => {
  it('GassanProvider の lineBreak="browser" で元に戻せる', () => {
    const { container } = render(
      <GassanProvider lineBreak="browser">
        <Modal.Root open onOpenChange={noop} label="テスト">
          <Modal.Footer>
            <Modal.Button variant="primary">プロフィールを編集</Modal.Button>
          </Modal.Footer>
        </Modal.Root>
      </GassanProvider>,
    );
    expect(container.querySelector('.g-phrase')).toBeNull();
    expect(screen.getByRole('button', { name: 'プロフィールを編集' })).toBeInTheDocument();
  });

  it('内側の Provider が lineBreak を省略したら、外側の指定に従う（文言だけ差し替えても戻らない）', () => {
    const { container } = render(
      <GassanProvider lineBreak="browser">
        <GassanProvider labels={{ close: 'とじる' }}>
          <Phrase>プロフィールを編集</Phrase>
        </GassanProvider>
      </GassanProvider>,
    );
    expect(container.querySelector('.g-phrase')).toBeNull();
  });

  it('Phrase で、gassan の外の UI にも同じ折り返しを効かせられる', () => {
    const { container } = render(
      <button type="button">
        <Phrase>プロフィールを編集</Phrase>
      </button>,
    );
    expect(container.querySelector('button .g-phrase wbr[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('button')).toHaveAccessibleName('プロフィールを編集');
  });

  it('サーバーでも同じ位置に改行の機会を置く（hydration がずれない）', () => {
    const html = renderToString(<Phrase>プロフィールを編集</Phrase>);
    expect(html).toBe('<span class="g-phrase">プロフィールを<wbr aria-hidden="true"/>編集</span>');
  });
});

describe('W-02 器より長い文節の扱い（CSS）', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (): string => /\.g-phrase\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';

  it('文節の中では折らず、<wbr> と空白の位置でだけ折る（keep-all）', () => {
    expect(rule()).toMatch(/word-break:\s*keep-all;/);
  });

  it('1 文節が器より長いときだけ文字単位で折る。anywhere は使わない（最小幅が 1 文字になり、狭いボタンで文字単位に折れる）', () => {
    expect(rule()).toMatch(/overflow-wrap:\s*break-word;/);
    expect(rule()).not.toMatch(/anywhere/);
  });

  it('文字単位で折るときも、小書きのかなや長音符を行頭に置かない（line-break: strict）', () => {
    expect(rule()).toMatch(/line-break:\s*strict;/);
  });
});
