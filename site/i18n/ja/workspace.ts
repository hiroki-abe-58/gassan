export default {
  lead: 'API キー・監査ログ・通知の設定。管理の画面でよく作り直される 3 枚を、アプリの枠（P-12）の中に置く中身として用意した。',
  apiKeys: {
    title: 'API キー',
    intro: 'キーそのものは、作った直後に同じ窓で 1 度だけ見せる。読み取り専用の欄にフォーカスを移して全体を選び、「コピー」と「今しか表示できない」を欄に結ぶ。見せている間は Esc や外を押しても閉じず、閉じない理由を読み上げる。部品はキーを持ち続けない（`onCreate` が返した `secret` を見せ、閉じたら捨てる）。表には見分けるための一部（`hint`）だけを渡す。有効期限は短いものを先に並べ、それを既定にする。',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: '読み取り', description: 'プロジェクトとメンバーを読む' },
  { value: 'write', label: '書き込み', description: 'プロジェクトを作る・変える・消す' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // サーバーはキーのハッシュだけを保存し、キーそのものはこの 1 度だけ返す
        const { secret } = (await response.json()) as { secret: string };
        reload();
        return { secret };
      }}
      onRevoke={async (id) => {
        const response = await fetch(\`/api/keys/\${id}\`, { method: 'DELETE' });
        if (!response.ok) return { error: true };
        reload();
      }}
    />
  );
}`,
  },
  auditLog: {
    title: '監査ログ',
    intro: '絞り込みとページ分けはサーバーで行う。部品は条件を持たず、`query` で受け取り、変わるたびに `onQueryChange` で渡す。探す言葉は送ったとき（Enter か「検索」）に、操作の種類と期間は選んだときに変わり、条件を変えると 1 ページ目に戻る。日時は秒まで出し、列の見出しに時間帯の名前を添える。読み込んでいる間は `loading` を渡す（表が骨組みになり、読み込み終えたら件数を読み上げる）。',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // 条件を受けて、サーバーから 1 ページ分を読む

const ACTIONS = [
  { value: 'member.invite', label: 'メンバーを招待した' },
  { value: 'api_key.create', label: 'API キーを作った' },
  { value: 'auth.sign_in', label: 'ログインした' },
];

export function AuditLog() {
  const [query, setQuery] = useState<AuditLogQuery>({ text: '', action: null, range: null, page: 1 });
  const { data, isLoading } = useAuditLog(query);
  return (
    <AuditLogPage
      query={query}
      onQueryChange={setQuery}
      events={data?.events ?? []}
      total={data?.total ?? 0}
      pageCount={data?.pageCount ?? 1}
      loading={isLoading}
      actions={ACTIONS}
      onExport={async (current) => {
        const response = await fetch('/api/audit-log/exports', { method: 'POST', body: JSON.stringify(current) });
        return response.ok ? undefined : { error: true };
      }}
    />
  );
}`,
  },
  notifications: {
    title: '通知の設定',
    intro: '知らせの種類を行、受け取る方法を列にした表。チェックボックスは行と列の見出しを合わせた名前を持つ（「コメントとメンション メール」）。送れない方法は「—」、止められない知らせ（セキュリティ・請求）は選ばせずに「必ず届きます」と書く。「すべての通知を止める」は表より前に置き、止めている間は表を選べなくして理由を書く。おやすみ時間の終わりが始まりより前なら「翌」を添える。',
  },
  samples: {
    keys: { production: '本番のサーバー', ci: 'CI のテスト', analytics: '分析の書き出し', legacy: '古い連携' },
    scopes: {
      read: { label: '読み取り', description: 'プロジェクトとメンバーを読む' },
      write: { label: '書き込み', description: 'プロジェクトを作る・変える・消す' },
      billing: { label: '請求', description: '請求書と使った量を読む' },
    },
    actions: {
      signIn: 'ログインした',
      signInFailed: 'ログインに失敗した',
      invite: 'メンバーを招待した',
      role: 'メンバーの役割を変えた',
      remove: 'メンバーを外した',
      keyCreate: 'API キーを作った',
      keyRevoke: 'API キーを無効にした',
      plan: 'プランを変えた',
      settings: 'ワークスペースの設定を変えた',
      export: 'データを書き出した',
    },
    roleChange: '{0}（閲覧者 → 編集者）',
    planChange: 'Free → Pro',
    settingsTarget: 'ワークスペースの名前',
    exportTarget: 'メンバーの一覧（CSV）',
    system: 'システム',
    apiKey: 'API キー',
    locations: { tokyo: '東京, 日本', osaka: '大阪, 日本', fukuoka: '福岡, 日本', singapore: 'シンガポール' },
    topics: {
      comments: { label: 'コメントとメンション', description: '自分あてのコメントと @メンション' },
      invites: { label: '招待と参加', description: 'ワークスペースへの招待と、メンバーの参加' },
      projects: { label: 'プロジェクトの更新', description: '担当しているプロジェクトの変更' },
      weekly: { label: '週のまとめ', description: '月曜の朝に、先週の出来事をまとめて送ります' },
      product: { label: '新しい機能', description: '新しい機能と、使い方のヒント' },
      security: { label: 'セキュリティ', description: '新しい端末からのログインと、パスワードの変更' },
      billing: { label: '請求', description: '請求書と、支払いの失敗' },
    },
  },
  a11yCaption: 'API キー・監査ログ・通知の設定の振る舞い',
};
