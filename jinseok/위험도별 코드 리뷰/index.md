# 위험도별 코드 리뷰: 에이전트가 PR을 쏟아낼 때

> 원문: [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/) (Addy Osmani, Morgan Westlee Lunt, Qing Wang, 2026-10-15)
>
> 함께 본 자료: Cloudflare 「Orchestrating AI Code Review at scale」, Robin Wieruch 「Testing AI-Generated Code」, GitHub Docs(rulesets, CODEOWNERS, merge queue)

## 한눈에 보기

| 질문 | Claude Code 팀의 답 |
|---|---|
| 왜 바꿨나 | Anthropic 모노레포 변경이 하루 약 2,500건(5월)에서 30,000건 이상(9월)으로. 한 줄씩 읽기 어려움 |
| 무엇을 줄이나 | revert·장애를 늘리지 않는 선에서 **사람의 리뷰 시간** |
| 어떻게 | 검증 → CI → AI 리뷰 → 보안 리뷰 → 사람 승인 → 머지 큐·플래그, 놓친 건 롤백 |
| 사람 승인 수 | 변경의 위험도 티어로 정함: Low 0명, Medium 1명, High 2명 |
| 결과 | Claude Code 저장소에서 6~9월 머지된 PR 2배 이상, revert 비율 40% 이상 감소 |
| 아직 없는 것 | 지표가 나빠지면 승인을 자동으로 늘리는 장치(circuit breaker) |

## 1. 모든 줄을 사람이 읽는 리뷰의 한계

### 변경 건수 증가

- Claude Code 코드의 약 90%를 Claude가 작성
- Anthropic 모노레포에 들어가는 변경: 하루 약 2,500건(5월) → 30,000건 이상(9월)
- Claude Code는 모노레포와 다른 저장소지만 사정은 비슷함
- 사람이 하루에 읽을 수 있는 diff 양은 그대로
  - 리뷰 대기가 길어지거나
  - 읽지 않고 승인만 누르게 됨(rubber stamp)

### 리뷰의 두 가지 역할

1. 배포 전에 문제를 찾아 고치기
2. 팀이 코드를 같이 알아 두기(맥락 공유)

- 원문: "사람이 코드를 읽었나?"만으로는 문제를 잡았는지 알 수 없다
- 대신 묻는 것: 이 변경에서 무엇이 잘못될 수 있나? 그걸 자동 검사가 잡나, 사람이 잡나?
- 리뷰 시점도 바뀜: PR을 다 만들고 리뷰를 기다림 → 코드를 쓰는 동안 검사가 계속 돎(에디터 맞춤법 검사처럼)

### 목표와 가드레일

| 구분 | 무엇을 재나 |
|---|---|
| 목표 | PR 대부분을 **사람 1명 이하**로 머지(작성자 본인이어도 됨) |
| 사람이 쓰는 시간 | PR당 사람 승인 수(중앙값·p95), 사람 코멘트 수, 사람 리뷰 대기 시간 |
| 가드레일 | revert 비율, 장애(incident) 비율 |

- 사람이 쓰는 시간 = 리뷰하는 시간 + 나쁜 코드가 깨뜨린 걸 고치는 시간
- revert가 늘면 아낀 리뷰 시간만큼 고치는 데 쓰게 됨
- 대상: Claude Code 저장소(CLI, 데스크톱·웹 앱, 모바일 앱)

## 2. 리뷰를 여러 단계로 나누기

### PR이 머지되기까지

```text
PR 전    작업 검증     Claude가 테스트·빌드·린트 실행, 새 컨텍스트로 띄운 서브에이전트가 diff 리뷰
PR마다   필수 CI       lint, 타입, 플랫폼별 테스트, 빌드, 패키징. 실패하면 머지 불가
         AI 코드 리뷰  여러 에이전트가 버그 탐색 → 다른 에이전트들이 투표 → 통과한 것만 PR 코멘트로
         보안 리뷰     별도 자동 리뷰. 두 리뷰에 열린 지적이 있으면 머지 불가
         위험도 승인   분류기가 티어 결정(사람 0/1/2명). 일부 경로는 항상 사람
머지     머지 큐       최신 main에 변경을 얹어 모든 검사 재실행
머지 후  플래그        사내 직원이 먼저 사용 → latest 채널 → stable 채널
         감시·복구     작성자와 on-call이 지켜봄, 플래그 끄기, revert
```

- 단계마다 잡는 문제도 놓치는 문제도 있음. 모든 단계를 빠져나가는 문제는 드물고 빠져나가면 롤백

### PR 전 검증

