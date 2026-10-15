/**
 * 참고구간 데이터.
 *
 * 원칙: 공표된 구간을 원문 그대로 옮긴다. 원문을 확인하지 못한 값은 넣지 않는다.
 *
 * 현재 비어 있음 — 이유는 MISSING_DATA 참고.
 * TODO(verify): RCPA Table 6 원문을 확인할 수 있는 환경에서 아래 형식으로 채울 것.
 *
 * 예시 형식 (실제 값 아님):
 * { analyteId: 'sodium', specimen: 'serum/plasma', sex: 'all', ageMin: 18, ageMax: null,
 *   lower: ?, upper: ?, unit: 'mmol/L', sourceId: 'rcpa', ageLabel: '≥18 y' }
 */
export type Sex = 'M' | 'F' | 'all';

export interface ReferenceInterval {
  analyteId: string;
  specimen: string;
  sex: Sex;
  /** 나이 하한(년, 포함) */
  ageMin: number;
  /** 나이 상한(년, 미포함). null = 상한 없음 */
  ageMax: number | null;
  /** 원문 표기 그대로의 나이 구간 */
  ageLabel: string;
  lower: number | null;
  upper: number | null;
  unit: string;
  sourceId: string;
  note?: string;
}

export const REFERENCE_INTERVALS: ReferenceInterval[] = [];

export const SPECIMENS = ['serum/plasma', 'serum', 'plasma', 'whole blood', 'urine'] as const;

export interface MissingData {
  item: string;
  reason: string;
}

export const MISSING_DATA: MissingData[] = [
  {
    item: 'RCPA Harmonised Reference Intervals (Table 6) — 성인 참고구간 전체',
    reason:
      '앱 작성 세션의 네트워크 정책이 www.rcpa.edu.au 접속을 차단(HTTP 403)해 원문 표를 열지 못했다. 검색 결과 요약이나 기억으로 채우는 것은 "공표 구간을 그대로" 원칙에 어긋나므로 비워 두었다.',
  },
  {
    item: 'CALIPER 소아 참고구간',
    reason:
      '요구사항대로 앱은 CALIPER로 안내만 한다(데이터 미탑재). caliperproject.ca도 같은 네트워크 정책으로 차단되어 링크 경로를 직접 확인하지 못했다.',
  },
];
