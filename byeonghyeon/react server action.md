# React Server Action

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
  const create = async (formData: FormData) => {
    "use server";
    // ...
  };

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
- function, Map, Set, Date, undefined, Symbol → 불가

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

- Server Action의 인자와 반환값은 모두 직렬화 가능한 값만 허용
  
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
- 같은 코드가 JS 지원 여부에 따라 동작 방식이 달라짐
- JS가 로드되기 전에는 HTML 기본 동작으로 서버에 요청
- JS가 로드되면 자동으로 fetch 기반의 비동기 처리

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
- 브라우저가 기본 HTML 폼 제출 방식으로 POST 요청 전송
- Next.js 서버에서 Server Action 실행
- redirect('/thanks') 응답 → 브라우저 전체 페이지 이동
  => JS 없이도 작동하지만, 전체 새로고침이 발생

#### JS 로드 이후의 흐름

- `<form action={submit}>`을 Next.js가 감지 → 내부적으로 fetch()로 전환
- 클라이언트에서 비동기 요청으로 Server Action 실행
- redirect('/thanks') → Next.js가 내부적으로 router.push('/thanks') 호출
- 브라우저는 새로고침 없이 자연스럽게 페이지 전환
  => 클라이언트 상태, 서버 캐시 유지

### 클라이언트 부담 최소화 & 서버 주도 처리

- JS 번들 제외: Server Action은 클라이언트 번들에 포함되지 않아 초기 로딩 속도 개선
- 폼 처리 단순화: `<form action={serverAction}>`만으로 요청 가능, 클라이언트 로직 불필요
- 보안 강화: 인증/권한 검증 등 민감한 로직을 서버에서 직접 처리


## hooks

### useActionState
- 액션 실행 + 상태 관리 + 제출 상태 확인
- state: 서버 응답 결과 (예: 성공/실패 메시지)
- formAction: `<form action={...}>`에 연결할 함수
- isPending: 제출 중 여부 (로딩 상태)

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
      <input name="email" required />
      <button disabled={isPending}>Sign up</button>
      <p>{state.message}</p>
    </form>
  );
}
```

### useFormState
- 액션 실행 + 상태 관리

```javascript
"use client";

import { useFormState } from "react";
import { createUser } from "@/app/actions";

const initialState = { message: "" };

export default function SignupForm() {
  const [state, formAction] = useFormState(createUser, initialState);

  return (
    <form action={formAction}>
      <input name="email" required />
      <button type="submit">Sign up</button>
      <p>{state.message}</p>
    </form>
  );
}
```

### useFormStatus
- 제출 상태 확인

```javascript
// SignupForm.tsx
"use client";
export default function SignupForm(){
  const [state, formAction] = useFormState(createUser, initialState);

  return (
    <form action={formAction}>
      <input name="email" />
      <SubmitButton />
    </form>)
}

// SubmitButton.tsx
"use client";
import { useFormStatus } from "react";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
}
```

#### reference

- https://nextjs-ko.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- https://nextjs.org/docs/app/getting-started/updating-data
- https://ko.react.dev/reference/rsc/server-functions
- https://lurgi.github.io/Development/Exploring-Nextjs-Server-Action-and-React-useActionState
- https://velog.io/@kcj_dev96/Server-Action
