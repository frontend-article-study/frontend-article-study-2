# **Improvements in React 19**

## **`ref` as a prop**

```jsx
() => {
  const [startDate, setStartDate] = useState(new Date());
  
  //before
  const CustomInput = forwardRef(
    ({ value, onClick, className }, ref) => (
      <button className={className} onClick={onClick} ref={ref}>
        {value}
      </button>
    ),
  );

   //after
  const CustomInput =({ value, onClick, className, ref }) => {
  return (
    <button className={className} onClick={onClick} ref={ref}>
      {value}
    </button>
  );
	}
  
  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      customInput={<CustomInput className="example-custom-input" />}
    />
  );
};
```

- `forwardRef` 를 사용하지 않아도 됩니다. 앞으로의 버전에서는 없어질 예정입니다.
- 함수형 컴포넌트가 상태를 직접적으로 변경하거나 DOM에 직접 접근하는 등의 부작용을 일으키지 않도록 하기 위해서 `forwardRef` 를 사용하기 시작했습니다.
- 19버전부터는 새로운 참조 프로퍼티를 사용하도록 컴포넌트를 자동으로 업데이트하는 코드모드를 게시할 예정입니다.

## **Diffs for hydration errors**

```
//Before
Warning: Text content did not match. Server: “Server” Client: “Client”
  at span
  at App
Warning: An error occurred during hydration. The server HTML was replaced 
with client content in <div>.
Warning: Text content did not match. Server: “Server” Client: “Client”
  at span
  at App
Warning: An error occurred during hydration. The server HTML was replaced 
with client content in <div>.
Uncaught Error: Text content does not match server-rendered HTML.
  at checkForUnmatchedText
  …
  
//After
 Uncaught Error: Hydration failed because the server rendered HTML didn’t match
  the client. As a result this tree will be regenerated on the client.
  This can happen if an SSR-ed Client Component used:

- A server/client branch if (typeof window !== 'undefined').
- Variable input such as Date.now() or Math.random() which changes each time it’s called.
- Date formatting in a user’s locale which doesn’t match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  <App>
    <span>
+    Client
-    Server

  at throwOnHydrationMismatch
  …
```

- 비교해보기
    1. 간결한 에러메세지:
        - "Warning: Text content did not match. Server: 'Server' Client: 'Client'"와 같은 경고 메시지가 반복적으로 출력
            
            ⇒ "Uncaught Error: Hydration failed because the server rendered HTML didn’t match the client"라는 명확한 요약 메시지로 시작
            
    2. **에러 내용**:
        - 같은 문제가 여러 번 발생해 비슷한 경고가 여러 번 출력
            
            ⇒  일반적인 원인을 나열
            
            - 브라우저 환경에 따라 달라지는 코드(`if (typeof window !== 'undefined')`).
            - 비결정적 값(`Date.now()`, `Math.random()`).
            - 사용자 위치에 따라 달라지는 날짜 형식.
            - 서버와 클라이언트 사이의 외부 데이터 불일치.
            - 잘못된 HTML 태그 구조.
    3. **에러의 위치 표시**:
        - 오류가 발생한 DOM 구조의 일부를 표시하지만, 분석을 위한 맥락이 부족
            
            ⇒ HTML Diff 시각화
            
            - "Server: 'Server'"와 "Client: 'Client'"의 차이를 명확히 보여줌
            - 문제가 되는 HTML의 특정 노드를 `+`와 `-`기호로 비교하여 제공
    4. **디버깅 안내**:
        - 에러 메시지가 어떤 조건에서 발생했는지나, 이를 해결하는 방법에 대한 정보가 부족
            
            ⇒ Hydration mismatch 관련 공식 문서에 대한 링크를 포함해 문제 해결에 도움
            

## **`<Context>` as a provider**

```jsx
import React, { createContext } from 'react';

const ThemeContext = createContext('');

//Before
function App({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}

//After
function App({ children }) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );
}
```

- `<Context.Provider>` 대신 `<Context>` 를 사용할 수 있습니다.
- 앞으로의 버전에서는 deprecate 될 예정입니다.

## **Cleanup functions for refs**

