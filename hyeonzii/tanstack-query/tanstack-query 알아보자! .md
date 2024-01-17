# Tanstack Query 란?

우선! React Query가 Tanstack Query 로 이름을 변경했습니다!

React Query는 React Application에서 서버의 상태를 불러오고, 캐싱하며, **지속적으로 동기화**하고 업데이트하는 작업을 도와주는 라이브러리 입니다. Hook을 사용하여 React Component 내부에서 자연스럽게 서버의 데이터를 사용할 수 있는 방법을 제안합니다.

### server state의 특징

- 사용자가 제어하거나 소유하지 않는 위치에서 원격으로 유지됨
- 비동기 API를 통해 fetching과 updating이 필요
- 복수의 사람들이 접근이 가능하며 사용자가 모르는 사이 변경될 수 있음
- 따라서 언제든 데이터가 **최신상태가 아니게** 될 수 있음

### server state 관리의 어려움

- 캐싱
- 동일 데이터 요청에 대한 중복 요청 제거
- 백그라운드에서 out of date 데이터 업데이트
- 페이지네이션과 Lazy Loading과 같은 성능 최적화
...

## 특징

### 캐싱
: 특정 데이터의 복사본을 저장하여 이후 동일한 데이터의 재접근 속도를 높힘

**그래서 언제 데이터를 갱신해주는데?**

Tanstack-Ouery는 아래의 옵션들을 제공합니다.

``` javascript
refetchOnWindowFocus, //default: true
refetchOnMount, //defualt:true
refetchOnReconnect, //default: true
staleTime, //default:0
cacheTime, //default: 5분 (60 * 5 * 1000)
```
위의 옵션들을 통해 우리는 Tanstack-Query가 어떤 시점에 데이터를 Refetching 하는지 알 수 있습니다!

1. 브라우저에 포커스가 들어온 경우 (refetchOnWindowFocus)
2. 새로운 컴포넌트 마운트가 발생한 경우 (refetchOnMount)
3. 네트워크 재연결이 발생한 경우 (refetchOnReconnect)

**staleTime**
: 얼마의 시간이 흐른 뒤에 데이터를 stale(신선하지 않은)하다고 취급할 것인가

- staleTime은 데이터가 fresh->stale 상태로 변경되는데 걸리는 시간
- fresh 상태일 때는 Refetch 트리거(3가지 경우)가 발생해도 Refetch가 일어나지 않는다
- 기본값이 0이므로 따로 설정해주지 않는다면 Refetch 트리거가 발생했을 때 무조건 Refetch가 발생한다

**cacheTime**
:inactive 상태로 메모리에 남아있는 시간, 기본 5분

- cacheTime은 데이터가 inactive한 상태일 때 캐싱된 상태로 남아있는 시간
- 특정 컴포넌트가 unmount(페이지 전환 등으로 화면에서 사라질 때)되면 사용된 데이터는 inactive 상태로 바뀌고, 이때 데이터는 cacheTime만큼 유지된다.
- cacheTime 이후 데이터는 가비지 콜렉터로 수집되어 메모리에서 해제된다.
- 만일 cacheTime이 지나지 않았는데 해당 데이터를 사용하는 컴포넌트가 다시 mount되면, 새로운 데이터를 fetch 해오는 동안 캐싱된 데이터를 보여준다.
- 즉, 캐싱된 데이터를 계속 보여주는게 아니라 fetch 하는 동안 임시로 보여준다.

> **Q. 그럼 각각 어느정도로 설정해줘야 좋은걸까..?**
>
> A. 일단..목적에 따라 다를것...
>
> 사용자가 자주 업데이트되는 데이터를 보여주는 페이지, 최신 정보를 유지하길 원한다면 **짧은 staleTime**
> 자주 변하지 않는 데이터를 사용하는 경우엔 **긴 staleTime**
>
> 사용자가 자주 방문하는 페이지라면 **긴 cacheTime**
>
> 근데 둘 다 예측하기 어렵다면..... 적절히 설정해주는 것이 좋을 듯 합니다....!!

### Client 데이터와 Server 데이터 간의 분리

: 프로젝트의 규모가 커지고 관리해야할 데이터가 넘치다 보면, Client에서 관리하는 데이터와 Server에서 관리하는 데이터가 분리될 필요성을 느끼게 됩니다.

> Client Data: 모달 관련 데이터, 페이지 관련 데이터...
>
> Server Data: 사용자 정보, 비즈니스 로직 관련 정보...
>
> **비동기 API 호출을 통해 불러오는 데이터**들을 Server 데이터라고 할 수 있습니다!

기존의 Redux,Recoil 등과 같은 **전역 상태 관리 라이브러리**들은 Client와 Server 데이터를 완벽히 분리해 관리에 용이하도록 충분한 기능이 지원된다고 보기 어렵습니다.

