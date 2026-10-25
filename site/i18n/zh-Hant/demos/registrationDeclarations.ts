import type ja from '../../ja/demos/registrationDeclarations';

export default {
  note: '開立帳戶的產業（銀行、證券、加密資產、匯款等）在身分驗證之前詢問的申報與聲明。',
  comments: {
    labels: '依法令撰寫的文字（聲明文與範圍的說明）也能從註冊的文字表取得',
    tax: '選「僅日本」只要按一次。只對還有其他國家的人顯示國家與稅籍編號的欄位',
    usPerson: '只對回答「有」的人，詢問美國稅籍編號與申報的同意',
    declaration: '冗長的範圍說明，放在可以展開與收合的 details 中',
  },
} satisfies typeof ja;
