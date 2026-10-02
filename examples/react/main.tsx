import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../src/styles.css';
import './demo.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

// StrictMode で二重に effect が走る。
// ここで dialog が二重に開いたり、ゲートの登録が壊れたりしないことを目視で確認する。
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
