import type ja from '../../ja/demos/registrationNumbers';

export default {
  try: '輸入 7000012050002，公司名稱就會填入「国税庁」（日本國稅廳；範例資料）。',
  comments: {
    lookup: '依法人編號查詢公司名稱。範例從手邊的表格查詢（實際上會從自己的伺服器呼叫日本國稅廳的法人編號系統 Web-API）',
    myNumber: '也接受全形、空白與連字號，統一為純數字',
    check: '位數與檢查碼在嘗試送出後才以 isMyNumber 確認（輸入途中不報錯）',
    company: '湊齊正確的 13 位數後才查詢，只填入空白的欄位，或先前自動填入後未更動的欄位',
  },
} satisfies typeof ja;
