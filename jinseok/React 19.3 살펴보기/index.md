# React 19.3 살펴보기

> 원문: [React 19.3 – React Blog](https://react.dev/blog/2026/09/09/react-19-3) (2026-09-09)
>
> 데모: Next.js 16.3.7 + React 19.3.0

## 한눈에 보기

| 기능 | 패키지 | 한 줄 요약 |
|---|---|---|
| `<ViewTransition>` | `react` | 브라우저 View Transition API로 enter / exit / update / share 애니메이션 (stable) |
| `addTransitionType` | `react` | 업데이트의 "이유"에 따라 다른 애니메이션 선택 |
| `use(browser())` | `react-dom` | 브라우저 전용 컴포넌트를 SSR에서 제외 |
| Fragment ref | `react` | 래퍼 DOM 없이 형제 노드 묶음에 이벤트·포커스·Observer (stable) |
| Server Components Context | `react` | Server Component에서 `<Context value>`를 직접 렌더링 |
| Trusted Types | `react-dom` | Trusted Types 객체를 문자열로 바꾸지 않고 그대로 전달 |

## 1. ViewTransition

### 브라우저 View Transition API

- `document.startViewTransition(update)`
  1. 현재 화면을 스냅샷으로 찍고
  2. `update`로 DOM을 바꾼 뒤
  3. 이전 스냅샷과 새 화면 사이를 CSS 애니메이션으로 전환
- 문제: React에서는 **언제 DOM이 바뀌는지** 개발자가 직접 알기 어려움
- React가 대신 `startViewTransition`을 호출해 주는 컴포넌트가 `<ViewTransition>`

### 전환 중에 생기는 가상 요소 트리

```text
::view-transition                     ← 화면 전체를 덮는 오버레이
└─ ::view-transition-group(name)      ← 위치·크기 이동
   └─ ::view-transition-image-pair(name)
      ├─ ::view-transition-old(name)  ← 바뀌기 전 스냅샷 (정지 이미지)
      └─ ::view-transition-new(name)  ← 바뀐 뒤 화면 (실시간)
```

- 전환하는 동안만 브라우저가 임시로 만드는 CSS 표준 가상 요소(pseudo-element)
- 기본 애니메이션: `old`는 fade-out, `new`는 fade-in (cross-fade), `group`은 위치·크기 보간, 0.25초
  - `h1`의 margin처럼 **브라우저 기본 스타일**(UA stylesheet)에 들어 있는 값 → CSS 한 줄 없이도 동작
  - 우리가 쓴 CSS는 브라우저 기본 스타일보다 항상 우선 → 원하는 대로 덮어쓰기
- 괄호 안에는 `view-transition-name`, 전체를 뜻하는 `*`, 또는 `.클래스`
- 애니메이션을 바꾸고 싶으면 이 가상 요소를 CSS로 잡는다
- 자세히: [MDN – Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)

### 언제 동작하나

```tsx
setItems(next);                            // ❌ 애니메이션 없음
startTransition(() => setItems(next));     // ✅ 애니메이션
```

- `<ViewTransition>`은 **Transition 안의 업데이트**에서만 동작
  - `startTransition` / `useTransition`
  - `<Suspense>`가 fallback에서 내용으로 바뀔 때
  - `useDeferredValue`
- Next.js App Router의 페이지 이동은 이미 Transition이라 그대로 동작

### ViewTransition의 prop

```tsx
<ViewTransition
  enter="slide-in"     // 이 컴포넌트가 나타날 때
  exit="slide-out"     // 사라질 때
  update="none"        // 안쪽 내용이 바뀔 때 (예시로 "none" = 이 상황은 끔)
  name="photo-1"       // 다른 곳의 같은 name과 이어짐 (share)
>
  <Card />
</ViewTransition>
```

- prop의 값은 **CSS 클래스 이름**. React가 전환 순간 그 클래스를 붙여 줌

```text
enter="slide-in"
  → 마운트되는 순간 요소에 view-transition-class: slide-in
  → CSS: ::view-transition-new(.slide-in) { animation: … }   ← 나타나는 쪽은 new
```

- `exit`는 사라지는 쪽이라 `::view-transition-old(.slide-out)`으로 잡음

### 데모 1: 추가·삭제

<!-- demo: /list -->

```tsx
{items.map((item) => (
  <ViewTransition key={item.id} enter="slide-in" exit="slide-out">
    <li>{item.text}</li>
  </ViewTransition>
))}

// 업데이트는 반드시 Transition 안에서
startTransition(() => setItems(next));
```

```css
::view-transition-new(.slide-in) { animation: 280ms both fade-in, 280ms both scale-in; }
::view-transition-old(.slide-out) { animation: 200ms both fade-out, 200ms both to-left; }
```

- 섞기(reorder)에도 애니메이션이 붙는 이유: 항목이 `<ViewTransition>`으로 감싸져 있고, 섞기도 `startTransition` 안의 업데이트라서
  - React가 항목마다 고유한 `view-transition-name`을 자동으로 붙임 → 섞기 전후의 같은 항목이 한 쌍이 됨
  - 자리 이동에는 클래스를 주지 않았으니 브라우저 기본 애니메이션 → 앞에서 본 `group`이 이전 위치에서 새 위치로 이동

### 데모 2: 목록 → 상세

<!-- demo: /share -->

```tsx
// 목록
<Link href={`/share/${photo.id}`}>
  <ViewTransition name={`photo-${photo.id}`}>
    <div className="thumb" />
  </ViewTransition>
</Link>

// 상세
<ViewTransition name={`photo-${photo.id}`}>
  <div className="hero" />
</ViewTransition>
```

- CSS 없음: 같은 `name`끼리 한 `group`으로 묶이고, 브라우저 기본 애니메이션이 썸네일 위치·크기 → 큰 이미지 위치·크기로 이동 (share)
- Next.js App Router에서는
  - 설정 없이 동작: `<Link>`·`router.push` 이동이 이미 Transition → 두 page에 같은 `name`만 주면 끝
  - 도착 페이지가 prefetch되어 한 번에 그려질 때만 이어짐 (중간에 suspend하면 그냥 나타남)
- 모양을 바꾸려면 양쪽에 `share="morph" default="none"` → CSS `::view-transition-group(.morph)`

### 데모 3: 방향별 애니메이션

<!-- demo: /carousel -->

```tsx
startTransition(() => {
  addTransitionType("next");
  setIndex((i) => i + 1);
});

<ViewTransition
  key={photo.id}
  enter={{ next: "from-right", prev: "from-left", default: "none" }}
  exit={{ next: "to-left", prev: "to-right", default: "none" }}
>
```

```css
::view-transition-new(.from-right) { animation: 380ms from-right; }
::view-transition-old(.to-left)    { animation: 380ms to-left; }
::view-transition-new(.from-left)  { animation: 380ms from-left; }
::view-transition-old(.to-right)   { animation: 380ms to-right; }

@keyframes from-right { from { translate: 48px; opacity: 0; } }
```

- 같은 상태 변경이라도 **왜** 바뀌었는지(type)에 따라 다른 클래스 선택
  - `next`: 새 사진 `from-right` + 이전 사진 `to-left` / `prev`: `from-left` + `to-right` (keyframes는 방향만 다름)

### 데모 4: Suspense

<!-- demo: /suspense -->

```tsx
<Suspense
  fallback={<ViewTransition exit="slide-down"><Skeleton /></ViewTransition>}
>
  <ViewTransition enter="slide-up">
    <QuoteCard promise={promise} />
  </ViewTransition>
</Suspense>
```

```css
::view-transition-old(.slide-down) { animation: 150ms slide-down; }
::view-transition-new(.slide-up)   { animation: 400ms 150ms both slide-up; }

@keyframes slide-down { to   { translate: 0 16px; opacity: 0; } }
@keyframes slide-up   { from { translate: 0 16px; opacity: 0; } }
```

- 순서: 스켈레톤이 먼저 150ms 동안 빠지고 → 내용이 이어서 400ms 동안 올라옴 (두 번째 `150ms`가 기다리는 시간)
- **새로 가능해진 것: fallback의 exit 애니메이션**
  - 이전: Suspense가 fallback을 직접 제거 → AnimatePresence로도 불가 ([motion#1193](https://github.com/framer/motion/issues/1193) wontfix)
  - 이제: 제거를 늦추는 대신 제거 전 화면을 스냅샷(`old`)으로 찍어 두고 그 이미지에 애니메이션을 적용

### 주의할 점

- 미지원 브라우저: 애니메이션 없이 즉시 반영 (기능은 정상, Chromium 125+ / 최신 Safari·Firefox)
- **`prefers-reduced-motion`을 React가 처리해 주지 않음** → CSS에서 직접 끄기
- 전환 중에는 `::view-transition` 오버레이가 클릭을 가로챔 → `pointer-events: none` 권장
- 이름 붙인 `<ViewTransition>`은 관계없는 전환에도 애니메이션이 적용됨 → `default="none"`으로 막기
- enter/exit은 **마운트·언마운트될 때만** 동작 → 조건부 렌더링이나 `key`와 함께 사용

## 2. use(browser())

### 문제: 브라우저에서만 알 수 있는 값

<!-- demo: /browser/naive -->

- 창 너비, `navigator.language`, 타임존, `localStorage`…
- 서버와 브라우저가 다른 값을 그리면 **hydration 에러** (React #418)

```tsx
// ❌ 서버는 "알 수 없음", 브라우저는 실제 너비
const width = typeof window === "undefined" ? "알 수 없음" : window.innerWidth;
```

### 이전 방식 vs 19.3 방식

<!-- demo: /browser -->

```tsx
// 이전: 컴포넌트마다 mounted 상태, 첫 렌더 → effect → 재렌더
function BrowserInfo() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Placeholder />;
  return <InfoTable info={readBrowserInfo()} />;
}
```

```tsx
// 19.3: 서버에서는 suspend, 브라우저에서는 그냥 렌더링
import { browser } from "react-dom";

function BrowserInfo() {
  use(browser());
  return <InfoTable info={readBrowserInfo()} />;
}

<Suspense fallback={<Placeholder />}>
  <BrowserInfo />
</Suspense>
```

- 클라이언트 전용 여부를 **쓰는 쪽(`dynamic` + `ssr: false`)이 아니라 컴포넌트 자신이** 결정 → 쓰는 쪽은 `<Suspense>`로 감싸기만
- 단, 렌더링만 막음 → import할 때 `window`를 쓰는 모듈이나 코드 분할은 여전히 `dynamic`

### 알아둘 점

- 서버 렌더링 중에는 반드시 `<Suspense>` 안에 있어야 함 (없으면 서버 렌더링 실패)
- Client Component에서만 호출 가능
- 에러가 아니라서 서버 로그에 recoverable error가 남지 않음 → 대신 `onBrowserBailout` 콜백으로 추적
- `use`는 조건문 안에서 부를 수 있음

```tsx
function useBrowserQuery(query, options) {
  if (options.initialData === undefined) {
    use(browser()); // 초기 데이터가 없을 때만 서버 렌더링을 건너뜀
  }
  return useQuery(query, options);
}
```

- 라이브러리 사례: FUNSTACK Router는 URL을 모르는 SSR에서 `<Outlet />`이 `use(browser())`를 호출해 hydration 불일치를 없앰

## 3. Fragment ref

<!-- demo: /fragment-ref -->

```tsx
function InView({ children, onChange }) {
  const ref = useRef<FragmentInstance>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(/* ... */);
    ref.current.observeUsing(observer);
    return () => ref.current.unobserveUsing(observer);
  }, []);

  return <Fragment ref={ref}>{children}</Fragment>;
}
```

- 이전: 관찰하려면 `<div ref>` 래퍼가 필요 → 레이아웃·시맨틱 깨짐 (`ul > div > li`)
- 이제: 래퍼 없이 **첫 단계 자식 DOM 노드**에 적용 (`ul > li` 유지, 텍스트 노드 제외)
- `FragmentInstance`: `addEventListener`, `focus` / `focusLast` / `blur`, `observeUsing`, `getClientRects`, `scrollIntoView` …

## 4. Server Components에서 Context

```tsx
// 이전: Provider만을 위한 Client Component 파일
// providers.tsx
"use client";
export function UserProvider({ user, children }) {
  return <UserContext value={user}>{children}</UserContext>;
}

// layout.tsx (Server Component)
<UserProvider user={user}>{children}</UserProvider>
```

```tsx
// 19.3: layout.tsx (Server Component)에서 바로
<UserContext value={user}>{children}</UserContext>
```

- Provider만을 위한 `"use client"` 파일이 필요 없음
- 읽는 쪽은 여전히 Client Component (`use(UserContext)`)
- 값은 서버에서 클라이언트로 넘어가므로 직렬화 가능해야 함

## 5. 그 밖의 변경

- **Trusted Types**: Trusted Types 객체를 넘기면 React가 문자열로 바꾸지 않고 그대로 전달 → 브라우저가 XSS 정책으로 검증
- **Transition 독립 렌더링**: 느린 Transition이 다른 Transition을 막지 않음
- Strict Mode에서 hydration 중에도 Effect 두 번 실행
- `onFullscreenChange` / `onFullscreenError` 이벤트, SVG `maskType` 지원

## 6. 우리 프로젝트에서 써보려면

- Next.js App Router: **내장 React**(canary)를 씀 → 16.3.7에는 19.3이 들어 있어 설정 없이 사용
- Pages Router, Vite: `react@19.3.0` 설치

| 지금 이렇게 하고 있다면 | 19.3에서는 |
|---|---|
| 목록 추가·삭제, 로딩 → 내용 전환이 뚝 끊김 | `<ViewTransition>` 한 겹 + CSS (Suspense fallback exit도 가능) |
| `useEffect` + mounted, `dynamic(..., { ssr: false })` | 컴포넌트 안에서 `use(browser())` + `<Suspense>` |
| IntersectionObserver용 래퍼 `div` | Fragment ref (`observeUsing`) |
| Context만을 위한 `providers.tsx` | layout에서 `<Context value>` (읽기 전용 값일 때) |

- 단, import할 때 `window`를 쓰는 모듈이나 코드 분할은 여전히 `dynamic`

## Reference

- [React 19.3 – React Blog](https://react.dev/blog/2026/09/09/react-19-3)
- [browser – React](https://react.dev/reference/react-dom/browser)
- [Designing view transitions – Next.js](https://nextjs.org/docs/app/guides/view-transitions)
- [React ViewTransition vs. Motion – LogRocket](https://blog.logrocket.com/react-viewtransition-vs-motion-comparing-animation-approaches/)
- [Use Cases for the React 19.3 browser() API – uhyo](https://zenn.dev/uhyo/articles/react-use-browser-usage?locale=en)
- [Do you still need Framer Motion? – Motion](https://motion.dev/blog/do-you-still-need-framer-motion)
- [Unmount animations for Suspense Fallback component? – motion#1193](https://github.com/framer/motion/issues/1193)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) ([한국어](https://developer.mozilla.org/ko/docs/Web/API/View_Transition_API))
- [MDN: Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)
