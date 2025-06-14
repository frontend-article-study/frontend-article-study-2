# React Sever Action

- React 19, Next.js 15에 도입
- 서버에서 실행되는 함수('use server' 지시어 사용)
- Client에서 API 라우팅 없이 직접 서버 함수 호출 가능
- 주로 form, data mutation에 사용

## 사용방법

### Server Component

- 컴포넌트 내부 함수로 사용 가능

```javascript
//server component
export default function Page() {
  async function create(formData: FormData) {
    "use server";
    // 서버 실행 로직
  }

  return <form action={create}>...</form>;
}
```

### Client Component

- 컴포넌트 내부 함수로 사용 불가
- 별도 정의 후 import

```javascript
// server action
"use server";
export async function create() {
  console.log("서버에서 실행 중!");
}

// cient component
"use client";
import { create } from "@/app/create";

export function CreateButton() {
  const handleClick = async () => {
    await create();
  };

  return <button onClick={handleClick}>Create</button>;
}
```

### Passing actions as props

```javascript
// server action
'use server'
export async function updateItem(formData: FormData) {
  // 서버 실행 로직
}

// server component
import ClientComponent from './ClientComponent'
import { updateItem } from './actions'

export default function Page() {
  return <ClientComponent updateItemAction={updateItem} />
}

// client component
'use client'
export default function ClientComponent({ updateItemAction }) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```

- 일반적으로 서버에서 클라이언트 컴포넌트로 함수를 전달하는 것은 불가능

#### 직렬화

- 데이터를 문자열 형태로 변환하여 네트워크를 통해 전송할 수 있도록 만드는 과정
- 서버 → 클라이언트로 전달되는 props는 반드시 직렬화 가능해야 함
- string, number, boolean, array, object(단순 객체) -> 가능
- function, Map, Set, Date, undefined, Symbol → ❌ 직렬화 불가

```javascript
// server component
import ClientComponent from "./ClientComponent";

function someFunction() {
  console.log("hello");
}

export default function Page() {
  return <ClientComponent fn={someFunction} />; // ❌
}
```

#### Server Action은 예외

- typescript: Next.js TS 플러그인은 props 이름이 Action 또는 action으로 끝나면, 이것이 Server Action일 것이라 추측
- 컴파일: 'use server'가 붙은 함수는 Next.js가 직렬화 가능한 참조 객체로 변환

```
{
  $$typeof: Symbol.for('react.server.reference'),
  $$id: 'app/actions:updateItem',
  $$bound: []
},
```

- 런타임: Next.js는 이 fn이 진짜 Server Action인지 확인함. 참조객체인가? ID가 유효한가?

```
❌ TypeError: Received function is not a server reference
```

- server action의 인자와 반환값도 직렬화가 가능해야 함 (객체로 변경 안해줌)

## 장점

### REST API의 번거로움

```javascript
// server api route
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { userId } = body;

  const user = await db.users.findOne({ id: userId });

  return NextResponse.json(user);
}

// client component
import axios from "axios";

async function fetchUser(userId) {
  const response = await axios.post("/api/user", { userId });
  return response.data;
}

export default function UserComponent() {
  const handleFetch = async () => {
    const user = await fetchUser("123");
  };

  return <button onClick={handleFetch}>Fetch User</button>;
}
```

### server action 사용

```javascript
// app/actions/fetchUser.js
"use server";

import db from "@/lib/db";

export async function fetchUser(userId) {
  const user = await db.users.findOne({ id: userId });
  return user;
}

// 클라이언트에서 호출
"use client";
import { fetchUser } from "./actions/fetchUser";

export default function UserComponent() {
  const handleFetch = async () => {
    const user = await fetchUser("123");
  };

  return <button onClick={handleFetch}>Fetch User</button>;
}
```

- API Route 없이 서버 로직을 함수 형태로 작성
- 클라이언트에서 직접 함수 호출 (fetch관련 설정 불필요)

### 점진적 향상 (progressive enhancement)

- JavaScript가 꺼져 있어도 기본 기능은 동작하고, JS가 로드되면 더 나은 UX로 향상되는 구조
- 동일한 코드가 JS 유무에 따라 자연스럽게 두 가지 방식으로 작동
- JS가 꺼져 있어도 브라우저 기본 <form> 동작으로 서버 요청 가능
- JS가 로드된 이후에는 자동으로 fetch 기반의 비동기 처리로 전환

#### client action

```javascript
"use client";

export default function FormWithEnhancements() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    await fetch("/api/submit", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <button>Submit</button>
    </form>
  );
}
```

