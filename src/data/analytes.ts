/**
 * 분석물 정의. 변환 계수는 여기 적지 않는다.
 * 계수는 화학식 → 분자량(IUPAC 원자량) → UCUM 변환으로 실행 시 계산한다.
 */
export interface UnitOption {
  id: string;
  /** UCUM 코드 (special 변환은 의미상 코드) */
  ucum: string;
  label: string;
  /** 이 단위가 분석물과 다른 화학종 기준으로 표기될 때 (예: BUN = 질소 기준) */
  basis?: { formula: string; label: string };
}

export type AnalyteKind = 'ucum' | 'hba1c' | 'ratio';

export interface Analyte {
  id: string;
  en: string;
  ko: string;
  synonyms: string[];
  category: string;
  kind: AnalyteKind;
  /** 질량↔몰 변환 기준 화학식 */
  formula?: string;
  formulaLabel?: string;
  /** 이온 전하의 절댓값 (mEq 변환) */
  charge?: number;
  units: UnitOption[];
  assumptions?: string[];
  /** 추가 출처 id (sources.ts) */
  sources?: string[];
}

const MGDL: UnitOption = { id: 'mg/dL', ucum: 'mg/dL', label: 'mg/dL' };
const MMOLL: UnitOption = { id: 'mmol/L', ucum: 'mmol/L', label: 'mmol/L' };
const UMOLL: UnitOption = { id: 'umol/L', ucum: 'umol/L', label: 'µmol/L' };
const MEQL: UnitOption = { id: 'meq/L', ucum: 'meq/L', label: 'mEq/L' };
const GDL: UnitOption = { id: 'g/dL', ucum: 'g/dL', label: 'g/dL' };
const GL: UnitOption = { id: 'g/L', ucum: 'g/L', label: 'g/L' };
const UL: UnitOption = { id: 'U/L', ucum: 'U/L', label: 'U/L' };
const UKATL: UnitOption = { id: 'ukat/L', ucum: 'ukat/L', label: 'µkat/L' };
const UGDL: UnitOption = { id: 'ug/dL', ucum: 'ug/dL', label: 'µg/dL' };
const NGML: UnitOption = { id: 'ng/mL', ucum: 'ng/mL', label: 'ng/mL' };
const NGDL: UnitOption = { id: 'ng/dL', ucum: 'ng/dL', label: 'ng/dL' };
const PGML: UnitOption = { id: 'pg/mL', ucum: 'pg/mL', label: 'pg/mL' };
const UGL: UnitOption = { id: 'ug/L', ucum: 'ug/L', label: 'µg/L' };
const MGL: UnitOption = { id: 'mg/L', ucum: 'mg/L', label: 'mg/L' };
const NMOLL: UnitOption = { id: 'nmol/L', ucum: 'nmol/L', label: 'nmol/L' };
const PMOLL: UnitOption = { id: 'pmol/L', ucum: 'pmol/L', label: 'pmol/L' };

const enzyme = (id: string, en: string, ko: string, synonyms: string[]): Analyte => ({
  id,
  en,
  ko,
  synonyms,
  category: '효소',
  kind: 'ucum',
  units: [UL, UKATL],
  assumptions: ['1 U = 1 µmol/min (UCUM 정의). 측정 온도·방법(IFCC 37 °C 등)은 변환으로 바뀌지 않는다.'],
});

