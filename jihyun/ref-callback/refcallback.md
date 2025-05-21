# Ref Callback

# Effect로 input에 focus 하기

```tsx
const ref = useRef(null)

useEffect(() => {
  ref.current?.focus()
}, [])

return <input ref={ref} ... />
```

- 위 코드는 대부분 ok
- useEffect 내부에서는 참조가 변하지 않는 ref 뿐이므로 의존성 배열은 비어있어도 됨

## 위 코드의 문제점?

- effect 콜백이 실행될 때, `ref.current`가 존재한다는 가정 하에 작성됐다는 점
- 만약 Input 컴포넌트의 렌더링이 지연됐거나 input이 조건부 노출되는 등의 상황이라면, effect가 실행될 때 ref는 null이기에 focus할 수 없음
- 즉, 실제로 원하는 동작은 input이 렌더링됐을 때가 아니라 상위 컴포넌트의 렌더에 묶여있음

# RefCallback

ref에는 함수도 전달할 수 있다.

```tsx
type Ref<T> = RefCallback<T> | RefObject<T> | null;
```

즉, RefCallback은 컴포넌트가 렌더링된 후에 호출되는 함수라고 볼 수 있는 것.

```tsx
// 1 - syntax sugar
ref={ref}

// 2
ref={(node) => { ref.current = node; }}
```

- 1과 2 두 문은 동일하다

## RefCallback으로 focus 하기

```tsx
<input ref={(node) => { node?.focus(); }} ... />
```

- ref에 전달한 함수는 input이 렌더링된 다음에 실행됨
- useEffect에서 호출하는 것과 다르게, input의 렌더링 주기에 결합되어 있음
- 주의할 점: ref의 실행 여부는 refCallback의 참조와 연관
  - 즉, 리렌더링이 발생할 때마다 실행됨
  - 메모가 필요하겠다!

## RefCallback을 사용할 땐 참조가 바뀌는 것을 주의

```tsx
const ref = useCallback((node) => { node?.focus(); }, [])

return <input ref={ref} ... />
```

- 컴포넌트가 렌더링된 다음 최초 1회 실행이 필요한 함수라면, ref의 참조가 바뀌지 않도록 주의해야 함

### RefCallback은 Memo 없이 못 쓴다?

- Memo의 목적은 불필요한 연산을 방지하는 것
- 즉, Memo 하지 않더라도 올바르게 동작해야 함
  - RefCallback을 Memo한 코드는 오히려 잘못 작성한 코드일 수 있음

```tsx
const ref = (node) => { node?.focus(); }

function Component() {
  return <input ref={ref} ... />
}
```

- Memo를 사용하지 않아도 1번만 실행될 수 있어야 함
- 따라서 더 나은 해결책은 RefCallback을 **컴포넌트 바깥에 두는 것**

### RefCallback을 컴포넌트 안에서 선언해야만 한다면?

```tsx
function MeasureExample() {
  const [height, setHeight] = React.useState(0);

  const measuredRef = React.useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <h1 ref={measuredRef}>Hello, world</h1>
      <h2>The above header is {Math.round(height)}px tall</h2>
    </>
  );
}
```

- node가 변경되지 않는 한, height는 항상 동일한 값 → setHeight를 호출하더라도 리렌더링을 스킵
- 이런 상황에서는 useCallback을 사용하는게 알맞음

```tsx
function MeasureExample() {
  const [rect, setRect] = React.useState({ height: 0 })

  const measuredRef = (node) => {
    if (node !== null) {
      // 🚨 여기서 무한 리-렌더링이 발생됩니다. ⬇️
      setRect(node.getBoundingClientRect())
    }
  })

  return (
    <>
      <h1 ref={measuredRef}>Hello, world</h1>
      <h2>The above header is {Math.round(rect.height)}px tall</h2>
    </>
  )
}
```

- setRect에 원시형을 저장하는 것이 아니라면, 무한 리렌더링이 발생함
- 정말 이렇게 구현해야만 한다면 useLayoutEffect를 고려할 것

### useCallback을 경계하려는 이유 - React Compiler

- useCallback은 언제 제거해도 코드 동작에 문제없어야 함
- React가 캐시를 폐기한다고 해서 앱이 동작하지 못한다면 잘못된 것

## Cleanup functions for refs

- React19부터 RefCallback에 cleanup 함수를 지원
- 이전에는 컴포넌트가 언마운트될 때, null로 ref 함수를 호출했음. 이제 RefCallback에서 cleanup을 리턴하면 null로 ref 함수 호출을 스킵함
  - 향후 버전에서는 null로 ref 호출하는 것을 더 이상 사용하지 않을 것

```tsx
-(<div ref={(current) => (instance = current)} />) +
(
  <div
    ref={(current) => {
      instance = current;
    }}
  />
);
```

- 리턴하는 것은 cleanup 함수로 보기 때문에 암시적 리턴 사용에 주의할 것

# RefCallback vs useEffect

- node에 접근해야 한다면 RefCallback
  - useRef + useEffect 보다 적은 양의 코드
  - 타겟 node의 렌더링과 연결되므로 더 명확한 의도ㅓ
- node가 필요 없는 side-effect라면 useEffect

---

### reference

- [https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs](https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs)
- [https://tkdodo.eu/blog/ref-callbacks-react-19-and-the-compiler](https://tkdodo.eu/blog/ref-callbacks-react-19-and-the-compiler)
- [https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)
