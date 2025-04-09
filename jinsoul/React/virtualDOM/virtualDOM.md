## 1. JSX 처리하기

### 1-1. 조건부 렌더링(createVNode)

jsx를 VDOM으로 파싱하게 되면 대략 이런 모양이다.

```jsx
// JSX 코드
<div>
  {isLoggedIn && <span>환영합니다</span>}
  {count === 0 ? "없음" : count}
</div>

// 변환된 형태
createVNode(
  "div", // element
  null, // props
  isLoggedIn && createVNode("span", null, "환영합니다"),
  count === 0 ? "없음" : count //chidren
)
```

이 때 고려해야할 점은 다음과 같다.

```jsx
<div>
  {0}           // 렌더링 됨
  {null}        // 렌더링 안됨
  {undefined}   // 렌더링 안됨
  {false}       // 렌더링 안됨
  {'text'}      // 렌더링 됨
  {42}          // 렌더링 됨
</div>
```

createVDOM에서는 렌더링 할 수 없는 값을 고려하여 truthy한 값만 필터해야하므로 **falsy값으로 취급되는 0과 boolean 값이 true인 값**만 필터링 한다.

### 1-2. 평탄화

```jsx
// 1. 일반적인 JSX 구조 - flat이 필요없는 경우
<div>
  <h1>제목</h1>
  <p>내용</p>
</div>

// 2. map으로 생성되는 경우 - flat이 필요한 경우
const items = ['항목1', '항목2', '항목3'];

<ul>
  {items.map(item => [
    <li key={item}>{item}</li>,
    <li key={`divider-${item}`}>구분선</li>
  ])}
</ul>

// map 실행 후 children 배열 (flat 전)
[
  [
    { type: 'li', props: {...}, children: ['항목1'] },
    { type: 'li', props: {...}, children: ['구분선'] }
  ],
  [
    { type: 'li', props: {...}, children: ['항목2'] },
    { type: 'li', props: {...}, children: ['구분선'] }
  ],
  [
    { type: 'li', props: {...}, children: ['항목3'] },
    { type: 'li', props: {...}, children: ['구분선'] }
  ]
]

// flat 후
[
  { type: 'li', props: {...}, children: ['항목1'] },
  { type: 'li', props: {...}, children: ['구분선'] },
  { type: 'li', props: {...}, children: ['항목2'] },
  { type: 'li', props: {...}, children: ['구분선'] },
  { type: 'li', props: {...}, children: ['항목3'] }, 
  { type: 'li', props: {...}, children: ['구분선'] }
]

```

동적으로 생성되는 중첩 배열 구조를 `flat()` 메서드를 통해 단일 레벨로 평탄화해야한다. 평탄화를 하지 않는다면 중첩 배열들을 재귀하며 하나씩 처리해야하는 로직이 또 필요하기 때문에 DOM을 업데이트 할 때도, 비교 알고리즘을 적용 할 때도 복잡도가 늘어난다.

### 1-3. 정규화(normalizeVNode)

`createVNode` 로 한번 평탄화와 필터링을 거쳤는데 왜 정규화 과정이 필요한것인가 생각이 들었다. 정규화 과정에서 렌더링이 되면 안되는 값을 정리하고 문자열이나 숫자를 일관된 형식으로 변환하는 과정도 중요하지만 함수인 경우에는 컴포넌트 함수이기 때문에 해당 값 또한 정규화 처리를 해 주어야 한다. 그래서 `type`이 `function` 인 경우 정규화를 한번 더 거치도록 재귀를 통해 구현했다.

그런데 테스트 통과가 안되어서 output을 보았더니 다음과 같았다.

