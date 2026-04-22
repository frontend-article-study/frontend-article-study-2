[[번역] 굿바이 innerHTML, 반가워 setHTML: Firefox 148에서 한층 강화된 XSS 방어](https://velog.io/@superlipbalm/goodbye-innerhtml-hello-sethtml-stronger-xss-protection-in-firefox-148)

위 아티클의 내용을 더욱 잘 이해하기 위한 몇 가지 질문에 대한 답을 정리했습니다. 먼저 원문을 그대로 가져와 각주를 달듯이 질문 번호((1), (2), (3)…)를 달고, 아래에 번호에 해당하는 질문과 답변을 작성합니다.

---

# 원문 + 질문 번호

> 원문: https://hacks.mozilla.org/2026/02/goodbye-innerhtml-hello-sethtml-stronger-xss-protection-in-firefox-148/
> 

[교차 사이트 스크립팅(Cross-site scripting, XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)은 [(1)](https://www.notion.so/innerHTML-setHTML-Firefox-148-XSS-349872bbb453801c8810daafd0869549?pvs=21) 여전히 웹에서 가장 빈번하게 발생하는 취약점 중 하나입니다. 새롭게 표준화된 [Sanitizer API](https://wicg.github.io/sanitizer-api/)는 웹 개발자가 신뢰할 수 없는 HTML을 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)에 삽입하기 전에 정제(sanitize)할 수 있는 직관적인 방법을 제공합니다. Firefox 148은 모두에게 더 안전한 웹 환경을 제공하기 위해 이 표준화된 보안 강화 API를 최초로 탑재한 브라우저입니다. 다른 브라우저들도 곧 뒤따라 이를 지원할 것으로 예상됩니다.

XSS 취약점은 웹사이트가 의도치 않게 공격자로 하여금 사용자 생성 콘텐츠를 통해 임의의 HTML이나 자바스크립트를 주입하도록 허용할 때 발생합니다. 공격자는 이를 통해 사용자 상호작용을 감시하고 조작할 수 있으며, 해당 취약점을 악용할 수 있는 한 지속적으로 사용자 데이터를 탈취할 수 있습니다. XSS는 오랫동안 방어하기 까다로운 것으로 악명 높았으며, 거의 10년 동안 [웹 취약점 상위 3개](https://nvd.nist.gov/general/visualizations/vulnerability-visualizations/cwe-over-time)(CWE-79) 안에 줄곧 랭크되어 왔습니다.

![](https://hacks.mozilla.org/wp-content/uploads/2026/02/sanitizer-diagram-optimized-2.svg)

Firefox는 2009년 (2) [콘텐츠 보안 정책(Content-Security-Policy, CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) 표준화를 주도한 것을 시작으로 (3) 초기부터 XSS 문제 해결에 깊이 관여해 왔습니다. CSP는 브라우저가 로드하고 실행할 수 있는 리소스(스크립트, 스타일, 이미지 등)를 웹사이트가 제한할 수 있도록 하여 XSS에 대한 강력한 방어선을 제공합니다. 그러나 지속적인 개선과 관리에도 불구하고, 웹사이트 구조를 대대적으로 변경해야 하고 보안 전문가의 꾸준한 검토가 요구되었기 때문에 (4) [CSP는 광범위한 웹 생태계를 모두 보호할 만큼 충분히 채택되지는 못했습니다](https://almanac.httparchive.org/en/2024/security#content-security-policy).

(5) [Sanitizer API](https://wicg.github.io/sanitizer-api/)는 악의적인 HTML을 무해한 HTML로 변환하는, 즉 정제하는 표준화된 방법을 제공하여 이러한 간극을 메우도록 설계되었습니다. `setHTML()` 메서드는 HTML을 삽입하는 과정에 정제 단계를 직접 통합하여 기본적으로 안전(safety by default)을 보장합니다. 다음은 간단하지만 안전하지 않은 형태의 HTML을 정제하는 예시입니다.

```jsx
document.body.setHTML(`<h1>Hello my name is <img src="x">`);
```

이 정제 과정은 HTML `<h1>` 요소를 유지하면서, (6) 내부의 `<img>` 요소와 그 `onclick` 속성을 제거합니다. 이를 통해 XSS 공격 요소를 차단하고 결과적으로 다음과 같이 안전한 HTML만 남게 됩니다.

```html
<h1>Hello my name is</h1>
```

개발자는 보안에 취약한 [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) 할당을 [setHTML()](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)로 교체함으로써, 최소한의 코드 변경만으로 더 강력한 XSS 방어 기능을 적용할 수 있습니다. 만약 특정 상황에서 `setHTML()`의 [기본 설정](https://wicg.github.io/sanitizer-api/#built-in-safe-default-configuration)이 너무 엄격하거나 조건에 맞지 않는다면, 개발자는 유지하거나 제거할 HTML 요소와 속성을 정의하는 [커스텀 설정](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML#options)을 지정할 수 있습니다. 운영 중인 웹 페이지에 도입하기 전에 Sanitizer API를 미리 실험해 보고 싶다면, [Sanitizer API 플레이그라운드](https://sanitizer-api.dev/)를 활용해 보는 것을 권장합니다.

더욱 견고한 보호를 원한다면, HTML 파싱과 삽입에 대한 통제를 중앙 집중화하는 (7) [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)와 Sanitizer API를 결합할 수 있습니다. 일단 `setHTML()`을 도입하고 나면, 사이트에서는 복잡한 커스텀 정책이 없어도 더 쉽게 Trusted Types 강제 적용을 활성화할 수 있습니다. 엄격한 정책을 통해 지정된 `setHTML()`의 사용은 허용하면서 그 외에 안전하지 않은 HTML 삽입 방식은 전면 차단함으로써 향후 XSS가 재발하는 것을 막을 수 있습니다.

이처럼 Sanitizer API는 기존 코드에 사용된 `innerHTML`을 `setHTML()`로 손쉽게 교체할 수 있게 해 주며, 웹에서 XSS 공격으로부터 사용자를 보호할 수 있는 안전하고 새로운 기본 방식을 제시합니다. Firefox 148은 Sanitizer API뿐만 아니라 Trusted Types도 함께 지원함으로써 사용자에게 한결 더 안전한 웹 환경을 제공합니다. 이제 모든 개발자는 이러한 표준을 채택함으로써, 전담 보안 팀을 구성하거나 복잡한 구현 변경을 거치지 않아도 효과적으로 XSS를 예방할 수 있게 됩니다.

*위 삽화에 대한 이미지 출처: [Website, by Desi Ratna](https://thenounproject.com/icon/website-8288559/); [Person, by Made by Made](https://thenounproject.com/icon/person-7955970/); [Hacker by Andy Horvath](https://thenounproject.com/icon/hacker-8192186/).*

> 🚀 한국어로 된 프런트엔드 아티클을 빠르게 받아보고 싶다면 Korean FE Article(https://kofearticle.substack.com/)을 구독해주세요!
> 

[Creative Commons Attribution Share-Alike License v3.0](https://creativecommons.org/licenses/by-sa/3.0/)

---

# 질문과 답변

## (1) 최근 주요 XSS 기반 실제 공격 관련 실태는? (2025~2026)

### 사례

① Magecart 카드 스키밍 공격 (2026년 1월, 2024-2025 급증)

- 사고 내용: Silent Push 보안팀이 2022년부터 은밀히 운영되던 Magecart
네트워크를 2026년 1월 적발했습니다. 수천 개의 이커머스 사이트 결제
페이지가 감염되었습니다.
- 공격 방식: 쇼핑몰 웹사이트의 XSS 취약점을 악용하거나 서버를 침해해 악성
JavaScript를 결제 페이지에 주입했습니다. 사용자가 결제 정보를 입력하면
실시간으로 카드 번호, CVV, 개인정보를 공격자 서버로 전송합니다.
- 피해: American Express, Mastercard, Diners Club, Discover, JCB, UnionPay
등 6대 결제 네트워크의 카드 정보가 탈취되었습니다. 2024-2025년 사이 103%
급증하며 가장 빠르게 성장하는 위협 중 하나로 기록되었습니다.
- 특징: 악성 스크립트가 정상 결제 폼을 완벽하게 복제하여 사용자가 전혀
눈치챌 수 없었습니다.

② 360XSS 캠페인 - Krpano 프레임워크 공격 (2025년 2월)

- 사고 내용: Krpano 가상 투어 프레임워크의 Reflected XSS
취약점(CVE-2020-24901)이 대규모로 악용되었습니다.
- 공격 방식: 공격자가 조작된 URL을 통해 악성 스크립트를 주입하고, SEO
포이즈닝을 통해 검색 엔진 결과에 악성 페이지를 노출시켰습니다.
- 피해: 350개 이상의 웹사이트가 감염되었으며, 피해 사이트에는:
    - 미국 주정부 포털
    - 대학교 웹사이트
    - 주요 호텔 체인
    - 언론사
    - Fortune 500 기업 다수
- 의의: 합법적인 도메인의 신뢰도를 악용해 스팸 광고를 주입하고 검색 엔진
순위를 조작한 사례입니다.

③ ResumeLooters - 구직 사이트 대량 침해 (2025년)

- 사고 내용: 'ResumeLooters'라는 해커 그룹이 구직 사이트와 쇼핑몰을 집중
공격했습니다.
- 공격 방식: SQL Injection과 XSS 공격을 조합하여 65개의 정상 웹사이트를
침해했습니다.
- 피해: 200만 명 이상의 구직자 개인정보가 탈취되었습니다. 이름, 이메일,
전화번호, 주소, 이력서 등 민감 정보가 포함됩니다.
- 특징: XSS를 통해 세션 쿠키를 탈취하고 관리자 권한을 획득한 뒤
데이터베이스에 접근하는 복합 공격이었습니다.

④ Microsoft Excel + Copilot Agent 연쇄 공격 (2026년 3월)

- 사고 내용: Microsoft Excel 내의 XSS 취약점(CVE-2026-26144)이 AI 비서인
Copilot과 결합되어 실제 공격에 악용되었습니다.
- 공격 방식: 공격자가 악성 스크립트가 포함된 엑셀 파일을 공유합니다.
파일을 열거나 미리보기만 해도 XSS가 실행되며(Zero-Click), Copilot Agent의
네트워크 권한을 탈취해 사용자의 다른 클라우드 문서, 이메일, 파일에
접근하여 외부로 유출합니다.
- 심각도: CVSS 7.5 (High), Microsoft는 2026년 3월 Patch Tuesday에서 긴급
패치를 발표했습니다.
- 의의: **기존 XSS가 브라우저 내에 국한되었다면, 이제는 AI 에이전트의 권한을
탈취하는 도약대 역할을 하게 된 첫 사례입니다.**

⑤ WordPress LiteSpeed Cache 플러그인 공격 (2025년)

- 사고 내용: LiteSpeed Cache 플러그인의 Stored XSS
취약점(CVE-2025-12450)이 발견되었습니다.
- 공격 방식: 인증되지 않은 공격자가 악성 스크립트를 WordPress 페이지에
저장할 수 있었습니다. 사이트 방문자가 해당 페이지를 로드하면 자동으로
스크립트가 실행됩니다.
- 피해 규모: 700만 개 이상의 WordPress 사이트에 설치된 인기 플러그인이라
잠재적 피해 범위가 막대했습니다.
- 의의: WordPress 생태계에서 2025년에만 11,334개의 새로운 취약점이
발견되었으며(전년 대비 42% 증가), 그중 XSS가 가장 지배적인 취약점
유형입니다. 취약점 공개 후 대량 악용까지의 중간값이 단 5시간에 불과합니다.

⑥ Roundcube 이메일 서버 공격 (2025년 9월~)

- 사고 내용: Roundcube 웹메일 서버의 XSS 취약점이 9월 패치 이후에도
적극적으로 악용되고 있습니다.
- 공격 방식: 공격자가 조작된 이메일을 발송하면, 사용자가 웹메일에서 해당
이메일을 열람할 때 XSS가 실행됩니다.
- 피해: CISA(미국 사이버보안·인프라 보안국)가 공식 경고를 발령할 정도로
광범위한 공격이 진행 중입니다.
- 의의: 패치가 나왔음에도 업데이트하지 않은 서버들이 지속적으로 공격당하고
있습니다.

### 2025-2026 XSS 공격 통계 및 동향

Microsoft 생태계 내 사고

- 2024년 1월 ~ 2025년 중반: MSRC가 조치한 XSS 관련 사례 970건 이상
- 2024년 7월 ~ 2025년 7월: 265건 처리 (Important 263건, Critical 2건)
- 전체 중요/심각 사고의 약 15%
- 보안 연구자들에게 총 $912,300 버그 바운티 지급 (최고액 $20,000)

AI 생성 코드의 위험

- Veracode의 2025 보고서: AI로 생성된 웹 애플리케이션 코드의 **86%**에서
XSS 방지 체크 실패
- 100개 이상의 LLM을 테스트한 결과, 사용자 입력 sanitization이 제대로
구현되지 않음
- **AI 생성 코드는 사람이 작성한 코드보다 2.74배 더 많은 XSS 취약점 포함**

WordPress 생태계

- 2025년: 11,334개의 새로운 취약점 발견 (전년 대비 42% 증가)
- 취약점 공개 후 대량 악용까지의 중간값: 5시간
- 46%의 취약점은 공개 시점에 개발자 패치가 없었음

### 프론트엔드 개발자 관점에서의 시사점

1. "신뢰할 수 있는 입력은 없다": 사용자 입력뿐만 아니라 서드파티 API 응답,
URL 파라미터, 심지어 데이터베이스에서 가져온 데이터도 렌더링 전에
sanitization이 필수입니다.
2. "의존성 보안 = 내 보안": WordPress 플러그인, npm 패키지, 프레임워크 등
우리가 사용하는 모든 의존성이 XSS의 통로가 될 수 있습니다. npm audit,
정기적인 업데이트, 의존성 스캔이 필수입니다.
3. "AI 시대의 XSS는 더 위험하다": CVE-2026-26144처럼 XSS가 단순히 alert
창을 띄우는 수준이 아니라, AI 에이전트 권한을 탈취해 이메일, 클라우드
문서, 비즈니스 데이터에 접근하는 도구로 진화했습니다.
4. "Sanitizer API가 절실하다": innerHTML 대신 setHTML()을 사용하면
기본적으로 위험한 요소/속성이 제거되므로, Firefox 148의 Sanitizer API
도입은 시의적절합니다.

---

## (2) CSP란?

CSP는 웹사이트에서 어떤 리소스(스크립트, 이미지, 스타일 등)를 로드하고 실행할 수 있는지 제어하는 보안 정책입니다. 웹페이지의 "보안 규칙"이라고 생각하면 됩니다.

### 왜 필요한가?

XSS 공격이나 데이터 주입 공격을 방어하기 위해서입니다. 공격자가 악의적인
스크립트를 주입하더라도, CSP 정책에 의해 실행이 차단됩니다.

### 작동 방식

서버에서 HTTP 헤더나 HTML의 <meta> 태그로 정책을 설정합니다:

### HTTP 헤더 방식

Content-Security-Policy: default-src 'self'; script-src 'self'
[https://trusted.com](https://trusted.com/)

### HTML meta 태그 방식

<meta http-equiv="Content-Security-Policy"
content="default-src 'self'; script-src 'self' [https://trusted.com](https://trusted.com/)">

---

## (3) Firefox/Mozilla의 XSS 문제 해결 활동

CSP 표준화 외에도 Firefox와 Mozilla는 다양한 XSS 방지 기술을 개발하고
주도해왔습니다.

### 1. Sanitizer API 최초 구현 (2026년)

Firefox 148에서 세계 최초로 표준화된 Sanitizer API를 브라우저에
탑재했습니다.

// innerHTML 대신 setHTML() 사용
element.setHTML(userInput);  // 자동으로 XSS 차단

왜 중요한가:

- CSP는 채택률이 낮고 기존 웹사이트 구조 변경 필요
- Sanitizer API는 코드 한 줄만 바꾸면 됨 (innerHTML → setHTML())
- 개발자가 더 쉽게 보안 적용 가능

### 2. eslint-plugin-no-unsanitized 개발

Mozilla가 개발한 정적 분석 도구로, 코드 작성 단계에서 XSS 취약점을
찾아냅니다.

// ❌ 경고: 안전하지 않은 코드
element.innerHTML = userInput;
document.write(data);

// ✅ 안전한 코드 권장
element.textContent = userInput;
DOMPurify.sanitize(data);

효과:

- Firefox UI 코드 검사 시 수천 개 의심 코드 → 34개 실제 취약점으로 축소
- 2개의 심각한 보안 버그 발견 및 수정
- DOM-based XSS 방지에 특히 효과적

GitHub: https://github.com/mozilla/eslint-plugin-no-unsanitized

### 3. Trusted Types 지원

Firefox 148부터 Trusted Types를 지원하여 Sanitizer API와 결합 사용 가능:

// Trusted Types 정책 설정
trustedTypes.createPolicy('default', {
createHTML: (string) => {
// setHTML은 허용하되, 다른 innerHTML은 차단
return sanitizer.sanitizeFor('div', string);
}
});

### 4. DOM-based XSS 정적 분석 연구

2021년 Mozilla Attack & Defense 팀이 발표한 정적 분석 기법:

- Single Page Application(SPA)의 DOM XSS 취약점 자동 탐지
- document.write(), eval(), innerHTML 등 위험 패턴 탐지
- Firefox 브라우저 UI 코드 보안 검증에 사용

### 5. XSS Filter 개발 시도 (최종적으로 미구현)

2010년대 초반, Mozilla는 Chrome의 XSSAuditor 기반 XSS Filter를 개발했으나:

개발한 이유:

- Reflected XSS 공격 차단 (URL에 스크립트 삽입 공격)
- 타사 솔루션보다 정확한 Chrome 방식 채택

결국 구현하지 않은 이유 (2016년 최종 결정):
❌ Stored XSS (서버 저장 XSS) 방어 불가
❌ DOM-based XSS 방어 불가
❌ 우회 가능성과 오탐(false positive) 문제
✅ 대신 CSP, Sanitizer API 등 근본적 해결책에 집중

### 6. 보안 가이드라인 및 표준화 활동

Mozilla는 웹 보안 가이드라인을 지속적으로 발표:

- CSP 베스트 프랙티스 문서화
- Nonce-based CSP 지원 및 권장
- OWASP Top 10 대응 가이드

### Firefox의 XSS 방지 전략 변화

2009: CSP 표준 주도
↓
2010년대: XSS Filter 개발 시도 → 근본적 한계로 포기
↓
2010년대 중반: 개발 도구에 집중 (eslint plugin)
↓
2021: DOM XSS 정적 분석 연구
↓
2026: Sanitizer API 최초 구현 + Trusted Types 지원

### 정리

Firefox/Mozilla는 브라우저 자체 기능과 개발자 도구 양쪽에서 XSS 문제를
해결:

| 분류 | 기술 | 효과 |
| --- | --- | --- |
| 브라우저 표준 | CSP (2009) | 페이지 전체 보안 정책 |
| 브라우저 API | Sanitizer API (2026) | HTML 정제 표준화 |
| 브라우저 API | Trusted Types | 위험한 DOM API 제어 |
| 개발 도구 | eslint-plugin | 코드 작성 단계 검증 |
| 연구 | 정적 분석 | DOM XSS 자동 탐지 |

핵심 철학: "브라우저가 막는 것(CSP)"보다 **"개발자가 안전하게 만들 수 있게
돕는 것(Sanitizer API, eslint)"**에 더 집중하는 방향으로 진화했습니다.

---

## (4) 2024년 실제 웹사이트들이 CSP를 어떻게 사용하고 있는지

이 글은 2024년 실제 웹사이트들이 CSP를 어떻게 사용하고 있는지 분석한
보고서입니다.

### 1. CSP 채택 현황

채택률 증가

2022년: 15%
2024년: 19%
증가율: 27% ↑

의미: 웹사이트 5개 중 1개 정도만 CSP를 사용하고 있습니다. 천천히 증가하는
중이지만 여전히 대부분의 사이트가 CSP를 사용하지 않음.

### 2. 실제로 어떻게 사용되나?

가장 많이 사용되는 지시어 TOP 3

1위: frame-ancestors (56%)
Content-Security-Policy: frame-ancestors 'none'
→ 클릭재킹 방지 (다른 사이트가 iframe으로 내 페이지를 못 넣게 함)

2위: upgrade-insecure-requests (54%)
Content-Security-Policy: upgrade-insecure-requests
→ HTTP를 HTTPS로 자동 전환

3위: block-all-mixed-content (24%)
Content-Security-Policy: block-all-mixed-content
→ HTTPS 페이지에서 HTTP 리소스 차단

가장 흔한 CSP 패턴

- 패턴 1: HTTPS만 강제
    
    Content-Security-Policy: upgrade-insecure-requests
    
- 패턴 2: HTTPS + 클릭재킹 방지
    
    Content-Security-Policy:
    upgrade-insecure-requests;
    block-all-mixed-content;
    frame-ancestors 'none'
    

핵심: 대부분의 사이트가 CSP를 XSS 방지보다 HTTPS 강제와 클릭재킹 방지에
사용하고 있습니다.

### 3. 스크립트 보안 키워드 사용 현황

문제적 통계

unsafe-inline: 91% 😱
unsafe-eval:   78% 😱

이게 무슨 의미냐면:

CSP를 설정했지만...

Content-Security-Policy:
script-src 'self' 'unsafe-inline' 'unsafe-eval'

이렇게 하면 CSP가 거의 무용지물입니다!

- 'unsafe-inline': 인라인 스크립트 허용 → XSS 공격 가능
- 'unsafe-eval': eval() 허용 → 동적 코드 실행 가능

긍정적 신호

nonce 사용:        20% ↑
strict-dynamic:    10% ↑

nonce 사용 예시:
<meta http-equiv="Content-Security-Policy"
content="script-src 'nonce-abc123'">

<script nonce="abc123">
// 이 스크립트만 실행 가능
</script>

### 4. 주요 문제점

문제 1: 과도하게 긴 헤더

일부 사이트: 수천 바이트의 CSP 헤더

예시 (실제로 이런 경우가 있음):
Content-Security-Policy:
default-src 'self' [https://cdn1.com](https://cdn1.com/) [https://cdn2.com](https://cdn2.com/) [https://cdn3.com](https://cdn3.com/)
... (수백 개의 도메인 나열) ...

왜 문제인가:

- 관리가 어려움
- 성능 저하 (헤더가 너무 큼)
- 보안 효과 감소 (허용 목록이 너무 많음)

문제 2: 복잡성

개발자들이 CSP 정책 언어를 이해하기 어려움
→ 잘못 설정하면 보안 효과 없음
→ 또는 사이트가 제대로 작동 안 함

문제 3: 실질적 보안 효과 미미

91%가 unsafe-inline 사용 = XSS 방지 효과 거의 없음

### 5. 실제 사용 패턴 분석

현실적인 CSP 사용 목적

| 목적 | 사용률 | 효과 |
| --- | --- | --- |
| HTTPS 강제 | 54% | ✅ 잘 작동 |
| 클릭재킹 방지 | 56% | ✅ 잘 작동 |
| XSS 방지 | ~9% | ⚠️ 제한적 (unsafe 키워드 때문) |

결론: CSP가 원래 목적(XSS 방지)보다는 부가적인 보안 기능으로 더 많이
활용되고 있습니다.

### 6. 트렌드 예측

2024년: 19%
예상 2025년: 20% 돌파

채택률은 증가하지만 속도가 느림. CSP 복잡성이 채택의 장벽.

### 핵심 요약

좋은 소식 ✅

- CSP 채택률 증가 (19%)
- nonce, strict-dynamic 같은 안전한 방식 증가
- HTTPS 강제에는 효과적으로 활용됨

나쁜 소식 ❌

- 여전히 80%의 사이트가 CSP 미사용
- 91%가 unsafe-inline 사용 → XSS 방지 효과 없음
- 너무 복잡해서 올바르게 설정하기 어려움

현실

CSP 설정함 (19%) ──┬─→ 제대로 설정 (~9%) → 실제 보안 효과
│
└─→ 잘못 설정 (~10%) → 보안 효과 미미

CSP 없음 (81%) ─────→ 보안 취약

결론: CSP는 좋은 보안 도구이지만, 너무 복잡해서 실제로 제대로 활용되는
경우가 드뭅니다. 그래서 Mozilla가 Sanitizer API 같은 더 쉬운 대안을 만든
것입니다!

---

## (5) Sanitizer API 개괄

Sanitizer API는 웹 브라우저에서 제공하는 보안 기능으로, 신뢰할 수 없는
HTML 코드를 안전하게 처리하기 위한 API입니다.

### 왜 필요한가?

웹 개발을 하다보면 사용자가 입력한 HTML이나 외부에서 받은 HTML을
웹페이지에 표시해야 할 때가 있습니다. 하지만 이를 단순히 innerHTML로
삽입하면 XSS(Cross-Site Scripting) 공격에 취약해집니다.

문제 예시:
// 위험한 코드
element.innerHTML = userInput; // 만약 userInput에
<script>alert('해킹')</script>가 있다면?

기존에는 DOMPurify 같은 라이브러리를 사용했지만, 브라우저 자체에서
제공하는 표준 API가 더 안전하고 효율적입니다.

### 주요 기능

1. 안전한 HTML 삽입
    
    ```jsx
    // 기본 사용 (가장 안전)
    element.setHTML(userInput);  // 위험한 스크립트는 자동으로 제거됨
    ```
    
2. 커스텀 설정
    
    허용할 태그와 속성을 직접 지정할 수 있습니다:
    
    ```jsx
    const sanitizer = new Sanitizer({
    elements: ["p", "a", "strong", "em"],  // 이 태그들만 허용
    attributes: ["href", "class"]           // 이 속성들만 허용
    });
    
    element.setHTML(userInput, { sanitizer });
    ```
    
3. 문서 파싱
    
    ```jsx
    // HTML 문자열을 완전한 문서로 파싱
    const doc = Document.parseHTML(htmlString);
    ```
    

### 핵심 보안 기능

- 스크립트 차단: <script> 태그나 onclick 같은 이벤트 핸들러 제거
- XSS 방지: 악의적인 코드 실행 차단
- 안전한 기본값: 별도 설정 없이도 위험한 요소는 자동 제거

### 실용적인 예시

```jsx
// 사용자가 입력한 댓글을 안전하게 표시
const commentDiv = document.getElementById('comment');
const userComment = '<p>좋은 글이네요!</p><script>alert("해킹")</script>';

// 안전하게 삽입 (script 태그는 자동으로 제거됨)
commentDiv.setHTML(userComment);
// 결과: <p>좋은 글이네요!</p> 만 표시됨
```

이 API는 웹 보안을 크게 향상시키며, 개발자가 복잡한 보안 로직을 직접
구현하지 않아도 되게 해줍니다.

---

## (6) Sanitizer API가 제거하는 위험 대상

### 핵심 개념: 3단계 보안 레벨

Sanitizer API는 3단계 보안 레벨로 작동합니다:

| 레벨 | 적용 방법 | 엄격도 | 강제 여부 |
| --- | --- | --- | --- |
| XSS-Safe Baseline | setHTML() 사용 시 항상 적용 | 최소 (XSS만 차단) | ✅ |
| 강제 |  |  |  |
| Default Configuration | setHTML() 기본값 | 매우 엄격 | 선택 가능 |
| Custom Sanitizer | 직접 설정 전달 | 사용자 정의 | 선택 가능 |

### 1. XSS-Safe Baseline (무조건 적용)

setHTML() 사용 시 항상 강제 적용되는 최소 보안
커스텀 설정을 전달해도 이 규칙은 절대 우회 불가!

❌ 무조건 차단되는 태그

```html
<script>alert('XSS')</script>           <!-- JavaScript 코드 -->
<iframe src="[evil.com](http://evil.com/)"></iframe>        <!-- 외부 프레임 -->
<object data="evil.swf"></object>       <!-- 플러그인 객체 -->
<embed src="evil.swf">                  <!-- 임베디드 콘텐츠 -->
<frame>                                 <!-- 프레임 -->
<use>                                   <!-- SVG use 요소 -->
```

❌ 무조건 차단되는 속성

```html
<!-- 모든 on* 이벤트 핸들러 -->
<img src="x" onerror="alert('XSS')">    <!-- onerror -->
<body onload="malicious()">              <!-- onload -->
<div onclick="steal()">                  <!-- onclick -->
<input onchange="hack()">                <!-- onchange -->
<a onmouseover="evil()">                 <!-- onmouseover -->
```

모든 이벤트 핸들러:

- onclick, onload, onerror, onmouseover, onfocus
- onbeforeinput, onafterprint, onchange, onsubmit
- 기타 150개 이상의 모든 on* 속성

✅ Baseline에서는 허용 (XSS 안전)

<img src="photo.jpg">                   <!-- 이미지 -->
<video src="video.mp4"></video>         <!-- 비디오 -->
<button>클릭</button>                   <!-- 버튼 -->
<form><input></form>                    <!-- 폼 요소 -->
<div data-id="123">                     <!-- data-* 속성 -->
<!-- HTML 주석 -->

### 2. Default Configuration (setHTML 기본값)

setHTML()을 인자 없이 호출할 때 적용되는 엄격한 설정
= XSS-Safe Baseline + 추가 보안

❌ 추가로 제거되는 태그들

- 미디어 요소
    
    ```html
    <img src="photo.jpg">                   <!-- ❌ 제거 -->
    <video src="video.mp4"></video>         <!-- ❌ 제거 -->
    <audio src="sound.mp3"></audio>         <!-- ❌ 제거 -->
    ```
    
- 폼 관련 요소
    
    ```html
    <button>클릭</button>                   <!-- ❌ 제거 -->
    <form></form>                           <!-- ❌ 제거 -->
    <input type="text">                     <!-- ❌ 제거 -->
    <textarea></textarea>                   <!-- ❌ 제거 -->
    <label></label>                         <!-- ❌ 제거 -->
    <select><option></option></select>      <!-- ❌ 제거 -->
    <output></output>                       <!-- ❌ 제거 -->
    ```
    
- 스타일 및 메타 요소
    
    ```html
    <style>CSS</style>                      <!-- ❌ 제거 -->
    <link rel="stylesheet">                 <!-- ❌ 제거 -->
    <template></template>                   <!-- ❌ 제거 -->
    ```
    
- 인터랙티브 요소
    
    ```html
    <details><summary></summary></details>  <!-- ❌ 제거 -->
    ```
    
- 커스텀 요소
    
    ```html
    <my-component></my-component>           <!-- ❌ 제거 -->
    <custom-widget></custom-widget>         <!-- ❌ 제거 -->
    ```
    

❌ 추가로 제거되는 속성

```html
<div data-user-id="123">                <!-- data-* 제거 -->
<div aria-label="설명">                 <!-- aria-* 제거 -->
<div style="color: red">                <!-- 인라인 style 제거 -->
<!-- HTML 주석도 제거 -->
```

✅ Default에서 허용되는 안전한 요소

```html
<!-- 기본 블록/인라인 요소 -->
<p>, <div>, <span>, <section>, <article>
```

```html
<!-- 제목 -->
<h1>, <h2>, <h3>, <h4>, <h5>, <h6>
```

```html
<!-- 텍스트 서식 -->
<strong>, <em>, <b>, <i>, <u>, <mark>, <small>
<del>, <ins>, <sub>, <sup>, <code>, <pre>
```

```html
<!-- 리스트 -->
<ul>, <ol>, <li>, <dl>, <dt>, <dd>
```

```html
<!-- 링크 및 구분 -->
<a href="#">                            <!-- href 속성만 -->
<br>, <hr>
```

```html
<!-- 인용 -->
<blockquote>, <q>, <cite>
```

```html
<!-- 테이블 -->
<table>, <thead>, <tbody>, <tr>, <td>, <th>
```

### 2. 메서드별 동작 방식

setHTML() - 안전한 메서드 (권장 ⭐)

- 패턴 1: 기본 사용 (가장 엄격)
    
    ```jsx
    element.setHTML(userInput);
    ```
    
    ```jsx
    // 적용되는 것:
    // 1️⃣ XSS-Safe Baseline (강제)
    // 2️⃣ Default Configuration (기본값)
    ```
    
    제거되는 것:
    
    - ❌ <script>, <iframe>, on* 속성 (Baseline)
    - ❌ <img>, <button>, <form>, data-* 등 (Default)
    
    남는 것:
    
    - ✅ <p>, <div>, <h1>, <strong>, <a> 등 안전한 기본 요소만
- 패턴 2: 커스텀 설정 전달
    
    ```jsx
    const sanitizer = new Sanitizer({
    allowElements: ["h1", "p", "img", "script"],  // script 허용 시도
    allowAttributes: {
    "img": ["src", "onerror"]  // onerror 허용 시도
    }
    });
    ```
    
    ```jsx
    element.setHTML(userInput, { sanitizer });
    ```
    
    ```jsx
    // 적용되는 것:
    // 1️⃣ XSS-Safe Baseline (강제!) ← 우선순위 최상위
    // 2️⃣ Custom Sanitizer
    ```
    
    실제 결과:
    
    - ✅ <h1>, <p> 허용 (커스텀 설정)
    - ✅ <img> 허용 (커스텀 설정)
    - ❌ <script> 제거 (Baseline이 강제로 차단!)
    - ❌ onerror 제거 (Baseline이 강제로 차단!)

핵심: setHTML()은 항상 XSS-Safe Baseline을 강제 적용합니다!

### setHTMLUnsafe() - 위험한 메서드 (주의 ⚠️)

- 패턴 1: 기본 사용 (매우 위험!)
    
    ```jsx
    element.setHTMLUnsafe(userInput);
    ```
    
    ```jsx
    // 적용되는 것:
    // 없음! (innerHTML과 동일)
    ```
    
    ⚠️ 모든 것이 그대로 삽입됨 - XSS 공격에 취약!
    
- 패턴 2: 커스텀 설정 전달
    
    ```jsx
    const sanitizer = new Sanitizer({
    allowElements: ["h1", "p", "img"],
    allowAttributes: {
    "img": ["src"]
    }
    });
    ```
    
    ```jsx
    element.setHTMLUnsafe(userInput, { sanitizer });
    ```
    
    ```jsx
    // 적용되는 것:
    // 1️⃣ Custom Sanitizer만 (Baseline 강제 안 됨!)
    ```
    
    위험: XSS-Safe Baseline이 강제되지 않으므로 설정 실수 시 위험!
    

### 최종 결론

setHTML()을 사용하면 개발자가 실수해도 XSS는 방지됩니다. 이것이 "Secure by Default"의 핵심입니다! 🛡️

---

## (7) Trusted Types API

Trusted Types API는 위험한 DOM API를 "안전 모드"로 만드는 보안 기능입니다.

핵심 개념: 문자열 금지!

### 문제 상황

```jsx
// ❌ 위험한 코드 (현재 일반적인 방식)
element.innerHTML = userInput;  // userInput에 <script>가 있으면?
eval(data);                     // data가 악성 코드라면?
```

문제: JavaScript는 문자열이면 뭐든지 실행합니다!

### Trusted Types의 해결책

```jsx
// ✅ 안전한 코드 (Trusted Types 사용)
element.innerHTML = trustedHTML;  // TrustedHTML 객체만 허용
eval(trustedScript);              // TrustedScript 객체만 허용

element.innerHTML = "<p>text</p>"; // ❌ TypeError 발생! 문자열 차단됨
```

해결: 신뢰할 수 있는 객체만 위험한 API에 전달 가능!

### 작동 방식

- 1단계: 정책(Policy) 만들기
    
    정책 = 문자열을 안전하게 변환하는 규칙
    
    ```jsx
    const myPolicy = trustedTypes.createPolicy("my-policy", {
    	createHTML: (input) => {
    		// 여기서 입력을 정제
    		return DOMPurify.sanitize(input);
    	},
    	createScript: (input) => {
    	  // 스크립트 검증
    	  if (isSafe(input)) return input;
    	  throw new Error("안전하지 않은 스크립트!");
    	},
    	createScriptURL: (url) => {
    	  // URL 검증
    	  if (url.startsWith("<https://trusted.com>")) return url;
    	  throw new Error("신뢰할 수 없는 도메인!");
    	}
    });
    ```
    
- 2단계: 정책으로 안전한 객체 만들기

```jsx
const userInput = '<p>안녕하세요</p><script>alert("XSS")</script>';

// 정책을 통과시켜 TrustedHTML 객체 생성
const trustedHTML = myPolicy.createHTML(userInput);

// 이제 안전하게 사용 가능
element.innerHTML = trustedHTML;
// 결과: <p>안녕하세요</p> (script는 DOMPurify가 제거)
```

### 세 가지 Trusted 타입

1. TrustedHTML
    
    HTML을 렌더링하는 위험한 API 보호
    
    ```jsx
    // 위험한 API들 (TrustedHTML 객체 필요)
    element.innerHTML = trustedHTML;
    element.outerHTML = trustedHTML;
    document.write(trustedHTML);
    element.insertAdjacentHTML('beforeend', trustedHTML);
    ```
    
2. TrustedScript
    
    JavaScript 코드를 실행하는 위험한 API 보호
    
    ```jsx
    // 위험한 API들 (TrustedScript 객체 필요)
    eval(trustedScript);
    new Function(trustedScript);
    scriptElement.text = trustedScript;
    scriptElement.textContent = trustedScript;
    ```
    
3. TrustedScriptURL
    
    스크립트 URL을 로드하는 위험한 API 보호
    
    ```jsx
    // 위험한 API들 (TrustedScriptURL 객체 필요)
    scriptElement.src = trustedScriptURL;
    workerScript.src = trustedScriptURL;
    ```
    

### CSP와 연동하여 강제하기

CSP 설정으로 Trusted Types 활성화

```html
<meta http-equiv="Content-Security-Policy"
content="require-trusted-types-for 'script'; trusted-types
my-policy">
```

두 가지 지시어:

1. require-trusted-types-for 'script'
    
    모든 위험한 API에 Trusted Types 강제 적용
    
    ```html
    // ❌ TypeError 발생!
    element.innerHTML = "<p>text</p>";
    ```
    
    ```html
    // ✅ 정상 작동
    element.innerHTML = myPolicy.createHTML("<p>text</p>");
    ```
    
2. trusted-types my-policy default
    
    허용된 정책 이름 지정 (화이트리스트)
    
    ```html
    // ✅ 허용된 정책
    trustedTypes.createPolicy("my-policy", {...});
    ```
    
    ```html
    // ❌ DOMException 발생! (허용되지 않은 정책)
    trustedTypes.createPolicy("evil-policy", {...});
    ```
    

### Sanitizer API + Trusted Types 결합

핵심 아이디어

Trusted Types 정책 안에서 Sanitizer API 사용
↓

1. Trusted Types: "innerHTML에 문자열 쓰지 마!" (강제)
2. Sanitizer API: "정제된 HTML 만들어줄게!" (정제)
↓
완벽한 방어!

예시: 정책에서 setHTML() 사용 (권장)

전체 코드

```html
<!DOCTYPE html>
<html>
<head>
<!-- CSP로 Trusted Types 강제 -->
<meta http-equiv="Content-Security-Policy"
content="require-trusted-types-for 'script';
trusted-types sanitizer-policy">
</head>
<body>
<div id="content"></div>

<script>
  // Trusted Types 정책에 Sanitizer API 통합
  const sanitizerPolicy = trustedTypes.createPolicy('sanitizer-policy',
    {
			createHTML: (input) => {
				// 임시 div 생성
				const div = document.createElement('div');
				// Sanitizer API로 정제
	      div.setHTML(input);

	      // 정제된 결과를 문자열로 반환
	      return div.innerHTML;
    }
  });

  // 사용
  const userInput = `
    <h1>제목</h1>
    <p onclick="alert('XSS')">내용</p>
    <img src="photo.jpg" onerror="alert('XSS')">
    <script>alert('XSS')</script>
  `;

  // ❌ 직접 사용 불가 (CSP가 차단)
  // document.getElementById('content').innerHTML = userInput;  // TypeError!
  
  // ✅ 정책을 거쳐야 함
  const safeHTML = sanitizerPolicy.createHTML(userInput);
  document.getElementById('content').innerHTML = safeHTML;

  // 결과: <h1>제목</h1><p>내용</p>
  // - script, img, onclick, onerror 모두 제거됨
</script>
</body>
</html>
```

작동 원리

userInput (위험한 문자열)
↓
sanitizerPolicy.createHTML(input) 호출
↓
정책 내부에서 div.setHTML(input) 실행 (Sanitizer API)
↓
Sanitizer가 위험 요소 제거
↓
정제된 HTML을 TrustedHTML 객체로 반환
↓
element.innerHTML = trustedHTML (CSP 통과)
↓
안전하게 렌더링

### Trusted Types, CSP, Sanitizer API의 관계

핵심 정리

Sanitizer API

```jsx
// ✅ CSP 없이 단독으로 완벽하게 작동
element.setHTML(userInput);  // 그냥 쓰면 됨!
```

```html
// CSP 불필요! 브라우저 API로 바로 작동
```

Sanitizer API가 나온 이유:

- CSP는 너무 복잡하고 채택률이 낮음 (19%)
- 개발자가 쉽게 사용할 수 있는 API 필요
- innerHTML → setHTML()로 한 줄만 바꾸면 됨

Trusted Types

```jsx
// ❌ CSP 없으면 강제 안 됨 (경고도 없음)
element.innerHTML = userInput;  // 그냥 작동함 (위험)
```

```jsx
// ✅ CSP로 강제해야만 의미 있음
// Content-Security-Policy: require-trusted-types-for 'script'
element.innerHTML = userInput;  // TypeError! (차단됨)
```

결합 시나리오

시나리오 1: Sanitizer API만 (CSP 불필요 ✅)

```jsx
// CSP 없음
```

```jsx
// 그냥 사용
element.setHTML(userInput);
// ✅ 완벽하게 작동, XSS 방지됨
```

```jsx
// 커스텀 설정도 가능
const sanitizer = new Sanitizer({
allowElements: ['p', 'img']
});
element.setHTML(userInput, { sanitizer });
```

장점:

- 간단함
- CSP 설정 불필요
- 즉시 사용 가능

단점:

- 개발자가 setHTML() 대신 innerHTML을 쓰면? → 보호 안 됨

시나리오 2: Trusted Types + Sanitizer (CSP 없이)

```jsx
// CSP 없음
```

```jsx
// 정책 정의
const policy = trustedTypes.createPolicy('my-policy', {
createHTML: (input) => {
const div = document.createElement('div');
div.setHTML(input);  // Sanitizer API 사용
return div.innerHTML;
}
});
```

```jsx
// ✅ 이렇게 쓰면 안전
element.innerHTML = policy.createHTML(userInput);
```

```jsx
// ❌ 하지만 이렇게 써도 경고 없음! (문제!)
element.innerHTML = userInput;  // XSS 발생!
```

장점:

- 정책으로 코드 구조화 가능
- Sanitizer API 재사용 가능

단점:

- 강제되지 않음! 개발자가 실수하면 끝

시나리오 3: Trusted Types + Sanitizer + CSP (완전체)

```html
<!-- CSP로 Trusted Types 강제 -->
<meta http-equiv="Content-Security-Policy"
content="require-trusted-types-for 'script'; trusted-types
my-policy">
```

```jsx
const policy = trustedTypes.createPolicy('my-policy', {
createHTML: (input) => {
const div = document.createElement('div');
div.setHTML(input);
return div.innerHTML;
}
});
```

```jsx
// ✅ 안전
element.innerHTML = policy.createHTML(userInput);
```

```jsx
// ❌ TypeError! 브라우저가 차단
element.innerHTML = userInput;
```

장점:

- 강제됨! 실수해도 브라우저가 차단
- 최고 수준의 보안

단점:

- CSP 설정 필요 (약간 복잡)

언제 CSP가 필요한가?

Sanitizer API 단독 사용
→ CSP 불필요 ✅

Trusted Types를 "강제"하고 싶을 때
→ CSP 필수 ⚠️

Sanitizer + Trusted Types 결합인데 강제 안 해도 됨
→ CSP 선택 사항 🤷

실무 권장:
// 대부분의 경우: 이것만으로 충분
element.setHTML(userInput);

// 보안이 극도로 중요한 경우만: CSP + Trusted Types 추가