> **Q. 왜 적합하지 못할까?**
>
> A. 
> 
> 1. 데이터 동기화의 복잡성
>
> 사용자 액션, 네트워크 상태, 다른 사용자의 액션 등 다양한 요인에 따라서 서버의 데이터 상태는 계속 변하게 됩니다. 이런 상황에서 클라이언트의 상태를 항상 최신으로 유지하려면, 실시간으로 서버의 상태 변화를 감지하고 반영하는 로직이 필요하게 되는데, 이는 상당히 복잡한 작업입니다.
>
> 2. 캐싱과 무효화의 어려움
>
> 클라이언트에서 서버 데이터를 캐싱하는 것은 효율적인 데이터 관리를 위해 필수적입니다. 하지만 언제, 어떻게 캐시를 업데이트하거나 무효화할지 결정하는 것은 쉽지 않습니다. 특히 여러 사용자가 동시에 데이터를 변경하는 경우, 캐시된 데이터가 실제 서버의 데이터와 불일치하는 상황이 발생할 수 있습니다.
>
> 3. 서버와 클라이언트의 데이터 모델 차이
>
> 서버와 클라이언트의 데이터 모델이 다를 수 있습니다.

따라서 **Tanstack Query** 에서는 아래와 같은 로직을 지원합니다.

```javascript

const { data, isLoading } = useQueries(
	['unique-key'],
	() => {
		return api({
			url: URL,
			method: 'GET',
		});
	},
	{
		onSuccess: (data) => {
			// data로 이것저것 하는 로직
		}
	},
	{
		onError: (error) => {
			// error로 이것저것 하는 로직
		}
	}
)

```

`onSuccess` 와 `onError` 함수를 통해 fetch 성공과 실패에 대한 분기를 간단하게 구현할 수 있게 됩니다!

## 사용해보기!

### useQuery

비동기 데이터를 가져오고 관리하는 작업을 쉽게 처리할 수 있게 됩니다.

1. Query Key: 데이터를 가져오는 데 사용되는 고유 식별자
	- 캐시에 데이터를 저장하고 검색하는데 사용
2. Fetch Function: 실제 데이터를 가져오는 함수
	- 해당 함수는 Promise를 반환
3. (Optional) Options : 다양한 설정과 콜백을 포함하는 객체
	- 데이터 가져오기 성공 및 실패 시에 어떤 동작을 할 지 결정 가능
    
```typescript
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

'todos'라는 Query Key를 가진 비동기 쿼리를 수행합니다.

또한 `result`에는 생산성을 높이기 위해 몇 가지 상태가 포함되어 있습니다.

1. `isPending` 혹은 `status === 'pending'` : 쿼리에 아직 데이터가 없습니다.
2. `isError` 혹은 `status === 'error'` : 쿼리에 오류가 발생했습니다.
3. `isSuccess` 혹은 `status === 'suceess'` : 쿼리가 성공했고 데이터를 사용할 수 있습니다.

이 외에도 많은 상태가 존재하나 [공식문서](https://tanstack.com/query/latest/docs/react/guides/queries)를 참조하시길 바라겠습니다!

대부분의 경우는 `isPending` 상태를 확인한 후 `isError` 상태를 확인한 다음 마지막으로 데이터가 사용 가능하다고 가정하고 성공적인 상태를 렌더링 하는 것으로 충분합니다.

```typescript
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  // We can assume by this point that `isSuccess === true`
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

> **Q. cacheTime과 staleTime은 어디서 적용?**
>
> A. useQuery에서 해당 내용을 적용시킬 수 있습니다!

```typescript
export const useGetSpeechGuideList = () => {
  return useQuery(['getSpeechGuideList'], () => api.homeService.getSpeechGuideData(), {
    cacheTime: Infinity,
    staleTime: Infinity,
  });
};
```

### useMutations

queries와 달리 mutations 는 보통 데이터를 생성/수정/삭제 혹은 서버 사이드 이펙트를 수행 하는데 사용됩니다.

즉 useMutations 는 데이터 변경 작업을 쉽게 처리할 수 있도록 해줍니다.

```typescript
function App() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo)
    },
  })

  return (
    <div>
      {mutation.isPending ? (
        'Adding todo...'
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: 'Do Laundry' })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

useMutation 훅을 사용해 mutation을 생성합니다. mutation은 newTodo 객체를 인자로 받아, axios.post 함수를 사용해 '/todos' 경로에 POST 요청을 보냅니다.

mutation 상태에 따라 다른 UI를 렌더링합니다.

	
 - `isPending`
    	
     - 'Adding todo...'
     - 진행중 메시지
        
- `isError`
    
  - `<div>An error occurred: {mutation.error.message}</div>`
  - 오류 메시지
        
- `isSuccess`
    
   - <div>Todo added!</div>
   - 성공 메시지
        
'Create Todo' 버튼을 클릭하면, mutation의 mutate 메서드를 호출해 새로운 할 일을 추가합니다.
id로 현재시간, title로 'Do Laundry'인 새로운 할 일을 추가해주게 됩니다.

### Query Invalidation

쿼리의 데이터가 오래되었다는 사실을 알게 되었을 경우, 이 데이터는 유효하지 않을 수 있습니다. 따라서 쿼리를 오래되었다고 표시해주고 다시 가져오게 해줍니다.

```typescript
// 캐시에 있는 모든 쿼리를 무효화
queryClient.invalidateQueries()
// 'todos' 라는 쿼리 키를 가진 모든 데이터를 무효화
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

