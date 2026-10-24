import { useState, type ReactNode } from 'react';

import { Phrase, TreeView, type TreeNode } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

const FOLDER = 'M3 6.5A1.5 1.5 0 0 1 4.5 5h3l1.5 1.5h6.5A1.5 1.5 0 0 1 17 8v6.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-8Z';
const FILE = 'M11.5 3.5h-5A1.5 1.5 0 0 0 5 5v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 15 15V7l-3.5-3.5ZM11.5 3.5V7H15';

function Mark({ d }: { d: string }): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const labelOf = (nodes: readonly TreeNode[], id: string): string | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node.label;
    const found = node.children ? labelOf(node.children, id) : undefined;
    if (found) return found;
  }
  return undefined;
};

export default function TreeFiles(): ReactNode {
  const t = useDemoText('treeFiles');
  const folder = <Mark d={FOLDER} />;
  const file = <Mark d={FILE} />;
  const items: TreeNode[] = [
    {
      id: 'docs',
      label: t.docs,
      icon: folder,
      children: [
        { id: 'guide', label: t.guide, icon: file },
        {
          id: 'api',
          label: 'API',
          icon: folder,
          children: [
            { id: 'auth', label: t.auth, icon: file },
            { id: 'billing', label: t.billing, icon: file },
          ],
        },
      ],
    },
    {
      id: 'design',
      label: t.design,
      icon: folder,
      children: [
        { id: 'logo', label: 'logo.svg', icon: file },
        { id: 'colors', label: 'colors.json', icon: file },
      ],
    },
    { id: 'readme', label: 'README.md', icon: file },
  ];
  const [selected, setSelected] = useState('guide');
  return (
    <div className="s-tree-demo">
      <TreeView label={t.label} items={items} selected={selected} onSelectedChange={setSelected} defaultExpanded={['docs']} />
      <p className="s-demo-note">
        <Phrase>{fmt(t.selected, labelOf(items, selected) ?? '')}</Phrase>
      </p>
    </div>
  );
}
