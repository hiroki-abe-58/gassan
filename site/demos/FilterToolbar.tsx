import { useState, type ReactNode } from 'react';

import { Button, Checkbox, IconButton, Menu, Popover, Segmented, Tooltip, toast } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

// t:glyph
function Glyph({ d }: { d: string }): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FilterToolbar(): ReactNode {
  const t = useDemoText('filterToolbar');
  const [unread, setUnread] = useState(true);
  const [mine, setMine] = useState(false);
  const [sort, setSort] = useState('new');
  const active = Number(unread) + Number(mine);
  const names: Record<string, string> = {
    csv: t.exportCsv,
    print: t.print,
    compact: t.compact,
    comfortable: t.comfortable,
    archive: t.archiveAll,
  };

  return (
    <div className="s-demo-row s-toolbar">
      {/* t:tooltip */}
      <Tooltip content={t.refreshHint}>
        <IconButton label={t.refresh} onClick={() => toast(t.refreshed)}>
          <Glyph d="M15.5 9.5a5.5 5.5 0 1 1-1.6-3.9M15.5 4v3.5H12" />
        </IconButton>
      </Tooltip>
      <Tooltip content={t.share}>
        <IconButton label={t.share}>
          <Glyph d="M10 12.5V3.5M6.5 7 10 3.5 13.5 7M4.5 11v4a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-4" />
        </IconButton>
      </Tooltip>

      <Popover
        title={t.filterTitle}
        trigger={
          <Button size="sm" iconStart={<Glyph d="M3.5 5h13M6 10h8M8.5 15h3" />}>
            {active > 0 ? fmt(t.filterCount, String(active)) : t.filter}
          </Button>
        }
      >
        <div className="s-popover-form">
          <Checkbox checked={unread} onCheckedChange={setUnread}>
            {t.unreadOnly}
          </Checkbox>
          <Checkbox checked={mine} onCheckedChange={setMine}>
            {t.assignedToMe}
          </Checkbox>
          <Segmented
            aria-label={t.sortLabel}
            value={sort}
            onValueChange={setSort}
            options={[
              { value: 'new', label: t.newest },
              { value: 'old', label: t.oldest },
            ]}
          />
        </div>
      </Popover>

      {/* t:menu */}
      <Menu
        align="end"
        trigger={
          <IconButton label={t.more}>
            <Glyph d="M5 10h.01M10 10h.01M15 10h.01" />
          </IconButton>
        }
        items={[
          { value: 'csv', label: t.exportCsv, shortcut: '⌘E' },
          { value: 'print', label: t.print, shortcut: '⌘P' },
          { type: 'separator' },
          {
            type: 'group',
            label: t.viewGroup,
            items: [
              { value: 'compact', label: t.compact },
              { value: 'comfortable', label: t.comfortable },
            ],
          },
          { type: 'separator' },
          { value: 'archive', label: t.archiveAll, tone: 'danger' },
        ]}
        onSelect={(value) => toast(fmt(t.chose, names[value] ?? value))}
      />
    </div>
  );
}
