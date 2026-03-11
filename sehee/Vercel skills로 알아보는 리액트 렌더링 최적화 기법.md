Vercel에서 한달 전쯤에 공개해서 화제가 되었던 Agent-skills에서 렌더링 성능 관련 스킬들(react-best-practices/rendering-, react-best-practices/rerender-)을 까보면서 몰랐던 내용들을 클로드와 함께 정리해 보았다.

SSR에 국한된 내용(하이드레이션 최적화)이나 최신 React 명세와 관련된 내용(Activity, useTransition 등)은 생략했다.

## 긴 리스트에서 CSS content-visibility 적용하기(rendering-content-visibility)

화면 밖 렌더링을 지연시키기 위해 `content-visibility: auto`를 적용할 수 있다.

### 내용 설명

긴 리스트를 렌더링할 때, CSS의 `content-visibility: auto`를 적용하면 화면 밖(off-screen)에 있는 항목들의 레이아웃과 페인트를 브라우저가 자동으로 건너뛴다. `contain-intrinsic-size`로 예상 크기를 지정해두면 스크롤바 높이 계산도 정상적으로 동작한다.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**Example:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="overflow-y-auto h-screen">
      {messages.map(msg => (
        <div key={msg.id} className="message-item">
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

1000개 메시지 기준, 브라우저가 화면 밖 ~990개 항목을 건너뛰어 초기 렌더링이 약 10배 빨라진다.

### 원리 설명

`content-visibility: auto`는 CSS Containment 스펙의 일부로, 브라우저에게 "이 요소가 뷰포트에 보이지 않으면 내부 콘텐츠의 렌더링 작업(레이아웃·페인트)을 전부 생략해도 된다"고 알려주는 속성이다.

핵심은 브라우저의 렌더링 파이프라인 중 가장 비용이 큰 단계들을 통째로 스킵한다는 점이다. 브라우저가 HTML을 처리하는 흐름은 대략 이러한데 :

1. **Parse** — HTML을 파싱해서 DOM 트리를 만든다
2. **Style** — CSS를 적용해서 각 노드의 스타일을 계산한다
3. **Layout** — 각 요소의 위치와 크기를 계산한다 (reflow)
4. **Paint** — 픽셀을 실제로 그린다
5. **Composite** — 레이어를 합성해서 화면에 출력한다

`content-visibility: auto`  속성을 붙이면 뷰포트에 보이지 않는 요소의 3~5단계(Layout, Paint, Composite)를 생략한다. 즉 1~2단계(Parse, Style)는 그대로 실행되었으므로 DOM 자체는 존재하지만 렌더링 작업이 지연되므로, 가상화(virtualization) 라이브러리 없이도 비슷한 성능 이점을 얻을 수 있다.

`contain-intrinsic-size: 0 80px`은 렌더링이 생략된 요소의 "대체 크기"를 브라우저에 알려준다. 이게 없으면 렌더링 전 요소의 높이가 0으로 잡혀 스크롤바 높이가 뒤틀리고, 사용자가 스크롤할 때마다 레이아웃이 급격히 변하는 문제가 생긴다.

가상화(`react-window`, `@tanstack/virtual` 등)와 비교하면, 이 방식은 JS 로직 없이 CSS만으로 적용 가능하고 접근성(검색, Ctrl+F)도 유지된다는 장점이 있다. 다만 DOM 노드 자체는 전부 생성되므로, 수만 개 수준의 극단적 리스트에서는 여전히 가상화가 더 효과적이다.

## 명시적 조건부 렌더링 사용하기 (rendering-conditional-render)

JSX에서 `&&` 대신 삼항 연산자(`? :`)를 사용해 falsy 값(`0`, `NaN`)이 화면에 노출되는 버그를 방지한다.

### 내용 설명

**Incorrect (count가 0일 때 "0"이 렌더링됨):**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count && <span className="badge">{count}</span>}
    </div>
  )
}

// When count = 0, renders: <div>0</div>
// When count = 5, renders: <div><span class="badge">5</span></div>
```

**Correct (count가 0일 때 아무것도 렌더링하지 않음):**

```tsx
function Badge({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </div>
  )
}

