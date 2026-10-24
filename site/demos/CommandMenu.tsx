import { useState, type ReactNode } from 'react';

import { Button, CommandPalette, toast } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function CommandMenu(): ReactNode {
  const t = useDemoText('commandMenu');
  const [open, setOpen] = useState(false);
  const run = (label: string) => () => toast(fmt(t.ran, label));

  return (
    <>
      <Button onClick={() => setOpen(true)}>{t.open}</Button>
      {/* t:hotkey */}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        placeholder={t.placeholder}
        items={[
          { id: 'home', group: t.pages, label: t.home, description: t.homeDescription, onSelect: run(t.home) },
          { id: 'members', group: t.pages, label: t.members, keywords: ['members'], onSelect: run(t.members) },
          { id: 'billing', group: t.pages, label: t.billing, keywords: ['billing', 'invoice'], onSelect: run(t.billing) },
          { id: 'settings', group: t.pages, label: t.settings, description: t.settingsDescription, onSelect: run(t.settings) },
          { id: 'invite', group: t.actions, label: t.invite, shortcut: ['G', 'I'], onSelect: run(t.invite) },
          { id: 'project', group: t.actions, label: t.project, shortcut: ['C'], onSelect: run(t.project) },
          { id: 'export', group: t.actions, label: t.export, description: t.exportDescription, disabled: true },
        ]}
      />
    </>
  );
}
