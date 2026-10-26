import type ja from '../ja/workspace';

export default {
  lead: 'API 密钥、审计日志、通知设置。这是管理后台里经常被反复重做的三个界面，做成了可以放进应用外框（P-12）中的内容。',
  apiKeys: {
    title: 'API 密钥',
    intro: '密钥本身只会在刚创建时、在同一个窗口中显示一次。焦点会移到只读的输入框并选中全部内容，“复制”按钮和“只会显示这一次”的提示都与该输入框关联。显示密钥期间，按 Esc 或点击外部都不会关闭，并会播报不关闭的原因。部件不会一直持有密钥（显示 `onCreate` 返回的 `secret`，关闭后即丢弃）。传给表格的只有用来区分密钥的一部分（`hint`）。有效期把较短的排在前面，并以第一项作为默认值。',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: '读取', description: '读取项目和成员' },
  { value: 'write', label: '写入', description: '创建、更改和删除项目' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // 服务器只保存密钥的哈希值，密钥本身只在这一次返回
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
    title: '审计日志',
    intro: '筛选和分页都在服务器端进行。部件本身不保存条件，而是通过 `query` 接收，每次变化时通过 `onQueryChange` 传出。搜索词在提交时（按 Enter 或“搜索”）生效，操作类型和日期范围在选择时生效；条件一变就回到第 1 页。时间显示到秒，并在列标题中附上时区名称。加载期间传入 `loading`（表格显示为骨架屏，加载完成后播报条数）。',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // 根据条件，从服务器读取一页的数据

const ACTIONS = [
  { value: 'member.invite', label: '邀请成员' },
  { value: 'api_key.create', label: '创建 API 密钥' },
  { value: 'auth.sign_in', label: '登录' },
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
    title: '通知设置',
    intro: '以通知类型为行、接收方式为列的表格。每个复选框的名称由所在行和列的标题组合而成（“评论与提及 邮件”）。无法发送的方式显示“—”；无法关闭的通知（安全、账单）不提供选择，而是写明“始终发送”。“暂停所有通知”放在表格前面，暂停期间无法在表格中选择，并写明原因。免打扰时段的结束时间早于开始时间时，会加上“次日”。',
  },
  samples: {
    keys: { production: '生产服务器', ci: 'CI 测试', analytics: '分析数据导出', legacy: '旧版集成' },
    scopes: {
      read: { label: '读取', description: '读取项目和成员' },
      write: { label: '写入', description: '创建、更改和删除项目' },
      billing: { label: '账单', description: '读取发票和用量' },
    },
    actions: {
      signIn: '登录',
      signInFailed: '登录失败',
      invite: '邀请成员',
      role: '更改成员角色',
      remove: '移除成员',
      keyCreate: '创建 API 密钥',
      keyRevoke: '撤销 API 密钥',
      plan: '更改套餐',
      settings: '更改工作区设置',
      export: '导出数据',
    },
    roleChange: '{0}（查看者 → 编辑者）',
    planChange: 'Free → Pro',
    settingsTarget: '工作区名称',
    exportTarget: '成员列表（CSV）',
    system: '系统',
    apiKey: 'API 密钥',
    locations: { tokyo: '日本东京', osaka: '日本大阪', fukuoka: '日本福冈', singapore: '新加坡' },
    topics: {
      comments: { label: '评论与提及', description: '给你的评论和 @提及' },
      invites: { label: '邀请与加入', description: '工作区邀请，以及成员加入' },
      projects: { label: '项目更新', description: '你所负责项目的变更' },
      weekly: { label: '每周摘要', description: '每周一早上，把上周的动态汇总发送给你' },
      product: { label: '新功能', description: '新功能与使用技巧' },
      security: { label: '安全', description: '新设备登录与密码修改' },
      billing: { label: '账单', description: '发票与付款失败' },
    },
  },
  a11yCaption: 'API 密钥、审计日志与通知设置模板的行为',
} satisfies typeof ja;
