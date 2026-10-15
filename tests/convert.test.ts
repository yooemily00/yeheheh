import { describe, expect, it } from 'vitest';
import { ANALYTES, findAnalyte, searchAnalytes } from '../src/data/analytes';
import { convert, type ConversionResult } from '../src/lib/convert';
import { molecularWeight } from '../src/lib/atomicWeights';

const a = (id: string) => {
  const x = findAnalyte(id);
  if (!x) throw new Error(id);
  return x;
};
const val = (r: ConversionResult) => {
  if (!r.ok) throw new Error(r.reason);
  return r.value;
};

describe('질량 ↔ 몰 (분자량 계산값 사용)', () => {
  it('포도당 mg/dL → mmol/L 계수 = 10 / MW', () => {
    const mw = molecularWeight('C6H12O6');
    expect(val(convert(a('glucose'), 100, 'mg/dL', 'mmol/L'))).toBeCloseTo((100 * 10) / mw, 10);
  });

  it('크레아티닌 mg/dL → µmol/L 계수 = 10000 / MW', () => {
    const mw = molecularWeight('C4H7N3O');
    expect(val(convert(a('creatinine'), 1, 'mg/dL', 'umol/L'))).toBeCloseTo(10000 / mw, 8);
  });

  it('결과에 계수·수식·출처가 붙는다', () => {
    const r = convert(a('cholesterol'), 200, 'mg/dL', 'mmol/L');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.factor).toBeCloseTo(10 / molecularWeight('C27H46O'), 10);
    expect(r.equation).toContain('×');
    expect(r.sources.map((s) => s.id)).toEqual(expect.arrayContaining(['ucum', 'iupac']));
    expect(r.steps.join(' ')).toContain('C27H46O');
  });
});

describe('당량 (이온 전하)', () => {
  it('Na⁺: 1 mmol/L = 1 mEq/L', () => {
    expect(val(convert(a('sodium'), 140, 'mmol/L', 'meq/L'))).toBeCloseTo(140, 10);
  });
  it('Ca²⁺: 2.5 mmol/L = 5 mEq/L', () => {
    expect(val(convert(a('calcium'), 2.5, 'mmol/L', 'meq/L'))).toBeCloseTo(5, 10);
  });
  it('Ca²⁺: mg/dL → mEq/L = mg/dL × 10 × 2 / MW', () => {
    expect(val(convert(a('calcium'), 10, 'mg/dL', 'meq/L'))).toBeCloseTo((10 * 10 * 2) / 40.078, 8);
  });
  it('Mg²⁺: mEq/L → mmol/L 은 ½', () => {
    expect(val(convert(a('magnesium'), 2, 'meq/L', 'mmol/L'))).toBeCloseTo(1, 10);
  });
});

describe('스케일 변환', () => {
  it('g/dL → g/L', () => expect(val(convert(a('albumin'), 4.2, 'g/dL', 'g/L'))).toBeCloseTo(42, 10));
  it('U/L → µkat/L (1 U = 1 µmol/min)', () =>
    expect(val(convert(a('alt'), 60, 'U/L', 'ukat/L'))).toBeCloseTo(1, 10));
  it('ng/mL = µg/L', () => expect(val(convert(a('ferritin'), 50, 'ng/mL', 'ug/L'))).toBeCloseTo(50, 10));
});

describe('근거 없는 변환 거부', () => {
  it('mg/dL → U/L 는 차원 불일치로 거부하고 이유를 준다', () => {
    const r = convert(a('glucose'), 100, 'mg/dL', 'U/L');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('incommensurable');
    expect(r.reason).toMatch(/차원/);
  });
  it('U/L → mg/dL 도 거부', () => {
    expect(convert(a('alt'), 30, 'U/L', 'mg/dL').ok).toBe(false);
  });
  it('분자량이 정의되지 않은 단백 혼합물 g/dL → mmol/L 거부', () => {
    const r = convert(a('total-protein'), 7, 'g/dL', 'mmol/L');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('missing-molecular-weight');
  });
  it('유효하지 않은 UCUM 단위 거부', () => {
    expect(convert(a('glucose'), 1, 'mg/dL', 'banana').ok).toBe(false);
  });
  it('숫자가 아닌 값 거부', () => {
    expect(convert(a('glucose'), NaN, 'mg/dL', 'mmol/L').ok).toBe(false);
  });
});

describe('양방향 스왑 왕복', () => {
  it('모든 UCUM 분석물의 모든 단위쌍이 왕복 시 원래 값으로 돌아온다', () => {
    for (const an of ANALYTES.filter((x) => x.kind !== 'hba1c')) {
      for (const f of an.units) {
        for (const t of an.units) {
          const fwd = val(convert(an, 123.4, f.id, t.id));
          const back = val(convert(an, fwd, t.id, f.id));
          expect(back, `${an.id} ${f.id}->${t.id}`).toBeCloseTo(123.4, 8);
        }
      }
    }
  });
});

describe('검색', () => {
  it('영문·한글·동의어로 찾는다', () => {
    expect(searchAnalytes('glucose')[0].id).toBe('glucose');
    expect(searchAnalytes('당화혈색소')[0].id).toBe('hba1c');
    expect(searchAnalytes('BUN')[0].id).toBe('urea');
    expect(searchAnalytes('sgpt')[0].id).toBe('alt');
    expect(searchAnalytes('크레아티닌').map((x) => x.id)).toContain('creatinine');
  });
  it('빈 검색어는 전체 목록', () => {
    expect(searchAnalytes('')).toHaveLength(ANALYTES.length);
  });
});
