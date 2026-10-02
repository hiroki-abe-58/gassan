import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import FieldForm from '../../demos/FieldForm';
import fieldSource from '../../demos/FieldForm.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { repoFile } from '../../data';

const DELEGATED: readonly { control: string; use: string }[] = [
  { control: 'range / date / time / file / select', use: 'ネイティブの input をそのまま Modal.Field で包む' },
  { control: 'ラジオ・複数チェック', use: 'fieldset と legend で名前を付ける（label ではなく）' },
  { control: '検索つきセレクト・コンボボックス・2 つ摘みのスライダー', use: 'Base UI などの専用ライブラリに任せる' },
];

export function FieldPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/field"
      rest={rest}
      title="フォーム部品"
      lead="Modal.Field はラベル・ヘルプ・エラーの配線だけを引き受け、中身の入力は作らない。Chips・Switch・Table・Alert は、モーダルの中でよく要るのに配線を間違えやすい部品だけを持つ。"
      ids={['B-08', 'B-09', 'B-13']}
      overview={() => (
        <>
          <Section id="field" title="配線を 1 箇所に" intro="render prop で id と aria-* を渡す。中身はネイティブの input でも、ほかのライブラリの部品でもよい。">
            <Example
              title="メンバーを招待"
              description="空のまま「招待する」を押すと、まとめが 1 箇所に出て、フォーカスが最初のエラーへ移る。"
              code={fieldSource}
            >
              <FieldForm />
            </Example>
          </Section>

          <Section id="delegate" title="コントロールは自作しない">
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label="入力部品の任せ先">
              <table className="s-table">
                <caption className="s-sr-only">入力部品の任せ先</caption>
                <thead>
                  <tr>
                    <th scope="col">部品</th>
                    <th scope="col">どうするか</th>
                  </tr>
                </thead>
                <tbody>
                  {DELEGATED.map((row) => (
                    <tr key={row.control}>
                      <th scope="row">{row.control}</th>
                      <td>{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Prose>
              <p>
                それぞれの最小例は{' '}
                <a href={repoFile('docs/control-recipes.md')} target="_blank" rel="noreferrer">
                  docs/control-recipes.md
                </a>{' '}
                にある。モーダルの中のポップアップは、パネルの <code>transform</code> で <code>position: fixed</code> が壊れるので、
                popover API か dialog 内へのポータルを使う（C-12）。
              </p>
            </Prose>
          </Section>

          <Section id="errors" title="エラーの出し方">
            <Callout>
              個々のエラーに <code>role="alert"</code> は付けない。入力のたびに読み上げが割り込むと、かえって入力できなくなる。
              送信時のまとめだけを <code>Modal.Alert</code> に置き、フォーカスは最初のエラー項目へ移す（B-09）。
            </Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalFieldProps" title="Modal.Field" />
          <ApiTable name="FieldControlProps" title="render prop の引数" />
          <ApiTable name="ModalChipsProps" title="Modal.Chips" />
          <ApiTable name="ChipOption" />
          <ApiTable name="ModalSwitchProps" title="Modal.Switch" />
          <ApiTable name="ModalTableProps" title="Modal.Table" />
          <ApiTable name="ModalAlertProps" title="Modal.Alert" />
        </>
      )}
      a11y={() => <SpecTable ids={['B-08', 'B-09', 'B-13', 'C-12', 'K-04', 'D-13']} caption="フォーム部品が満たす仕様" />}
    />
  );
}