![](https://velog.velcdn.com/images/jinsoul75/post/c610565b-c8e6-4974-8106-f362aa89f13c/image.png)

리액트에서는 children을 두 가지 방식으로 전달한다.

1. props.children

```jsx
<Component children={<div>자식</div>} />
```

1. JSX 중첩

```jsx
<Component>
  <div>자식</div>
</Component>
```

이 두방식을 모두 지원해주어야 하는데 기존 코드는 첫번째 방식만 처리하고 있었다.

그래서 `vNode.children` 필드에 `vNode.children`이 존재하면 값을 할당하여 일관된 인터페이스를 가지도록 구현하였다.

```jsx
// 1. props로 전달하는 경우
<Component children={<div>내용</div>} />
// vNode = {
//   type: Component,
//   props: { children: <div>내용</div> },
//   children: []
// }

// 2. JSX 중첩으로 전달하는 경우
<Component>
  <div>내용</div>
</Component>
// vNode = {
//   type: Component,
//   props: {},
//   children: [<div>내용</div>]
// }

// 두 경우 모두 최종적으로:
props = {
  children: [<div>내용</div>]
}
```

그런데 기존에 `props.children` 에 값이 있으면 `vNode.chilren` 값이 덮어 쓸 수 있으므로 `props.children` 값이 없고 `vNode.chilren` 이 있을때만 할당하도록 분기처리를 해주었다.

```jsx
if (!props.children && vNode.children && vNode.children.length > 0) {
  props.children = vNode.children;
}
```

여기까지 작성하고 나니 문득 `props.children`과`vNode.chilren` 값이 모두 있으면 어떻게 되는건가 생각이 들었다.

실제 리액트에서는 다음과 같이 동작했다.

```jsx
function TestComponent(props) {
  console.log("전달받은 props:", props);
  return (
    <div style={{ border: "2px solid blue", margin: "10px", padding: "10px" }}>
      <h3>렌더링된 children:</h3>
      {props.children}
    </div>
  );
}

export function App(props) {
  return (
    <div>
      <h2>React Children 테스트</h2>
      <TestComponent children={<span>props로 전달된 children</span>}>
        <div>JSX 중첩으로 전달된 children</div>
      </TestComponent>
    </div>
  );
}

```

![](https://velog.velcdn.com/images/jinsoul75/post/434b8f95-9e48-4dd7-bf91-751d397130f4/image.png)

리액트에서는 JSX중첩으로 전달된 `Children`이 우선된다. `Children`이 우선이 되어야 JSX의 주요 목적인 "선언적 UI구현"에 더 적합하고 컴포넌트 계층 구조를 시각적으로 더 잘 표현하기 때문이다.

따라서 코드는 리액트와 같은 동작을 하기 위해 아래와 같이 변경이 필요하다.

```jsx
    if (vNode.children && vNode.children.length > 0) {
      props.children = vNode.children;
    }
```

## 2. 업데이트

oldNode와 newNode 두 가상 DOM을 비교하여 변경사항을 실제 DOM에 반영할 때, JavaScript 객체로 표현된 두 DOM 트리를 비교한다. 이때 **DOM 요소의 타입이 같다면 요소 자체는 재사용**하고, **변경된 props만 업데이트**하며 **나머지 속성은 그대로 유지**한다. 이러한 방식으로 실제 DOM 조작을 최소화하여 성능을 최적화한다.

### 2-1. 새로운 속성 처리(updateAttributes)

```jsx
<div className="old" onClick={handleClick} />

// {
//   type: 'div',
//   props: {
//     className: 'old',
//     onClick: handleClick
//   },
//   children: []
// }

// ↓ 변경
<div className="new" onClick={newHandler} />

// {
//   type: 'div',
//   props: {
//     className: 'new',
//     onClick: newHandler
//   },
//   children: []
// }

// 처리되는 과정
- className: "old" → "class": "new" 변환 및 업데이트
- onClick: handleClick → newHandler 이벤트 핸들러 교체
```

### 2-2. 이전 속성 제거

```jsx
// 예시
<div id="test" className="old" />
// ↓ 변경
<div className="new" />

// 처리되는 과정
- id 속성이 새로운 props에 없으므로 제거
- className은 새 props에 있으므로 스킵
```

### 2-3. 이벤트 처리 최적화

```jsx
if (key.startsWith("on")) {
  // onClick -> click 으로 변환
  // 별도의 이벤트 매니저를 통한 처리
  return addEvent(target, key.replace("on", "").toLowerCase(), value);
}
```

### 2-4. diffing 알고리즘 간단 구현

리액트의 Diffing은 두 개의 트리를 비교하여 변경된 부분만 실제 DOM에 효율적으로 업데이트하는 알고리즘이다. 면접 준비할 때나 외우던 개념인데 실제로 구현할 일이 생길줄 몰랐다. ㅎㅎ

고려해야할 사항이 많아서 꽤 까다로웠다. 각 레벨에서 자식의 위치를 index로 추적하고 재귀적으로 자식요소들을 비교하고 트리구조를 유지하면서 변경사항을 적용했다.

크게는 이런 순서로 알고리즘을 구현했다.

> 엘리먼트 타입 비교 -> 속성 업데이트 -> 재귀적으로 자식 비교
> 

### 2-4-1. old 노드만 있는 경우 → removeChild

```jsx
// 이전 렌더링
<div>
  <p>첫 번째</p>
  <p>두 번째</p>  // oldNode
  <p>세 번째</p>
</div>

// 새로운 렌더링
<div>
  <p>첫 번째</p>
  {/* 두 번째 p 태그 삭제됨 - newNode가 없음 */}
  <p>세 번째</p>
</div>
```

### 2-4-2. new 노드만 있는 경우 → appendChild

```jsx
// 1. 이전 렌더링
<div>
  <p>첫 번째</p>
  {/* 여기에는 아무것도 없었음 (oldNode가 없음) */}
  <p>세 번째</p>
</div>

// 2. 새로운 렌더링
<div>
  <p>첫 번째</p>
  <p>새로 추가됨!</p>  // newNode만 존재
  <p>세 번째</p>
</div>
```

### 2-4-3. 같은 위치에 있는 노드의 타입이 변경된 경우 → replaceChild

이런 경우 노드를 재사용하지 않고 완전히 새로운 노드를 교체하고 모든 하위 트리도 새로 생성한다.

```jsx
// 1. 태그 타입이 변경된 경우
// 이전 렌더링
<div>
  <p>텍스트</p>  // oldNode.type = 'p'
</div>

// 새로운 렌더링
<div>
  <span>텍스트</span>  // newNode.type = 'span'
</div>

// 2. 컴포넌트 타입이 변경된 경우
// 이전 렌더링
<div>
  <Button>클릭</Button>  // oldNode.type = Button
</div>

// 새로운 렌더링
<div>
  <Link>클릭</Link>  // newNode.type = Link
</div>

// 3. 조건부 렌더링으로 인한 변경
{isError ?
  <ErrorMessage>에러발생</ErrorMessage>  // oldNode.type = ErrorMessage
  :
  <SuccessMessage>성공</SuccessMessage>  // newNode.type = SuccessMessage
}
```

### 2-4-4. old 노드와 new 노드의 타입이 같을 경우(2-1. 새로운 속성 처리(updateAttributes))

DOM 요소를 재사용하고 속성이 변경된 경우만 업데이트 해줌으로써 불필요한 DOM 조작을 최소화한다.

```jsx
// oldNode
<input  
  type="text"
  value="old"
  disabled={false}
/>

// newNode
<input
  type="text"
  value="new"
  disabled={true}
/>

// 처리: input 요소는 재사용, value와 disabled 속성만 업데이트
```

## 3. 리얼 DOM 만들기(createElement)

```jsx
{
  type: 'div',
  props: {
    className: 'container',
    onClick: () => alert('click')
  },
  children: ['Hello']
}

<div class="container">Hello</div>
```

가상DOM을 실제DOM으로 만들기 위해서 실제DOM에서 가상DOM으로 만드는 과정을 반대로 수행한다.
타입별로 분기처리를 해서 `createTextNode` 로 노드 타입이 `null`, `boolean`, `undefined` 일 경우 빈 텍스트 노드를 `number`, `string`일 경우  텍스트 노드를 만들어준다.

### 3-1. Document Fragment

하지만 타입이 `배열`일 경우 `DocumentFragment`를 생성하고 각 자식에 대해 createElement를 재귀 호출하여 추가한다.

```jsx
// JSX
<div>
  {[1, 2, 3].map(num => <span>{num}</span>)}
</div>

// vNode의 모습
vNode = [
  { type: 'span', props: {}, children: [1] },
  { type: 'span', props: {}, children: [2] },
  { type: 'span', props: {}, children: [3] }
]
```

- `DocumentFragment`는 메모리 상에만 존재하는 가벼운 DOM
- 실제 DOM 트리에 직접 연결 되지 않는 문서 객체
- 여러 요소를 한번에 DOM에 추가할 수 있어 리플로우와 리페인팅이 한 번만 실행

```jsx
// 1. DocumentFragment 없이 직접 DOM 조작
function withoutFragment() {
  const container = document.getElementById('container');
  [1, 2, 3].forEach(num => {
    const div = document.createElement('div');
    div.textContent = num;
    container.appendChild(div);  // 매번 DOM 업데이트 발생
  });
}
// -> 3번의 리플로우/리페인트 발생

// 2. DocumentFragment 사용
function withFragment() {
  const fragment = document.createDocumentFragment();
  [1, 2, 3].forEach(num => {
    const div = document.createElement('div');
    div.textContent = num;
    fragment.appendChild(div);   // 메모리상에서만 작업
  });
  container.appendChild(fragment);  // 한 번의 DOM 업데이트
}
// -> 1번의 리플로우/리페인트 발생
```

### 3-2. 속성 업데이트하기(updateAttributes)

리액트에서는 일반 html의 속성과의 충돌방지를 위해 카멜케이스를 사용한다. 따라서 속성 업데이트를 할 때 className 이나 onClick과 같은 속성들을 모두 변환해주어야 한다.

## 4. 이벤트 위임(setupEventListeners)

리액트는 이벤트 리스너를 각 엘리먼트에 직접 등록하지 않고 root 요소에 이벤트를 위임하는 방식을 사용한다.

![image.png](attachment:411d9e7d-ea0d-48ca-8413-4269d2a90f12:image.png)

### 4-1. SyntheticEvent

이때 네이티브 이벤트를 그대로 사용하지 않고 `SyntheticEvent` 래퍼 객체로 감싸서 처리한다. 이는 브라우저마다 다른 이벤트 동작을 일관되게 처리하기 위함이며, 리액트는 `SyntheticEvent`를 통해 모든 이벤트를 정규화하여 크로스 브라우징 이슈를 해결한다.

### 1. 이벤트 속성의 차이

- **`event.target` vs `event.srcElement`**:
    - 대부분의 현대 브라우저는 `event.target`을 사용하여 이벤트가 발생한 요소를 참조
    - 오래된 Internet Explorer(IE)에서는 `event.srcElement`를 사
    - `SyntheticEvent`는 항상 `event.target`을 제공하여, 브라우저 간의 차이를 추상화

### 2. 키보드 이벤트

- **`event.key`, `event.keyCode`, `event.charCode`**:
    - 키보드 이벤트에서 키 코드를 제공하는 속성들이 브라우저마다 다를 수 있음
    - `SyntheticEvent`는 `event.key`를 통해 일관된 키 값을 제공

### 3. 기본 동작 방지

- **`event.preventDefault()`**:
    - 오래된 IE에서는 `event.returnValue = false`를 사용
    - `SyntheticEvent`는 `event.preventDefault()`를 통해 일관된 방식으로 기본 동작을 방지

### 4. 이벤트 타입의 차이

- **마우스 휠 이벤트**:
    - `wheel`, `mousewheel`, `DOMMouseScroll` 등 다양한 이벤트 타입이 브라우저마다 다르게 지원
    - `SyntheticEvent`는 이러한 차이를 추상화하여, 일관된 이벤트 타입을 제공

### 4-2. 이벤트 버블링 활용

- `Map` 객체를 통해 `root` 요소에 이벤트 등록이 한번만 이루어지도록 이벤트 정보를 저장했다.
- `root` 요소에 이벤트 발생시 이벤트가 저장된 `Map` 객체를 순회하면서 이벤트 발생한 요소가 현재 대상 요소 내부에 있는지 확인 후 핸들러를 호출 시켰다.

## 5. 렌더링(renderElement)

앞서 작성한 함수들을 조합해서 실제 렌더링을 해야한다. 그렇다면 기존DOM을 어딘가에다가 저장을 해두고 새로 렌더링을 할때마다 비교하는 로직이 포함되어야 한다. 기존 DOM이 없는 초기 렌더링 일때도 고려를 해야한다. 이 과정 또한 `Map` 객체를 통해 관리를 해주었다.

그런데 코드리뷰를 하다보니 container에 oldNode 속성으로 기존 노드들을 저장해두는 방법을 사용하신 분들도 많았다.

container는 DOM 요소인데 속성값으로 저장해도 되는 방법이 맞는지 궁금했다. 이러한 방법은 다음과 같은 문제가 있다.

1. DOM 요소 오염
DOM 요소에 직접 데이터를 저장하는 방식은 UI 렌더링을 하는 DOM 요소만의 책임을 벗어난다.
2. 메모리 누수 가능성
`container` DOM 요소 제거시 `container.oldNode`는 자동으로 정리 되지 않을 수 있는 문제가 있다. Map 객체를 사용한다면 `delete()` 메소드로 명시적으로 삭제가 가능하다.

```jsx
const previousVNodeMap = new Map();

export function renderElement(vNode, container) {
  // 1. vNode 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 2. 이전 가상 DOM 가져오기
  const previousVNode = previousVNodeMap.get(container);

  // 3. DOM 업데이트 또는 생성
  if (previousVNode) {
    // 이전 가상 DOM이 있으면 업데이트
    updateElement(container, normalizedVNode, previousVNode);
  } else {
    // 첫 렌더링: 새 DOM 요소 생성 및 추가
    const $el = createElement(normalizedVNode);

    container.appendChild($el);
  }

  // 4. 현재 가상 DOM 저장
  previousVNodeMap.set(container, normalizedVNode);

  // 5. 이벤트 리스너 설정 - 선택자 문자열 사용
  setupEventListeners(container);
}
```