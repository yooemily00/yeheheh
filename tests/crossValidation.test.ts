/**
 * 교차 검증 — 계산된 계수를 공개 SI 변환표의 반올림 계수와 대조한다.
 * 이 값들은 앱에 들어가지 않고 테스트에서만 쓴다.
 *
 * TODO(verify): 작성 세션의 네트워크 정책으로 아래 원문을 열지 못했다.
 *   - Labcorp SI Unit Conversion Table
 *   - CMEinfo SI conversion table (PDF)
 *   - NBME Laboratory Reference Values (PDF)
 * 따라서 expected 값은 위 문서에서 직접 옮긴 것이 아니라, SI 변환표에 관행적으로
 * 실리는 반올림 계수다. 원문 확인 후 문서별로 열을 나눠 갱신할 것.
 */
import { describe, expect, it } from 'vitest';
import { findAnalyte } from '../src/data/analytes';
import { convert } from '../src/lib/convert';

const CASES: [analyte: string, from: string, to: string, expected: number][] = [
  ['glucose', 'mg/dL', 'mmol/L', 0.0555],
  ['creatinine', 'mg/dL', 'umol/L', 88.4],
  ['urea', 'bun-mg/dL', 'urea-mmol/L', 0.357],
  ['uric-acid', 'mg/dL', 'umol/L', 59.48],
  ['cholesterol', 'mg/dL', 'mmol/L', 0.0259],
  ['triglyceride', 'mg/dL', 'mmol/L', 0.0113],
  ['bilirubin', 'mg/dL', 'umol/L', 17.1],
  ['calcium', 'mg/dL', 'mmol/L', 0.25],
  ['magnesium', 'mg/dL', 'mmol/L', 0.411],
  ['phosphate', 'mg/dL', 'mmol/L', 0.323],
  ['iron', 'ug/dL', 'umol/L', 0.179],
  ['ammonia', 'ug/dL', 'umol/L', 0.587],
  ['lactate', 'mg/dL', 'mmol/L', 0.111],
  ['ethanol', 'mg/dL', 'mmol/L', 0.217],
  ['cortisol', 'ug/dL', 'nmol/L', 27.59],
  ['free-t4', 'ng/dL', 'pmol/L', 12.87],
  ['testosterone', 'ng/dL', 'nmol/L', 0.0347],
  ['vitamin-d', 'ng/mL', 'nmol/L', 2.496],
  ['vitamin-b12', 'pg/mL', 'pmol/L', 0.738],
  ['folate', 'ng/mL', 'nmol/L', 2.266],
  ['digoxin', 'ng/mL', 'nmol/L', 1.281],
];

describe('교차 검증: 계산 계수 vs 공개 변환표 반올림 계수 (±1%)', () => {
  it.each(CASES)('%s %s → %s ≈ %f', (id, from, to, expected) => {
    const r = convert(findAnalyte(id)!, 1, from, to);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Math.abs(r.value - expected) / expected).toBeLessThan(0.01);
  });
});
