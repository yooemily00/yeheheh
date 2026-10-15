import { UcumLhcUtils } from '@lhncbc/ucum-lhc';
import type { Analyte, UnitOption } from '../data/analytes';
import { molecularWeight } from './atomicWeights';
import { SOURCES, type Source } from './sources';

const ucum = UcumLhcUtils.getInstance();

export interface ConversionOk {
  ok: true;
  value: number;
  from: UnitOption;
  to: UnitOption;
  /** 선형 변환이면 계수(결과 = 입력 × factor) */
  factor: number | null;
  method: string;
  equation: string;
  steps: string[];
  assumptions: string[];
  sources: Source[];
}

export interface ConversionFail {
  ok: false;
  code: string;
  reason: string;
}

export type ConversionResult = ConversionOk | ConversionFail;

export function formatNumber(x: number, sig = 4): string {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e6 || abs < 1e-4) return x.toExponential(sig - 1);
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(abs)));
  return Number(x.toFixed(Math.min(digits, 10))).toString();
}

const FAIL_REASONS: Record<string, string> = {
  incommensurable:
    '두 단위의 물리적 차원이 다릅니다(예: 질량 농도 vs 효소 활성도). 측정 원리가 다른 양 사이에는 근거 있는 환산식이 없으므로 변환하지 않습니다.',
  'missing-molecular-weight':
    '질량↔몰 변환에는 분자량이 필요하지만 이 분석물은 단일 분자량이 정의되지 않습니다(단백 혼합물 등).',
  'missing-charge': 'mEq 변환에는 이온 전하가 필요하지만 이 분석물은 전하가 정의되지 않습니다.',
  'missing-molecular-weight-and-charge': '질량↔당량 변환에는 분자량과 전하가 모두 필요하지만 정의되지 않았습니다.',
};

function ucumConvert(from: string, v: number, to: string, opts: { molecularWeight?: number; charge?: number }) {
  const r = ucum.convertUnitTo(from, v, to, opts);
  if (r.status === 'succeeded' && r.toVal !== null) return { ok: true as const, value: r.toVal };
  return { ok: false as const, code: r.code ?? 'error', msg: r.msg.join(' ') };
}

function mwOf(analyte: Analyte, unit: UnitOption): { mw: number; formula: string; label: string } | undefined {
  if (unit.basis) return { mw: molecularWeight(unit.basis.formula), formula: unit.basis.formula, label: unit.basis.label };
  if (analyte.formula)
    return { mw: molecularWeight(analyte.formula), formula: analyte.formula, label: analyte.formulaLabel ?? analyte.en };
  return undefined;
}

function sourcesFor(analyte: Analyte, extra: string[]): Source[] {
  const ids = new Set([...extra, ...(analyte.sources ?? [])]);
  return [...ids].map((id) => SOURCES[id]).filter(Boolean);
}

// ---------- HbA1c (NGSP master equation) ----------
// TODO(verify): ngsp.org/ifcc.asp 원문과 직접 대조하지 못함 (네트워크 정책 차단)
export const HBA1C = {
  ngspToIfcc: (ngsp: number) => 10.929 * (ngsp - 2.15),
  ifccToNgsp: (ifcc: number) => 0.09148 * ifcc + 2.152,
};

function convertHbA1c(analyte: Analyte, value: number, from: UnitOption, to: UnitOption): ConversionResult {
  const common = {
    from,
    to,
    factor: null,
    method: '특수 변환 — NGSP/IFCC 마스터 방정식 (절편이 있는 선형식)',
    assumptions: analyte.assumptions ?? [],
    sources: sourcesFor(analyte, []),
  };
  if (from.id === to.id) return { ok: true, value, ...common, equation: '동일 단위', steps: [] };
  if (from.id === 'ngsp') {
    const out = HBA1C.ngspToIfcc(value);
    return {
      ok: true, value: out, ...common,
      equation: 'IFCC (mmol/mol) = 10.929 × (NGSP % − 2.15)',
      steps: [`10.929 × (${value} − 2.15) = ${formatNumber(out, 5)}`],
    };
  }
  const out = HBA1C.ifccToNgsp(value);
  return {
    ok: true, value: out, ...common,
    equation: 'NGSP (%) = 0.09148 × IFCC (mmol/mol) + 2.152',
    steps: [`0.09148 × ${value} + 2.152 = ${formatNumber(out, 5)}`],
  };
}