// When count = 0, renders: <div></div>
// When count = 5, renders: <div><span class="badge">5</span></div>
```

### 원리 설명

JavaScript에서 `&&` 연산자는 왼쪽 피연산자가 falsy면 **왼쪽 값 자체를 반환**한다. `false && <span>` 은 `false`를 반환하지만, React는 `false`를 렌더링하지 않으므로 문제없다.

그런데 `0 && <span>`은 `0`을 반환하고, React는 `0`을 **유효한 렌더링 값으로 취급**해서 화면에 문자 "0"을 그대로 출력한다. `NaN`도 마찬가지다.

React가 렌더링하지 않는 값은 `null`, `undefined`, `false`, `true` 이 네 가지뿐이다. `0`과 `NaN`은 숫자이므로 텍스트 노드로 렌더링된다.

따라서 조건 값이 숫자일 가능성이 있으면 `&&` 대신 명시적으로 boolean을 만들어주는 게 안전하다. `count > 0 ? ... : null` 처럼 삼항 연산자를 쓰거나, `!!count && ...` 처럼 이중 부정으로 boolean 변환하거나, `Boolean(count) && ...` 를 쓰는 방법이 있다. 조건이 이미 boolean 타입임이 확실한 경우(예: `isLoggedIn && <Dashboard />`)에는 `&&`를 써도 안전하다.

## 정적 JSX 요소 끌어올리기 (rendering-hoist-jsx)

props나 state에 의존하지 않는 정적 JSX를 컴포넌트 바깥으로 추출해 매 렌더링마다 재생성되는 것을 방지한다.

### 내용 설명

**Incorrect (매 렌더링마다 요소를 재생성):**

```tsx
function LoadingSkeleton() {
  return <div className="animate-pulse h-20 bg-gray-200" />
}

function Container() {
  return (
    <div>
      {loading && <LoadingSkeleton />}
    </div>
  )
}
```

**Correct (동일한 요소를 재사용):**

```tsx
const loadingSkeleton = (
  <div className="animate-pulse h-20 bg-gray-200" />
)

