import { useState, type ReactNode } from 'react';

import { Button, Checklist, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChecklistStart(): ReactNode {
  const t = useDemoText('checklistStart');
  const [done, setDone] = useState<string[]>(['account']);
  const [dismissed, setDismissed] = useState(false);
  const finish = (id: string): void => setDone((list) => [...list, id]);

  if (dismissed) {
    return (
      <p className="s-demo-note">
        <Phrase>{t.dismissed}</Phrase>{' '}
        <button
          type="button"
          className="s-link-btn"
          onClick={() => {
            setDone(['account']);
            setDismissed(false);
          }}
        >
          <Phrase>{t.reset}</Phrase>
        </button>
      </p>
    );
  }
  return (
    <Checklist
      title={t.title}
      description={t.description}
      onDismiss={() => setDismissed(true)}
      items={[
        { id: 'account', title: t.account, done: done.includes('account') },
        {
          id: 'project',
          title: t.project,
          description: t.projectDescription,
          done: done.includes('project'),
          action: (
            <Button size="sm" onClick={() => finish('project')}>
              {t.create}
            </Button>
          ),
        },
        {
          id: 'invite',
          title: t.invite,
          description: t.inviteDescription,
          done: done.includes('invite'),
          action: (
            <Button size="sm" onClick={() => finish('invite')}>
              {t.inviteAction}
            </Button>
          ),
        },
        {
          id: 'notify',
          title: t.notify,
          done: done.includes('notify'),
          action: (
            <Button size="sm" onClick={() => finish('notify')}>
              {t.setUp}
            </Button>
          ),
        },
      ]}
    />
  );
}