```jsx

//before
const inputRef = useRef(null);

  useEffect(() => {
    console.log('컴포넌트가 마운트되었습니다');

    return () => {
      // 컴포넌트가 언마운트될 때 실행
      console.log('컴포넌트가 언마운트되었습니다');
      inputRef.current = null; // 명시적으로 null 설정
    };
  }, []);

  return <input ref={inputRef} />;

//after
<input
  ref={(ref) => {
    return () => {
     inputRef.current = null; 
    };
  }}
/>
```

- `useEffect`의 클린업 함수처럼 컴포넌트가 unmount될 때 실행 할 수 있는 **ref callback** 클린업 **함수**
- 이전 버전에서는 unmount시 null로 ref 함수를 호출
- 만약 클린업 함수를 반환하는 경우 react는 이 단계를 건너뛰고 앞으로의 버전에서는 deprecate 될 예정
    - **DOM 참조 객체 정리**: 예를 들어, `focus`나 `eventListener`를 설정했을 때, 해당 요소가 unmount될 때 이를 정리할 수 있음
    - **Class Component의 ref 정리**: 클래스 컴포넌트에 대한 참조도 cleanup할 수 있음
- React의 리소스 관리 및 **메모리 누수 방지**에 도움

## **`useDeferredValue` initial value**

```jsx
function Search() {
  const [deferredValue, setDeferredValue] = useState('');
  const value = useDeferredValue(deferredValue, '');

  return (
    <div>
      <input
        type="text"
        value={deferredValue}
        onChange={(e) => setDeferredValue(e.target.value)}
        placeholder="검색어를 입력하세요"
      />
      <Results query={value} />
    </div>
  );
}
```

- 사용자가 입력하는 값이 변경되었을 때, 즉시 화면에 반영하는 대신 **변경된 값을 지연시키고 렌더링을 한 번에 처리**하는 훅
- 초기값을 설정함으로써 변경되지 않은 상태 대신 기본값을 사용할 수 있다.

## **Support for Document Metadata**

```jsx
function BlogPost({post}) {
  return (
    <article>
      <h1>{post.title}</h1>
      <title>{post.title}</title>
      <meta name="author" content="Josh" />
      <link rel="author" href="https://twitter.com/joshcstory/" />
      <meta name="keywords" content={post.keywords} />
      <p>
        Eee equals em-see-squared...
      </p>
    </article>
  );
}
```

- React가 특정 컴포넌트에서 `<title>`, `<meta>`, `<link>`와 같은 메타데이터 태그를 자동으로 `<head>`부분에 삽입
- 현재 라우트에 따라 메타데이터를 동적으로 변경하는 경우 등 복잡한 요구사항에서는 여전히 `react-helmet` 같은 라이브러리가 유용

## **Support for stylesheets**

```jsx
function ComponentOne() {
  return (
    <Suspense fallback="loading...">
      <link rel="stylesheet" href="foo" precedence="default" />
      <link rel="stylesheet" href="bar" precedence="high" />
      <article className="foo-class bar-class">
        {...}
      </article>
    </Suspense>
  );
}

function ComponentTwo() {
  return (
    <div>
      <p>{...}</p>
      <link rel="stylesheet" href="baz" precedence="default" />  {/* 이 스타일은 foo와 bar 사이에 삽입됨 */}
    </div>
  );
}
```

1. **스타일시트 우선순위 설정**:
    - 스타일시트에 우선순위를 설정할 수 있는 `precedence` 속성이 도입되어 스타일시트가 DOM에 삽입되는 순서를 관리할 수 있다.
    - 예를 들어, `precedence="high"`로 설정된 스타일시트는 기본 우선순위(`precedence="default"`)를 갖는 스타일시트보다 먼저 로드
2. **서버 사이드 렌더링(SSR)**:
    - 서버 사이드 렌더링시 `<head>`에 스타일시트를 포함시켜 브라우저가 스타일시트를 로드할 때까지 페이지를 그리지 않도록 한다.
    - 만약 스타일시트가 늦게 발견되면, React는 클라이언트에서 해당 스타일시트를 로드한 후, 의존하는 콘텐츠를 표시한다.
        
        ⇒ 콘텐츠가 렌더링되기 전에 필요한 스타일이 모두 로드되도록 보장
        