function Container() {
  return (
    <div>
      {loading && loadingSkeleton}
    </div>
  )
}
```

특히 복잡한 정적 SVG 노드에서 효과가 크다. React Compiler가 활성화된 프로젝트라면 이 최적화를 컴파일러가 자동으로 수행하므로 수동 호이스팅이 불필요하다.

### 원리 설명

JSX는 결국 `React.createElement()` 호출로 변환된다. `<div className="animate-pulse" />`는 매번 `{ type: 'div', props: { className: 'animate-pulse' }, ... }` 같은 새로운 객체를 생성한다는 뜻이다. 컴포넌트 안에 있으면 렌더링될 때마다 이 객체가 새로 만들어진다.

이걸 컴포넌트 바깥 모듈 스코프에 선언하면, 모듈이 로드될 때 딱 한 번만 객체가 생성되고 이후 렌더링에서는 동일한 참조를 재사용한다. React의 reconciliation(재조정) 과정에서 이전 렌더링과 새 렌더링의 요소를 비교할 때, 참조가 같으면 해당 서브트리의 diffing을 완전히 건너뛸 수 있다. 즉 객체 생성 비용 절약 + diff 비용 절약 두 가지 이점이 있다.

단순한 `<div>` 하나에서는 체감하기 어렵지만, path가 수십 개인 SVG 아이콘이나 깊게 중첩된 정적 마크업의 경우 매 렌더링마다 수백 개의 createElement 호출과 그에 따른 diff 비교가 발생하므로 효과가 눈에 띈다.

주의할 점은, 이 패턴은 요소가 **완전히 정적**일 때만 적용해야 한다는 것이다. props, state, context 등 어떤 동적 값에도 의존하지 않아야 한다. 동적 값을 참조하는 요소를 바깥으로 빼면 값이 변해도 반영되지 않는 버그가 생긴다.

## SVG 좌표 정밀도 최적화 (rendering-svg-precision)

SVG 좌표의 소수점 자릿수를 줄여 파일 크기를 감소시킨다.

### 내용 설명

**Incorrect (과도한 정밀도):**

```
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />
```

**Correct (소수점 1자리):**

```
<path d="M 10.3 20.8 L 30.9 40.2" />
```

**SVGO로 자동화:**

```bash
npx svgo --precision=1 --multipass icon.svg
```

적절한 정밀도는 viewBox 크기에 따라 다르지만, 대부분의 경우 줄이는 것이 이득이다.

### 원리 설명

디자인 툴(Figma, Illustrator 등)에서 SVG를 내보내면 좌표가 소수점 6자리 이상으로 찍히는 경우가 흔하다. 하지만 실제로 브라우저 화면의 1px 이하 차이는 사람 눈에 구분되지 않는다. viewBox가 `0 0 24 24`인 아이콘이라면 소수점 1자리(0.1 단위)로도 충분하고, `0 0 1000 1000` 같은 큰 뷰박스에서는 정수만으로도 괜찮을 수 있다.

파일 크기 관점에서 보면, path의 `d` 속성(도형의 실제 경로를 정의하는 명령어 문자열)은 SVG 파일에서 가장 큰 비중을 차지하는 부분이다. 좌표 하나당 불필요한 소수점 5~6자리를 제거하면, path가 복잡한 아이콘에서는 파일 크기가 수십 퍼센트 줄어들 수 있다. 이건 네트워크 전송량뿐 아니라 브라우저의 SVG 파싱 시간에도 영향을 준다. 문자열이 짧을수록 파싱이 빠르고, 좌표 수가 줄어들면 렌더링 시 계산할 포인트도 줄어든다.

SVGO의 `--multipass` 옵션은 최적화를 여러 번 반복 적용한다. 한 번의 최적화로 생긴 변화가 다른 최적화의 기회를 열어주는 경우가 있기 때문이다. 프로젝트에 SVG 아이콘이 많다면 빌드 파이프라인에 SVGO를 통합해두는 것이 좋다.

## 상태 읽기를 사용 시점으로 미루기 (rerender-defer-reads)

콜백 안에서만 읽는 동적 상태는 훅으로 구독하지 말고, 실제 사용 시점에 직접 읽어서 불필요한 리렌더링을 방지한다.

### 내용 설명

**Incorrect (모든 searchParams 변경에 구독됨):**

```tsx
function Sh areButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

**Correct (필요할 때 직접 읽고, 구독하지 않음):**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

### 원리 설명

`useSearchParams` 같은 훅은 호출하는 순간 해당 컴포넌트를 그 상태의 **구독자**로 등록한다. searchParams가 변경될 때마다 이 컴포넌트는 리렌더링된다. 그런데 위 예시에서 `ref` 값은 버튼을 클릭할 때만 필요하고, 렌더링 출력에는 아무 영향이 없다. 화면에 그리는 건 항상 똑같은 `<button>Share</button>`인데, URL 쿼리가 바뀔 때마다 쓸데없이 리렌더링이 발생하는 것이다.

이런 경우 훅 대신 `window.location.search`를 콜백 안에서 직접 읽으면 구독 자체가 사라진다. 값이 필요한 시점(클릭 이벤트)에 그때의 최신 값을 가져오므로 정확성도 동일하다.

이 원칙은 searchParams에만 한정되지 않는다. localStorage, sessionStorage, URL hash 등 **렌더링 출력에 영향을 주지 않는 외부 상태**를 훅이나 상태 관리 라이브러리로 구독하고 있다면 같은 패턴이 적용된다. 핵심 질문은 "이 값이 화면에 보이는 것을 바꾸는가?"이다. 답이 아니오라면 구독할 이유가 없다.

반대로, 값이 렌더링 결과에 영향을 준다면(예: searchParams에 따라 다른 UI를 보여줘야 하는 경우) 당연히 훅으로 구독해야 한다. 이 최적화는 "콜백에서만 쓰이는 값"에 한정된다.