- Claude에게 직접 돌려 볼 수단(테스트, 빌드, 디자인과 비교할 스크린샷)을 주고 "다 했다"는 말 대신 실행 결과를 보여 달라고 함
- Boris Cherny(Claude Code를 만든 사람): 검증 수단을 주면 결과가 2~3배 좋아진다고 추정
- AI 리뷰가 같은 지적을 반복하면 그 내용을 스킬, lint 규칙, 지시 파일에 넣음

| 파일 | 내용 |
|---|---|
| `CLAUDE.md` | 스택, 컨벤션, 할 것과 하지 않을 것. 리뷰마다 읽으므로 짧게 |
| `REVIEW.md` | 코드 오너가 쓰는 리뷰 기준. 이 영역에서 무엇을 장애로 보는지, nit 개수 상한, 건너뛸 경로, 지적마다 파일·줄 근거 요구 |

### AI 리뷰가 지적을 거르는 방법

- diff만 보지 않고 저장소 전체와 PR 의도를 같이 봄. 버그 수정 PR이면 근본 원인까지 찾음
- 여러 에이전트가 동시에 버그를 찾음 → 다른 에이전트들이 지적마다 투표 → 충분히 동의한 것만 코멘트로 남김
- 스타일·로그 메시지·코드 정리만 다루는 지적은 버림(자기 PR로 A/B 테스트 후 결정)
- 지적마다 태그: **Important** / **Nit** / **Pre-existing**(이 PR이 만들지 않은 기존 버그)
- 저장소마다 Quick / Standard / Deep 선택
- 쓸 만한 리뷰 코멘트를 받은 사내 PR: 16% → 54% (리서치 프리뷰 시작 후)
- 1,000줄 넘는 PR은 대부분 지적이 나오고 작은 PR은 대부분 지적 없이 통과

### 사람 리뷰 전에 도는 검사

| 단계 | 막는 방식 |
|---|---|
| AI 리뷰·보안 리뷰 | 열린 지적이 있으면 머지 불가. 고치거나 짧은 사유를 달아 스레드를 닫음. 다음 커밋에서 고쳐지면 자동으로 해제 |
| 필수 CI | 실패하면 머지 불가. CLI PR 하나에 검사 수십 개 |
| PR 템플릿 | "어떻게 테스트했나", "어떻게 되돌리나". Claude가 채워도 요청한 사람이 확인 |
| 머지 큐 | 각자 통과한 PR 두 개가 합쳐져 main을 깨는 일을 막음 |
| 플래그 | 배포 없이 기능 끄기 |

## 3. 위험도 티어

### 티어별 사람 승인 수

| 위험도 | 예 | 사람 승인 |
|---|---|---|
| Low | 문서, 문구(copy), 내부 전용 기능, 플래그를 꺼 둔 채 코드만 추가하는 변경 | 자동 리뷰·보안 검사 통과 시 **0명** |
| Medium | 일반 제품 변경, 민감 영역(캐싱, 자동 업데이트, 시스템 프롬프트) | 1명 |
| High | 가장 위험한 코드, 항상 2명이 필요한 몇몇 경로 | 2명 |

- 원문 예: 문서 수정과 자동 업데이트 변경은 위험이 다르니 리뷰도 달라야 함

### 티어를 정하는 규칙

- **작성자가 아니라 변경이 정한다**: 분류기가 변경을 읽고 티어 결정
- 두 번째 분류기: 티어가 낮아도 이번 변경은 사람이 더 봐야 하는지 따로 판단
- 항상 사람이 보는 경로: 오너가 민감하다고 등록한 경로, 모든 CI workflow 파일
- Low·Medium 승인 기준은 저장소의 신뢰 작성자 목록(주로 소유 팀)에만 적용. 그 외 작성자는 승인자 1명 추가
- 에이전트의 승인은 사람 승인으로 세지 않음
- 에이전트에게 지시한 사람은 필수 리뷰어 중 한 명으로 셈
- 승인은 특정 커밋에만 유효. 에이전트가 push하거나 merge 충돌을 손으로 풀면 다시 승인

### Cloudflare의 티어와 비교

```ts
// Cloudflare 글의 packages/core/src/risk.ts (글에 실린 단순화 버전)
if (fileCount > 50 || hasSecurityFiles) return "full";
if (totalLines <= 10 && fileCount <= 20)  return "trivial";
if (totalLines <= 100 && fileCount <= 20) return "lite";
return "full";
```

| 티어 | 에이전트 수 | 평균 비용(2026-03-10~04-09) |
|---|---|---|
| trivial | 2 | $0.20 |
| lite | 4 | $0.67 |
| full | 7+ | $1.68 |

