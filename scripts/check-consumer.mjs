/**
 * 利用者の立場からの検品。tarball を作り、別ディレクトリへ実際にインストールして、
 * import できるか・型が解決できるかを確かめる。
 *
 *   node scripts/check-consumer.mjs
 *
 * ネットワークと npm install が要るので `npm run verify` には入れていない。CI で回す。
 *
 * なぜ要るか:
 *  exports マップの "types" を import/require の外側に1つだけ置くと、require 解決でも
 *  ESM 用の .d.ts が返る。package.json が type:module のとき、moduleResolution が
 *  node16 / nodenext の利用者は TS1479 で落ちる。ところがリポジトリ内の tsc は
 *  相対パスで src を直接見るため、この不整合を検出できない。
 *  「外からインストールした状態」でしか出ない種類の事故なので、ここで作り直して確かめる。
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'kasane-consumer-'));

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`  FAIL  ${message}`);
};
const pass = (message) => console.log(`  ok    ${message}`);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

console.log('checking from a consumer install');
console.log(`  workdir ${work}`);

try {
  // --- 1. tarball を作って実インストール ------------------------------------
  run('npm', ['pack', '--pack-destination', work], repo);
  const tarball = readdirSync(work).find((name) => name.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack produced no tarball');

  run('npm', ['init', '-y'], work);
  run(
    'npm',
    ['install', '--no-audit', '--no-fund', 'react@19', 'react-dom@19', '@types/react@19',
      resolve(work, tarball)],
    work,
  );
  pass(`installed ${tarball}`);

  // --- 2. ESM / CJS / CSS が外から引けるか ----------------------------------
  writeFileSync(
    join(work, 'runtime.mjs'),
    `import { Modal, ModalRoot, ModalChart, ModalHandle, useModals, englishLabels,
              resolveDetents, snapToDetent } from '@genelab/kasane';
     if (!Modal?.Root || !ModalRoot || !useModals || !englishLabels) throw new Error('esm export missing');
     if (!Modal.Chart || Modal.Chart !== ModalChart) throw new Error('Modal.Chart export missing');
     if (!Modal.Handle || Modal.Handle !== ModalHandle) throw new Error('Modal.Handle export missing');
     // 判定の純粋関数は外から単体で使える（レイアウトを持たない環境でも再現できる）
     if (resolveDetents(['full', 'peek', 'zzz']).join(',') !== 'peek,full') throw new Error('resolveDetents broken');
     if (snapToDetent({ detents: ['peek', 'full'], currentIndex: 1, deltaY: 400, elapsedMs: 100,
                        viewportHeight: 800, dismissible: true }).type !== 'snap') throw new Error('snapToDetent broken');
     const { createRequire } = await import('node:module');
     const require = createRequire(import.meta.url);
     if (!require('@genelab/kasane').Modal?.Root) throw new Error('cjs export missing');
     require('node:fs').accessSync(require.resolve('@genelab/kasane/styles.css'));
     require('node:fs').accessSync(require.resolve('@genelab/kasane/styles.source.css'));
     console.log('  ok    ESM / CJS / styles.css / styles.source.css all resolve');
    `,
  );
  process.stdout.write(run('node', ['runtime.mjs'], work));

  // --- 3. 3つの解決方式すべてで型が通るか -----------------------------------
  writeFileSync(
    join(work, 'types.tsx'),
    `import { Modal, type CloseReason, type ModalKind, type ModalChartProps } from '@genelab/kasane';
     const chart: ModalChartProps = { label: 'sales', summary: 'peaks in March', children: null };
     const kind: ModalKind = 'consent';
     export function App() {
       return (
         <Modal.Root
           kind={kind}
           open
           onOpenChange={() => {}}
           onRequestClose={(reason: CloseReason) => reason !== 'backdrop'}
         >
           <Modal.Header>
             <Modal.Controls end={<Modal.Close />} />
             <Modal.Title>title</Modal.Title>
           </Modal.Header>
           <Modal.Body readGate="read">
             <Modal.Consent gate="terms">agree</Modal.Consent>
             <Modal.GateStatus />
             <Modal.Chart {...chart} data={<table />} visualAccessible={false}>
               <svg />
             </Modal.Chart>
           </Modal.Body>
           <Modal.Footer>
             <Modal.Button variant="primary" gate>continue</Modal.Button>
           </Modal.Footer>
         </Modal.Root>
       );
     }
    `,
  );

  // README「シートと段（ディテント）」の例をそのまま置く。
  // 文書に載せた API が、外からインストールした状態で本当に型が通るかを確かめる。
  writeFileSync(
    join(work, 'sheet.tsx'),
    `import { Modal, type DetentToken } from '@genelab/kasane';
     export function Sheet({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
       return (
         <Modal.Root
           open={open}
           onOpenChange={setOpen}
           placement="sheet"
           swipeToDismiss
           detents={['peek', 'half', 'full']}
           defaultDetent="half"
           onDetentChange={(d: DetentToken) => void d}
         >
           <Modal.Handle />
           <Modal.Header>
             <Modal.Title>route</Modal.Title>
           </Modal.Header>
           <Modal.Body>body</Modal.Body>
         </Modal.Root>
       );
     }
    `,
  );

  const tsc = resolve(repo, 'node_modules/.bin/tsc');
  for (const [moduleResolution, module] of [
    ['bundler', 'esnext'],
    ['node16', 'node16'],
    ['nodenext', 'nodenext'],
  ]) {
    writeFileSync(
      join(work, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          jsx: 'react-jsx',
          target: 'es2022',
          module,
          moduleResolution,
          lib: ['es2022', 'dom'],
          skipLibCheck: true,
        },
        include: ['types.tsx', 'sheet.tsx'],
      }),
    );
    try {
      run(tsc, ['-p', 'tsconfig.json'], work);
      pass(`types resolve under moduleResolution: ${moduleResolution}`);
    } catch (error) {
      fail(`moduleResolution ${moduleResolution}:\n${error.stdout ?? error.message}`);
    }
  }
} catch (error) {
  fail(error.stdout || error.message);
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\nconsumer check failed.');
  process.exit(1);
}
console.log('\nconsumer check passed.');
