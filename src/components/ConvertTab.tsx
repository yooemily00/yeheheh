import { useMemo, useState } from 'react';
import { ANALYTES, type Analyte } from '../data/analytes';
import { convert, formatNumber } from '../lib/convert';
import { AnalytePicker } from './AnalytePicker';
import { SourceList } from './SourceList';

const CUSTOM = '__custom__';

export function ConvertTab() {
  const [analyte, setAnalyte] = useState<Analyte>(ANALYTES[0]);
  const [raw, setRaw] = useState('100');
  const [fromId, setFromId] = useState(ANALYTES[0].units[0].id);
  const [toId, setToId] = useState(ANALYTES[0].units[1].id);
  const [customTo, setCustomTo] = useState('U/L');
  const [copied, setCopied] = useState(false);

  const pick = (a: Analyte) => {
    setAnalyte(a);
    setFromId(a.units[0].id);
    setToId(a.units[1]?.id ?? a.units[0].id);
  };

  const value = raw.trim() === '' ? NaN : Number(raw.replace(',', '.'));
  const effectiveTo = toId === CUSTOM ? customTo.trim() : toId;
  const result = useMemo(
    () => (raw.trim() === '' || effectiveTo === '' ? null : convert(analyte, value, fromId, effectiveTo)),
    [analyte, value, raw, fromId, effectiveTo],
  );

  const swap = () => {
    if (toId === CUSTOM) return;
    setFromId(toId);
    setToId(fromId);
    if (result?.ok) setRaw(formatNumber(result.value, 6));
  };

  const copy = async () => {
    if (!result?.ok) return;
    const text = `${analyte.en} ${raw} ${result.from.label} = ${formatNumber(result.value)} ${result.to.label}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한 없음 */
    }
  };

  return (
    <section className="panel" aria-labelledby="convert-title">
      <h2 id="convert-title" className="sr-only">단위 변환</h2>
      <AnalytePicker value={analyte} onChange={pick} />

      <div className="row">
        <div className="col">
          <label className="field-label" htmlFor="val">값</label>
          <input id="val" className="input input-num" inputMode="decimal" value={raw} onChange={(e) => setRaw(e.target.value)} />
        </div>
        <div className="col">
          <label className="field-label" htmlFor="from">원본 단위</label>
          <select id="from" className="input" value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {analyte.units.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-icon" onClick={swap} disabled={toId === CUSTOM} aria-label="원본·대상 단위 바꾸기" title="양방향 스왑">
          ⇄
        </button>
        <div className="col">
          <label className="field-label" htmlFor="to">대상 단위</label>
          <select id="to" className="input" value={toId} onChange={(e) => setToId(e.target.value)}>
            {analyte.units.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
            <option value={CUSTOM}>기타 단위 직접 입력 (UCUM)…</option>
          </select>
          {toId === CUSTOM && (
            <input className="input input-sm" aria-label="UCUM 단위 코드" value={customTo} onChange={(e) => setCustomTo(e.target.value)} placeholder="예: U/L" />
          )}
        </div>
      </div>

      {result && result.ok && (
        <div className="result" aria-live="polite">
          <div className="result-main">
            <span className="result-value">{formatNumber(result.value)}</span>
            <span className="result-unit">{result.to.label}</span>
            <button type="button" className="btn btn-ghost" onClick={copy}>{copied ? '복사됨 ✓' : '복사'}</button>
          </div>
          <div className="result-sub">
            {raw} {result.from.label} · {analyte.ko}
          </div>

          <div className="basis">
            <h3>계산 근거</h3>
            <dl>
              <dt>방법</dt>
              <dd>{result.method}</dd>
              <dt>계수</dt>
              <dd>{result.factor !== null ? `× ${formatNumber(result.factor, 6)}` : '절편이 있는 식이라 단일 계수 없음'}</dd>
              <dt>수식</dt>
              <dd><code>{result.equation}</code></dd>
              {result.steps.length > 0 && (
                <>
                  <dt>계산 과정</dt>
                  <dd>
                    <ol className="steps">{result.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                  </dd>
                </>
              )}
              <dt>가정</dt>
              <dd>
                {result.assumptions.length ? <ul>{result.assumptions.map((a) => <li key={a}>{a}</li>)}</ul> : '추가 가정 없음'}
              </dd>
              <dt>출처</dt>
              <dd><SourceList sources={result.sources} /></dd>
            </dl>
          </div>
        </div>
      )}

      {result && !result.ok && (
        <div className="result result-reject" role="alert">
          <div className="reject-title">변환하지 않음</div>
          <p>{result.reason}</p>
          <p className="muted small">코드: {result.code}</p>
        </div>
      )}
    </section>
  );
}
