# branded type 그리고 queryOptions

## 목차

- 구조적 타이핑이란?
- 구조적 타이핑의 한계 — 브랜드 패턴이 필요한 이유
- 브랜드 패턴 기본 문법
- queryOptions의 문제 의식
- DataTag — queryOptions가 브랜드 패턴을 적용하는 방식
- getQueryData가 브랜드를 읽는 방법
- 전체 타입 추론 흐름
- 실전 적용 포인트
- 정리

---

## 구조적 타이핑이란?

> **타입의 이름이 아닌, 구조(필드와 타입)가 같으면 같은 타입으로 취급하는 방식**
> 

```tsx
type Point2D  = { x: number; y: number }
type Vector2D = { x: number; y: number }

function move(point: Point2D) { ... }

const v: Vector2D = { x: 1, y: 2 }
move(v) // ✅ 타입 에러 없음 — 구조가 같아서

```

- `Point2D`와 `Vector2D`는 이름이 달라도 구조가 같으면 호환됨
- Java, C# 같은 언어의 **명목적 타이핑(Nominal Typing)** 과 반대되는 개념
    - 명목적 타이핑: 이름이 다르면 다른 타입 (구조가 같아도 에러)
- TypeScript는 유연하고 편리하지만 — **의미상 다른 타입을 구분하지 못하는 한계**가 있음

---

## 구조적 타이핑의 한계 — 브랜드 패턴이 필요한 이유

### 문제: 의미는 다르지만 구조가 같은 타입들

```tsx
type UserId = string
type PostId = string

// DB에서 유저를 삭제하는 함수
async function deleteUser(id: UserId) {
  await db.users.delete({ where: { id } })
}

const postId: PostId = 'post-456'

// 실수로 PostId를 넘겼지만 — TypeScript는 모름
deleteUser(postId) // ✅ 타입 에러 없음 — 하지만 런타임에 엉뚱한 row 삭제!

```

- `UserId`와 `PostId`는 둘 다 `string`이라 TypeScript가 구분하지 못함
- 엉뚱한 row가 삭제되는 버그가 **런타임에서야** 발견됨
- **브랜드 패턴**으로 이 실수를 컴파일 타임에 잡을 수 있음

---

## 브랜드 패턴 기본 문법

### 교차 타입으로 "표식" 붙이기

```tsx
type UserId = string & { __brand: 'UserId' }
type PostId = string & { __brand: 'PostId' }

const userId = 'user-123' as UserId
const postId = 'post-456' as PostId

async function deleteUser(id: UserId) {
  await db.users.delete({ where: { id } })
}

deleteUser(userId) // ✅
deleteUser(postId) // ❌ 타입 에러! — 컴파일 타임에 잡힘
//         ~~~~~~
//         'PostId'는 'UserId'에 할당할 수 없습니다

```

- `& { __brand: 'UserId' }` 를 교차 타입(Intersection Type)으로 추가
- `__brand` 필드는 런타임엔 존재하지 않음 — **타입 레벨에만 있는 "유령 필드"**
- 런타임 비용 없이 컴파일 타임 안전성 확보

---

## queryOptions의 문제 의식

### queryKey만으로는 데이터 타입을 알 수 없다

```tsx
// queryKey는 그냥 배열 — 어떤 타입의 데이터와 연결됐는지 정보가 없음
queryClient.getQueryData(['user', '123'])
//          반환 타입: unknown 😢

```

- `getQueryData`는 queryKey를 받지만, 이 key가 `User` 타입과 연결됐다는 정보가 없음
- 개발자가 직접 제네릭을 명시해야 했음

```tsx
queryClient.getQueryData<User>(['user', '123'])   // 직접 명시 😓

```

- 그런데 이 제네릭을 **틀리게 써도 TypeScript는 에러를 내지 않음**
- `getQueryData`는 단순히 `QueryKey`(배열)를 받기 때문에,
key와 제네릭 타입 사이의 관계를 검증할 방법이 없기 때문

```tsx
// 실제 데이터는 User인데, string이라고 잘못 명시해도 에러 없음 😱
// 기대: 타입 에러 발생 — 실제: 통과
queryClient.getQueryData<string>(['user', '123'])
//          ^^ string | undefined — 잘못된 타입이지만 그냥 통과

```

---

## DataTag — queryOptions가 브랜드 패턴을 적용하는 방식

### Step 1. TanStack Query의 내부 브랜드 타입

```tsx
// TanStack Query 내부 타입 정의
type DataTag<TQueryKey, TData> = TQueryKey & {
  __dataTagSymbol: TData  // 👈 브랜드 — TData를 queryKey에 태깅
}

```

- 기존 `TQueryKey`에 `__dataTagSymbol`을 교차 타입으로 붙인 것
- `__dataTagSymbol` 역시 유령 필드 — 런타임엔 존재하지 않음

### Step 2. queryOptions의 타입 시그니처에서 DataTag를 반환

