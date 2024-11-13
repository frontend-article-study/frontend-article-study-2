# useMemo

> [React 공식 문서](https://react.dev/reference/react/useMemo)
> 

- `useMemo`는 리렌더링 간 연산 결과를 캐시할 수 있는 React Hook이다.

```jsx
const cachedValue = useMemo(calculateValue, dependencies)
```

- 첫 번째 인수 (`calculateValue`) : 캐시하고 싶은 값을 연산하는 함수
    - 순수 함수여야 한다.
    - 인수가 없어야 한다.
    - 모든 유형의 값을 반환할 수 있어야 한다.
- 두 번째 인수 (`dependencies`) : `calculateValue` 함수가 의존하는 값(들)의 리스트
    - 의존성 목록은 항목 수가 일정해야 하며 [dep1, dep2, dep3] 과 같이 인라인으로 작성돼야 한다.

# Returns

- 최초 렌더링 시에는 첫 번째 인수인 함수를 호출하고 반환된 값을 `useMemo`가 반환한다.
- 이후 렌더링에서는 `dependencies` 값이 **마지막 렌더링으로부터 바뀌지 않았다면 동일한 값을 반환**하고, 값이 바뀌었다면 `calculateValue`를 호출하여 **그 결과를 반환한 후 이후에 다시 쓰일 수 있도록 저장**한다.

💡 이와 같이 반환 값을 캐싱하는 것을 메모이제이션(memoization)이라고도 하며, 이 훅이 useMemo라고 불리는 이유기도 하다.

# Caveats

1. `useMemo`는 훅이기 때문에, 컴포넌트의 최상위나 customHook에서만 호출할 수 있다.
    
    → 반복문이나 조건문에서 호출할 수 없다.
    
2. Strict Mode에서는 calculation funciton을 두 번 호출한다.
3. React는 특별한 이유가 없는 한 캐시된 값을 버리지 않는다.

# Usage

## 1. 비용이 많이 드는 계산 건너뛰기

```jsx
function TodoList({ todos, tab, theme }) {
  const visibleTodos = filterTodos(todos, tab);
  // ...
}
```

- TodoList 컴포넌트가 자신의 state를 업데이트하거나, 부모로부터 새로운 props를 받으면 filterTodos는 재실행된다.
- 일반적으로는 대부분의 연산은 매우 빠르기 때문에 문제가 되지 않지만 아주 큰 배열을 필터링하거나 비용이 큰 연산을 하는 함수를 매번 재실행시키면 성능에 문제를 줄 수 있다.

```jsx
import { useMemo } from 'react';

function TodoList({ todos, tab, theme }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  // ...
}
```

- todos와 tab 값이 지난 렌더링동안의 값과 동일하다면, 함수를 재실행시키지 않고 `useMemo`를 통해 캐싱된 값을 사용함으로써 성능적인 이점을 얻을 수 있다.

### 계산 비용이 많이 드는지 어떻게 알 수 있나요?

- 일반적으로 수천 개의 객체를 생성하거나 반복하지 않는 한 비용이 많이 들지는 않는다.

```jsx
console.time('filter array');
const visibleTodos = filterTodos(todos, tab);
console.timeEnd('filter array');
```

- console 객체의 `time()` 메서드와 `timeEnd()` 메서드를 통해 특정 코드의 실행 시간을 측정하고 디버깅할 수 있다.
- 기록된 시간이 상당히 길다면 연산을 memoize하는 것이 합리적일 수 있다.
- 연산을 `useMemo`로 감싸서 다시 시간 기록을 해보면 총 시간이 감소했는지 여부도 확인할 수 있다.
- 내 컴퓨터가 사용자의 컴퓨터보다 속도가 빠를 수 있으므로 [Chrome의 CPU Throttling](https://developer.chrome.com/blog/new-in-devtools-61?hl=ko#throttling)을 통해 인위적으로 속도를 저하시켜 성능 테스트를 할 수 있다.
- 개발 중인 성능을 측정하면 정확한 결과를 얻기 힘들다. 그래서 정확한 연산 시간을 얻기 위해 프로덕션용으로 빌드 후 테스트해보는 것이 좋다.

💡 useMemo는 불필요한 작업이나 업데이트를 스킵해줄 뿐 최초 렌더링을 빠르게 해주진 않는다.

## 2. 컴포넌트의 리렌더링 건너뛰기

- 경우에 따라서는 `useMemo`가 자식 컴포넌트 리렌더링을 최적화하는 데 쓰이기도 한다.

```jsx
export default function Parents({ todos, tab, theme }) {
  // ...
  return (
    <div className={theme}>
      <Child items={visibleTodos} />
    </div>
  );
}
```

- 기본적으로 컴포넌트가 리렌더링되면, React는 그의 모든 자식 컴포넌트를 리렌더링한다.

```jsx
import { memo } from 'react';

const Child = memo(function List({ items }) {
  // ...
});
```

- Child 컴포넌트에 props로 전달되는 값이 이전 렌더링에서의 값과 같다면 `memo`를 통해 Child 컴포넌트의 리렌더링을 skip할 수 있다.

```jsx
export default function Parents({ todos, tab, theme }) {

  const visibleTodos = filterTodos(todos, tab);

  return (
    <div className={theme}>
      <Child items={visibleTodos} />
    </div>
  );
}
```

- `filterTodos`의 인자인 `todos`, `tab`이 아닌 `theme` props 값이 변경돼도 `filterTodos` 함수는 항상 새로운 배열을 생성한다.
- `visibleTodos`이 항상 새로운 값이므로 Child 컴포넌트도 항상 새로운 props를 받게 되므로 `memo`로 컴포넌트를 감싸더라도 최적화가 적용되지 않는다.

```jsx
export default function Parents({ todos, tab, theme }) {

  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
		[todos, tab]
  );

  return (
    <div className={theme}>
      <Child items={visibleTodos} />
    </div>
  );
}
```

- `visibleTodos` 연산에 `useMemo`를 적용해 theme props만 바뀌는 경우에는 Child 컴포넌트의 리렌더링에 영향을 주지 않도록 한다.

### useMemo로 컴포넌트 감싸기

```jsx
export default function Parents({ todos, tab, theme }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  const children = useMemo(() => <Child items={visibleTodos} />, [visibleTodos]);
  
	return (
    <div className={theme}>
      {children}
    </div>
  );
}
```

- Child 컴포넌트를 `memo`로 감싸지 않고, `useMemo`로 감싸는 방법도 있다.
- 동일하게 `visibleTodos` 값이 바뀌지 않으면, Child 컴포넌트는 리렌더링되지 않는다.
- 비교적 불편한 사용법 때문에 보통 `memo`를 더 많이 사용한다.

## 3. 의존 값 기억하기

```jsx
function Dropdown({ allItems, text }) {
  const searchOptions = { matchMode: 'whole-word', text };

  const visibleItems = useMemo(() => {
    return searchItems(allItems, searchOptions);
  }, [allItems, searchOptions]);
  // ...
```

- 컴포넌트가 리렌더링되면 컴포넌트 내부의 코드를 재실행한다.
- `text` props 값이 바뀌지 않더라도 `searchOptions` 객체도 모든 리렌더마다 새로 실행된다.
- React는 의존성 값이 항상 다른 것으로 인지하고 `useMemo`로 감싸고 있는 `visibleItems`를 매번 새로 연산한다.

```jsx
function Dropdown({ allItems, text }) {
  const searchOptions = useMemo(() => {
    return { matchMode: 'whole-word', text };
  }, [text]);

  const visibleItems = useMemo(() => {
    return searchItems(allItems, searchOptions);
  }, [allItems, searchOptions]);
  // ...
```

- `searchOptions` 객체를 `visibleItems`의 의존성 값으로 넘기기 전에 memoize해줌으로써 `text`가 변경되지 않으면 `searchOptions` 객체도 변경되지 않게 하여 문제를 해결한다.

```jsx
function Dropdown({ allItems, text }) {
  const visibleItems = useMemo(() => {
    const searchOptions = { matchMode: 'whole-word', text };
    return searchItems(allItems, searchOptions);
  }, [allItems, text]);
  // ...
```

- 더 간결한 코드와 함께 의존도를 한 단계 낮출 수 있다.

## 4. 기능 기억하기

```jsx
export default function ProductPage({ productId, referrer }) {
  function handleSubmit(orderDetails) {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails
    });
  }

  return <Form onSubmit={handleSubmit} />;
}
```

- 객체가 모든 리렌더링마다 새로 실행되는 것처럼, 함수도 모든 리렌더링마다 새로운 함수를 생성한다.
- 그 자체로 문제가 되지는 않지만 Form 컴포넌트를 `memo`로 감싸서 memoize 하고자 한다면, props 값이 변경되지 않았을 때는 새로운 함수를 생성하게 하면 안 된다.

```jsx
const handleSubmit = useMemo(() => {
  return (orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails
    });
  };
}, [productId, referrer]);
```

- `useMemo`를 통해 `handleSubmit`함수를 memoize하기 위해서는 연산 함수가 새로운 함수를 반환해야 한다.

```jsx
const handleSubmit = useCallback((orderDetails) => {
  post('/product/' + productId + '/buy', {
    referrer,
    orderDetails
  });
}, [productId, referrer]);
```

- `useMemo`대신 `useCallback`을 사용하면 동일한 효과를 얻으면서도 불필요하게 중첩된 함수를 피할 수 있고, 더 간결한 코드를 얻을 수 있다.
