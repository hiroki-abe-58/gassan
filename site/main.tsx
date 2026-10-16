import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './layers.css';
import '../src/styles.css';
import './site.css';
import { App } from './App';
import { loadLang } from './i18n';
import { currentLang } from './router';
import { initTheme } from './theme/store';

const container = document.getElementById('root');
if (!container) throw new Error('#root が無い');

// 色は CSS ではなくテーマから書く。描画より先に適用して、一瞬だけ別の色が出るのを避ける。
initTheme();

// 文言は言語ごとに別のチャンク。URL の言語を読み終えてから描く（別の言語が一瞬出るのを避ける）。
void loadLang(currentLang()).then(() => {
  // StrictMode で effect が二重に走っても、モーダルが二重に開いたりゲートの登録が壊れたりしないことを、
  // サイトそのものが毎回確かめている。
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
