import { useState, type ReactNode } from 'react';

import { Avatar, Badge, Breadcrumbs, DescriptionList, IconButton, Menu, Pagination, Tabs, confirm, toast } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

const PAGE_SIZE = 4;

export default function ProjectSettings(): ReactNode {
  const t = useDemoText('projectSettings');
  const [page, setPage] = useState(1);
  const [suspended, setSuspended] = useState<ReadonlySet<string>>(new Set());
  const roles = [t.admin, t.editor, t.editor, t.viewer];
  const members = [t.m1, t.m2, t.m3, t.m4, t.m5, t.m6, t.m7, t.m8, t.m9, t.m10, t.m11, t.m12].map((name, index) => ({
    name,
    role: roles[index % roles.length] ?? t.viewer,
  }));
  const shown = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setAccess = (name: string, stop: boolean): void => {
    setSuspended((current) => {
      const next = new Set(current);
      if (stop) next.add(name);
      else next.delete(name);
      return next;
    });
    toast(fmt(stop ? t.suspendedToast : t.resumed, name));
  };

  const act = (value: string, name: string): void => {
    if (value === 'role') toast(fmt(t.roleChanged, name));
    else if (value === 'resend') toast(fmt(t.resent, name));
    else if (value === 'resume') setAccess(name, false);
    else {
      // t:confirm
      void confirm({ title: fmt(t.suspendTitle, name), description: t.suspendDescription, confirmLabel: t.suspend, tone: 'danger' }).then(
        (ok) => {
          if (ok) setAccess(name, true);
        },
      );
    }
  };

  const memberList = (
    <div className="s-settings-members">
      <ul className="s-member-list">
        {shown.map((member) => {
          const stopped = suspended.has(member.name);
          return (
            <li key={member.name} className="s-member">
              <Avatar name={member.name} size="sm" />
              <span className="s-member-name">{member.name}</span>
              <Badge tone={stopped ? 'warning' : 'neutral'}>{stopped ? t.suspended : member.role}</Badge>
              {/* t:rowMenu */}
              <Menu
                align="end"
                trigger={
                  <IconButton label={fmt(t.actionsFor, member.name)} size="sm">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 10h.01M10 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                  </IconButton>
                }
                items={[
                  { value: 'role', label: t.changeRole },
                  { value: 'resend', label: t.resend, disabled: member.role === t.admin },
                  { type: 'separator' },
                  stopped ? { value: 'resume', label: t.resume } : { value: 'suspend', label: t.suspend, tone: 'danger' },
                ]}
                onSelect={(value) => act(value, member.name)}
              />
            </li>
          );
        })}
      </ul>
      <Pagination count={Math.ceil(members.length / PAGE_SIZE)} page={page} onPageChange={setPage} label={t.membersPages} />
    </div>
  );

  return (
    <div className="s-settings">
      <Breadcrumbs
        items={[
          { label: t.home, href: '#/ui/navigation' },
          { label: t.projects, href: '#/ui/navigation' },
          { label: t.project },
        ]}
      />
      <Tabs
        label={t.sections}
        items={[
          { value: 'members', label: t.members, badge: <Badge>{members.length}</Badge>, content: memberList },
          {
            value: 'billing',
            label: t.billing,
            content: (
              <DescriptionList
                items={[
                  { term: t.plan, details: t.planValue },
                  { term: t.nextInvoice, details: t.nextInvoiceValue },
                  { term: t.payment, details: t.paymentValue },
                ]}
              />
            ),
          },
          { value: 'notifications', label: t.notifications, content: <p className="s-demo-note">{t.notificationsBody}</p> },
        ]}
      />
    </div>
  );
}
