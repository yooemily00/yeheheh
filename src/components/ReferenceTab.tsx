import { useState } from 'react';
import { ANALYTES, type Analyte } from '../data/analytes';
import { MISSING_DATA, REFERENCE_INTERVALS, SPECIMENS } from '../data/referenceIntervals';
import { judge, lookupIntervals, PAEDIATRIC_AGE, publishedAgeBands } from '../lib/referenceLookup';
import { SOURCES } from '../lib/sources';
import { AnalytePicker } from './AnalytePicker';

const JUDGE_LABEL = { low: '낮음 (Low)', normal: '참고구간 내 (Normal)', high: '높음 (High)' } as const;

export function ReferenceTab() {
  const [analyte, setAnalyte] = useState<Analyte>(ANALYTES[0]);
  const [age, setAge] = useState('45');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [specimen, setSpecimen] = useState<string>('serum');
  const [rawResult, setRawResult] = useState('');

  const ageYears = Number(age);
  const ageValid = age.trim() !== '' && Number.isFinite(ageYears) && ageYears >= 0 && ageYears < 130;
  const matches = ageValid ? lookupIntervals(REFERENCE_INTERVALS, { analyteId: analyte.id, ageYears, sex, specimen }) : [];
  const bands = publishedAgeBands(REFERENCE_INTERVALS, analyte.id);
  const resultValue = rawResult.trim() === '' ? null : Number(rawResult.replace(',', '.'));
  const datasetEmpty = REFERENCE_INTERVALS.length === 0;

  return (
    <section className="panel" aria-labelledby="ri-title">
      <h2 id="ri-title" className="sr-only">참고구간 조회</h2>

      {datasetEmpty && (
        <div className="notice notice-warn" role="status">
          <strong>참고구간 데이터가 아직 들어 있지 않습니다.</strong>
          <ul>
            {MISSING_DATA.map((m) => (
              <li key={m.item}>
                <b>{m.item}</b> — {m.reason}
              </li>
            ))}
          </ul>
          <p className="small">
            원문: <a href={SOURCES.rcpa.url} target="_blank" rel="noreferrer">{SOURCES.rcpa.label}</a>
          </p>
        </div>
      )}

      <AnalytePicker value={analyte} onChange={setAnalyte} />

      <div className="row">
        <div className="col">
          <label className="field-label" htmlFor="age">나이 (년)</label>
          <input id="age" className="input" inputMode="decimal" value={age} onChange={(e) => setAge(e.target.value)} aria-invalid={!ageValid} />
        </div>
        <div className="col">
          <span className="field-label" id="sex-label">성별</span>
          <div className="seg" role="radiogroup" aria-labelledby="sex-label">
            {(['F', 'M'] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={sex === s} className={sex === s ? 'seg-on' : ''} onClick={() => setSex(s)}>
                {s === 'F' ? '여' : '남'}
              </button>
            ))}
          </div>
        </div>
        <div className="col">
          <label className="field-label" htmlFor="spec">검체</label>
          <select id="spec" className="input" value={specimen} onChange={(e) => setSpecimen(e.target.value)}>
            {SPECIMENS.filter((s) => s !== 'serum/plasma').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <label className="field-label" htmlFor="res">결과 값 (선택)</label>
          <input id="res" className="input" inputMode="decimal" value={rawResult} onChange={(e) => setRawResult(e.target.value)} placeholder="판정할 값" />
        </div>
      </div>

      {ageValid && ageYears < PAEDIATRIC_AGE && (
        <div className="notice notice-info">
          만 {PAEDIATRIC_AGE}세 미만은 소아 참고구간을 확인하세요:{' '}
          <a href={SOURCES.caliper.url} target="_blank" rel="noreferrer">{SOURCES.caliper.label}</a>
          <span className="tag-verify" title={SOURCES.caliper.note}>TODO(verify)</span>
        </div>
      )}

      {!ageValid && <p className="muted">0–129 사이 나이를 입력하세요.</p>}

      {ageValid && matches.length === 0 && (
        <div className="result result-empty">
          <div className="reject-title">공표된 참고구간 없음</div>
          <p>
            {analyte.ko} · {ageYears}세 · {sex === 'F' ? '여' : '남'} · {specimen} 조건에 해당하는 공표 구간이 데이터에 없습니다. 다른 나이 구간에서 값을 끌어오거나 외삽하지 않습니다.
          </p>
          {bands.length > 0 && <p className="small">이 분석물의 공표 나이 구간: {bands.join(', ')}</p>}
        </div>
      )}

      {matches.map((ri) => {
        const j = resultValue !== null && Number.isFinite(resultValue) ? judge(resultValue, ri) : null;
        const src = SOURCES[ri.sourceId];
        return (
          <div key={`${ri.ageLabel}-${ri.sex}-${ri.specimen}`} className="result">
            <div className="result-main">
              <span className="result-value">
                {ri.lower ?? '—'} – {ri.upper ?? '—'}
              </span>
              <span className="result-unit">{ri.unit}</span>
            </div>
            {j && (
              <div className={`judge judge-${j}`}>
                {resultValue} {ri.unit} → {JUDGE_LABEL[j]}
              </div>
            )}
            <dl className="basis">
              <dt>나이 구간</dt>
              <dd>{ri.ageLabel}</dd>
              <dt>성별</dt>
              <dd>{ri.sex === 'all' ? '공통' : ri.sex}</dd>
              <dt>검체</dt>
              <dd>{ri.specimen}</dd>
              <dt>출처</dt>
              <dd>{src ? <a href={src.url} target="_blank" rel="noreferrer">{src.label}</a> : ri.sourceId}</dd>
              {ri.note && (
                <>
                  <dt>비고</dt>
                  <dd>{ri.note}</dd>
                </>
              )}
            </dl>
          </div>
        );
      })}
    </section>
  );
}
