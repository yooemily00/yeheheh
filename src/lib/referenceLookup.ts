import type { ReferenceInterval, Sex } from '../data/referenceIntervals';

export interface LookupQuery {
  analyteId: string;
  ageYears: number;
  sex: Exclude<Sex, 'all'>;
  specimen: string;
}

/** serum/plasma로 공표된 구간은 serum·plasma 선택 시에도 해당 */
function specimenMatches(published: string, selected: string): boolean {
  if (published === selected) return true;
  if (published === 'serum/plasma') return selected === 'serum' || selected === 'plasma';
  return false;
}

/**
 * 조건에 정확히 맞는 공표 구간만 반환한다.
 * 나이가 어떤 공표 구간에도 들어가지 않으면 빈 배열 — 외삽하지 않는다.
 */
export function lookupIntervals(data: ReferenceInterval[], q: LookupQuery): ReferenceInterval[] {
  return data.filter(
    (ri) =>
      ri.analyteId === q.analyteId &&
      specimenMatches(ri.specimen, q.specimen) &&
      (ri.sex === 'all' || ri.sex === q.sex) &&
      q.ageYears >= ri.ageMin &&
      (ri.ageMax === null || q.ageYears < ri.ageMax),
  );
}

/** 해당 분석물에 대해 공표된 나이 구간 목록 (외삽 없음 안내용) */
export function publishedAgeBands(data: ReferenceInterval[], analyteId: string): string[] {
  return [...new Set(data.filter((ri) => ri.analyteId === analyteId).map((ri) => `${ri.ageLabel} (${ri.sex}, ${ri.specimen})`))];
}

export type Judgement = 'low' | 'normal' | 'high';

/** 경계값은 구간 안(normal)으로 본다. 한쪽 한계만 공표된 경우 그 한계만 적용 */
export function judge(value: number, ri: Pick<ReferenceInterval, 'lower' | 'upper'>): Judgement {
  if (ri.lower !== null && value < ri.lower) return 'low';
  if (ri.upper !== null && value > ri.upper) return 'high';
  return 'normal';
}

export const PAEDIATRIC_AGE = 18;