- JS가 완전히 로드되어야 제출 가능, JS가 꺼지면 작동 ❌

#### server action

```javascript
// Server Component
export default function SignupPage() {
  async function submit(formData: FormData) {
    "use server";

    const name = formData.get("name");

    // 처리 완료 후 페이지 이동
    return redirect("/thanks");
  }

  return (
    <form action={submit}>
      <button type="submit">Sign up</button>
    </form>
  );
}
```

#### JS 미로드 상태에서의 흐름

- 사용자가 <form> 제출
- 브라우저가 기본 HTML submit 방식으로 POST 전송
- Next 서버에서 submit 함수 실행
- redirect('/thanks') 응답 → 브라우저가 해당 페이지로 전체 이동
  => JS가 없어도 작동, SPA처럼 부드러운 UX는 아님 (화면 전체 깜빡이며 이동)

#### JS 로드 이후의 흐름

- `<form>`의 action={submit}은 Next.js가 내부적으로 fetch()로 감지
- 클라이언트에서 자바스크립트 기반 비동기 요청으로 Server Action 호출
- redirect('/thanks') → Next가 내부적으로 router.push('/thanks') 실행
- 브라우저는 새로고침 없이 페이지 이동
  => 클라이언트 상태, 서버 캐시 유지

### 클라이언트 부담 최소화 & 서버 주도 처리

- JS 번들 제외: Server Action은 클라이언트 번들에 포함되지 않아 초기 로딩 속도 개선
- 폼 처리 단순화: `<form action={serverAction}>`만으로 요청 가능, 클라이언트 로직 불필요
- 보안 강화: 인증, 권한 체크 등 민감한 로직을 서버에서 처리

### 캐싱

- Next의 Data Cache는 서버 컴포넌트에서 fetch로 가져온 GET 요청 결과를 자동으로 캐싱
- DB 등 외부 데이터가 변경되더라도, Next.js는 캐시된 데이터만 사용 => 무효화 필요

#### revalidateTag

```javascript
// server component or server action
await fetch("https://api.example.com/data", {
  next: { tags: ["data"] }, // "data" 태그 부여
});

// server action
("use server");
import { revalidateTag } from "next/cache";

export async function updateData(name: string) {
  await fetch("https://api.example.com/data", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  });

  revalidateTag("data"); // 위 fetch에 부여된 태그 무효화
}
```

#### revalidatePath

```js
"use server";
import { revalidatePath } from "next/cache";

export async function createPost(data: any) {
  await fetch("/api/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });

  revalidatePath("/posts"); // `/posts` 경로 관련 캐시 무효화
}
```

#### revalidate: time

```js
await fetch("https://api.example.com/data", {
  next: { revalidate: 3600 }, // 1시간마다 재검증
});
```

#### cache: 'no-store'

```js
await fetch("https://api.example.com/data", {
  cache: "no-store",
});
```

## hooks

### useActionState

```javascript
"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions";

const initialState = { message: "" };

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState
  );

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Sign up"}
      </button>
      <p>{state.message}</p>
    </form>
  );
}
```

### useFormStatus

```javascript
"use client";

import { useFormStatus } from "react";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Sign up"}
    </button>
  );
}
```

### useOptimistic

```javascript
"use client";

import { useOptimistic } from "react";
import { incrementLike } from "./actions";

export default function LikeButton({ initialLikes }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (likes) => likes + 1
  );

  const handleClick = async () => {
    addOptimisticLike(); // UI에서 숫자 먼저 증가
    await incrementLike(); // 서버에 실제 증가 요청
  };

  return <button onClick={handleClick}>👍 Like ({optimisticLikes})</button>;
}
```

## server action을 항상 사용하는 것이 좋을까?

### 전체 네트워크 비용 증가

- 백엔드 서버가 별도로 존재한다면(이게 일반적) 네트워크 단계가 늘어남
- 클라이언트 직접 호출: client => backend server => client
- Server Action 사용 시: client => next server => backend server => next server => client

### 빈번한 Mutation의 경우

- 짧은 주기로 반복되는 요청(스크롤, 채팅 등)에는 서버 부하가 증가하고, 성능이 떨어질 수 있음 => React Query, SWR 등 클라이언트 캐시 기반 로직이 적절

#### reference

- https://nextjs-ko.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- https://nextjs.org/docs/app/getting-started/updating-data
- https://ko.react.dev/reference/rsc/server-functions
- https://lurgi.github.io/Development/Exploring-Nextjs-Server-Action-and-React-useActionState
- https://velog.io/@kcj_dev96/Server-Action
