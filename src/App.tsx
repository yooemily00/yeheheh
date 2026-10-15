import { useState } from 'react';
import { ConvertTab } from './components/ConvertTab';
import { ReferenceTab } from './components/ReferenceTab';

type Tab = 'convert' | 'reference';

export function App() {
  const [tab, setTab] = useState<Tab>('convert');
  return (
    <div className="app">
      <header className="header">
        <h1>검사 단위 변환 · 참고구간</h1>
        <p className="muted">UCUM 차원 검사 + IUPAC 원자량 기반 계산. 모든 결과에 계산 근거를 표시합니다.</p>
      </header>
      <nav className="tabs" role="tablist" aria-label="기능">
        <button role="tab" aria-selected={tab === 'convert'} className={tab === 'convert' ? 'tab tab-on' : 'tab'} onClick={() => setTab('convert')}>
          변환
        </button>
        <button role="tab" aria-selected={tab === 'reference'} className={tab === 'reference' ? 'tab tab-on' : 'tab'} onClick={() => setTab('reference')}>
          참고구간
        </button>
      </nav>
      <main>{tab === 'convert' ? <ConvertTab /> : <ReferenceTab />}</main>
      <footer className="footer muted small">
        교육·참고용 도구입니다. 임상 판단은 검사실이 보고한 단위와 참고구간을 우선하세요.
      </footer>
    </div>
  );
}