```tsx
// queryOptions의 타입 시그니처 (단순화)
function queryOptions<TData>(options: {
  queryKey: QueryKey            // 입력: 그냥 배열
  queryFn: () => Promise<TData> // TData를 여기서 추론
}): {
  queryKey: DataTag<QueryKey, TData>  // 출력: TData가 태깅된 브랜드 타입
  queryFn: () => Promise<TData>
}

```

- 입력의 `queryKey`는 평범한 배열
- 출력의 `queryKey`는 `TData`가 브랜딩된 특별한 타입
- `queryFn`의 반환 타입(`Promise<TData>`)에서 `TData`를 자동 추론

```tsx
const opts = queryOptions({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId), // 반환: Promise<User> → TData = User
})

opts.queryKey
// 타입: ['user', string] & { __dataTagSymbol: User }
//       ^^^^^^^^^^^^^^       ^^^^^^^^^^^^^^^^^^^^^^
//       런타임엔 그냥 배열    타입 레벨에만 존재하는 User 정보

```

---

## getQueryData가 브랜드를 읽는 방법

### DataTag에서 TData를 역추출하는 시그니처

```tsx
// getQueryData의 타입 시그니처
getQueryData<T>(queryKey: DataTag<QueryKey, T>): T | undefined
//           ^                              ^    ^
//     T는 명시 안 해도 됨                  |    반환 타입도 T로 결정
//                            queryKey의 브랜드에서 T를 역추론

```

- `queryKey` 매개변수 타입이 `DataTag<QueryKey, T>` — 브랜딩된 key만 받음
- TypeScript가 전달된 key의 `__dataTagSymbol`을 보고 `T`를 역추론
- 개발자가 제네릭을 직접 쓸 필요도 없고, 틀릴 수도 없음

```tsx
// opts.queryKey 타입: ['user', string] & { __dataTagSymbol: User }
queryClient.getQueryData(opts.queryKey)
//          T = User (TypeScript가 __dataTagSymbol에서 추론)
//          반환 타입: User | undefined ✅ 제네릭 명시 없이도 정확함

```

```tsx
// 브랜딩되지 않은 일반 배열을 넘기면 — 에러는 아니지만 unknown으로 fallback
queryClient.getQueryData(['user', '123'])
//          반환 타입: unknown 😢
//          타입 정보가 없으니 TypeScript가 추론을 포기
//          → 이후 data를 쓰려면 매번 타입 단언(as User)이나 타입 가드가 필요

```

- 즉, 일반 배열을 넘긴다고 에러가 발생하는 건 아님
- 대신 **브랜딩된 key를 넘길 때만 타입이 살아있고**, 그렇지 않으면 `unknown`으로 떨어져 실용성이 없음

---

## 전체 타입 추론 흐름

```
1. queryFn의 반환 타입에서 TData 추론
   queryFn: () => fetchUser(userId)
                  → Promise<User> → TData = User

2. queryOptions가 queryKey에 TData를 브랜딩
   입력  queryKey: ['user', string]
   출력  queryKey: ['user', string] & { __dataTagSymbol: User }

3. getQueryData가 브랜드에서 T를 역추론
   getQueryData(opts.queryKey)
                __dataTagSymbol: User → T = User

4. 반환 타입 결정
   T | undefined → User | undefined ✅

```

---

## 실전 적용 포인트

### 한 곳에서 정의하고, 여러 곳에서 타입 안전하게 재사용

```tsx
// queries/user.ts
export const userQueryOptions = (userId: string) => queryOptions({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60 * 5,
})

// 컴포넌트에서
const { data } = useQuery(userQueryOptions(id))
//      ^^ User | undefined ✅

// 서버사이드 prefetch에서
await queryClient.prefetchQuery(userQueryOptions(id)) // ✅

// 캐시에서 직접 읽을 때
const cached = queryClient.getQueryData(userQueryOptions(id).queryKey)
//    ^^ User | undefined ✅ — 제네릭 없이도 추론됨

```

- queryKey와 데이터 타입의 연결이 **한 곳에서 선언되고 전파**됨
- 선언부를 바꾸면 사용하는 모든 곳에서 타입이 자동으로 업데이트됨

---

## 정리

|  | 브랜드 패턴 없이 | 브랜드 패턴 적용 |
| --- | --- | --- |
| **타입 구분** | 구조가 같으면 동일 타입 | 유령 필드로 구분 |
| **런타임 비용** | — | 없음 |
| **queryKey 반환 타입** | `unknown` | 자동 추론 |
| **잘못된 타입 명시** | 에러 없음 😱 | 컴파일 타임 에러 ✅ |
| **오류 발견 시점** | 런타임 | 컴파일 타임 |

### 핵심 한 줄 요약

> 브랜드 패턴 = 런타임엔 아무것도 없지만, 타입 레벨에선 모든 것을 아는 "유령 표식"
> 
> 
> `queryOptions`는 `DataTag`로 queryKey에 데이터 타입을 태깅하고,
> `getQueryData`는 그 태그를 읽어 반환 타입을 자동으로 결정한다
>