/**
 * IUPAC/CIAAW 표준 원자량 (abridged, 5 유효숫자 수준).
 * 구간(interval)으로 공표된 원소(H, C, N, O, Li, Mg, S, Cl)는 CIAAW의
 * "conventional/abridged" 값을 사용한다.
 *
 * TODO(verify): 작성 세션의 네트워크 정책으로 ciaaw.org 접속이 차단되어
 * 원문 표(Standard Atomic Weights 2021/2023 abridged)와 직접 대조하지 못했다.
 */
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  Li: 6.94,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
  Co: 58.933,
  I: 126.9,
};

export const ATOMIC_WEIGHT_SOURCE = {
  label: 'IUPAC CIAAW Standard Atomic Weights (abridged)',
  url: 'https://www.ciaaw.org/atomic-weights.htm',
};

/** 화학식 문자열(괄호 1단계 중첩까지 지원)을 원소별 개수로 분해 */
export function parseFormula(formula: string): Record<string, number> {
  const tokens = formula.match(/([A-Z][a-z]?|\d+|\(|\))/g);
  if (!tokens || tokens.join('') !== formula) {
    throw new Error(`화학식을 해석할 수 없습니다: ${formula}`);
  }
  const stack: Record<string, number>[] = [{}];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    const mult = next && /^\d+$/.test(next) ? Number(next) : 1;
    if (t === '(') {
      stack.push({});
    } else if (t === ')') {
      const group = stack.pop();
      if (!group || stack.length === 0) throw new Error(`괄호 불일치: ${formula}`);
      const top = stack[stack.length - 1];
      for (const [el, n] of Object.entries(group)) top[el] = (top[el] ?? 0) + n * mult;
      if (next && /^\d+$/.test(next)) i++;
    } else if (/^[A-Z]/.test(t)) {
      if (!(t in ATOMIC_WEIGHTS)) throw new Error(`원자량 표에 없는 원소: ${t}`);
      const top = stack[stack.length - 1];
      top[t] = (top[t] ?? 0) + mult;
      if (next && /^\d+$/.test(next)) i++;
    } else {
      throw new Error(`예상치 못한 토큰 '${t}' in ${formula}`);
    }
  }
  if (stack.length !== 1) throw new Error(`괄호 불일치: ${formula}`);
  return stack[0];
}

/** 화학식으로부터 분자량(g/mol) 계산 */
export function molecularWeight(formula: string): number {
  const counts = parseFormula(formula);
  return Object.entries(counts).reduce((sum, [el, n]) => sum + ATOMIC_WEIGHTS[el] * n, 0);
}
