import type ja from '../../ja/demos/japaneseNormalize';

export default {
  postalCode: '郵遞區號',
  postalCodeHelp: '不論有無〒、全形或連字號，都統一為「123-4567」',
  phone: '電話號碼',
  phoneHelp: '統一為純數字（+81 改為 0）',
  kana: '振假名',
  kanaHelp: '平假名、半形片假名轉為片假名',
  company: '公司名稱',
  companyHelp: '英數字轉為半形，半形片假名轉為全形',
  invoice: '登記號碼（發票）',
  invoiceHelp: '從數字開始輸入也會補上 T',
  legacy: '傳送到要求全形之系統的地址',
  legacyHelp: '英數字與空白也轉為全形',
  comments: {
    postalCode: '每次輸入時統一（輸入法組字期間不處理）。onChange 會收到統一後的值',
    phone: '值只有數字（加上分隔需要區碼表，所以不加）',
    legacy: '不說「請以全形輸入」，而是由接收的一方轉成全形',
    received: '應用程式收到的值',
  },
} satisfies typeof ja;