## Effect 의존성 좁히기 (rerender-dependencies)

useEffect의 의존성 배열에 객체 대신 원시값을 지정한다.

### 내용 설명

**Incorrect (user의 어떤 필드든 바뀌면 재실행):**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**Correct (id가 바뀔 때만 재실행):**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

### 원리 설명

React는 의존성 배열의 값을 이전 렌더링과 비교할 때 `Object.is()`를 사용한다. 원시값(string, number, boolean)은 값 자체가 같으면 동일하다고 판단하지만, 객체는 **참조 비교**를 한다. 매 렌더링마다 `user` 객체가 새로 생성되면(상위에서 `{ ...user }` 스프레드를 하거나, API 응답을 새로 세팅하거나) 내용이 같아도 참조가 달라져서 effect가 매번 재실행된다.

`[user]` 대신 `[user.id]`를 쓰면 비교 대상이 원시값(string이나 number)이 되므로, 실제로 id가 변할 때만 effect가 돈다.

## 파생된 상태를 구독하기 (rerender-derived-state)

연속적으로 변하는 값 대신 파생된 boolean 상태를 구독해서 리렌더링 빈도를 줄인다.

### 내용 설명

**Incorrect (픽셀 변화마다 리렌더링):**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // 지속적으로 업데이트
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

**Correct (boolean이 전환될 때만 리렌더링):**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

### 원리 설명

`useWindowWidth()`는 보통 내부적으로 `resize` 이벤트를 리스닝하면서 `setState(window.innerWidth)`를 호출한다. 사용자가 브라우저 창을 드래그해서 리사이즈하면 1초에 수십 번씩 이벤트가 발생하고, 1024→1023→1022→...→768→767 이런 식으로 매 픽셀마다 state가 바뀌어 리렌더링이 일어난다. 하지만 이 컴포넌트가 실제로 관심 있는 건 "모바일이냐 아니냐"라는 두 가지 상태뿐이다.

`useMediaQuery`는 브라우저의 `window.matchMedia` API를 사용한다. 이 API는 CSS 미디어 쿼리의 매칭 결과가 **전환될 때만** 콜백을 호출한다. 즉 768→767로 넘어가는 경계 순간에만 이벤트가 발생하고, 767→766→765 같은 변화에는 반응하지 않는다.

이 파생된 상태를 구독하는 기법은 hook뿐 아니라 effect에도 적용할 수 있다.

**effect에서 파생 상태 구독하기:**

```tsx
// Incorrect: width=767, 766, 765... 매번 실행
useEffect(() => {
  if (width < 768) {
    enableMobileMode()
  }
}, [width])

// Correct: boolean이 전환될 때만 실행
const isMobile = width < 768
useEffect(() => {
  if (isMobile) {
    enableMobileMode()
  }
}, [isMobile])
```

이 사고방식의 핵심은 "이 로직이 **진짜** 반응해야 하는 변화가 무엇인가"를 먼저 파악하고, 그 변화값만 정확히 구독하도록 만드는 것이다.

## 지연 State 초기화 사용하기 (rerender-lazy-state-init)

비용이 큰 초기값을 `useState`에 넣을 때는 값을 직접 전달하지 말고 함수로 감싸서 초기 렌더링에서만 실행되게 한다.

### 내용 설명

**Incorrect (매 렌더링마다 실행):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()가 매 렌더링마다 실행됨
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')

  // query가 바뀔 때도 buildSearchIndex가 불필요하게 실행됨
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse가 매 렌더링마다 실행됨
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('settings') || '{}')
  )

  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

**Correct (초기 렌더링에서만 실행):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex()가 초기 렌더링에서만 실행됨
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')

  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse가 초기 렌더링에서만 실행됨
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })

  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

지연 초기화가 필요한 경우: localStorage/sessionStorage 읽기, 데이터 구조(인덱스, Map) 구축, DOM 읽기, 무거운 변환 작업.

불필요한 경우: 단순 원시값(`useState(0)`), props 직접 참조(`useState(props.value)`), 가벼운 리터럴(`useState({})`).

