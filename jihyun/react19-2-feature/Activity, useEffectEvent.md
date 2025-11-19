# Activity, useEffectEvent

# Activity

- children의 내부 상태와 UI를 숨기거나 복원할 수 있게 함
  - e.g. 일부 컴포넌트를 숨기고자 할 때
    ```tsx
    <Activity mode={isShowingSidebar ? 'visible' : 'hidden'}>
      <Sidebar />
    </Activity>
    ```
- props은 mode=‘hidden’ | ‘visible’
  - visible이 기본값
- hidden 모드
  - Activity 컴포넌트의 children에 display: ‘none’을 주어 숨김
  - 자식 컴포넌트의 모든 Effect(예: `useEffect`)가 정리(cleanup)되고 언마운트됨
    - 불필요한 API 호출, 타이머, 이벤트 리스너 등이 백그라운드에서 실행되는 것을 방지하여 성능을 개선하고 자원을 절약하기 위함
  - hidden 상태에서 발생하는 업데이트(props 변경)는 낮은 우선순위 또는 지연됨
    - 다시 visible 될 때 반영됨

## Usage

### 1. 숨겨진 컴포넌트의 state를 복원하기

- 일반적인 조건부 렌더링
  ```tsx
  {
    isShowingSidebar && <Sidebar />;
  }
  ```
  - isShowingSidebar가 true → false로 변하면, Sidebar는 언마운트되며 내부 상태는 삭제됨
  - isShowingSidebar가 true → false → true로 변하면, Sidebar의 상태는 초기화
  - [https://codesandbox.io/p/sandbox/wk82fw?file=%2Fsrc%2FApp.js](https://codesandbox.io/p/sandbox/wk82fw?file=%2Fsrc%2FApp.js)
- Activity로 조건부 렌더링
  ```tsx
  <Activity mode={isShowingSidebar ? 'visible' : 'hidden'}>
    <Sidebar />
  </Activity>
  ```
  - isShowingSidebar가 true → false → true로 변하면, Sidebar의 상태는 **복원**됨
  - [https://codesandbox.io/p/sandbox/4qls6x?file=%2Fsrc%2FApp.js](https://codesandbox.io/p/sandbox/4qls6x?file=%2Fsrc%2FApp.js)

### 2. 숨겨진 컴포넌트의 DOM을 복원하기

- display: none으로 숨김 처리를 하기 때문에, children의 DOM은 숨김 상태일때도 보존됨
- 사용자가 다시 상호 작용할 가능성이 높은 UI 부분에서 임시 상태를 유지하는 데 유용
- 일반적인 조건부 렌더링
  ```tsx
  {
    activeTab === 'home' && <Home />;
  }
  {
    activeTab === 'contact' && <Contact />;
  }
  ```
  - activeTab이 변경되면 Home/Contact는 언마운트되거나 다시 마운트됨
  - [https://codesandbox.io/p/sandbox/94clhg?file=%2Fsrc%2FApp.js](https://codesandbox.io/p/sandbox/94clhg?file=%2Fsrc%2FApp.js)
- Activity로 조건부 렌더링
  ```tsx
  <Activity mode={activeTab === 'home' ? 'visible' : 'hidden'}>
    <Home />
  </Activity>
  <Activity mode={activeTab === 'contact' ? 'visible' : 'hidden'}>
  	<Contact />
  </Activity>
  ```
  - activeTab이 변경되면 Home/Contact는 display: none 처리되거나 해제
  - 각 탭 컴포넌트의 상태 보존 가능
  - [https://codesandbox.io/p/sandbox/fkfqjd?file=%2Fsrc%2FApp.js](https://codesandbox.io/p/sandbox/fkfqjd?file=%2Fsrc%2FApp.js)

### 3. 컨텐츠를 준비하기 (사전 렌더링)

- 처음 보는 컨텐츠를 준비하는 용도로도 사용 가능
  ```tsx
  <Activity mode="hidden">
    <SlowComponent />
  </Activity>
  ```
- 초기 렌더링 때 숨김 처리 → 페이지에 표시되진 않지만, 표시되는 컨텐츠보다 낮은 우선 순위 + effect는 마운트하지 않은 상태로 계속 렌더 중
- 코드와 데이터 미리 로드 가능
- https://codesandbox.io/p/sandbox/42xysf?file=%2Fsrc%2FApp.js
- https://codesandbox.io/p/sandbox/jwffrj?file=%2Fsrc%2FApp.js
- Note
  - Suspense 메커니즘을 지원하도록 설계된 페칭 방식만 작동
  - 왜냐? effect는 마운트되지 않으니까

# useEffectEvent

- non-reactive 로직을 (`effect event`라는 함수로) effect에서 분리할 수 있음
  - 디펜던시 어레이에 추가하지 않아도 됨
- 컴포넌트 최상위에서 useEffectEvent를 호출하여 `effect event`를 선언
  - `effect event`는 useEffect 콜백 내부에서 호출할 수 있는 함수임

```tsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  // ...
}
```

- `effect event` 콜백은 호출될 때 항상 최신 값에 접근함
  - 클로저로 인한 문제 방지
- useEffect 내부에서만 호출해야 하며, 값의 변화에 의존하지 않는 로직을 추출하는 데만 사용해야 함(디펜던시 어레이에 추가하지 않기 위한 용도가 아님)

## Usage

### props와 state의 최신값을 읽기

- effect 내부에서 reactive value를 읽고 싶다면, 그 value는 디펜던시 어레이에 추가되어야 함
  - 즉, effect는 value가 바뀌면 다시 실행됨
- 그러나 일부 케이스에서는 값이 바뀌었다고 해서 effect를 다시 실행하지 않고 그저 최신값을 읽기만 하고 싶을 수 있음

```tsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onNavigate = useEffectEvent((visitedUrl) => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onNavigate(url);
  }, [url]);

  // ...
}
```

- url이 변경될때마다 logVisit을 호출하고 싶은 케이스 (numberOfItems가 변경될 때마다 호출하고 싶은건 아님)
- reactive-value인 url은 디펜던시 배열에 넣고, logVisit 함수는 effect event 함수로 만들어 최신의 numberOfItems 값을 참조하도록 함