- `auth/`, `crypto/` 같은 보안 관련 경로는 크기와 상관없이 full
- Anthropic은 티어로 **사람 승인 수**를, Cloudflare는 **AI 리뷰 깊이**(비용)를 정함

## 4. AI 리뷰어 성능 관리

### 장애 사례로 평가셋 만들기

```text
장애·revert 발생 → 그 코드를 아는 엔지니어가 버그와 위치 확인 → 평가셋에 추가
        ↑                                                   │
        └── 리뷰어(프롬프트·도구·모델) 변경 → 매일 전체 평가 → 점수가 오르면 유지, 아니면 폐기
```

- 오탐(noise)도 셈: 지적마다 작성자 반응을 분류(고침 / 틀림 / 의도한 동작 / 중요하지 않음)
- 문제없는 PR에도 돌려 봄. 그대로 고치면 오히려 코드가 틀어지는 지적이 몇 번 나오는지 셈
- 우선순위: 진짜 버그 잡기 > 리뷰 라운드 줄이기
- 작성자가 에이전트면 오탐 비용이 큼: 사람은 nit을 넘기지만 에이전트는 고치고 리뷰를 또 부름

### 리뷰 라운드 줄이기

- CLI PR 하나가 밤새 리뷰·수정을 50라운드 넘게 돌아서 작성자가 직접 멈춤
- `git blame`으로 보니 계속 지적된 코드의 약 59%가 첫 리뷰 때부터 있던 코드
- 바꾼 것: 3라운드 뒤에는 접근 방식을 바꿔 보라고 요청, 몇 번 뒤부터는 바뀐 부분만 다시 리뷰, 위치 하나하나 대신 버그 유형으로 묶어 지적, 같은 지적 반복 금지

| 사내 PR | 전 | 후 |
|---|---|---|
| 리뷰·수정 1라운드 만에 통과 | 65% | 78% |
| 5라운드 이상 필요 | 8.9% | 1.5% |
| 통과까지 평균 리뷰 횟수 | 2.08 | 1.32 |

## 5. 사람이 맡는 일

### 자동화하지 않는 일

- 만들지 말지 정하기: 방향, 완성도 판단, 범위
- 위험한 코드 리뷰: 결제(billing), 자동 업데이트, CI workflow
- 다른 사람이 따라 할 패턴을 정하는 아키텍처
- 결과 확인: PR을 올린 사람이 테스트 결과, 실행 로그, 스크린샷, AI 리뷰 코멘트를 직접 확인
  - 테스트가 못 잡는 위험을 설명하지 못하면 동료에게 빠른 승인 대신 꼼꼼한 리뷰를 요청
- 결과 책임: 누가 코드를 썼든 배포한 변경마다 책임자 1명

### 머지한 사람이 책임진다

- 원문 표현 "You land it, you own it": 작은·중간 크기 변경이 문제를 일으키면 보통 머지한 사람이 고침
- 이 규칙이 돌아가는 조건
  - 변경이 작다: 리뷰·디버깅·revert가 쉬움
  - 되돌릴 수 있다: 플래그, revert, 단계 배포로 대부분 몇 분 안에
  - 영향 범위(blast radius)를 본다: 큰 코드에는 사람과 검사를 더 붙임
  - 회귀를 빨리 안다: 텔레메트리와 사내 사용
  - 사람 탓을 하지 않는다: 장애 리뷰에서는 어느 단계가 잡았어야 했는지를 따짐
- 주 단위 on-call 로테이션이 있음

### 반론과 한계

- 원문이 밝힌 한계
  - 지표가 나빠질 때 승인을 늘리는 자동 장치가 아직 없음. 엔지니어들도 사람 승인 없는 머지를 늘리기 전에 이 장치를 원함
  - 잘못된 머지를 알아채는 건 여전히 작성자, on-call, revert·장애 대시보드 몫
  - 맥락 공유는 정식 절차 없음. 필요한 부분만 Claude에게 설명 문서(explainer)를 부탁
- HN 「Ask HN: How to deal with shipping AI-written code you don't understand?」의 의견
  - 장애 대응 중 on-call은 핫 패스를 알아야 함. 코드를 모르면 복구가 느려짐
- 사람 승인 없는 머지가 늘면 코드를 이해하는 일은 리뷰 말고 다른 데서 챙겨야 함

## 6. 우리 Next.js 저장소에 적용하기

### 티어 표 예시