### 원리 설명

`useState` 에 초기값을 전달할 때, 해당 값은 함수 컴포넌트가 호출될 때마다(즉 매 렌더링마다) 계산되고 첫 번째 렌더에만 그 값을 사용하는 식으로 동작한다. 즉 `useState(buildSearchIndex(items))` 라고 쓰면, `buildSearchIndex(items)`가 매 렌더링마다 실행된 뒤 그 결과가 `useState`에 전달되고, React는 초기 렌더링이 아닐 경우 이 값을 무시하는 식이다. 즉 함수 호출 자체는 항상 일어나게 된다.

대신 `useState(() => buildSearchIndex(items))`로 함수를 전달하면, React는 매 렌더링에서 이 함수 객체만 만들고 초기 렌더링에서만 호출한다. 함수 객체 자체를 만드는 비용은 무시할 수 있을 만큼 작으므로, 비싼 계산을 효과적으로 1회로 제한할 수 있다.

이건 사실 JavaScript의 **eager evaluation**(즉시 평가) 특성 때문에 생기는 문제다.

```tsx
function greet(name) {
  console.log("Hello, " + name)
}

greet(getNameFromDB())
/**
JavaScript 엔진은 greet()가 호출되기 전에 먼저 괄호 안(getNameFromDB())을 계산함
=> JS 언어의 실행 규칙. 대부분의 프로그래밍 언어가 이렇게 동작함
**/
```

함수 인자는 함수가 호출되기 전에 항상 평가되므로, 평가를 지연시키려면 함수로 한 번 감싸는 수밖에 없다. React의 `useState`가 이 패턴을 공식 지원하는 것이고, 같은 이유로 `useMemo(() => ...)`, `useEffect(() => ...)`도 모두 함수를 받는다.

## 메모이제이션된 컴포넌트의 기본 비원시값을 상수로 추출하기 (rerender-memo-with-default-value)

`memo()`로 감싼 컴포넌트에서 비원시 타입(배열, 객체, 함수)의 기본값을 인라인으로 선언하면 메모이제이션이 깨지므로, 모듈 스코프의 상수로 추출한다.

### 내용 설명

**Incorrect (리렌더링마다 `onClick`이 다른 참조를 가짐):**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) {
  // ...
})

// onClick 없이 사용
<UserAvatar />
```

**Correct (안정적인 기본값):**

```tsx
const NOOP = () => {};

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) {
  // ...
})

