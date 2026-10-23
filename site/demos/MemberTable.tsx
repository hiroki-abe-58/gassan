import { useState, type ReactNode } from 'react';

import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DescriptionList,
  EmptyState,
  IconButton,
  Menu,
  Modal,
  PageHeader,
  SearchInput,
  confirm,
  toast,
  type DataTableColumn,
} from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

export default function MemberTable({ headingLevel = 2 }: { headingLevel?: 1 | 2 }): ReactNode {
  const t = useDemoText('memberTable');
  const [members, setMembers] = useState<Member[]>(() => [
    { id: 'm1', name: t.m1, email: 'aoi@example.com', role: t.admin, status: 'active', lastActive: '2026-10-23' },
    { id: 'm2', name: t.m2, email: 'ren@example.com', role: t.editor, status: 'active', lastActive: '2026-10-21' },
    { id: 'm3', name: t.m3, email: 'hina@example.com', role: t.editor, status: 'invited', lastActive: '' },
    { id: 'm4', name: t.m4, email: 'minato@example.com', role: t.viewer, status: 'active', lastActive: '2026-09-30' },
    { id: 'm5', name: t.m5, email: 'yui@example.com', role: t.editor, status: 'suspended', lastActive: '2026-08-12' },
    { id: 'm6', name: t.m6, email: 'hiroto@example.com', role: t.viewer, status: 'active', lastActive: '2026-10-18' },
  ]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Member | null>(null);
  const statusLabel = { active: t.active, invited: t.pending, suspended: t.suspended };
  const statusTone = { active: 'success', invited: 'info', suspended: 'warning' } as const;

  const needle = query.trim().toLowerCase();
  const shown = needle ? members.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(needle)) : members;

  const remove = async (ids: string[]): Promise<void> => {
    const names = members.filter((m) => ids.includes(m.id)).map((m) => m.name);
    // t:confirm
    const ok = await confirm({
      title: ids.length === 1 ? fmt(t.removeOne, names[0] ?? '') : fmt(t.removeMany, String(ids.length)),
      description: t.removeDescription,
      confirmLabel: t.remove,
      tone: 'danger',
    });
    if (!ok) return;
    setMembers((current) => current.filter((m) => !ids.includes(m.id)));
    setSelected((current) => current.filter((id) => !ids.includes(id)));
    toast.success(ids.length === 1 ? fmt(t.removedOne, names[0] ?? '') : fmt(t.removedMany, String(ids.length)));
  };

  const columns: DataTableColumn<Member>[] = [
    {
      key: 'name',
      header: t.name,
      // t:rowHeader
      cell: (m) => (
        <span className="s-person">
          <span aria-hidden="true">
            <Avatar name={m.name} size="xs" />
          </span>
          {m.name}
        </span>
      ),
      sortValue: (m) => m.name,
    },
    { key: 'email', header: t.email, cell: (m) => m.email },
    { key: 'role', header: t.role, cell: (m) => m.role, sortValue: (m) => m.role },
    { key: 'status', header: t.status, cell: (m) => <Badge tone={statusTone[m.status]}>{statusLabel[m.status]}</Badge> },
    // t:empty
    { key: 'lastActive', header: t.lastActive, cell: (m) => m.lastActive || '—', sortValue: (m) => m.lastActive, align: 'end' },
  ];

  return (
    <div className="s-member-table">
      <PageHeader
        headingLevel={headingLevel}
        title={t.title}
        description={t.description}
        actions={
          <Button variant="primary" onClick={() => toast(t.inviteSent)}>
            {t.invite}
          </Button>
        }
      />
      <div className="s-table-toolbar">
        <SearchInput aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <DataTable
        label={t.title}
        columns={columns}
        rows={shown}
        getRowId={(m) => m.id}
        defaultSort={{ key: 'lastActive', direction: 'descending' }}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={(ids) => (
          <Button size="sm" onClick={() => void remove(ids)}>
            {t.remove}
          </Button>
        )}
        rowActions={(m) => (
          <Menu
            align="end"
            trigger={
              <IconButton label={fmt(t.actionsFor, m.name)} size="sm">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 10h.01M10 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </IconButton>
            }
            items={[
              { value: 'detail', label: t.detail },
              { type: 'separator' },
              { value: 'remove', label: t.remove, tone: 'danger' },
            ]}
            onSelect={(value) => (value === 'detail' ? setDetail(m) : void remove([m.id]))}
          />
        )}
        empty={<EmptyState title={fmt(t.noMatch, query)} description={t.noMatchHint} headingLevel={3} />}
      />

      {/* t:side */}
      <Modal.Root open={detail !== null} onOpenChange={(open) => !open && setDetail(null)} kind="view" placement="end" size="sm">
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{detail?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail ? (
            <DescriptionList
              items={[
                { term: t.email, details: detail.email },
                { term: t.role, details: detail.role },
                { term: t.status, details: statusLabel[detail.status] },
                { term: t.lastActive, details: detail.lastActive || '—' },
              ]}
            />
          ) : null}
        </Modal.Body>
      </Modal.Root>
    </div>
  );
}
