import { describe, expect, it } from 'vitest';
import { molecularWeight, parseFormula } from '../src/lib/atomicWeights';

describe('화학식 파서 / 분자량', () => {
  it('원소 개수를 센다', () => {
    expect(parseFormula('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 });
    expect(parseFormula('CH4N2O')).toEqual({ C: 1, H: 4, N: 2, O: 1 });
    expect(parseFormula('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
  });

  it('원자량 합으로 분자량을 계산한다', () => {
    // 6×12.011 + 12×1.008 + 6×15.999
    expect(molecularWeight('C6H12O6')).toBeCloseTo(180.156, 3);
    expect(molecularWeight('C4H7N3O')).toBeCloseTo(113.12, 2);
    expect(molecularWeight('CH4N2O')).toBeCloseTo(60.056, 3);
    expect(molecularWeight('N2')).toBeCloseTo(28.014, 3);
  });

  it('잘못된 화학식·미등록 원소는 오류', () => {
    expect(() => parseFormula('c6h12')).toThrow();
    expect(() => molecularWeight('Xe')).toThrow();
    expect(() => parseFormula('C6(H12')).toThrow();
  });
});