| 티어 | 경로 예 | 사람 승인 | 자동 검사 |
|---|---|---|---|
| Low | `messages/**`(문구·i18n), `docs/**`, `*.module.css`, `*.stories.tsx` | 0명 | CI + AI 리뷰 + 시각 회귀 |
| Medium | 그 밖의 `app/**`, `components/**`, `lib/**`, `next.config.ts` | 1명 | + 변경 범위 테스트 |
| High | `proxy.ts`(인증 분기), `app/(auth)/**`, `app/(checkout)/**`, `lib/payments/**` | 소유 팀 2명 | + AI 리뷰 Deep |
| 항상 사람 | `.github/**`, `package.json`, `pnpm-lock.yaml` | 1명 | 없음 |

- 원문 티어를 우리 앱 경로로 옮긴 예시. 원문 권고대로 엄격하게 시작해서 근거가 쌓이면 푼다
- GitHub 설정은 경로만 봄. "플래그 뒤 변경"처럼 내용으로 판단하는 건 Medium으로 둠

### CODEOWNERS로 리뷰 요청 보내기

```text
# .github/CODEOWNERS  (마지막으로 일치한 줄이 우선)
/app/                     @acme/web
/components/              @acme/web
/proxy.ts                 @acme/auth
/app/(auth)/              @acme/auth
/app/(checkout)/          @acme/payments
/lib/payments/            @acme/payments
/.github/                 @acme/platform
/package.json             @acme/platform
/pnpm-lock.yaml           @acme/platform
```

- 위치는 `.github/` → 루트 → `docs/` 순으로 찾아 처음 찾은 파일 하나만 씀
- `!` 부정 패턴은 안 됨. 오너가 여럿이면 그중 1명만 승인해도 통과라서 "2명"은 못 정함
- "Require review from Code Owners"를 켤 거면 `*` 줄을 두지 않음(모든 PR이 1명 필요해짐)

### Ruleset의 경로별 필수 리뷰어

```text
Require a pull request before merging > Required reviewers
팀               승인 수   파일 패턴 (.gitignore 형식, 위에서부터 차례로)
@acme/web          1      app/**  components/**  lib/**  next.config.ts
                          !**/*.module.css  !**/*.stories.tsx
                          !app/(auth)/**  !app/(checkout)/**  !lib/payments/**
@acme/auth         2      /proxy.ts  app/(auth)/**
@acme/payments     2      app/(checkout)/**  lib/payments/**
@acme/platform     1      .github/**  package.json  pnpm-lock.yaml
```

- 팀은 최대 15개, 팀마다 승인 수 0~10. 팀에 저장소 쓰기 권한이 있어야 승인으로 인정됨
- 조직 소유 저장소에서만 가능(개인 저장소에는 팀이 없음)
- CODEOWNERS와 달리 `!`로 Low 파일을 뺄 수 있어서 티어 표를 그대로 옮길 수 있음

### Ruleset 나머지 설정

| 옵션(main 대상) | 설정 | 원문 규칙 |
|---|---|---|
| Required approvals | 0 | Low는 사람 0명 |
| Dismiss stale pull request approvals when new commits are pushed | 켬 | 승인은 특정 커밋 기준 |
| Require conversation resolution before merging | 켬 | 지적은 고치거나 사유를 달아 닫기 |
| Require status checks to pass | `ci` | CI 실패 시 머지 불가 |
| Require merge queue | 켬 | 최신 main 위에서 재검사 |

- stale 승인은 새 커밋 외에 Update branch, base 쪽 변경으로 diff가 바뀌어도 무효
- 머지 큐는 조직의 public 저장소나 Enterprise Cloud private 저장소에서만 쓸 수 있음. CI workflow에 `merge_group` 트리거 필요
- Copilot이 사람 없이 연 PR은 승인 1명 추가가 기본값(public preview). 필요 승인이 0이면 효과 없음

### 티어 분류 스크립트

```js
// scripts/risk-tier.mjs  사용: node scripts/risk-tier.mjs origin/main
import { execFileSync } from "node:child_process";

const base = process.argv[2] ?? "origin/main";
// --numstat 한 줄 = "추가<TAB>삭제<TAB>경로" (바이너리는 "-")
const out = execFileSync("git", ["diff", "--numstat", "--no-renames", `${base}...HEAD`], { encoding: "utf8" });
const rows = out.split("\n").filter(Boolean).map((line) => line.split("\t"));
const files = rows.map(([, , file]) => file);
const lines = rows.reduce((sum, [add, del]) => sum + (Number(add) || 0) + (Number(del) || 0), 0);

const high = [/^proxy\.ts$/, /^app\/\((auth|checkout)\)\//, /^lib\/payments\//];
const low = [/^messages\//, /^docs\//, /\.module\.css$/, /\.stories\.tsx$/];
const hit = (rules) => (file) => rules.some((rule) => rule.test(file));

let tier = "medium";
if (files.some(hit(high))) tier = "high";
else if (files.length > 0 && files.every(hit(low)) && lines <= 200) tier = "low";
console.log(tier);
```

