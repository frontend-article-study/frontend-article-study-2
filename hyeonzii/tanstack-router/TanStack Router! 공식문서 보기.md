![](https://velog.velcdn.com/images/hyeonzii/post/4cc45406-4513-4386-b9b6-329abb22c395/image.png)
 (_출처_https://github.com/tanstack/router_)
 
 A fully type-safe React router with built-in data fetching, stale-while revalidate caching and first-class search-param APIs.
 
Typescript의 타입 시스템을 활용하여 라우팅을 관리할 수 있는 라이브러리 입니다!

이 외에도

자동 라우트 프리패칭, 쿼리 스트링 관리 등 다양한 기능들을 제공하고 있습니다. 

## 직접 사용해보자

```bash
npm install @tanstack/react-router
```

저는 vite를 사용하기 때문에 아래 구문으로 설치를 진행했습니다.

```bash
npm install --save-dev @tanstack/router-vite-plugin @tanstack/router-devtools
```

**Vite.config.ts**
```tsx
// vite.config.ts
import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // ...,
    TanStackRouterVite(),
  ],
})
```

기본 경로 파일을 생성해줍니다.

**src/routes/__root.tsx**
```tsx
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

각각 index와 about 경로 컴포넌트를 생성해주는데 .lazy.tsx확장자를 사용하여 지연 로딩을 가능하게 해줍니다.

> 지연 로딩?
>
> 리소스를 논 블로킹(중요하지 않음)으로 식별하여 필요할 때만 로드하는 전략입니다.
>
> 컴포넌트가 필요한 시점에만 로드하는 것을 가능하게 해 로딩 시간을 최적화 해줍니다.


**src/routes/index.lazy.tsx**

```tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
```

**src/about.index.lazy.tsx**

```tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/about')({
  component: About,
})

function About() {
  return <div className="p-2">Hello from About!</div>
}
```

app.tsx파일을 아래와 같이 구성해주고 실행시키면 자동적으로 routeTree.gen 파일이 생성됩니다.

_index.html를 id="root"-> id="app"으로 변경해줍니다._

**src/app.tsx**

```tsx
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
```

![](https://velog.velcdn.com/images/hyeonzii/post/53963a0a-bef0-4d38-ae7a-f43638ad0f1b/image.png)

![](https://velog.velcdn.com/images/hyeonzii/post/6c4d6e3b-10a1-48fa-81a3-d1977d79c57d/image.png)

이렇게 라우팅이 잘 되는 것을 확인할 수 있습니다.

[링크](https://tanstack.com/router/latest/docs/framework/react/comparison) 를 확인해보면 tanstack router 만 지원하는 기능이 있는데요! (react-router-dom,next 와 비교)

그걸 몇 가지 실습해보겠습니다.

## path params

기존에 `/`뒤에 작성했던 것과 달리 `$`를 기준으로 구분지어 줍니다.

- `$postId`
- `$name`
- `$teamId`
- `about/$name`

**posts.$postId.tsx** 파일을 만들어보겠습니다.

![](https://velog.velcdn.com/images/hyeonzii/post/be7367d1-8dea-4b44-babb-01ba5dc81252/image.gif)

이렇게 간편하게 알아서 파일이 작성이 됩니다!

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    return fetchPost(params.postId)
  },
})
```

```tsx
export const Route = createFileRoute('/posts/$postId')({
  beforeLoad: async ({ params }) => {
    // do something with params.postId
  },
})
```
이렇게 작성하면 비동기 로직 처리가 가능하니 참고하세요!

하지만 저희는 단순 path params 값을 확인할 것이므로 아래와 같이 작성해보겠습니다.

```tsx
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  return <div>Post {postId}</div>
}
```