// onClick 없이 사용
<UserAvatar />
```

### 원리 설명

`memo()`는 이전 props와 새 props를 `Object.is()`로 하나씩 비교해서, 전부 같으면 리렌더링을 건너뛴다. 그런데 `<UserAvatar />`처럼 `onClick`을 안 넘기면 `onClick`은 `undefined`가 되고, 컴포넌트 안에서 `onClick = () => {}`라는 기본값이 적용된다.

문제는 이 기본값 `() => {}`가 **컴포넌트 함수가 실행될 때마다 새로 생성**된다는 점이다. 바로 직전 스킬에서 다뤘던 것과 같은 원리인데, 기본값 표현식도 함수가 호출될 때 매번 평가된다. 매 렌더링마다 새로운 함수 객체가 만들어지고, `Object.is(이전 () => {}, 새 () => {})`는 참조가 다르니까 `false`를 반환한다. `memo()`는 props가 바뀌었다고 판단하고 리렌더링을 진행한다. 결과적으로 `memo()`를 감싼 의미가 없어진다.

`const NOOP = () => {}`를 모듈 스코프에 선언하면, 모듈 로드 시 딱 한 번만 함수가 생성되고 이후로는 항상 같은 참조다. 매 렌더링에서 `onClick`의 기본값이 동일한 참조이므로 `memo()`의 비교가 정상적으로 작동한다.

이건 함수뿐 아니라 배열(`= []`)이나 객체(`= {}`)도 마찬가지다. 인라인으로 쓰면 매번 새 참조가 생기니까, `const EMPTY_ARRAY = []`, `const DEFAULT_CONFIG = {}` 같은 식으로 상수를 빼둬야 한다. 앞서 다뤘던 "정적 JSX 요소 끌어올리기"와도 같은 맥락이다. 변하지 않는 값은 컴포넌트 바깥으로 빼서 참조를 안정시키는 것이 핵심이다.

## 메모이제이션된 컴포넌트로 추출하기 (rerender-memo)

비용이 큰 계산을 별도의 메모이제이션된 컴포넌트로 분리해서, 불필요한 상황에서는 계산 자체를 건너뛸 수 있게 한다.

### 내용 설명

**Incorrect (loading 중에도 avatar를 계산):**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**Correct (loading 중에는 계산을 건너뜀):**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

React Compiler가 활성화된 프로젝트라면 `memo()`와 `useMemo()`를 수동으로 쓸 필요 없이 컴파일러가 자동 최적화한다.

### 원리 설명

Incorrect 코드의 문제는 `useMemo`의 위치에 있다. React의 훅 규칙상, 훅은 조건문이나 early return **이전에** 호출되어야 한다. 그래서 `useMemo`가 `if (loading) return <Skeleton />` 보다 위에 있을 수밖에 없고, `loading`이 `true`여서 결과를 쓰지 않을 때도 `computeAvatarId`의 메모이제이션 로직이 매번 실행된다. 실제 계산이 캐시에서 나오더라도 의존성 비교 비용은 발생하고, `user`가 바뀌었다면 비싼 계산도 그대로 수행된다.

Correct 코드는 비싼 계산을 `UserAvatar`라는 별도 컴포넌트로 분리한다. 이렇게 하면 `Profile` 컴포넌트에서 `loading`이 `true`일 때 early return으로 `<Skeleton />`을 반환하고, `<UserAvatar />`는 JSX 트리에 아예 포함되지 않는다. React는 렌더 트리에 없는 컴포넌트의 함수를 호출하지 않으므로, `computeAvatarId`도 `useMemo`도 전혀 실행되지 않는다.

여기에 `memo()`까지 감싸면 추가 이점이 생긴다. `loading`이 `false`인 상태에서 부모가 리렌더링되더라도, `user` 참조가 바뀌지 않았으면 `UserAvatar`의 리렌더링 자체가 스킵된다. "계산이 필요 없을 때 안 하기(early return)" + "props가 안 바뀌면 리렌더링 안 하기(memo)" 두 가지 최적화를 동시에 얻는 셈이다.

핵심 교훈은, `useMemo`로 계산 결과를 캐싱하는 것보다 **컴포넌트 분리로 계산 자체를 실행 경로에서 빼는 것**이 더 근본적인 최적화라는 점이다.

## 단순 원시값 표현식에 useMemo를 쓰지 않기 (rerender-simple-expression-in-memo)

연산자 몇 개로 끝나는 단순한 표현식이고 결과가 원시값(boolean, number, string)이면 `useMemo`로 감싸지 않는다. 메모이제이션 자체의 비용이 계산 비용보다 클 수 있다.

### 내용 설명

**Incorrect:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
  // return some markup
}
```