### 티어 라벨 workflow

```yaml
# .github/workflows/risk-tier.yml
name: risk-tier
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions: { contents: read, pull-requests: write }
jobs:
  risk-tier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - env:
          GH_TOKEN: ${{ github.token }}
          PR: ${{ github.event.pull_request.number }}
          BASE: origin/${{ github.base_ref }}
        run: |
          tier=$(node scripts/risk-tier.mjs "$BASE")
          gh pr edit "$PR" --remove-label risk:low,risk:medium,risk:high || true
          gh pr edit "$PR" --add-label "risk:$tier"
```

- 라벨 `risk:low`·`risk:medium`·`risk:high`는 미리 만들어 둠(`gh label create`)
- 라벨은 표시와 지표용. 실제로 막는 건 ruleset의 필수 리뷰어. 줄 수 조건은 ruleset으로 걸 수 없음
- 이 파일도 `.github/**`라서 바꾸려면 platform 팀 승인

### PR 템플릿과 lint 규칙

```md
<!-- .github/pull_request_template.md -->
## Testing         어떻게 확인했나 (명령·출력·스크린샷)
## Risk            예상 티어와 이유, 영향 받는 사용자
## How to revert   revert 한 번? 플래그 끄기? 데이터 마이그레이션?
```

- Low를 사람 없이 통과시키려면 "정해진 패턴을 지켰나"를 기계가 확인해야 함
- Robin Wieruch의 방법: 파일 종류마다 뼈대(skeleton)는 **lint로 강제**하고 판단이 들어간 파일만 테스트
  - 예: 서버 핸들러 첫 줄이 `await requireSession()`인지 lint로 확인. Server Action에도 같은 규칙을 걸 수 있음
- 티어를 낮추려면 그만큼 사람 리뷰보다 앞 단계에 검사를 둬야 함

## 정리

- 질문을 바꾼다: "사람이 읽었나" → "무엇이 잘못될 수 있고 어떤 검사가 잡나"
- 사람 승인 수는 작성자 대신 **변경의 위험도**로 정한다
- 리뷰를 줄인 만큼 문제를 빨리 찾고 되돌릴 수 있어야 한다. 가드레일은 revert·장애 비율
- AI 리뷰어도 평가셋으로 성능을 재고 리뷰가 끝없이 돌지 않게 관리한다
- GitHub에서는 경로별 필수 리뷰어로 티어를 강제하고 내용은 AI 리뷰와 사람이 판단한다

### 지금 이렇게 하고 있다면 → 이제는

| 지금 이렇게 하고 있다면 | 이제는 |
|---|---|
| 모든 PR에 승인 1명, 문구 수정도 리뷰 대기 | 티어 표를 정하고 Low 경로는 필수 리뷰어에서 제외 |
| 결제·인증 PR도 아무나 1명 승인 | Required reviewers로 소유 팀 2명 |
| 에이전트 PR을 "에이전트가 썼으니" 대충 승인 | 지시한 사람이 리뷰어, 에이전트 승인은 세지 않음 |
| 승인 뒤 push된 커밋도 그대로 머지 | Dismiss stale approvals 켜기 |
| AI 리뷰를 계속 다시 돌림 | 3라운드가 넘으면 방향 전환 요청, 이후엔 바뀐 부분만 |
| PR 설명이 "기능 추가" 한 줄 | Testing / Risk / How to revert 템플릿 |
| 리뷰 지표가 없음 | PR당 승인 수·대기 시간과 revert 비율을 같이 본다 |

## 참고 자료

- [How the Claude Code team does code review – claude.dev](https://claude.dev/blog/solving-code-review-at-anthropic/) (2026-10-15)
- [Orchestrating AI Code Review at scale – Cloudflare](https://blog.cloudflare.com/ai-code-review/) (2026-04-20)
- [Testing AI-Generated Code: Lint the Pattern, Test the Decision – Robin Wieruch](https://www.robinwieruch.de/testing-ai-generated-code/) (2026-10-21)
- [Ask HN: How to deal with shipping AI-written code you don't understand? – Hacker News](https://news.ycombinator.com/item?id=50151036) (2026-10-19)
- [Available rules for rulesets – GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [About code owners – GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Managing a merge queue – GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