3. **클라이언트 사이드 렌더링(CSR)**:
    - 클라이언트에서는 새로 렌더링된 스타일시트를 로드하고, 이를 로드한 후에야 실제 렌더링이 이루어진다.
    - 동일한 스타일시트를 여러 번 렌더링하더라도 React는 스타일시트를 문서에 한 번만 포함

```jsx
function ComponentOne() {
  return (
    <div>
      <p>Component One</p>
      <link rel="stylesheet" href="styles.css" precedence="default" />
    </div>
  );
}

function ComponentTwo() {
  return (
    <div>
      <p>Component Two</p>
      <link rel="stylesheet" href="styles.css" precedence="default" />
    </div>
  );
}

function App() {
  return (
    <>
      <ComponentOne />
      <ComponentTwo />
    </>
  );
}
```

## **Support for preloading resources**

- ***초기 문서 로드* 시** 또는 ***클라이언트 측 업데이트 시*** 브라우저에 빨리 로드해야 할 리소스를 알려주면 페이지 성능에 큰 영향을 미칠 수 있다.
- React 19에는 브라우저 리소스 로드 및 사전 로딩을 위한 새로운 API가 다수 포함되어 있어 브라우저가 예상되는 리소스를 미리 로드하여 페이지 로딩 시간을 단축시키고, 클라이언트 측에서 더 빠른 업데이트 가능

```jsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom'
function MyComponent() {
  preinit('https://.../path/to/some/script.js', {as: 'script' }) 
  preload('https://.../path/to/font.woff', { as: 'font' })
  preload('https://.../path/to/stylesheet.css', { as: 'style' })
  // 폰트, 스타일시트, 스크립트와 같은 리소스를 미리 로드하여 필요할 때 빠르게 사용할 수 있도록 준비
  prefetchDNS('https://...')
  // 특정 호스트에 대한 DNS 조회를 미리 준비시켜서 리소스를 바로 요청하지 않아도, DNS 조회를 미리 해두어 빠른 로딩이 가능
  preconnect('https://...')
  // 리소스를 요청할 정확한 내용을 지정하지 않고, 미리 서버와의 연결을 설정해 두는 기능
}
```

## **Support for Custom Elements**

```jsx
class MyCustomElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // 이제 프로퍼티로 접근
    this.shadowRoot.innerHTML = `<p>Hello, ${this.data?.name || 'World'}!</p>`;
  }
}

customElements.define('my-custom-element', MyCustomElement);

function App() {
  return (
    <div>
      <my-custom-element data={{ name: 'React' }}></my-custom-element>
    </div>
  );
}
```

- 이전 버전에서는 React가 인식하지 못하는 `props`를 프로퍼티가 아닌 속성(attribute)으로 처리했기 때문에, Custom Elements를 React에서 사용할 때 불편했다.
    
    1. **서버 사이드 렌더링 (SSR)**:
    
    - 서버에서 렌더링할 때, `props`가 **원시 값**(string, number, true 등)일 경우, 해당 값들은 속성(attribute)으로 렌더링
    - **비원시 값**(객체, 함수, 심볼 등)일 경우, 해당 `props`는 **생략.** 이는 서버에서 불필요한 데이터를 렌더링하지 않도록 하기 위함
    
    2. **클라이언트 사이드 렌더링 (CSR)**:
    
    - 클라이언트에서 렌더링할 때, `props`가 Custom Element의 프로퍼티로 존재하면 해당 `props`는 프로퍼티로 할당 그렇지 않으면 **속성(**attribute**)**으로 처리

# 결론

- 리액트 19의 주요 업데이트 사항을 살펴보니 서버액션, SSR을 고려한 기능들이 많았다. 빠르게 로드되는 사용자 경험, SEO 등의 강점이 있는 SSR 방식이 확실히 트렌드로 자리잡고 있는것 같다.

# ref

https://react.dev/blog/2024/12/05/react-19#whats-new-in-react-19