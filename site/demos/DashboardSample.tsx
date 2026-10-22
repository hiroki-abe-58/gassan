import type { ReactNode } from 'react';

import { Badge, Card, DescriptionList, Progress, Stat, Timeline } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function DashboardSample(): ReactNode {
  const t = useDemoText('dashboardSample');

  return (
    <div className="s-dashboard">
      <div className="s-dashboard-stats">
        <Card>
          <Stat label={t.revenue} value="¥1,240,000" delta="+12%" trend="up" description={t.vsLastMonth} />
        </Card>
        {/* t:churn */}
        <Card>
          <Stat label={t.churn} value="2.1%" delta="−0.4pt" trend="down" goodWhen="down" description={t.vsLastMonth} />
        </Card>
        <Card>
          <Stat label={t.active} value="1,284" delta="+3%" trend="up" description={t.vsLastWeek} />
        </Card>
      </div>

      <div className="s-dashboard-grid">
        <Card title={t.usage} actions={<Badge tone="warning">{t.nearLimit}</Badge>}>
          <div className="s-dashboard-stack">
            <Progress
              label={t.storage}
              value={17}
              max={20}
              tone="warning"
              valueText={(value, max) => fmt(t.gb, String(value), String(max))}
            />
            <Progress label={t.seats} value={12} max={15} valueText={(value, max) => fmt(t.people, String(value), String(max))} />
            <DescriptionList
              items={[
                { term: t.plan, details: t.planValue },
                { term: t.renewal, details: t.renewalValue },
              ]}
            />
          </div>
        </Card>
        <Card title={t.activity}>
          <Timeline
            items={[
              { title: t.invited, time: '2026-10-23T09:12', timeLabel: t.invitedAt, tone: 'accent' },
              { title: t.exported, time: '2026-10-22T18:40', timeLabel: t.exportedAt, tone: 'success' },
              { title: t.failedSync, time: '2026-10-22T08:05', timeLabel: t.failedSyncAt, tone: 'error', description: t.failedSyncDetail },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