![](https://velog.velcdn.com/images/hyeonzii/post/6ba0fd13-fcd8-422f-9465-1163c92ff73c/image.png)

값이 잘 읽히는 것을 확인할 수 있습니다!

### Navigating with Path Params

path params를 이용해서 네비게이션을 만들때, Typescript는 객체 혹은 객체를 반환하는 함수를 params로 넘겨야만 합니다.

경로 매개변수에서의 타입 안정성을 강조하기 위함입니다.


**객체**

```tsx
function Component() {
  return (
    <Link to="/blog/$postId" params={{ postId: '123' }}>
      Post 123
    </Link>
  )
}
```

**함수(객체 반환)**

```tsx
function Component() {
  return (
    <Link to="/blog/$postId" params={(prev) => ({ ...prev, postId: '123' })}>
      Post 123
    </Link>
  )
}
```

참고로 기존 react-router-dom은

```tsx
function Component() {
  const postId = '123';

  return (
    <Link to={`/blog/${postId}`}>
      Post 123
    </Link>
  );
}

```

위와 같이 사용했었습니다.

**장점**

이미 URL에 있는 매개변수를 다른 경로에 대해 유지해야 할 때 유용합니다. 현재 Path Params를 인자로 받기 때문에 필요한 대로 수정하고 최종 path Params을 반환할 수 있기 때문입니다.

## Search Params

기존 Search Param API 들은 아래의 것들을 고려했다
- Search Param은 언제나 Strings
- `URLSearchParams`를 사용하여 직렬화 및 역직렬화 하는 것만으로도 충분하다!

> 직렬화 , 역직렬화
>
> 객체 데이터를 통신하기 쉬운 포멧(Byte,CSV,Json..) 형태로 만들어주는 작업을 직렬화라고 볼 수 있고, 역으로, 포멧(Byte,CSV,Json..) 형태에서 객체로 변환하는 과정을 역직렬화

하지만 현실은 다르다고 합니다! (공식문서 피셜)

- Search Params는 애플리케이션 상태를 나타내므로 필연적으로 다른 상태 관리자와 연관된 동일한 DX를 가질 것으로 예상됩니다. 중첩 배열 및 객체와 같은 복잡한 데이터 구조를 효율적으로 저장하고 조작하는 기능이 있음을 의미합니다.

- 불변성 및 구조적 공유, 문자열화 했기 때문에 참조 무결성과 개체 ID가 손실될 수 있다고 합니다.
- Search Params는 URL의 중요한 부분이지만 URL의 경로이름과 관계없이 자주 변경됩니다.

**사용자 측면에서 필요한 것**
- 링크가 복사되었을 때의 상태를 정확하게 볼 수 있도록 해야합니다.
- 상태를 잃지 않고 앱을 새로고침하거나 앞/뒤 이동할 수 있도록 해야합니다.

**개발자 측면에서 필요한 것**
- 다른 상태 관리자와 동일한 훌륭한 DX를 상요하여 URL에서 상태를 추가,제거 또는 수정합니다.
- 애플리케이션에서 사용하기에 안전한 형식과 유형으로 URL에서 나오는 Search Params를 쉽게 검증할 수 있습니다.
- 기존 직렬화 형식에 대해 걱정할 필요 없이 Search Params를 읽고 씁니다.

### JSON-first Search Params

URL의 검색 문자열을 구조화된 JSON으로 자동 변환하는 강력한 Search Param Parser 입니다.

다음 경로로 이동시,

```tsx
const link = (
  <Link
    to="/shop"
    search={{
      pageIndex: 3,
      includeCategories: ['electronics', 'gifts'],
      sortBy: 'price',
      desc: true,
    }}
  />
)
```

다음 URL이 생성됩니다.

```
/shop?pageIndex=3&includeCategories=%5B%22electronics%22%2C%22gifts%22%5D&sortBy=price&desc=true
```
이 URL이 구문 분석되면 Search Params가 다음 JSON으로 정확하게 다시 변환됩니다.

```tsx
{
  "pageIndex": 3,
  "includeCategories": ["electronics", "gifts"],
  "sortBy": "price",
  "desc": true
}

```

### 유효성 검사 + Typescipt 입력!

Tanstack Router는 Search Params를 사용하기 전에 애플리케이션이 신뢰할 수 있는 형식인지, 유효성을 검사합니다.

```tsx
// /routes/shop.products.tsx

type ProductSearchSortOptions = 'newest' | 'oldest' | 'price'

type ProductSearch = {
  page: number
  filter: string
  sort: ProductSearchSortOptions
}

export const Route = createFileRoute('/shop/products')({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    // validate and parse the search params into a typed state
    return {
      page: Number(search?.page ?? 1),
      filter: (search.filter as string) || '',
      sort: (search.sort as ProductSearchSortOptions) || 'newest',
    }
  },
})

```
모든 `ProdusctsRoute` 의 Search Params 를 검증하고 입력된 `ProductSearch`를 반환합니다.

### Search Params 검증

`validateSearch` 옵션은 JSON으로 파싱된 Search Params 를 `Record<string,unknown>`으로 제공합니다 그리고 나서 선택한 유형의 개체를 반환하는 함수입니다.

```tsx
// /routes/shop.products.tsx

type ProductSearchSortOptions = 'newest' | 'oldest' | 'price'

type ProductSearch = {
  page: number
  filter: string
  sort: ProductSearchSortOptions
}

export const Route = createFileRoute('/shop/products')({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    // validate and parse the search params into a typed state
    return {
      page: Number(search?.page ?? 1),
      filter: (search.filter as string) || '',
      sort: (search.sort as ProductSearchSortOptions) || 'newest',
    }
  },
})

```

### SearchParams 읽기

**Search Params는 상위 경로에서 상속됩니다.**

shop.product.tsx
```tsx
const productSearchSchema = z.object({
  page: z.number().catch(1),
  filter: z.string().catch(''),
  sort: z.enum(['newest', 'oldest', 'price']).catch('newest'),
})

type ProductSearch = z.infer<typeof productSearchSchema>

export const Route = createFileRoute('/shop/products')({
  validateSearch: productSearchSchema,
})

```
shop.product.$productId.tsx
```tsx
export const Route = createFileRoute('/shop/products/$productId')({
  beforeLoad: ({ search }) => {
    search
    // ^? ProductSearch ✅
  },
})
```

### 컴포넌트에서 Search Params

검증된 Search Params에 `useSearch` 훅을 이용해서 component에서도 접근할 수 있습니다.

```tsx
// /routes/shop.products.tsx

export const Route = createFileRoute('/shop/products')({
  validateSearch: productSearchSchema,
})

const ProductList = () => {
  const { page, filter, sort } = Route.useSearch()

  return <div>...</div>
}

```

### Search Params 쓰기

### `<Link search/>`
`<Link />` 컴포넌트에서 `search` prop을 사용하는 것이 Search Params을 업데이트하는 가장 좋은 방법입니다.

```tsx
// /routes/shop.products.tsx
export const Route = createFileRoute('/shop/products')({
  validateSearch: productSearchSchema,
})

const ProductList = () => {
  return (
    <div>
      <Link
        from={allProductsRoute.fullPath}
        search={(prev) => ({ page: prev.page + 1 })}
      >
        Next Page
      </Link>
    </div>
  )
}

```

### `useNavigate(), navigate({search})`

`navigate` 함수 또한 `search` 옵션을 허용하고 있습니다.

```tsx
// /routes/shop.products.tsx
export const Route = createFileRoute('/shop/products/$productId')({
  validateSearch: productSearchSchema,
})

const ProductList = () => {
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <div>
      <button
        onClick={() => {
          navigate({
            search: (prev) => ({ page: prev.page + 1 }),
          })
        }}
      >
        Next Page
      </button>
    </div>
  )
}

```

#### 참고
[Tanstack Router 공식문서](https://tanstack.com/router/latest)
[지연 로딩](https://developer.mozilla.org/ko/docs/Web/Performance/Lazy_loading)
[Is Tanstack Router Better Than React-Router?](https://www.youtube.com/watch?v=qOwnQJOClrw)
[JAVA 직렬화(Serialization)과 역직렬화(Deserialization)](https://inkyu-yoon.github.io/docs/Language/Java/Serialization)
