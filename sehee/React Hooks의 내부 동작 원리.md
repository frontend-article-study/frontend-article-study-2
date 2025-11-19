## 이 주제를 다루게 된 계기

회사에서 다음과 같은 패턴의 코드를 작성하고 있었다.

```jsx
const useSomething = (flag) => {
  if (flag) {
    return useSomethingWithFlag();
  } else {
    return useSomethingWithoutFlag();
  }
}

```

React 공식 문서에서는 "조건문이나 반복문 안에서 Hook을 호출하지 마세요"라고 명시하고 있지만, 사실 이 코드는 에러 없이 잘 동작했다.

if문 중 하나에만 훅이 있을 경우엔 리액트 쪽에서 명시적으로 에러를 터뜨려서 막아줬던 것 같은데 저렇게 쓰니 너무 잘 돌아가서 의문이었다. Hook의 개수가 맞춰져 있으면 조건문에서 써도 문제가 없는 걸까?

하는 의문이 생겼고 이 의문을 풀기 위해 React에서 훅이 동작하는 원리를 알아보았다.

## React에서 Hook이 동작하는 원리

React는 각 컴포넌트의 Hook들을 다음과 같은 원리로 실행한다.

1. 최초 마운트 시 모든 함수형 컴포넌트를 렌더링한다. 이 때 리액트에서 제공하는 훅(useState, useEffect, useCallback 등)을 만나면 이들을 **연결 리스트(Linked List)** 형태로 저장한다.
2. 각 훅은 마운트 시에 실행되는 순서대로 연결된다.
3. 업데이트(리렌더링) 시, 각 훅은 연결 리스트로 저장된 값을 사용한다.

이 때, 링크드 리스트에 저장되는 것은 훅 코드 자체가 아닌 훅의 **상태 데이터**이다.

연결 리스트에 저장되는 훅의 형태는 다음과 같은데,

```jsx
// ReactFiberHooks.js
export type Hook = {
  memoizedState: any,      // Hook의 현재 값
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null,       // 다음 Hook을 가리키는 포인터
};

```

이 때 `memoizedState`에 각 Hook 타입에 맞는 데이터가 저장된다.

각 Hook은 `next` 포인터를 통해 다음 Hook과 연결되어 있고, 이 연결 리스트는 각 컴포넌트마다 갖고 있는 Fiber 노드의 `memoizedState`에 저장된다.

## 각 Hook 이 저장하는 데이터 예시

### useState

```jsx
Hook {
  memoizedState: 0,        // 현재 state 값
  baseState: 0,            // 기본 state 값
  baseQueue: null,         // 처리 대기 업데이트
  queue: {
    pending: null,         // 대기 중인 업데이트
    lanes: NoLanes,        // 우선순위
    dispatch: setCount함수, // setState 함수
    lastRenderedReducer: basicStateReducer,  // 업데이트 처리 함수
    lastRenderedState: 0   // 💾 마지막 렌더링된 값
  },
  next: null
}
```

### useEffect

```jsx
Hook {
  memoizedState: {
    tag: HookFlags,           // Effect 타입(useEffect, useLayoutEffect, useInsertionEffect)
    inst: {                   // Effect 인스턴스
      destroy: Function       // Cleanup 함수
    },
    create: Function,         // Effect 함수 (매번 새로 생성)
    deps: Array,              // 의존성 배열 (이전 렌더링의 deps와 비교)
    next: Effect              // 다음 Effect
  },
  ...
}
```

리액트는 렌더링 처리 과정에서 이렇듯 Hook이 당시 갖고 있는 상태값들을 함수 컴포넌트의 Fiber에서 순서대로 읽어오며 식별한다.

# 예시

다음과 같은 컴포넌트를 예로 들어 보자.

```jsx
function MyComponent() {
  const [name, setName] = useState('John');     // Hook 1
  const [age, setAge] = useState(25);           // Hook 2
  const [city, setCity] = useState('Seoul');    // Hook 3
  return <div>{name} {age} {city}</div>;
}

```

첫 렌더링 시, `mountWorkInProgressHook()` 함수가 호출되며 Hook들이 순서대로 생성된다.

```jsx
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // 첫 번째 Hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 두 번째 이후 Hook: 링크드 리스트에 추가
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

```

결과적으로 MyComponent의 Fiber의 memoizedState에 Hook들의 상태값이 링크드 리스트로 저장된다.

```
Fiber.memoizedState → Hook1(name) → Hook2(age) → Hook3(city) → null
```

이후 만약 사용자의 클릭으로 setName(”Alice”)가 호출되면, 내부적으로 dispatchSetState()가 실행되며 Hook1의 queue에 업데이트가 추가된다.

```jsx
// setName = dispatchSetState.bind(null, MyComponentFiber, Hook1.queue)
// setName('Alice') 호출 시:

function dispatchSetState(fiber, queue, action) {
  // action = 'Alice'
  
  // 1. 업데이트 객체 생성
  const update = {
    lane: SyncLane,
    action: 'Alice',        // 새 값
    hasEagerState: false,
    eagerState: null,
    next: null
  };
  
  // 2. 큐에 추가 (순환 링크드 리스트)
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;   // 자기 자신
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;   // 대기 중!
  
  // 3. 리렌더링 스케줄링
  scheduleUpdateOnFiber(fiber, SyncLane);
}
```

