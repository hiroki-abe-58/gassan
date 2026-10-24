import { useEffect, type ReactNode } from 'react';

import { Phrase, toast, type ToastPosition } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import ToastInModal from '../../demos/ToastInModal';
import toastInModalSource from '../../demos/ToastInModal.tsx?raw';
import ToastPromise from '../../demos/ToastPromise';
import toastPromiseSource from '../../demos/ToastPromise.tsx?raw';
import ToastTones from '../../demos/ToastTones';
import toastTonesSource from '../../demos/ToastTones.tsx?raw';
import ToastUndo from '../../demos/ToastUndo';
import toastUndoSource from '../../demos/ToastUndo.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { setToastPosition, useToastPosition } from '../../ui/toaster';

const IDS = ['N-01', 'N-02', 'N-03', 'N-04', 'N-05', 'N-06', 'N-07', 'N-08'];
const POSITIONS: readonly ToastPosition[] = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];

/** 画面の四隅と上下の中央に見立てたボタン。押すとサイトのホストの位置を変えて、そこに 1 つ出す。 */
function PositionPicker(): ReactNode {
  const t = useT().toast.position;
  const current = useToastPosition();
  // ページを離れたら既定の右下へ戻す。
  useEffect(() => () => setToastPosition('bottom-end'), []);
  return (
    <div className="s-toast-positions" role="group" aria-label={t.choose}>
      {POSITIONS.map((position) => (
        <button
          key={position}
          type="button"
          className="s-toast-position"
          data-at={position}
          aria-pressed={position === current}
          onClick={() => {
            setToastPosition(position);
            toast(t.message(t.labels[position]));
          }}
        >
          <Phrase>{t.labels[position]}</Phrase>
        </button>
      ))}
    </div>
  );
}

export function ToastPage({ rest }: PageProps): ReactNode {
  const { nav, toast: t } = useT();
  return (
    <ComponentPage
      path="/components/toast"
      rest={rest}
      title={nav.pages.toast}
      lead={t.lead}
      ids={IDS}
      overview={() => (
        <>
          <Section id="tones" title={t.tones.title} intro={t.tones.intro}>
            <Example title={t.tones.exampleTitle} description={t.tones.exampleDescription} code={toastTonesSource} demo="toastTones">
              <ToastTones />
            </Example>
          </Section>

          <Section id="meter" title={t.meter.title} intro={t.meter.intro}>
            <Prose>
              <Paras items={t.meter.body} />
            </Prose>
            <DataTable
              caption={t.meter.tableCaption}
              head={[t.meter.head.kind, t.meter.head.duration]}
              rows={t.meter.rows.map((row) => [row.kind, row.duration])}
            />
          </Section>

          <Section id="action" title={t.action.title} intro={t.action.intro}>
            <Example title={t.action.exampleTitle} description={t.action.exampleDescription} code={toastUndoSource} demo="toastUndo">
              <ToastUndo />
            </Example>
          </Section>

          <Section id="promise" title={t.promise.title} intro={t.promise.intro}>
            <Example
              title={t.promise.exampleTitle}
              description={t.promise.exampleDescription}
              code={toastPromiseSource}
              demo="toastPromise"
            >
              <ToastPromise />
            </Example>
          </Section>

          <Section id="position" title={t.position.title} intro={t.position.intro}>
            <PositionPicker />
            <CodeBlock lang="tsx" code={'<ToastHost position="top-center" max={3} />'} />
            <Prose>
              <Paras items={t.position.body} />
            </Prose>
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example
              title={t.modal.exampleTitle}
              description={t.modal.exampleDescription}
              code={toastInModalSource}
              demo="toastInModal"
            >
              <ToastInModal />
            </Example>
            <Prose>
              <Paras items={t.modal.body} />
            </Prose>
          </Section>

          <Section id="keys" title={t.keys.title}>
            <DataTable
              caption={t.keys.tableCaption}
              head={[t.keys.head.key, t.keys.head.action]}
              rows={t.keys.rows.map((row) => [<kbd key="key">{row.key}</kbd>, row.action])}
            />
          </Section>

          <Section id="host" title={t.host.title}>
            <CodeBlock
              lang="tsx"
              caption="app.tsx"
              code={`export function App() {\n  return (\n    <>\n      <Routes />\n      <ToastHost />\n    </>\n  );\n}`}
            />
            <Prose>
              <Paras items={t.host.body} />
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <DataTable
            caption={t.apiCaption.functions}
            head={[t.apiCaption.head.call, t.apiCaption.head.returns, t.apiCaption.head.description]}
            rows={t.apiCaption.rows.map((row) => [<code key="call">{row.call}</code>, row.returns, row.description])}
          />
          <ApiTable name="ToastHostProps" title="ToastHost" />
          <ApiTable name="ToastOptions" />
          <ApiTable name="ToastAction" />
          <ApiTable name="ToastPromiseMessages" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'V-01', 'V-02']} caption={t.a11yCaption} />}
    />
  );
}
