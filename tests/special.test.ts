import { describe, expect, it } from 'vitest';
import { findAnalyte } from '../src/data/analytes';
import { convert, HBA1C, type ConversionResult } from '../src/lib/convert';
import { molecularWeight } from '../src/lib/atomicWeights';

const a = (id: string) => findAnalyte(id)!;
const val = (r: ConversionResult) => {
  if (!r.ok) throw new Error(r.reason);
  return r.value;
};

describe('HbA1c NGSP ↔ IFCC (마스터 방정식)', () => {
  it('NGSP 6.5% → IFCC ≈ 48 mmol/mol', () => {
    expect(val(convert(a('hba1c'), 6.5, 'ngsp', 'ifcc'))).toBeCloseTo(10.929 * (6.5 - 2.15), 10);
    expect(Math.round(HBA1C.ngspToIfcc(6.5))).toBe(48);
  });
  it('IFCC 53 mmol/mol → NGSP ≈ 7.0%', () => {
    expect(val(convert(a('hba1c'), 53, 'ifcc', 'ngsp'))).toBeCloseTo(0.09148 * 53 + 2.152, 10);
    expect(HBA1C.ifccToNgsp(53)).toBeCloseTo(7.0, 1);
  });
  it('단일 계수가 없음을 명시한다', () => {
    const r = convert(a('hba1c'), 7, 'ngsp', 'ifcc');
    expect(r.ok && r.factor).toBe(null);
  });
  it('HbA1c를 mg/dL 등으로 바꾸려 하면 거부', () => {
    expect(convert(a('hba1c'), 7, 'ngsp', 'mg/dL').ok).toBe(false);
  });
});

describe('uACR / uPCR mg/g ↔ mg/mmol (분모 크레아티닌)', () => {
  it('계수 = 크레아티닌 MW / 1000', () => {
    const mw = molecularWeight('C4H7N3O');
    expect(val(convert(a('uacr'), 30, 'mg/g', 'mg/mmol'))).toBeCloseTo((30 * mw) / 1000, 8);
    expect(val(convert(a('upcr'), 150, 'mg/g', 'mg/mmol'))).toBeCloseTo((150 * mw) / 1000, 8);
  });
  it('KDIGO A2 경계 30 mg/g ≈ 3 mg/mmol (반올림 관행)', () => {
    // TODO(verify): KDIGO 2024 원문의 범주표 표기와 대조하지 못함
    expect(Math.round(val(convert(a('uacr'), 30, 'mg/g', 'mg/mmol')))).toBe(3);
    expect(Math.round(val(convert(a('uacr'), 300, 'mg/g', 'mg/mmol')))).toBe(34);
  });
  it('KDIGO 출처가 붙는다', () => {
    const r = convert(a('uacr'), 30, 'mg/g', 'mg/mmol');
    expect(r.ok && r.sources.map((s) => s.id)).toContain('kdigo2024');
  });
});

describe('BUN ↔ 요소', () => {
  const nw = molecularWeight('N2');
  const uw = molecularWeight('CH4N2O');
  it('BUN mg/dL → 요소 mg/dL = × MW(urea)/MW(N2)', () => {
    expect(val(convert(a('urea'), 14, 'bun-mg/dL', 'urea-mg/dL'))).toBeCloseTo((14 * uw) / nw, 8);
  });
  it('BUN mg/dL → 요소 mmol/L = × 10/MW(N2)', () => {
    expect(val(convert(a('urea'), 14, 'bun-mg/dL', 'urea-mmol/L'))).toBeCloseTo((14 * 10) / nw, 8);
  });
  it('요소 mmol/L → 요소 mg/dL = × MW(urea)/10', () => {
    expect(val(convert(a('urea'), 5, 'urea-mmol/L', 'urea-mg/dL'))).toBeCloseTo((5 * uw) / 10, 8);
  });
});

describe('중성지방 (triolein 가정)', () => {
  it('mg/dL → mmol/L = × 10 / MW(C57H104O6)', () => {
    const mw = molecularWeight('C57H104O6');
    expect(mw).toBeCloseTo(885.45, 1);
    expect(val(convert(a('triglyceride'), 150, 'mg/dL', 'mmol/L'))).toBeCloseTo((150 * 10) / mw, 8);
  });
  it('가정이 결과에 표시된다', () => {
    const r = convert(a('triglyceride'), 150, 'mg/dL', 'mmol/L');
    expect(r.ok && r.assumptions.join(' ')).toMatch(/triolein/);
  });
});
