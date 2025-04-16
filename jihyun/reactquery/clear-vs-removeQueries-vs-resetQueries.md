# clear vs removeQueries vs resetQueries

## clear

- 캐시된 모든 데이터를 삭제
- 모든 캐시를 삭제하기에, `쿼리 키` 필요없음
- 쿼리 구독 또한 제거됨
- 사용 예시: 로그아웃

## removeQueries

- `쿼리 키`에 대응되는 캐시를 삭제
- 해당 쿼리를 구독하는 컴포넌트들에게 캐시가 삭제됐음을 **알리지 않음**

```tsx
removeQueries<
    TQueryFnData = unknown,
    TError = DefaultError,
    TTaggedQueryKey extends QueryKey = QueryKey,
    TInferredQueryFnData = InferDataFromTag<TQueryFnData, TTaggedQueryKey>,
    TInferredError = InferErrorFromTag<TError, TTaggedQueryKey>,
  >(
    filters?: QueryFilters<
      TInferredQueryFnData,
      TInferredError,
      TInferredQueryFnData,
      TTaggedQueryKey
    >,
  ): void {
    const queryCache = this.#queryCache
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query) // 쿼리 캐시에서 해당 쿼리를 제거한다.
      })
    })
  }
```

## resetQueries

- `쿼리 키`에 대응되는 캐시를 초기화
  - isLoading 상태를 갖게됨
- 해당 쿼리를 구독하는 컴포넌트에 리렌더링 발생
- 즉, 기존 캐시를 지우고 최신 데이터로 작동하도록 보장하는 방법

```tsx
resetQueries<
    TQueryFnData = unknown,
    TError = DefaultError,
    TTaggedQueryKey extends QueryKey = QueryKey,
    TInferredQueryFnData = InferDataFromTag<TQueryFnData, TTaggedQueryKey>,
    TInferredError = InferErrorFromTag<TError, TTaggedQueryKey>,
  >(
    filters?: QueryFilters<
      TInferredQueryFnData,
      TInferredError,
      TInferredQueryFnData,
      TTaggedQueryKey
    >,
    options?: ResetOptions,
  ): Promise<void> {
    const queryCache = this.#queryCache

    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset() // 해당 쿼리를 리셋한다.
      })
      return this.refetchQueries(
        {
          type: 'active',
          ...filters,
        },
        options,
      )
    })
  }
```

### invalidate vs reset

- reset의 경우,
  - `loading` 상태가 됨
  - 쿼리가 active 상태라면 refetch
- invalidate의 경우,
  - `fetching` 상태가 됨
  - 쿼리를 stale 처리만 함
    - fetching이 완료되기 전까지, 값은 만료된 데이터로 유지됨

## Demo

[https://codesandbox.io/p/sandbox/yrh7dd](https://codesandbox.io/p/sandbox/yrh7dd)
