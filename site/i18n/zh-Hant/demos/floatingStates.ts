import type ja from '../../ja/demos/floatingStates';

export default {
  name: '顯示名稱',
  nameValue: '陳怡君',
  email: '電子郵件地址',
  emailValue: 'aoi@',
  emailError: '請依電子郵件地址的格式輸入',
  workspace: '工作區網址',
  workspaceValue: 'atlas-design',
  workspaceHelp: '建立後就無法變更',
  reset: '還原為初始值',
  comments: {
    reset: '以 form.reset() 回到空白或初始值時，標籤也會跟著移動（受控的值在 onReset 中還原）',
    initial: '有 defaultValue 時，從首次渲染起就以浮起的樣子顯示（在伺服器端渲染也一樣）',
    error: '錯誤顯示在欄位下方，標籤也會變成紅色。關聯（aria-invalid / aria-describedby）與標籤在上方時相同',
    disabled: '無法使用的欄位，外框與標籤會一起變淡',
  },
} satisfies typeof ja;