export const ANALYTES: Analyte[] = [
  {
    id: 'glucose', en: 'Glucose', ko: '포도당(혈당)', synonyms: ['GLU', 'blood sugar', 'FBS', '공복혈당'],
    category: '당', kind: 'ucum', formula: 'C6H12O6', formulaLabel: 'D-glucose', units: [MGDL, MMOLL],
  },
  {
    id: 'hba1c', en: 'Hemoglobin A1c', ko: '당화혈색소', synonyms: ['HbA1c', 'A1c', 'glycated hemoglobin', 'NGSP', 'IFCC'],
    category: '당', kind: 'hba1c',
    units: [
      { id: 'ngsp', ucum: '%', label: '% (NGSP/DCCT)' },
      { id: 'ifcc', ucum: 'mmol/mol', label: 'mmol/mol (IFCC)' },
    ],
    assumptions: [
      'NGSP 마스터 방정식(선형 회귀식)을 사용한다. 두 방향 식은 서로 정확한 역함수가 아니어서 왕복 변환 시 끝자리가 다를 수 있다.',
    ],
    sources: ['ngsp'],
  },
  {
    id: 'creatinine', en: 'Creatinine', ko: '크레아티닌', synonyms: ['Cr', 'Cre', 'SCr'],
    category: '신기능', kind: 'ucum', formula: 'C4H7N3O', units: [MGDL, UMOLL],
  },
  {
    id: 'urea', en: 'Urea / Blood urea nitrogen', ko: '요소 / 요소질소', synonyms: ['BUN', 'urea nitrogen', 'SUN', '혈중요소질소'],
    category: '신기능', kind: 'ucum', formula: 'CH4N2O', formulaLabel: 'urea',
    units: [
      { id: 'bun-mg/dL', ucum: 'mg/dL', label: 'mg/dL (BUN, 질소 기준)', basis: { formula: 'N2', label: '요소 1분자당 질소 2원자 (N₂)' } },
      { id: 'urea-mg/dL', ucum: 'mg/dL', label: 'mg/dL (요소 기준)' },
      { id: 'urea-mmol/L', ucum: 'mmol/L', label: 'mmol/L (요소)' },
    ],
    assumptions: ['BUN은 요소 분자 중 질소 질량만 표기한 값이다. 요소 1 mol = 질소 2 mol(28.014 g)로 계산한다.'],
  },
  {
    id: 'uric-acid', en: 'Uric acid', ko: '요산', synonyms: ['UA', 'urate'],
    category: '신기능', kind: 'ucum', formula: 'C5H4N4O3', units: [MGDL, UMOLL, MMOLL],
  },
  {
    id: 'cholesterol', en: 'Cholesterol (total, HDL, LDL, non-HDL)', ko: '콜레스테롤 (총·HDL·LDL)', synonyms: ['TC', 'T-chol', 'HDL-C', 'LDL-C', 'non-HDL'],
    category: '지질', kind: 'ucum', formula: 'C27H46O', formulaLabel: 'cholesterol', units: [MGDL, MMOLL],
    assumptions: ['지단백 분획(HDL/LDL)도 콜레스테롤 분자량으로 환산한다.'],
  },
  {
    id: 'triglyceride', en: 'Triglycerides', ko: '중성지방', synonyms: ['TG', 'triacylglycerol'],
    category: '지질', kind: 'ucum', formula: 'C57H104O6', formulaLabel: 'triolein (대표 중성지방)', units: [MGDL, MMOLL],
    assumptions: [
      '중성지방은 혼합물이므로 관행적으로 triolein(C57H104O6) 분자량을 대표값으로 쓴다. 실제 지방산 조성에 따라 몰 농도는 달라진다.',
      '효소법 측정값은 글리세롤 기준이며 free glycerol 보정 여부는 변환에 반영되지 않는다.',
    ],
  },
  {
    id: 'bilirubin', en: 'Bilirubin (total / direct)', ko: '빌리루빈 (총·직접)', synonyms: ['T-bil', 'TBIL', 'D-bil', 'DBIL'],
    category: '간기능', kind: 'ucum', formula: 'C33H36N4O6', formulaLabel: 'unconjugated bilirubin', units: [MGDL, UMOLL],
    assumptions: ['직접(포합) 빌리루빈도 관행상 비포합 빌리루빈 분자량(C33H36N4O6)으로 환산한다.'],
  },
  {
    id: 'calcium', en: 'Calcium (total / ionized)', ko: '칼슘 (총·이온화)', synonyms: ['Ca', 'iCa', 'Ca2+'],
    category: '전해질·무기질', kind: 'ucum', formula: 'Ca', charge: 2, units: [MGDL, MMOLL, MEQL],
  },
  {
    id: 'magnesium', en: 'Magnesium', ko: '마그네슘', synonyms: ['Mg', 'Mg2+'],
    category: '전해질·무기질', kind: 'ucum', formula: 'Mg', charge: 2, units: [MGDL, MMOLL, MEQL],
  },
  {
    id: 'phosphate', en: 'Phosphate (inorganic, as P)', ko: '인(무기인)', synonyms: ['P', 'Pi', 'phosphorus', 'IP'],
    category: '전해질·무기질', kind: 'ucum', formula: 'P', formulaLabel: '인(P) 원자 기준', units: [MGDL, MMOLL],
    assumptions: ['검사 결과는 인산 이온이 아니라 인(P) 원자 질량 기준으로 표기된다고 가정한다. 혈청 인산은 pH에 따라 HPO₄²⁻/H₂PO₄⁻ 혼합이므로 mEq 변환은 제공하지 않는다.'],
  },
  {
    id: 'sodium', en: 'Sodium', ko: '나트륨', synonyms: ['Na', 'Na+'],
    category: '전해질·무기질', kind: 'ucum', formula: 'Na', charge: 1, units: [MMOLL, MEQL, MGDL],
  },
  {
    id: 'potassium', en: 'Potassium', ko: '칼륨', synonyms: ['K', 'K+'],
    category: '전해질·무기질', kind: 'ucum', formula: 'K', charge: 1, units: [MMOLL, MEQL, MGDL],
  },
  {
    id: 'chloride', en: 'Chloride', ko: '염소', synonyms: ['Cl', 'Cl-', '클로라이드'],
    category: '전해질·무기질', kind: 'ucum', formula: 'Cl', charge: 1, units: [MMOLL, MEQL, MGDL],
  },
  {
    id: 'bicarbonate', en: 'Bicarbonate (total CO2)', ko: '중탄산염', synonyms: ['HCO3', 'HCO3-', 'tCO2', 'TCO2', 'CO2'],
    category: '전해질·무기질', kind: 'ucum', formula: 'HCO3', charge: 1, units: [MMOLL, MEQL],
  },
  {
    id: 'lithium', en: 'Lithium', ko: '리튬', synonyms: ['Li', 'Li+'],
    category: '치료약물', kind: 'ucum', formula: 'Li', charge: 1, units: [MMOLL, MEQL],
  },
  {
    id: 'iron', en: 'Iron', ko: '철(혈청철)', synonyms: ['Fe', 'serum iron', 'TIBC', 'UIBC'],
    category: '빈혈', kind: 'ucum', formula: 'Fe', units: [UGDL, UMOLL],
    assumptions: ['TIBC/UIBC도 결합 가능한 철의 질량으로 표기되므로 같은 분자량(Fe)으로 환산한다.'],
  },
  {
    id: 'ammonia', en: 'Ammonia', ko: '암모니아', synonyms: ['NH3', 'NH4+'],
    category: '간기능', kind: 'ucum', formula: 'NH3', units: [UGDL, UMOLL],
    assumptions: ['µg/dL 표기가 NH₃ 기준이라고 가정한다(일부 검사실은 NH₃-N 기준 표기 — 이 경우 계수가 다르다).'],
  },
  {
    id: 'lactate', en: 'Lactate', ko: '젖산', synonyms: ['lactic acid', 'Lac'],
    category: '기타', kind: 'ucum', formula: 'C3H6O3', formulaLabel: 'lactic acid', units: [MGDL, MMOLL],
    assumptions: ['mg/dL 표기가 젖산(C3H6O3) 기준이라고 가정한다. 젖산 음이온(C3H5O3⁻) 기준 시 계수가 약 1% 다르다.'],
  },
  {
    id: 'ethanol', en: 'Ethanol', ko: '에탄올(알코올)', synonyms: ['alcohol', 'EtOH', '혈중알코올'],
    category: '치료약물', kind: 'ucum', formula: 'C2H6O', units: [MGDL, MMOLL],
  },
  {
    id: 'digoxin', en: 'Digoxin', ko: '디곡신', synonyms: ['DIG'],
    category: '치료약물', kind: 'ucum', formula: 'C41H64O14', units: [NGML, NMOLL],
  },
  {
    id: 'cortisol', en: 'Cortisol', ko: '코르티솔', synonyms: ['hydrocortisone'],
    category: '내분비', kind: 'ucum', formula: 'C21H30O5', units: [UGDL, NMOLL],
  },
  {
    id: 'free-t4', en: 'Free thyroxine (fT4)', ko: '유리 갑상샘호르몬(fT4)', synonyms: ['FT4', 'thyroxine', 'T4'],
    category: '내분비', kind: 'ucum', formula: 'C15H11I4NO4', units: [NGDL, PMOLL],
  },
  {
    id: 'testosterone', en: 'Testosterone', ko: '테스토스테론', synonyms: ['T'],
    category: '내분비', kind: 'ucum', formula: 'C19H28O2', units: [NGDL, NMOLL, NGML],
  },
  {
    id: 'vitamin-d', en: '25-Hydroxyvitamin D', ko: '25-수산화비타민 D', synonyms: ['25(OH)D', 'vit D', 'calcidiol'],
    category: '비타민', kind: 'ucum', formula: 'C27H44O2', formulaLabel: '25-hydroxyvitamin D3', units: [NGML, NMOLL],
    assumptions: ['25(OH)D3 분자량을 사용한다. D2(C28H44O2)가 섞인 총 25(OH)D에서는 약간의 오차가 있다.'],
  },
  {
    id: 'vitamin-b12', en: 'Vitamin B12 (cobalamin)', ko: '비타민 B12', synonyms: ['B12', 'cobalamin', 'cyanocobalamin'],
    category: '비타민', kind: 'ucum', formula: 'C63H88CoN14O14P', formulaLabel: 'cyanocobalamin', units: [PGML, PMOLL],
    assumptions: ['cyanocobalamin 분자량을 사용한다(혈중 형태는 methyl-/adenosylcobalamin 등 혼합).'],
  },
  {
    id: 'folate', en: 'Folate', ko: '엽산', synonyms: ['folic acid', 'FA'],
    category: '비타민', kind: 'ucum', formula: 'C19H19N7O6', formulaLabel: 'folic acid', units: [NGML, NMOLL],
  },
  {
    id: 'total-protein', en: 'Total protein', ko: '총단백', synonyms: ['TP'],
    category: '단백', kind: 'ucum', units: [GDL, GL],
    assumptions: ['단백 혼합물이라 분자량이 정의되지 않아 몰 농도 변환은 하지 않는다.'],
  },
  {
    id: 'albumin', en: 'Albumin', ko: '알부민', synonyms: ['Alb'],
    category: '단백', kind: 'ucum', units: [GDL, GL],
  },
  {
    id: 'hemoglobin', en: 'Hemoglobin', ko: '혈색소(헤모글로빈)', synonyms: ['Hb', 'Hgb'],
    category: '혈액', kind: 'ucum', units: [GDL, GL],
  },
  {
    id: 'ferritin', en: 'Ferritin', ko: '페리틴', synonyms: ['FER'],
    category: '빈혈', kind: 'ucum', units: [NGML, UGL],
  },
  {
    id: 'crp', en: 'C-reactive protein', ko: 'C-반응단백', synonyms: ['CRP', 'hsCRP', 'hs-CRP'],
    category: '염증', kind: 'ucum', units: [MGL, { id: 'mg/dL', ucum: 'mg/dL', label: 'mg/dL' }],
  },
  enzyme('alt', 'Alanine aminotransferase', '알라닌아미노전이효소', ['ALT', 'GPT', 'SGPT']),
  enzyme('ast', 'Aspartate aminotransferase', '아스파르테이트아미노전이효소', ['AST', 'GOT', 'SGOT']),
  enzyme('alp', 'Alkaline phosphatase', '알칼리인산분해효소', ['ALP', 'ALK']),
  enzyme('ggt', 'Gamma-glutamyltransferase', '감마글루타밀전이효소', ['GGT', 'γ-GT', 'r-GTP']),
  enzyme('ld', 'Lactate dehydrogenase', '젖산탈수소효소', ['LD', 'LDH']),
  enzyme('ck', 'Creatine kinase', '크레아틴키나아제', ['CK', 'CPK']),
  enzyme('amylase', 'Amylase', '아밀라아제', ['AMY']),
  enzyme('lipase', 'Lipase', '리파아제', ['LIP']),
  {
    id: 'uacr', en: 'Urine albumin-to-creatinine ratio', ko: '소변 알부민/크레아티닌 비', synonyms: ['uACR', 'ACR', 'UACR', 'microalbumin'],
    category: '소변', kind: 'ratio', formula: 'C4H7N3O', formulaLabel: '분모: 크레아티닌',
    units: [
      { id: 'mg/g', ucum: 'mg/g', label: 'mg/g creatinine' },
      { id: 'mg/mmol', ucum: 'mg/mmol', label: 'mg/mmol creatinine' },
    ],
    assumptions: ['분자(알부민)는 질량 그대로 두고 분모 크레아티닌만 g ↔ mmol로 바꾼다.'],
    sources: ['kdigo2024'],
  },
  {
    id: 'upcr', en: 'Urine protein-to-creatinine ratio', ko: '소변 단백/크레아티닌 비', synonyms: ['uPCR', 'PCR', 'UPCR'],
    category: '소변', kind: 'ratio', formula: 'C4H7N3O', formulaLabel: '분모: 크레아티닌',
    units: [
      { id: 'mg/g', ucum: 'mg/g', label: 'mg/g creatinine' },
      { id: 'mg/mmol', ucum: 'mg/mmol', label: 'mg/mmol creatinine' },
    ],
    assumptions: ['분자(총단백)는 질량 그대로 두고 분모 크레아티닌만 g ↔ mmol로 바꾼다.'],
    sources: ['kdigo2024'],
  },
];

export function findAnalyte(id: string): Analyte | undefined {
  return ANALYTES.find((a) => a.id === id);
}

const norm = (s: string) => s.toLowerCase().replace(/[\s\-_()·,./]/g, '');

/** 영문·한글·동의어 검색 (부분 일치, 대소문자·공백 무시) */
export function searchAnalytes(query: string): Analyte[] {
  const q = norm(query);
  if (!q) return ANALYTES;
  const scored = ANALYTES.map((a) => {
    const names = [a.en, a.ko, a.id, ...a.synonyms].map(norm);
    let score = 0;
    if (names.some((n) => n === q)) score = 3;
    else if (names.some((n) => n.startsWith(q))) score = 2;
    else if (names.some((n) => n.includes(q))) score = 1;
    return { a, score };
  });
  return scored.filter((s) => s.score > 0).sort((x, y) => y.score - x.score).map((s) => s.a);
}
