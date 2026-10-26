import type ja from '../ja/workspace';

export default {
  lead: 'API 金鑰、稽核紀錄、通知設定。這是管理後台中經常被反覆重做的三個畫面，做成了可以放進應用程式外框（P-12）中的內容。',
  apiKeys: {
    title: 'API 金鑰',
    intro: '金鑰本身只會在剛建立時、在同一個視窗中顯示一次。焦點會移到唯讀的欄位並選取全部內容，「複製」按鈕與「只會顯示這一次」的提示都和該欄位建立關聯。顯示金鑰期間，按 Esc 或點擊外側都不會關閉，並會朗讀不關閉的原因。元件不會一直持有金鑰（顯示 `onCreate` 回傳的 `secret`，關閉後即捨棄）。傳給表格的只有用來區分金鑰的一部分（`hint`）。有效期限把較短的排在前面，並以第一項作為預設值。',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: '讀取', description: '讀取專案與成員' },
  { value: 'write', label: '寫入', description: '建立、變更與刪除專案' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // 伺服器只儲存金鑰的雜湊值，金鑰本身只在這一次回傳
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
    title: '稽核紀錄',
    intro: '篩選與分頁都在伺服器端進行。元件本身不保存條件，而是透過 `query` 接收，每次變更時透過 `onQueryChange` 傳出。搜尋字詞在送出時（按 Enter 或「搜尋」）生效，操作類型與日期範圍在選擇時生效；條件一變就回到第 1 頁。時間顯示到秒，並在欄標題附上時區名稱。載入期間傳入 `loading`（表格顯示為骨架屏，載入完成後朗讀筆數）。',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // 依條件從伺服器讀取一頁的資料

const ACTIONS = [
  { value: 'member.invite', label: '邀請成員' },
  { value: 'api_key.create', label: '建立 API 金鑰' },
  { value: 'auth.sign_in', label: '登入' },
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
    title: '通知設定',
    intro: '以通知類型為列、接收方式為欄的表格。每個核取方塊的名稱由所在列與欄的標題組合而成（「留言與提及 電子郵件」）。無法傳送的方式顯示「—」；無法關閉的通知（安全性、帳單）不提供選擇，而是寫上「一律傳送」。「暫停所有通知」放在表格前面，暫停期間無法在表格中選擇，並寫明原因。勿擾時段的結束時間早於開始時間時，會加上「隔天」。',
  },
  samples: {
    keys: { production: '正式環境伺服器', ci: 'CI 測試', analytics: '分析資料匯出', legacy: '舊版整合' },
    scopes: {
      read: { label: '讀取', description: '讀取專案與成員' },
      write: { label: '寫入', description: '建立、變更與刪除專案' },
      billing: { label: '帳單', description: '讀取發票與用量' },
    },
    actions: {
      signIn: '登入',
      signInFailed: '登入失敗',
      invite: '邀請成員',
      role: '變更成員角色',
      remove: '移除成員',
      keyCreate: '建立 API 金鑰',
      keyRevoke: '撤銷 API 金鑰',
      plan: '變更方案',
      settings: '變更工作區設定',
      export: '匯出資料',
    },
    roleChange: '{0}（檢視者 → 編輯者）',
    planChange: 'Free → Pro',
    settingsTarget: '工作區名稱',
    exportTarget: '成員清單（CSV）',
    system: '系統',
    apiKey: 'API 金鑰',
    locations: { tokyo: '日本東京', osaka: '日本大阪', fukuoka: '日本福岡', singapore: '新加坡' },
    topics: {
      comments: { label: '留言與提及', description: '給你的留言與 @提及' },
      invites: { label: '邀請與加入', description: '工作區邀請，以及成員加入' },
      projects: { label: '專案更新', description: '你所負責專案的變更' },
      weekly: { label: '每週摘要', description: '每週一早上，將上週的動態彙整後傳送給你' },
      product: { label: '新功能', description: '新功能與使用技巧' },
      security: { label: '安全性', description: '新裝置登入與密碼變更' },
      billing: { label: '帳單', description: '發票與付款失敗' },
    },
  },
  a11yCaption: 'API 金鑰、稽核紀錄與通知設定範本的行為',
} satisfies typeof ja;
