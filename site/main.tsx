import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './layers.css';
import '../src/styles.css';
import './site.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('#root が無い');

// StrictMode で effect が二重に走っても、モーダルが二重に開いたりゲートの登録が壊れたりしないことを、
// サイトそのものが毎回確かめている。
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