**Correct:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // return some markup
}
```

### 원리 설명

`useMemo`는 공짜가 아니다. 매 렌더링마다 React가 하는 일을 보면:

1. 의존성 배열의 각 값을 이전 렌더링의 값과 `Object.is()`로 비교
2. 바뀌었으면 함수를 실행해서 새 값을 저장
3. 안 바뀌었으면 캐시된 값을 반환

위 예시에서 실제 계산은 `user.isLoading || notifications.isLoading`, 즉 boolean OR 연산 하나다. 이건 CPU 입장에서 거의 0에 가까운 비용이다. 반면 `useMemo`의 의존성 비교는 두 개의 `Object.is()` 호출 + 내부 훅 관리 오버헤드가 있다.

게다가 결과가 원시값이면 `useMemo`로 참조 안정성을 확보할 필요도 없다. `useMemo`를 쓰는 주된 이유 중 하나는 객체/배열을 `memo()`된 자식에게 넘길 때 참조를 유지하기 위해서인데, 원시값은 매번 새로 계산해도 값이 같으므로 굳이 메모이제이션하지 않아도 하위 컴포넌트의 props 비교에서 동일하다고 판단된다. `useMemo`가 진짜 필요한 건 결과가 객체나 배열처럼 **매번 새 참조가 만들어지는 경우**이거나, **계산 자체가 무거운 경우**(큰 배열 필터링, 정렬, 복잡한 데이터 변환 등)다.

정리하면, `useMemo`를 쓸지 말지의 기준은 두 가지다: "계산이 비싼가?" 그리고 "결과의 참조 안정성이 필요한가?" 둘 다 아니면 그냥 변수로 계산하는 게 낫다.

## 일시적 값에는 useRef 사용하기 (rerender-use-ref-transient-values)

자주 변하지만 화면을 다시 그릴 필요가 없는 값(마우스 좌표, 인터벌, 임시 플래그 등)은 `useState` 대신 `useRef`에 저장해서 불필요한 리렌더링을 피한다.

### 내용 설명

**Incorrect (업데이트마다 리렌더링):**

```tsx
function Tracker() {
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setLastX(e.clientX)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: lastX,
        width: 8,
        height: 8,
        background: 'black',
      }}
    />
  )
}
```

**Correct (리렌더링 없이 DOM 직접 업데이트):**

```tsx
function Tracker() {
  const lastXRef = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX
      const node = dotRef.current
      if (node) {
        node.style.transform = `translateX(${e.clientX}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        background: 'black',
        transform: 'translateX(0px)',
      }}
    />
  )
}
```

### 원리 설명

마우스를 움직이면 `mousemove` 이벤트가 초당 수십~수백 번 발생한다. Incorrect 코드에서는 매번 `setLastX`를 호출하니까 그때마다 React의 전체 렌더링 사이클이 돈다. 컴포넌트 함수 실행 → Virtual DOM 생성 → 이전 Virtual DOM과 diff → 변경된 부분 실제 DOM에 반영. 점 하나의 위치를 바꾸는 데 이 과정을 초당 수백 번 반복하는 건 엄청난 낭비다.

> React 18부터 automatic batching이 도입되어서 맞지 않는 설명이 아닌가 싶었는데, 배칭은 하나의 이벤트 핸들러 안에 여러 setState가 있을 때 이를 묶어서 처리할 뿐이고 별도의 이벤트 핸들러마다 호출되는 setState를 묶어주진 않는다. 즉 각각이 별도 렌더링을 유발한다.
> 

Correct 코드는 React의 렌더링 사이클을 완전히 우회한다. `useRef`의 `.current`를 바꿔도 React는 아무 반응을 하지 않는다. ref는 그냥 컴포넌트 생명주기 동안 유지되는 일반 JavaScript 객체일 뿐이다. 그리고 `dotRef.current.style.transform`으로 DOM을 직접 조작하면, React의 Virtual DOM diff 없이 브라우저가 바로 해당 요소의 스타일만 업데이트한다.

이 패턴은 사실 React의 선언적 모델에서 벗어나는 것이다. 보통 React에서는 "state를 바꾸면 React가 알아서 DOM을 업데이트한다"는 흐름을 따르는데, 여기서는 "React를 건너뛰고 DOM을 직접 건드린다"는 명령형 방식을 쓰고 있다. 그래서 이 패턴은 **화면 업데이트가 매우 빈번하면서, 업데이트 내용이 단순한 스타일 변경에 한정될 때**만 쓰는 게 좋다. 마우스 위치에 따라 조건부로 다른 컴포넌트를 보여주거나 복잡한 레이아웃이 바뀌어야 한다면, 그건 React의 state로 관리하는 게 맞다.

추가로 `transform: translateX()`를 사용한 것도 의도적이다. `left` 속성을 바꾸면 브라우저가 Layout부터 다시 계산하지만, `transform`은 Composite 단계에서만 처리되므로 GPU 가속을 받아 훨씬 빠르다.

## 출처

https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices/rules
