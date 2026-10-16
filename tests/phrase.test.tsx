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

import { GassanProvider, Modal, Phrase, englishLabels, splitPhrases } from '../src';
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

  it('W-04: 空白で区切る言語・タイ語・数字だけの文字列は分けない', () => {
    for (const text of ['Agree and continue', 'แก้ไขโปรไฟล์', 'ແກ້ໄຂໂປຣໄຟລ໌', 'កែសម្រួលប្រវត្តិរូប', '프로필 편집', '12,345']) {
      expect(splitPhrases(text)).toEqual([text]);
    }
  });
});

describe('W-04 中国語は語の切れ目で分ける（splitPhrases）', () => {
  const cases: readonly [string, string[]][] = [
    ['编辑个人资料', ['编辑', '个人', '资料']],
    ['编辑個人資料', ['编辑', '個人', '資料']],
    ['保存更改并关闭', ['保存', '更改', '并关闭']],
    ['删除此文件后将无法恢复。', ['删除', '此文件后', '将无法', '恢复。']],
    ['刪除此檔案後將無法復原。', ['刪除', '此檔案後', '將無法', '復原。']],
    ['我的文件', ['我的', '文件']],
    ['请输入验证码', ['请输入', '验证码']],
  ];

  it('UI の文言を、語の途中ではない位置で分ける（「编辑个人资｜料」にしない）', () => {
    expect(cases.map(([input]) => splitPhrases(input))).toEqual(cases.map(([, expected]) => expected));
  });

  it('辞書に無い語が 1 文字ずつに割れても、その中では折らない（上｜传・验证｜码）', () => {
    expect(splitPhrases('上传文件')).toEqual(['上传文件']);
    expect(splitPhrases('重新发送验证码').at(-1)).toBe('验证码');
  });

  it('「的・了・后」などは前の語に付け、行頭に置かない', () => {
    const texts = ['这是我的文件', '支付成功后将自动跳转', '请阅读《用户协议》后继续', '确定要删除这条评论吗？'];
    for (const text of texts) {
      for (const phrase of splitPhrases(text).slice(1)) expect(phrase).not.toMatch(/^[的了后吗呢，。？》]/);
    }
  });

  it('数と量詞・漢字と英数字の間では折らない（3个・版本2）', () => {
    expect(splitPhrases('共有3个文件')).toEqual(['共有3个文件']);
    expect(splitPhrases('版本2更新说明')[0]).toBe('版本2更新');
  });

  it('つなぎ直すと必ず元の文字列に戻る', () => {
    for (const text of ['只允许上传 JPG、PNG 格式的图片', '3月份最高，为120万元。4月以后持平。', '將此頁面加入書籤']) {
      expect(splitPhrases(text).join('')).toBe(text);
    }
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

  it('英語・タイ語の文言には span も <wbr> も足さない（タイ語に keep-all を掛けると、ブラウザの辞書の切れ目が消える）', () => {
    const { container } = renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="secondary">Agree and continue</Modal.Button>
          <Modal.Button variant="primary">บันทึกการเปลี่ยนแปลง</Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(container.querySelector('.g-phrase')).toBeNull();
  });

  it('中国語のボタンは語の切れ目に <wbr> を置く。名前は元のまま', () => {
    const { container } = renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary">编辑个人资料</Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(container.querySelectorAll('.g-btn-label .g-phrase wbr[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '编辑个人资料' })).toBeInTheDocument();
  });

  it('韓国語は器（keep-all）だけを付け、<wbr> は足さない（空白でだけ折る）', () => {
    const html = renderToString(<Phrase>변경 사항을 저장하고 닫기</Phrase>);
    expect(html).toBe('<span class="g-phrase">변경 사항을 저장하고 닫기</span>');
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

  it('内側の Provider が labels を省略したら、外側の文言に従う（lineBreak だけ指定しても日本語に戻らない）', () => {
    render(
      <GassanProvider labels={englishLabels}>
        <GassanProvider lineBreak="browser">
          <GassanProvider labels={{ required: 'Must' }}>
            <Modal.Root open onOpenChange={noop} label="Settings">
              <Modal.Header>
                <Modal.Controls end={<Modal.Close />} />
              </Modal.Header>
            </Modal.Root>
          </GassanProvider>
        </GassanProvider>
      </GassanProvider>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
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

  it('ボタンのラベルは、ボタンより長い文節があってもボタンの外へはみ出さない（中央寄せの grid 項目の最小幅を外す）', () => {
    // 実測: .g-btn は inline-grid + place-items: center なので、ラベルの幅は fit-content になり最長の文節より縮まない。
    // 縦積みのフッタや狭い器でボタンが押し込まれると、文節がボタンの外へはみ出していた（§10-29）
    const label = /\.g-btn-label\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(label).toMatch(/min-inline-size:\s*0;/);
    expect(label).toMatch(/max-inline-size:\s*100%;/);
  });
});
