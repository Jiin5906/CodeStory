import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TagManager from 'react-gtm-module' // [추가]

// [추가] 환경 변수에서 GTM ID를 가져와 초기화합니다.
const gtmId = import.meta.env.VITE_GTM_ID;
if (gtmId) {
    TagManager.initialize({ gtmId });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)