import { describe, expect, it } from 'vitest';
import type { ReferenceInterval } from '../src/data/referenceIntervals';
import { REFERENCE_INTERVALS } from '../src/data/referenceIntervals';
import { judge, lookupIntervals } from '../src/lib/referenceLookup';

// 조회 로직 검증용 가상 데이터 (실제 공표값 아님 — 앱에는 포함되지 않음)
const FIXTURE: ReferenceInterval[] = [
  { analyteId: 'x', specimen: 'serum/plasma', sex: 'all', ageMin: 18, ageMax: 60, ageLabel: '18–<60 y', lower: 10, upper: 20, unit: 'u', sourceId: 'test' },
  { analyteId: 'x', specimen: 'serum/plasma', sex: 'M', ageMin: 60, ageMax: null, ageLabel: '≥60 y', lower: 12, upper: 25, unit: 'u', sourceId: 'test' },
  { analyteId: 'y', specimen: 'urine', sex: 'all', ageMin: 18, ageMax: null, ageLabel: '≥18 y', lower: null, upper: 3, unit: 'u', sourceId: 'test' },
];

describe('참고구간 조회', () => {
  it('나이·성별·검체가 맞는 구간만 반환', () => {
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 40, sex: 'F', specimen: 'serum' })).toHaveLength(1);
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 70, sex: 'M', specimen: 'plasma' })[0].ageLabel).toBe('≥60 y');
  });
  it('공표 구간 밖 나이는 외삽하지 않고 빈 결과', () => {
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 10, sex: 'F', specimen: 'serum' })).toEqual([]);
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 70, sex: 'F', specimen: 'serum' })).toEqual([]);
  });
  it('나이 상한은 미포함, 하한은 포함', () => {
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 18, sex: 'F', specimen: 'serum' })).toHaveLength(1);
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 60, sex: 'F', specimen: 'serum' })).toHaveLength(0);
  });
  it('검체 불일치는 제외', () => {
    expect(lookupIntervals(FIXTURE, { analyteId: 'x', ageYears: 40, sex: 'F', specimen: 'urine' })).toEqual([]);
  });
});

describe('판정', () => {
  it('low / normal / high, 경계값은 normal', () => {
    const ri = { lower: 10, upper: 20 };
    expect(judge(9.9, ri)).toBe('low');
    expect(judge(10, ri)).toBe('normal');
    expect(judge(20, ri)).toBe('normal');
    expect(judge(20.1, ri)).toBe('high');
  });
  it('상한만 공표된 경우 low 판정 없음', () => {
    expect(judge(0, { lower: null, upper: 3 })).toBe('normal');
    expect(judge(4, { lower: null, upper: 3 })).toBe('high');
  });
});

describe('앱 데이터', () => {
  it('원문 미확인 상태에서는 참고구간을 임의로 채우지 않는다', () => {
    // TODO(verify): RCPA Table 6 원문 확인 후 데이터를 넣으면 이 테스트를 갱신
    expect(REFERENCE_INTERVALS).toEqual([]);
  });
});
