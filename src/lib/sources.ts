export interface Source {
  id: string;
  label: string;
  url: string;
  /** 앱 작성 시점에 원문을 직접 열어 확인했는지 여부 */
  verified: boolean;
  note?: string;
}

const BLOCKED = '작성 세션의 네트워크 정책(403)으로 원문 페이지 접속 불가 — TODO(verify)';

export const SOURCES: Record<string, Source> = {
  ucum: {
    id: 'ucum',
    label: 'UCUM (Unified Code for Units of Measure) — @lhncbc/ucum-lhc 8.0.0',
    url: 'https://ucum.org/ucum',
    verified: true,
    note: '변환은 설치된 라이브러리를 직접 실행해 계산',
  },
  iupac: {
    id: 'iupac',
    label: 'IUPAC CIAAW Standard Atomic Weights',
    url: 'https://www.ciaaw.org/atomic-weights.htm',
    verified: false,
    note: BLOCKED,
  },
  ngsp: {
    id: 'ngsp',
    label: 'NGSP — IFCC Standardization of HbA1c (master equation)',
    url: 'https://ngsp.org/ifcc.asp',
    verified: false,
    note: BLOCKED,
  },
  kdigo2024: {
    id: 'kdigo2024',
    label: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD',
    url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
    verified: false,
    note: BLOCKED,
  },
  rcpa: {
    id: 'rcpa',
    label: 'RCPA Manual — Table 6: Harmonised reference intervals for chemical pathology',
    url: 'https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Harmonised-reference-intervals-for-chem',
    verified: false,
    note: BLOCKED,
  },
  caliper: {
    id: 'caliper',
    label: 'CALIPER — Canadian Laboratory Initiative on Paediatric Reference Intervals',
    url: 'https://caliperproject.ca/',
    verified: false,
    note: BLOCKED,
  },
};