```jsx
Hook1 {
  memoizedState: 'John',     // 아직 그대로
  queue: {
    pending: Update {        // 새로 추가됨
      action: 'Alice',
      next: 자기자신
    },
    dispatch: setName함수,
    ...
  },
  next: Hook2 → Hook3 → null
}
```

이후 스케줄링을 거쳐 컴포넌트가 다시 렌더링될 때, React는 저장된 Hook 리스트를 **순서대로** 순회하며 값을 처리한다.

이때 React는 Hook에 쌓여 있는 상태를 이름이나 변수로 구분하지 않고, 오직 **호출 순서**로만 식별한다.

```jsx
function MyComponent() {
  // === Hook 1: MyComponent의 첫번째 훅 호출 ===
  const [name, setName] = useState('John');
  
  // === Hook 2: MyComponent의 두번째 훅 호출 ===
  const [age, setAge] = useState(25);
  
  // === Hook 3: MyComponent의 세번째 훅 호출 ===
  const [city, setCity] = useState('Seoul');
  
  return <div>{name} {age} {city}</div>;
}
```

```jsx
=== Hook 순회 ===
┌─────────────────────────────────────┐
│ Hook 1: useState('John')            │
├─────────────────────────────────────┤
│ currentHook = null                  │
│ → Fiber.memoizedState 읽기          │
│ → Hook1 가져오기                    │
│ → queue.pending 확인                │
│ → Update { action: 'Alice' } 발견!  │
│ → basicStateReducer('John', 'Alice')│
│ → newState = 'Alice'                │
│ → hook.memoizedState = 'Alice' 💾   │
│ return ['Alice', setName]           │
└─────────────────────────────────────┘
        ↓
        currentHook = Hook1
        
┌─────────────────────────────────────┐
│ Hook 2: useState(25)                │
├─────────────────────────────────────┤
│ currentHook = Hook1                 │
│ → currentHook.next 읽기             │
│ → Hook2 가져오기                    │
│ → queue.pending 확인                │
│ → null (업데이트 없음)              │
│ → 이전 값 유지                      │
│ return [25, setAge]                 │
└─────────────────────────────────────┘
        ↓
        currentHook = Hook2
        
┌─────────────────────────────────────┐
│ Hook 3: useState('Seoul')           │
├─────────────────────────────────────┤
│ currentHook = Hook2                 │
│ → currentHook.next 읽기             │
│ → Hook3 가져오기                    │
│ → queue.pending 확인                │
│ → null (업데이트 없음)              │
│ → 이전 값 유지                      │
│ return ['Seoul', setCity]           │
└─────────────────────────────────────┘
        ↓
        currentHook = Hook3

=== 렌더링 완료 ===
finishRenderingHooks() {
  currentHook = null           ← 다시 리셋!
  workInProgressHook = null    ← 다시 리셋!
}

=== 최종 Fiber 상태 ===
Hook1(name='Alice') → Hook2(age=25) → Hook3(city='Seoul') → null
      ↑ 업데이트됨!
```

## 조건문에서 Hook을 쓰면 안 되는 이유

일반적으로 조건문에서 훅을 쓰면 안 되는 이유는, 훅 내부 값 매핑이 순서에만 의존하므로 조건 변경으로 훅의 순서가 바뀌었을 때 상태가 꼬일 가능성이 있기 때문임

ex)

https://stackblitz.com/edit/react-ts-ztvne7ck?file=App.tsx

## 왜 난 동작했을까?

문제의 코드 : 

```jsx
export const useGetIllustList = (projectId: number, imageType: IllustType) => {
  const { t } = useTranslation();
  if (imageType === AssetUrl.static) {
    return useGetStaticImageList({
      projectId,
      resourceType: ResourceType.illust,
      errorMessage: t('resource.message.illust.loadError'),
    });
  } else if (imageType === AssetUrl.live) {
    return useGetLiveResourceList({
      projectId,
      resourceType: LiveResourceType.live_illust,
      options: {
        enabled: imageType === AssetUrl.live,
      },
    });
  } else {
    return useGetSpineList({
      projectId,
      resourceType: ResourceType.illust,
      errorMessage: t('resource.message.illust.loadError'),
      options: {
        enabled: imageType === AssetUrl.spine,
      },
    });
  }
};
```

내가 사용한 커스텀 Hook은

- API만 다른 useQuery 래퍼 ⇒ 동일한 개수의 Hook을 사용하고 리턴 타입도 같음
- flag는 url 세그먼트에서 정해짐 ⇒ 한 페이지의 렌더링 사이클 내 flag가 바뀌지 않음

따라서 문제가 없었던 것으로 추정됨.

하지만 위험한 상태로 보여 리팩토링 예정..

# 올바른 방법

```jsx
function useSomething(flag) {
  // 모든 Hook을 최상위에서 호출
  const resultA = useSomethingWithFlag();
  const resultB = useSomethingWithoutFlag();

  // 조건문은 반환값에만 사용
  return flag ? resultA : resultB;
}

```

또는:

```jsx
function useSomething(flag) {
  const [data, setData] = useState(flag ? initialA : initialB);

  const action = useCallback(() => {
    if (flag) {
      // flag에 따른 로직
    } else {
      // 다른 로직
    }
  }, [flag]);

  return { data, action };
}

```

# 참고 자료

- React 공식 문서 - Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- React 소스 코드: https://github.com/facebook/react
    - `packages/react-reconciler/src/ReactFiberHooks.js`
    - `packages/react/src/ReactHooks.js`
