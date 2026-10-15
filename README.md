# 임상검사 단위 변환 · 참고구간 조회

**사이트:** https://yooemily00.github.io/yeheheh/

React + TypeScript + Vite로 만든 정적 웹앱입니다. GitHub Pages에 배포합니다.

## 기능

### 1. 변환 탭
- 분석물 검색: 영문·한글·약어·동의어 (예: `BUN`, `당화혈색소`, `SGPT`)
- 값, 원본 단위, 대상 단위를 넣으면 결과를 크게 표시하고, 바로 아래에 **계산 근거**(방법·계수·수식·계산 과정·가정·출처 링크)를 보여줍니다.
- 양방향 스왑과 복사 버튼이 있습니다.
- 근거 없는 변환(예: mg/dL → U/L)은 UCUM 차원 검사로 **이유와 함께 거부**합니다.

### 2. 참고구간 탭
- 분석물, 나이, 성별, 검체로 **공표된 구간만** 그대로 표시합니다. 공표되지 않은 나이 구간은 외삽하지 않습니다.
- 결과 값을 넣으면 low / normal / high로 판정합니다.
- 18세 미만은 CALIPER로 안내합니다.

## 데이터 출처와 역할

| 역할 | 출처 | 방식 |
|---|---|---|
| 단위 변환 엔진 | UCUM (`@lhncbc/ucum-lhc` 8.0.0) | 차원 검사·스케일 변환. 질량↔몰은 분자량, 몰↔당량은 이온 전하를 넘겨 라이브러리가 계산 |
| 분자량 | IUPAC CIAAW 표준 원자량 | `src/lib/atomicWeights.ts`에서 화학식으로 계산. **변환 계수를 표에서 복사하지 않음** |
| HbA1c | NGSP 마스터 방정식 (ngsp.org/ifcc.asp) | IFCC = 10.929 × (NGSP − 2.15), NGSP = 0.09148 × IFCC + 2.152 |
| uACR·uPCR | KDIGO 2024 | mg/g ↔ mg/mmol: 분모 크레아티닌 분자량으로 계산 |
| BUN ↔ 요소 | 분자량 | 요소 1 mol = 질소 2 mol (N₂ 28.014 g) |
| 중성지방 | 분자량 | triolein (C57H104O6) 대표 분자량 가정 |
| 참고구간 | RCPA Harmonised RI Table 6 / CALIPER(소아 안내) | **현재 데이터 비어 있음 (아래 참조)** |
| 교차 검증 (테스트 전용) | Labcorp, CMEinfo, NBME 변환표 | `tests/crossValidation.test.ts` — 앱에는 들어가지 않음 |

## 확보하지 못한 자료 / TODO(verify)

앱을 작성한 클라우드 세션의 네트워크 정책이 아래 사이트 접속을 **HTTP 403으로 차단**했습니다. 그래서 원문을 직접 확인하지 못했습니다.

| 항목 | 상태 | 이유 |
|---|---|---|
| RCPA Table 6 성인 참고구간 | ❌ 미탑재 (`REFERENCE_INTERVALS = []`) | rcpa.edu.au 차단. 검색 요약이나 기억으로 채우면 "공표 구간 그대로" 원칙에 어긋나므로 비워 둠 |
| CALIPER 소아 참고구간 | 안내 링크만 제공 (요구사항) | caliperproject.ca 차단으로 링크 경로 미확인 — TODO(verify) |
| NGSP 마스터 방정식 | 구현됨 — TODO(verify) | ngsp.org 차단. 널리 알려진 식을 사용했으나 원문 대조 필요 |
| KDIGO 2024 (30 mg/g ≈ 3 mg/mmol) | 계수는 분자량으로 계산 — TODO(verify) | kdigo.org 차단. 범주 경계 표기는 원문 대조 필요 |
| IUPAC 원자량 | 구현됨 — TODO(verify) | ciaaw.org 차단. abridged 값 사용, 원문 대조 필요 |
| Labcorp / CMEinfo / NBME 교차 검증 값 | 테스트에 관행적 반올림 계수로 대조 — TODO(verify) | 세 사이트 모두 차단. 문서별 원문 값으로 교체 필요 |

## 개발

```bash
npm ci
npm run dev      # 개발 서버
npm test         # Vitest (변환 로직·참고구간 조회 로직)
npm run build    # 타입 검사 + 프로덕션 빌드 (dist/)
```

## 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 테스트 → 빌드 → GitHub Pages 배포를 실행합니다.

처음 한 번은 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정해야 합니다.

## 주의

교육·참고용 도구입니다. 임상 판단에는 검사실이 보고한 단위와 참고구간을 우선하세요.
