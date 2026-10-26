import { useId, useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '../button';
import { DataTable, type DataTableColumn } from '../data-table';
import { ModalField, ModalSwitch } from '../fields';
import { Icon } from '../internal/icons';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { SelectBox } from '../internal/select-box';
import { PageHeader } from '../page-header';
import { usePhrase } from '../phrase';
import { ModalTimePicker } from '../time-picker';
import { FormError, runAction, type SubmitResult } from './form';
import { commonLabels, notificationSettingsLabels } from './labels';
import { SectionActions, SettingsSection } from './settings';
import { useTemplateLabels } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface NotificationChannel {
  value: string;
  label: string;
}

export interface NotificationTopic {
  id: string;
  label: string;
  description?: ReactNode;
  /** 送れる方法（channels の value）。既定はすべて。 */
  channels?: readonly string[];
  /** 止められない知らせ（セキュリティ・請求）。選ばせず「必ず届きます」と書く。 */
  required?: boolean;
}

export interface QuietHours {
  enabled: boolean;
  /** 始まり（'HH:mm'）。 */
  start: string;
  /** 終わり（'HH:mm'）。始まりより前なら翌日。 */
  end: string;
}

export interface NotificationSettingsValue {
  /** 知らせの id ごとの、受け取る方法（channels の value）。 */
  channels: Readonly<Record<string, readonly string[]>>;
  /** すべての通知を止めている（止められない知らせは届く）。 */
  paused: boolean;
  /** 渡すと、おやすみ時間の節を出す。 */
  quietHours?: QuietHours;
}

export interface NotificationSettingsPageProps extends DataAttributes {
  topics: readonly NotificationTopic[];
  /** 受け取る方法。既定はメール・プッシュ通知・アプリ内（'email' / 'push' / 'inApp'）。 */
  channels?: readonly NotificationChannel[];
  /** はじめの値。保存した値で描き直すときは key を変える。 */
  defaultValue: NotificationSettingsValue;
  onSubmit: (value: NotificationSettingsValue) => SubmitResult | Promise<SubmitResult>;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const NOTIFICATION_LABELS = { common: commonLabels, notificationSettings: notificationSettingsLabels } as const;

/**
 * 通知の設定。P-38。AppShell の中に置く中身。
 *
 * 知らせの種類（行）と受け取る方法（列）の表で、チェックボックスは行と列の見出しを合わせた名前を持つ（「コメント メール」）。
 * 送れない方法は「—」、止められない知らせは選ばせずに「必ず届きます」と書く。「すべての通知を止める」は表より前に置き、
 * 止めている間は表を選べなくして理由を書く。おやすみ時間は使うかどうかと始まり・終わり（I-20）で、終わりが前なら「翌」と書く。
 * 保存は送信の流れ（P-03）で、結果はいつも置いてある role="status" で読み上げ、変えたら消す。
 */
export function NotificationSettingsPage({
  topics,
  channels,
  defaultValue,
  onSubmit,
  title,
  description,
  className,
  ...rest
}: NotificationSettingsPageProps): ReactNode {
  const { common, notificationSettings: n } = useTemplateLabels(NOTIFICATION_LABELS);
  const phrase = usePhrase();
  const base = useId();
  const [value, setValue] = useState<NotificationSettingsValue>(defaultValue);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const methods = channels ?? [
    { value: 'email', label: n.channels.email },
    { value: 'push', label: n.channels.push },
    { value: 'inApp', label: n.channels.inApp },
  ];
  const quiet = value.quietHours;

  const update = (patch: Partial<NotificationSettingsValue>): void => {
    setValue((current) => ({ ...current, ...patch }));
    setSaved(false);
  };
  const toggle = (topic: string, channel: string, on: boolean): void => {
    const current = value.channels[topic] ?? [];
    const next = on ? [...current, channel] : current.filter((item) => item !== channel);
    // 並びは channels の順にそろえる（押した順にしない）
    update({ channels: { ...value.channels, [topic]: methods.map((method) => method.value).filter((item) => next.includes(item)) } });
  };
  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setPending(true);
    const failure = await runAction(() => onSubmit(value), common.submitFailed);
    setPending(false);
    setError(failure);
    setSaved(!failure);
  };

  const topicId = (topic: NotificationTopic): string => `${base}-topic-${topic.id}`;
  const channelId = (channel: NotificationChannel): string => `${base}-channel-${channel.value}`;
  const columns: DataTableColumn<NotificationTopic>[] = [
    {
      key: 'topic',
      header: n.topic,
      wrap: true,
      cell: (topic) => (
        <span className="g-notification-topic">
          <span id={topicId(topic)}>{topic.label}</span>
          {topic.description ? <span className="g-notification-detail">{topic.description}</span> : null}
        </span>
      ),
    },
    ...methods.map(
      (channel): DataTableColumn<NotificationTopic> => ({
        key: channel.value,
        header: <span id={channelId(channel)}>{channel.label}</span>,
        align: 'center',
        cell: (topic) => {
          if (topic.channels && !topic.channels.includes(channel.value)) {
            return (
              <>
                <span aria-hidden="true">—</span>
                <span className="g-sr-only">{n.unavailable}</span>
              </>
            );
          }
          if (topic.required) {
            return (
              <span className="g-notification-fixed">
                <Icon name="check" />
                <span className="g-sr-only">{n.required}</span>
              </span>
            );
          }
          return (
            <SelectBox
              className="g-data-table-check"
              checked={(value.channels[topic.id] ?? []).includes(channel.value)}
              onChange={(on) => toggle(topic.id, channel.value, on)}
              labelledBy={`${topicId(topic)} ${channelId(channel)}`}
              disabled={value.paused}
            />
          );
        },
      }),
    ),
  ];

  return (
    <div {...domPassthrough(rest, 'NotificationSettingsPage')} className={cx('g-notification-settings', className)}>
      <PageHeader title={title ?? n.title} description={description ?? n.description} />
      <form className="g-settings-sections" noValidate onSubmit={(event) => void submit(event)}>
        <SettingsSection title={n.pause} description={n.pauseDescription}>
          <ModalSwitch checked={value.paused} onCheckedChange={(paused) => update({ paused })}>
            {n.pauseSwitch}
          </ModalSwitch>
        </SettingsSection>
        <SettingsSection title={n.topics} description={n.topicsDescription}>
          {value.paused ? <p className="g-notification-paused">{phrase(n.paused)}</p> : null}
          <DataTable label={n.matrix} density="compact" columns={columns} rows={topics} getRowId={(topic) => topic.id} />
        </SettingsSection>
        {quiet ? (
          <SettingsSection title={n.quietHours} description={n.quietHoursDescription}>
            <ModalSwitch checked={quiet.enabled} onCheckedChange={(enabled) => update({ quietHours: { ...quiet, enabled } })}>
              {n.quietHoursSwitch}
            </ModalSwitch>
            <div className="g-quiet-hours">
              {/* 始まりと終わりは欠かせない値なので必須にし、いつも値があるので印は出さない */}
              <ModalField label={n.start} required requiredBadge={false}>
                {(control) => (
                  <ModalTimePicker {...control} value={quiet.start} disabled={!quiet.enabled} onValueChange={(start) => update({ quietHours: { ...quiet, start } })} />
                )}
              </ModalField>
              <ModalField label={n.end} help={n.everyDay(quiet.start, quiet.end, quiet.end <= quiet.start)} required requiredBadge={false}>
                {(control) => (
                  <ModalTimePicker {...control} value={quiet.end} disabled={!quiet.enabled} onValueChange={(end) => update({ quietHours: { ...quiet, end } })} />
                )}
              </ModalField>
            </div>
          </SettingsSection>
        ) : null}
        <FormError>{error}</FormError>
        <SectionActions status={saved ? n.saved : null}>
          <Button type="submit" variant="primary" loading={pending}>
            {n.save}
          </Button>
        </SectionActions>
      </form>
    </div>
  );
}
