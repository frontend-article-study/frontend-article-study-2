모달창을 만들기위해서 createPortal을 쓸까 Context API를 쓸까 하던중... 

Next의 **parallel / intercepting routes** 방식을 이용하면 모달창을 구현할 수 있다는 것을 알게 되었습니다!

같이 구현해봅시다.

## parellel routes?

병렬 라우팅은 상황,조건에 따라 하나 혹은 그 이상의 페이지들을 같은 레이아웃 내에서 보여줄 수 있도록 해줍니다. 대시보드와 소셜사이트의 피드와 같은, 앱에서 섹션을 구현할 때 용이합니다.

![](https://velog.velcdn.com/images/hyeonzii/post/40524cf2-257a-4210-97f5-1833ea2014f5/image.png)


## intercepting routes? 

라우트 가로채기는 현재 레이아웃 내에서 애플리케이션의 다른 부분을 로드할 수 있게 됩니다. 이 라우팅 패러다임은, 다른 컨텍스트로 변경하지 않으면서, 라우트의 내용을 보여주길 원할 때 용이합니다.

예시로, 피드에 있는 그림을 클릭했을 때 사진이 모달로 뜨게 하는 경우에 용이합니다.

![](https://velog.velcdn.com/images/hyeonzii/post/6d658222-17da-4f1e-b832-722211594ca1/image.png)

폴더명에 `(.)` 을 붙이면 동작합니다.

- `(.)` 같은 레벨에 매칭
- `(..)` 한 단계 위에 매칭
- `(..)(..)` 두 단계 위에 매칭
- `(...)` root `app` 디렉토리에 매칭

## 모달을 만들어봅시다!

저의 경우 커스텀이 가능한 모달을 만들고 싶었습니다.

**프로젝트 환경**
```
Next
App router
Typescript
Tailwind CSS
```

**플로우**

매칭페이지 접속 -> 방만들기 버튼 클릭 -> 모달창 오픈 -> 모달창 닫기 버튼 클릭 -> 모달창 닫힘 -> 매칭페이지 보임

### 모달 ui 작성

**/components/ui/modal.tsx**

```js
import Link from 'next/link'

export function Modal({ children, backLink }: { children: React.ReactNode; backLink: string }) {
  return (
    <div className="bg-black-rgba flex items-center justify-center w-full h-dvh fixed top-0 right-0 left-0">
      <div className="flex flex-col w-80 h-fit bg-white rounded-2xl p-4">
        <Link href={backLink}>Close</Link>
        <div>{children}</div>
      </div>
    </div>
  )
}
```

커스텀 모달창을 만들고 싶었기 때문에 children을 prop으로 받는 형태로 작성했습니다.

추가적으로, 페이지마다 뒤로가는 페이지가 달라 backLink를 prop으로 받았습니다.

### 모달 여는 로직 작성

우선 루트 레이아웃을 재설정 해줍니다.

**layout.tsx**

```tsx
export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {modal}
      </body>
    </html>
  )
}
```

디렉토리를 아래와 같이 작성합니다.

![](https://velog.velcdn.com/images/hyeonzii/post/e5e44af1-8cda-48c8-b6d6-ee9d3f2fe69f/image.png)

matching 페이지에서 
방만들기 버튼을 클릭하면 create 페이지로 넘어가도록,
test 버튼을 클릭하면 test 페이지로 넘어가도록 구현했습니다.

```ts
(...생략)
  <Button variant="primary" type="submit" className="h-12">
              <Link href="/matching/create">모집하기</Link>
            </Button>
            <Button variant="primary" type="submit" className="h-12">
              <Link href="/matching/test">test</Link>
            </Button>
(...생략)
```

아래 페이지들은 해당 주소를 새로고침 했을 시 뜨게 되는 화면입니다.
(즉, 가로치기 라우팅이 발생하지 않았을 때 떠야할 화면을 아래에 작성하게 됩니다.)

**matching/create/page.tsx**
```ts
import React from 'react'
import WriteForm from '@/components/feature/matching/WriteForm'

export default function write() {
  return <WriteForm />
}
```

**matching/test/page.tsx**

_(커스텀 여부 확인용이라 별 다른 내용은 작성하지 않았습니다.)_

```ts
import React from 'react'

export default function test() {
  return <div>test</div>
}

```

### 모달을 위한 폴더 생성

이제 가로채기 라우팅을 진행할 페이지들을 작성해줍니다.

![](https://velog.velcdn.com/images/hyeonzii/post/172a7873-e0c5-4a2f-b378-f5d8369e4ea6/image.png)

**@modal/(.)matching/create/page.tsx**
```ts
import React from 'react'
import { Modal } from '@/components/ui/modal'
import WriteForm from '@/components/feature/matching/WriteForm'

export default function Page() {
  return (
    <Modal backLink="/matching">
      <WriteForm />
    </Modal>
  )
}
```

**@modal/(.)matching/test/page.tsx**
```ts
import React from 'react'
import { Modal } from '@/components/ui/modal'

export default function Page() {
  return (
    <Modal backLink="/matching">
      <>테스트</>
    </Modal>
  )
}
```

`@modal`내에 `default.tsx` 파일을 작성해줍니다.
이유는, 모달이 활성화 되지 않았을 때 렌더링 하지 않도록 해줍니다.

> defualt.tsx 는 병렬 라우트의 경우가 필요없을 때 또는 기본값일 때 사용하게 됩니다.
> **루트 레이아웃**
> /일 때는 modal -> @/modal/(.matching)/default.tsx 이고
>
> **매칭 레이아웃**
> /matching/create 일 때는
> modal -> @/modal/(.matching)/create/page.tsx 가 됩니다.

**@modal/(.)matching/default.tsx**

```tsx
export default function Default() {
  return null
}
```

`@modal`을 더이상 렌더링하지 않기 위해서 `Link` 컴포넌트를 사용할 때, 우리는 catch-all 라우트를 이용해서 null을 반환합니다.

> Next.js의 동적 라우팅에서 `...` 점 세개를 사용해서 모든 path를 잡을 수 있습니다.
> `pages/post/[...slug].js` 라는 파일은 `post/a` 라는 url path와 매칭됩니다. 뒤에 추가로 붙는 path도 잡을 수 있게 됩니다.

**@modal/(.)matching/[...catchAll]/page.tsx**

```tsx
export default function CatchAll() {
  return null
}
```

## 결과
![](https://velog.velcdn.com/images/hyeonzii/post/46a650cd-c0ab-444d-9776-757ea1bb588a/image.gif)

모집하기와 test 각각 다른 모달창이 뜨는 것을 확인할 수 있습니다.

![](https://velog.velcdn.com/images/hyeonzii/post/ed2fd479-6562-4b8a-ae11-bf37c49da049/image.gif)

해당 모달창들의 주소를 새로고침 할 경우 **intercepting routes** 가 적용되지 않은 원래 렌더링되어야 할 페이지가 보이게 됩니다.

### 참고블로그

[Next 공식문서](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#opening-the-modal)
[Next.js13 Parallel/Intercepting Routes](https://velog.io/@jay/Parallel-Routes)
[Next.js 14 Tutorial - 32 - Parallel Intercepting Routes](https://www.youtube.com/watch?v=mVOvx9eVHg0)
[[Next.js] 동적 라우팅(Catch all routes)](https://velog.io/@fkszm3/Next.js-%EB%8F%99%EC%A0%81-%EB%9D%BC%EC%9A%B0%ED%8C%85Catch-all-routes)
[next.js default.tsx, 인터셉팅 라우트](https://velog.io/@tkrhdrhkdduf/next.js-default.tsx-%EC%9D%B8%ED%84%B0%EC%85%89%ED%8C%85-%EB%9D%BC%EC%9A%B0%ED%8A%B8)