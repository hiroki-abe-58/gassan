import type ja from '../../ja/demos/quickStart';

export default {
  open: '開啟',
  title: '編輯個人資料',
  name: '顯示名稱',
  cancel: '先不要',
  save: '儲存',
  comments: {
    alwaysMounted: '常駐掛載，用 open 控制開關。寫成 {open && <Modal.Root />} 就無法繪製退場動畫',
  },
} satisfies typeof ja;