// ---------- UCUM 기반 변환 (일반 + 비율) ----------
function convertUcum(analyte: Analyte, value: number, from: UnitOption, to: UnitOption): ConversionResult {
  const mwFrom = mwOf(analyte, from);
  const mwTo = mwOf(analyte, to);
  const charge = analyte.charge;
  const steps: string[] = [];
  const extraSources = ['ucum'];

  let run: (v: number) => ReturnType<typeof ucumConvert>;
  if (mwFrom && mwTo && mwFrom.formula !== mwTo.formula) {
    // 서로 다른 화학종 기준(예: BUN 질소 ↔ 요소): 몰을 경유
    run = (v) => {
      const mid = ucumConvert(from.ucum, v, 'mmol/L', { molecularWeight: mwFrom.mw, charge });
      if (!mid.ok) return mid;
      return ucumConvert('mmol/L', mid.value, to.ucum, { molecularWeight: mwTo.mw, charge });
    };
    steps.push(
      `원본 단위 기준 화학종: ${mwFrom.label} (${mwFrom.formula}) = ${formatNumber(mwFrom.mw, 6)} g/mol`,
      `대상 단위 기준 화학종: ${mwTo.label} (${mwTo.formula}) = ${formatNumber(mwTo.mw, 6)} g/mol`,
      `UCUM: ${from.ucum} → mmol/L (원본 기준 분자량) → ${to.ucum} (대상 기준 분자량)`,
    );
  } else {
    const mw = mwFrom?.mw;
    run = (v) => ucumConvert(from.ucum, v, to.ucum, { molecularWeight: mw, charge });
    if (mwFrom) steps.push(`분자량: ${mwFrom.label} (${mwFrom.formula}) = ${formatNumber(mwFrom.mw, 6)} g/mol — IUPAC 원자량으로 계산`);
    steps.push(`UCUM: ${from.ucum} → ${to.ucum}`);
  }

  const unit = run(1);
  if (!unit.ok) {
    return { ok: false, code: unit.code, reason: FAIL_REASONS[unit.code] ?? `UCUM 변환 실패: ${unit.msg}` };
  }
  const res = run(value);
  if (!res.ok) return { ok: false, code: res.code, reason: FAIL_REASONS[res.code] ?? res.msg };

  const factor = unit.value;
  const usesMw = steps.some((s) => s.includes('g/mol'));
  const usesEq = /eq/.test(from.ucum) !== /eq/.test(to.ucum);
  if (usesEq && charge) steps.push(`이온 전하 |z| = ${charge} → 1 mmol = ${charge} mEq`);
  if (usesMw) extraSources.push('iupac');

  let method: string;
  if (analyte.kind === 'ratio') method = '특수 변환 — 분모 크레아티닌의 g ↔ mmol 환산 (UCUM + 분자량)';
  else if (usesMw && usesEq) method = 'UCUM 차원 변환 + 분자량 + 이온 전하';
  else if (usesMw) method = 'UCUM 차원 변환 + 분자량 (질량 ↔ 몰)';
  else if (usesEq) method = 'UCUM 차원 변환 + 이온 전하 (몰 ↔ 당량)';
  else method = 'UCUM 스케일 변환 (같은 차원, 접두어/단위 배수만 다름)';

  steps.push(`계수: 1 ${from.label} = ${formatNumber(factor, 6)} ${to.label}`);
  return {
    ok: true,
    value: res.value,
    from,
    to,
    factor,
    method,
    equation: `${to.label} = ${from.label} × ${formatNumber(factor, 6)}`,
    steps,
    assumptions: analyte.assumptions ?? [],
    sources: sourcesFor(analyte, extraSources),
  };
}

/** 분석물 단위 목록 밖의 단위(예: mg/dL → U/L)도 근거 검사를 위해 받을 수 있다 */
export function convert(analyte: Analyte, value: number, fromId: string, toId: string): ConversionResult {
  if (!Number.isFinite(value)) return { ok: false, code: 'invalid-value', reason: '숫자 값을 입력하세요.' };
  const find = (id: string): UnitOption => analyte.units.find((u) => u.id === id) ?? { id, ucum: id, label: id };
  const from = find(fromId);
  const to = find(toId);
  const known = (u: UnitOption) => analyte.units.some((x) => x.id === u.id);

  if (analyte.kind === 'hba1c') {
    if (!known(from) || !known(to))
      return { ok: false, code: 'unsupported-unit', reason: 'HbA1c는 NGSP(%)와 IFCC(mmol/mol) 사이 변환만 근거가 있습니다.' };
    return convertHbA1c(analyte, value, from, to);
  }
  if (analyte.kind === 'ucum' || analyte.kind === 'ratio') {
    const v = ucum.validateUnitString(to.ucum);
    if (v.status !== 'valid')
      return { ok: false, code: 'invalid-unit', reason: `'${to.ucum}'은(는) 유효한 UCUM 단위가 아닙니다.` };
    return convertUcum(analyte, value, from, to);
  }
  return { ok: false, code: 'unsupported', reason: '지원하지 않는 변환입니다.' };
}
