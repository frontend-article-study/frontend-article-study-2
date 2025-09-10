# React Compiler

<aside>
💡

Note

현재는 RC 상태로, 커뮤니티 피드백을 받기 위해 오픈 소스로 공개함. 피드백 제공 부탁.

최신 릴리즈는 `@rc`, 데일리 실험적 릴리즈는 `@experimental` 태그로 확인할 수 있음.

</aside>

- 컴파일러는 **빌드** 시간에만 사용할 수 있는 도구로, React 앱을 자동으로 최적화함
- 일반 JavaScript와 함께 동작하며 React의 규칙을 이해하므로 사용하기 위해 코드를 다시 작성할 필요 없음
- `eslint-plugin-react-hooks`에는 컴파일러의 분석을 에디터에서 바로 표시하는 ESLint 규칙이 포함되어 있음
    - 린터는 컴파일러를 설치할 필요가 없기 때문에, 컴파일러를 사용할 준비가 되지 않았더라도 사용할 수 있음
- React 17+ 앱과 라이브러리에서 사용할 수 있음

## Compiler는 무슨 일을 하는가?

- 앱을 최적화하기 위해 코드를 자동으로 **메모화**함
- AS-IS (before compiler)
    - useMemo, useCallback, React.memo와 같은 API를 사용하여 메모화
    - 입력이 변경되지 않은 경우 애플리케이션의 특정 부분을 다시 계산할 필요가 없음을 React에게 알려줌 → 업데이트 작업을 줄일 수 있음
    - 이는 강력하지만 메모를 적용하는 것을 잊어버리거나, 잘못 적용하기 쉬움
        - 잘못 적용할 경우, React가 의미있는 변경이 없는 UI까지 확인해야하기에 비효율적인 업데이트가 될 수 있음
- TO-BE (with compiler)
    - 컴파일러는 JavaScript와 React의 규칙에 대한 지식으로 컴포넌트와 훅 내에서 values 또는 group of values를 **자동으로 메모화**함
    - 규칙을 지키지 않은 코드는 컴파일을 건너뜀
        - 리액트 컴파일러는 React 규칙이 깨졌음을 정적으로 감지할 수 있음
        - 컴파일러가 모든 코드를 최적화하는 것은 불필요
- 코드가 이미 잘 메모화되었다면, 컴파일러로 큰 성능 향상을 기대할 필요 없음.

## Compiler는 어떤 종류의 메모이제이션을 하는가?

- React Compiler의 초기 릴리즈는 주로 업데이트 성능 개선(컴포넌트 리렌더링)에 초점을 맞췄기에, 다음 두 가지 use case에 중점을 두고 있음
1. Skipping cascading re-rendering of components
    - e.g. `<Parent />` 를 리렌더링하면, 해당 컴포넌트에만 변경사항이 있음에도 불구하고 트리의 많은 컴포넌트들이 리렌더링됨
2. Skipping expensive calculations from outside of React
    - e.g. 컴포넌트 내부에서 expensivelyProcessAReallyLargeArrayOfObjects()를 호출하는 것

### 리렌더링 최적화

```tsx
function FriendList({ friends }) {
  const onlineCount = useFriendOnlineCount();
  if (friends.length === 0) {
    return <NoFriends />;
  }
  return (
    <div>
      <span>{onlineCount} online</span>
      {friends.map((friend) => (
        <FriendListCard key={friend.id} friend={friend} />
      ))}
      <MessageButton />
    </div>
  );
}
```

- (메모이제이션을 매뉴얼하게 적용하지 않은 경우,) 컴포넌트 상태가 바뀌면 React는 해당 컴포넌트와 그의 모든 자식들을 리렌더함
- `<FriendList />`의 상태가 바뀔 때마다 `<MessageButton />`은 다시 리렌더됨
- Compiler는 매뉴얼 메모화에 해당하는 기능을 자동으로 적용
    - 즉, 변경될 때 관련 부분만 다시 리렌더링함
    - `fine-grained reactivity`

### 비싼 연산 메모

```tsx
// **Not** memoized by React Compiler, since this is not a component or hook
function expensivelyProcessAReallyLargeArrayOfObjects() { /* ... */ }

// Memoized by React Compiler since this is a component
function TableContainer({ items }) {
  // This function call would be memoized:
  const data = expensivelyProcessAReallyLargeArrayOfObjects(items);
  // ...
}
```

- 렌더링 중의 비싼 연산을 자동으로 메모함
- 그러나 `expensivelyProcessAReallyLargeArrayOfObjects` 함수가 정말 비싼 연산을 하는 함수라면, React 외부에서 자체 메모화를 구현하는 것을 고려해도 좋음
    - React Compiler는 모든 함수가 아닌 React 컴포넌트와 Hook만 메모화하기 때문

## Compiler를 사용해야 하는가?

- Compiler는 현재 RC 버전이고, 프로덕션 환경에서 광범위하게 테스트되었음
- 컴파일러의 앱을 프로덕션 환경에 배포하는 것은 코드베이스의 상태와 React 규칙을 얼마나 잘 준수했는지에 따라 달라질 수 있음
- 서둘러 사용할 필요없고 안정적인 릴리즈가 나왔을 때 도입해도 상관없음

## Compiler가 가정하는 것

- 코드가 valid, semantic JavaScript
- nullable/optional 값과 프로퍼티에 액세스하기 전에, null 체크 또는 optional-chaining으로 타입 검사를 했는지 검사함
- React의 규칙을 지킴

## 컴포넌트가 최적화됐는지 어떻게 알 수 있나?

- React DevTools에서 Compiler에 의해 최적화된 컴포넌트 옆에 `Memo ✨` 뱃지를 노출함

## 컴파일 후 무언가 동작하지 않는다면?

- eslint-plugin-react-compiler를 설치했다면 에디터에서 React 규칙을 위반한 코드를 알 수 있으나 JavaScript의 특성으로 인해 모든 경우를 포괄적으로 감지할 수는 없기에, 무한 루프와 같은 버그 및 정의되지 않은 동작이 발생할 수 있음
- 컴파일 후 앱이 제대로 동작하지 않으면서 ESLint 오류도 표시되지 않는다면, Compiler가 코드를 잘못 컴파일하고 있는 것일 수 있음
    - 이때, `"use no memo"` 지시문으로 해당 요소의 컴파일을 스킵할 수 있음
        - 그러나 꼭 필요한 경우가 아니라면 사용하지 않는 것을 권장. `"use client"`처럼 오래 사용할 수 있는 느낌은 아님
        - 코드를 수정하더라도 지시어를 제거하기 전까지 컴파일을 건너뛰게 되기 때문