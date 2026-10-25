import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Button, IconButton } from './button';
import { warnDuplicateKeys } from './internal/dom';
import { PathIcon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useScrollbars } from './internal/scrollbars';
import { useLabels } from './labels';
import { Popover } from './overlay';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 鈴の印。この部品だけが使うので、共有の ICONS には入れない。 */
const BELL = 'M5 13.5V9a5 5 0 0 1 10 0v4.5l1.5 1.5h-13L5 13.5ZM8.5 17h3';

export interface NotificationEntry {
  id: string;
  title: string;
  /** 補足（1〜2 行）。 */
  body?: string;
  /** 届いた日時。「5 分前」「昨日」のように出す。 */
  time: Date | string;
  read?: boolean;
  /** 押すと移る行き先。無ければボタンにする（onOpenItem を呼ぶ）。 */
  href?: string;
  /** 印（飾り。aria-hidden にして渡す）。 */
  icon?: ReactNode;
}

export interface NotificationCenterProps extends DataAttributes {
  items: readonly NotificationEntry[];
  /** 項目を押したとき（既読にするのは利用側）。 */
  onOpenItem?: (id: string) => void;
  /** 渡すと、未読があるときに「すべて既読にする」を出す。 */
  onMarkAllRead?: () => void;
  /** 一覧の下に置くもの（「すべての通知を見る」へのリンクなど）。 */
  footer?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** 「たった今」「5 分前」「3 時間前」「昨日」「2 日前」、7 日より前は日付。 */
function relative(value: Date | string, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(seconds);
  if (abs < 60) return format.format(0, 'second');
  if (abs < 3600) return format.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return format.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return format.format(Math.round(seconds / 86_400), 'day');
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
}

/**
 * 通知の一覧。U-32。上の帯に置く鈴のボタンから、ポップオーバー（U-20）で開く。
 *
 * ボタンの名前は「通知」、未読があれば「通知 未読 3件」（数の印は飾り）。一覧は届いた順のまま並べ、未読の項目は太字と点で示し、
 * 読み上げには「未読」を添える。項目は href があればリンク、無ければボタンで、補足と届いた時刻は説明として続けて読む。
 * 未読があれば「すべて既読にする」を出す。無ければ「新しい通知はありません」。
 */
export function NotificationCenter({
  items,
  onOpenItem,
  onMarkAllRead,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...rest
}: NotificationCenterProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const base = useId();
  const unread = items.filter((item) => !item.read).length;
  const listRef = useRef<HTMLUListElement>(null);
  const bars = useScrollbars(listRef);

  const ids = items.map((item) => item.id).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('NotificationCenter', 'items[].id', ids.split('\u0000'));
  }, [ids]);

  return (
    <Popover
      {...domPassthrough(rest, 'NotificationCenter')}
      className={cx('g-notify', className)}
      title={labels.notifications}
      align="end"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={
        <IconButton label={unread > 0 ? labels.notificationsUnread(unread) : labels.notifications} className="g-notify-trigger">
          <PathIcon d={BELL} />
          {unread > 0 ? (
            <span className="g-notify-badge" aria-hidden="true">
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </IconButton>
      }
    >
      {onMarkAllRead && unread > 0 ? (
        <div className="g-notify-actions">
          <Button size="sm" variant="tertiary" onClick={onMarkAllRead}>
            {labels.markAllRead}
          </Button>
        </div>
      ) : null}
      {items.length === 0 ? (
        <p className="g-notify-empty">{phrase(labels.noNotifications)}</p>
      ) : (
        // 一覧は窓（自前のバー。U-35）。高さの上限と横のはみ出しは器が持つ
        <div className="g-scroll g-notify-scroll">
          <ul ref={listRef} className="g-notify-list g-scroll-viewport">
            {items.map((item, index) => {
              const itemId = `${base}-${String(index)}`;
              const describedBy = [item.body ? `${itemId}-body` : '', `${itemId}-time`].filter(Boolean).join(' ');
              const content = (
                <>
                  {item.icon ? <span className="g-notify-icon">{item.icon}</span> : null}
                  <span className="g-notify-text">
                    <span className="g-notify-title">
                      {item.read ? null : (
                        <span id={`${itemId}-unread`} className="g-sr-only">
                          {labels.unreadMark}
                        </span>
                      )}
                      <span id={`${itemId}-title`}>{phrase(item.title)}</span>
                    </span>
                    {item.body ? (
                      <span id={`${itemId}-body`} className="g-notify-body">
                        {phrase(item.body)}
                      </span>
                    ) : null}
                    {/* 相対の時刻は、サーバーとブラウザで分単位がずれうる */}
                    <time id={`${itemId}-time`} className="g-notify-time" dateTime={new Date(item.time).toISOString()} suppressHydrationWarning>
                      {relative(item.time, labels.locale)}
                    </time>
                  </span>
                </>
              );
              // 名前は「未読 件名」（言葉を別の要素に分け、aria-labelledby で空白を挟んでつなぐ）
              const common = {
                className: 'g-notify-item',
                'aria-labelledby': item.read ? `${itemId}-title` : `${itemId}-unread ${itemId}-title`,
                'aria-describedby': describedBy,
                onClick: () => onOpenItem?.(item.id),
              };
              return (
                <li key={item.id} data-unread={item.read ? undefined : ''}>
                  {item.href ? (
                    <a href={item.href} {...common}>
                      {content}
                    </a>
                  ) : (
                    <button type="button" {...common}>
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {bars}
        </div>
      )}
      {footer ? <div className="g-notify-footer">{footer}</div> : null}
    </Popover>
  );
}