> **Q. 그럼 어떤 시간에 따라서 쿼리를 무효화 시켜주는거지?**
>
> A. 어떤 시간을 따르지 않고 **즉시 무효화** 시키고 새로운 데이터를 가져옵니다.

### 전체 코드

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { getTodos, postTodo } from '../my-api'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  // Access the client
  const queryClient = useQueryClient()

  // Queries
  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos })

  // Mutations
  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <div>
      <ul>{query.data?.map((todo) => <li key={todo.id}>{todo.title}</li>)}</ul>

      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: 'Do Laundry',
          })
        }}
      >
        Add Todo
      </button>
    </div>
  )
}

render(<App />, document.getElementById('root'))
```

1. `QueryClient`를 생성, `QueryProvider`를 사용해 감싸 앱에 제공합니다.
2. Todos 컴포넌트에서 useQuery를 사용해 'todos'라는 Query key를 가진 비동기 쿼리를 수행, 해당 쿼리는 getTodos 함수를 호출해 데이터를 가져옴
3. `useMutation`으로 postTodo 함수를 호출하는 mutation 생성, 해당 mutation은 새로운 할 일을 추가하는 작업을 수행
4. mutation이 성공적으로 완료되면, `onSuccess` 콜백이 실행, 해당 콜백에서는 `queryClient.invalidateQueries`를 사용하여 'todos' 쿼리를 무효화하고 다시 가져옵니다. 이렇게 하면 최신 데이터로 UI가 즉시 업데이트됩니다.


> **Q. 만약 서버에서 내려주는 응답 데이터가 갱신된 새로운 데이터라면 추가적인 GET 요청없이(네트워크 낭비 없이)도 업데이트가 가능하지 않을까요?**
>
> A. setQuery()를 이용해보자!

### setQueryData()

쿼리의 캐시된 데이터를 즉시 업데이트하는데 사용할 수 있는 동기식 함수입니다.

첫번째 인자로는 변경시키고자 하는 쿼리의 키를 입력받습니다.
두번째 인자로는 업데이트 함수를 입력합니다.

```typescript
const queryClient = useQueryClient();
queryClient.setQueryData('todos', updatedTodos);
```

'todos' 쿼리를 `updateTodos` 라는 업데이트 함수를 이용해 변경시키게 됩니다.

#### 좀 더 복잡한 예제

```typescript
const updateVideoData = (data: VideoData, clickedTitleIndex: number) => {
  queryClient.setQueryData<VideoData>(['getVideoData', data.id, clickedTitleIndex, false], (oldData) => {
    return { ...oldData, ...data };
  });
};

export const usePostMemoData = () => {
  return useMutation(api.learnDetailService.postMemoData, {
    onSuccess: (data, { clickedTitleIndex }) => updateVideoData(data, clickedTitleIndex),
  });
};
```
(_코드출처: https://heycoding.tistory.com/128_)

서버로부터 응답받은 데이터는 `onSuccess`의 첫번째 인자인 `data`를 통해서 들어오게 됩니다.
oldData(입력한 쿼리키와 일치하는 쿼리가 가지고 있던 데이터를 의미, **해당 값은 불변성을 지켜야 합니다**)와 `data`에 모두 스프레드 연산자를 사용했으므로 중복되는 필드는 뒤에 위치한 `data`가 가지고 있는 값으로 덮어 씌워집니다.

>**Q. 둘 중 무엇을 사용?**
>
> A. TkDodo(이 라이브러리를 만들진 않았지만.. 많은 기여를 하신 분!)의 블로그에서는 invalidation이 더 안전한 접근 방식이라고 명시되어 있습니다. 
> 
> 상황에 맞게 쓰는 것이 좋을 것 같습니다.

### 장점!

1. Boilerplate 코드의 감소
2. 기존의 비동기 API 로직을 한곳에서 확인 가능함! -> **관심사 분리에 용이**
3. `onSuccess`, `onError`, `isFetching` 등 ErrorFlag를 지원해줘 편리하게 사용 가능
4. 지원해주는 다양한 옵션을 이용하여 효율적으로 데이터 변환이 가능

### 참고블로그

[[Next] TanStack Query 소개, 설치 및 셋팅](https://www.dgmunit1.com/blog/setting/next-tanstack-query)
[React Query(Tanstack Query)](https://velog.io/@6mn12j/React-Query)
[카카오페이 프론트엔드 개발자들이 React Query를 선택한 이유](https://tech.kakaopay.com/post/react-query-1/)
[공식문서](https://tanstack.com/query/latest/docs/react/quick-start)
[[React Query] 리액트 쿼리 '잘' 사용해보자 - 네트워크 비용 감소 / UX 개선](https://heycoding.tistory.com/128)