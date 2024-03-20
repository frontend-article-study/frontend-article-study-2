# Optimistic update

Optimistic update(낙관적 업데이트)는 UI를 낙관적으로 업데이트하는 방식을 말합니다. Optimistic update 방식으로 구현하면 서버 응답 시간에 딜레이가 있어도 앱이 반응적이고 부드럽게 동작하기 때문에 UX를 향상시키는 데에 도움이 됩니다.

# React-Query를 사용하여 optimistic update 구현하기

리액트 쿼리는 mutation이 완료되기 전 UI를 낙관적으로 업데이트할 수 있는 방법을 2가지 제공합니다.

> 리액트 쿼리에서 mutation이란, POST나 PUT 등과 같은 요청처럼 서버에 변경 사항을 발생시키는 작업을 의미합니다.

## (들어가기 전) mutation 옵션 정리

- `onMutate`
  - mutation 함수가 실행되기 전에 실행되는 함수
  - mutation 함수와 동일한 인수를 받음
  - 이 함수의 리턴 값은 mutation 실패 시, `onError`와 `onSettled` 함수에 전달됨
  - optimistic update 구현에 유용
- `onSuccess`
  - mutation이 성공하면 실행되는 함수
  - mutation의 결과가 전달됨
  - Promise를 받으면 await 및 resolve 됨
- `onError`
  - mutation에 오류가 발생하면 실행되는 함수
  - mutation의 오류가 전달됨
  - Promise를 받으면 await 및 resolve 됨
- `onSettled`
  - mutation의 성공(fulfilled)/실패(rejected)에 관계없이 완료됐을 때 실행되는 함수
  - Promise를 받으면 await 및 resolve 됨

## 1. UI 조작하기

mutation 함수를 호출할 때 전달한 데이터(=화면을 업데이트할 값)를 렌더링하는 방식입니다.

예를 들어 useMutation을 활용해 새로운 투두를 추가하는 상황이라고 가정해 봅시다.

투두를 추가하기 위해서 새로 추가할 투두를 mutationFn 인수로 전달할 것이고, 전달한 인수는 useMutation이 반환하는 `variables`로 접근할 수 있습니다.

그리고 mutation이 완료된 다음, 서버가 가진 투두 데이터와 동기화하기 위해 캐시된 쿼리를 무효화시킵니다.

```tsx
const { isPending, submittedAt, variables, mutate, isError } = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: async () => {
    return await queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// variables는 undefined였다가, mutationFn이 호출되었을 때 newTodo로 변경됩니다.
```

화면에 그려져야 하는 새로운 데이터가 `variables`에 담겨있기 때문에, mutation의 진행 상황과 관계 없이 렌더링에 사용할 수 있습니다. 즉, mutation이 pending 상태이더라도 성공했다고 가정하여 낙관적인 업데이트를할 수 있습니다.

```tsx
<ul>
  {todoQuery.items.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
  {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
</ul>
```

mutation의 상태가 pending에서 success로 변경된다면 `variables`는 렌더링되지 않고, 쿼리 무효화로 인해 todoQuery.items에 포함되어 렌더링됩니다.

만약 mutation에 오류가 발생했다면, 새로운 투두는 todoQuery.items에는 없을 것이기 때문에 error 상황에 대한 조건부 렌더링을 해 주는 것이 좋습니다.

이때 `variables`는 오류가 발생했을 때 지워지지 않으므로 여전히 새로운 데이터를 활용해 실패 UI를 렌더링할 수 있습니다.

```tsx
{
  isError && (
    <li style={{ color: 'red' }}>
      {variables}
      <button onClick={() => mutate(variables)}>Retry</button>
    </li>
  );
}
```

## 2. 캐시 조작하기

낙관적으로 상태를 업데이트할 때 mutation이 실패할 가능성이 있습니다. 이때 낙관적 업데이트된 쿼리를 실제 서버 상태로 되돌리기 위해 refetch를 트리거할 수 있는데요. 어떤 상황에서는 refetch가 제대로 동작하지 않을 수도 있고, mutation 오류는 refetch를 할 수 없는 유형의 서버 문제일 수도 있습니다.

이러한 경우, `onMutate` 핸들러를 사용해 `onError`와 `onSettled` 핸들러에 롤백 기능을 전달함으로써 업데이트 롤백을 수행할 수 있습니다.

```tsx
onMutate: (variables: TVariables) => Promise<TContext | void> | TContext | void
onError: (err: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown
onSettled: (data: TData, error: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown
```

로직은 다음과 같습니다.

mutation이 실행되기 전(onMutate 핸들러), 추후 mutation 실패 시 롤백하는 데 쓰일 현재 쿼리 데이터(업데이트 전 데이터)를 변수에 담아둡니다. 그리고 현재 쿼리 데이터를 새로운 데이터로 교체함으로써 낙관적 업데이트를 수행합니다. 그리고 업데이트 전 데이터를 리턴함으로써 mutation 완료 핸들러들에게 전달합니다.

만약 mutation에 실패했다면, 실패했을 때 실행되는 onError 핸들러에서 업데이트 전 데이터로 다시 쿼리 데이터를 교체합니다.

mutation에 성공했다면, 쿼리를 무효화하여 업데이트된 서버 상태를 가져옵니다.

```tsx
const queryClient = useQueryClient();

useMutation({
  mutationFn: updateTodo,
  // mutation 시작 전
  onMutate: async (newTodo) => {
    // 1. 쿼리의 다른 업데이트 무시 (refetch 실행으로 인한 데이터 꼬임 방지)
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    // 2. 현재 쿼리 데이터 스냅샷
    const previousTodos = queryClient.getQueryData(['todos']);
    // 3. 현재 쿼리 데이터를 새로운 데이터로 교체함으로써 낙관적 업데이트
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    // 4. 실패 시 새로운 데이터 반영 전으로 롤백하기 위해 스냅샷 데이터 전달
    return { previousTodos };
  },
  // mutation 실패 - onMutate의 리턴값이 context로 들어감
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  // mutation 성공 - 서버의 최신 상태와 동기화 위해 임의로 교체해둔 쿼리 무효화
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

## 두 가지 중 어떤 방법을 사용할까?

optimistic update의 결과가 나타나야하는 곳이 하나라면, 많은 코드 작성이 필요하지 않은 1번이 유용할 수 있습니다.

그러나 결과가 나타나야 하는 곳이 여러 곳이라면 자동으로 롤백을 처리할 수 있도록 캐시를 조작하는 것이 편리할 수 있습니다.

개인적으로 생각해봤을 때 단순한 mutation이고 사용자에게 롤백 시도 여부를 위임할만 하다면 1번을, 업데이트해야 하는 부분이 많고 사용자에게 롤백 시도를 위임할 필요가 없다면 2번 방법을 사용하는 것이 좋을 것 같습니다.

# 참고

cancelQueries 호출하는 이유: [https://velog.io/@mskwon/react-query-cancel-queries](https://velog.io/@mskwon/react-query-cancel-queries)

[https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
