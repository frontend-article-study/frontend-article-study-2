
## use ?

`use`는 **Promise**나 **context**와 같은 자원의 값을 읽을 수 있도록 해주는 Hook 입니다.

```jsx
import { use } from 'react';

function MessageComponent({messagePromise}) {
	const message = use(messagePromise);
  	const theme = use(ThemeContext)
}
```

다른 리액트 훅들과 다르게, `use`는 반복문과 `if`문과 같은 조건문에서 호출이 가능합니다.

Promise와 함께 호출할 경우, `use`훅은 `Suspense`와 `error boundaries`와 통합됩니다. (아래에 예시가 있습니다.)

### 파라미터

- `resource` : 읽으려고 하는 값, **Promise**혹은 **context** 입니다.

### 반환값

**Promise**혹은 **context** 로 부터 resolved 된 값과 같은, 자원으로부터 나온 값을 반환합니다.

## 사용 예시

**context**가 `use`에 전달될 때, `useContext`와 비슷하게 작동합니다. `useContext`는 반드시 컴포넌트의 상단에서 호출되어져야 했습니다.

하지만, `use`는 `if`와 같은 조건문이나 `for`와 같은 반복문 내에서도 호출 가능 합니다! `use`는 `useContext` 보다 더 유연성을 가지게 됩니다.

```jsx
import { use } from 'react';

function Button() {
  const theme = use(ThemeContext);
  // ...
```

`Button`에 context를 전달하기 위해서, Button 혹은 context provider와 관련된 부모 컴포넌트 중 하나를 감싸줍니다.

```jsx
function MyPage() {
  return (
    <ThemeContext.Provider value="dark">
      <Form />
    </ThemeContext.Provider>
  );
}

function Form() {
  // ... renders buttons inside ...
}
```

이제, `Button`과 provider에 얼마나 많은 층이 존재하냐는 중요하지 않습니다. `Button`이 `Form`에 어딘가에 위치하기만 한다면 `use(ThemeContext)`를 호출할 수 있습니다, "dark"라는 값을 받게 될 것 입니다.

```jsx
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <hr className={theme} />;
  }
  return false;
}
```
`use`는 `if`문 내에서도 호출되어집니다. 조건에 따라서 Context의 값을 읽도록 할 수 있습니다.

!codesandbox[68ryxj?view=Editor+%2B+Preview&module=%2Fsrc%2FApp.js]

## 서버에서 클라이언트로 데이터 스트리밍

서버 컴포넌트 클라이언트 컴포넌트  Promise를 prop으로 전달하여 데이터를 서버에서 클라언트로 스트리밍 할 수 있습니다.

```jsx
import { fetchMessage } from './lib.js';
import { Message } from './message.js';

export default function App() {
  const messagePromise = fetchMessage();
  return (
    <Suspense fallback={<p>waiting for message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

클라이언트 컴포넌트는 prop으로 받아진 Promise를 가지고 `use`에 전달하게 됩니다. 이것은 클라이언트 컴포넌트가 서버 컴포넌트에서 최초로 생겨난 Promise의 값을 읽을 수 있도록 해줍니다.

```jsx
// message.js
'use client';

import { use } from 'react';

export function Message({ messagePromise }) {
  const messageContent = use(messagePromise);
  return <p>Here is the message: {messageContent}</p>;
}
```

**Message**는 **Suspense**로 감싸져 있기 때문에, fallback은 Promise가 resolve 될 때까지 보여질 것 입니다. Promise가 resolve 될 때, 값은 `use` 훅으로 읽어질 것 이고 **Message** 컴포넌트는 Suspense fallback에 대체될 것 입니다.

**message.js**

!codesandbox[8dg646?view=Editor+%2B+Preview&module=%2Fsrc%2Fmessage.js]

### reject된 프로미스 관리

몇몇의 경우, `use`에 전달된 Promise는 reject될 수 있습니다. reject 된 프로미스는 아래와 같이 관리할 수 있습니다.

1. error boundary로 error를 보여준다.
2. `Promise.catch`로 대체값을 보여준다.

> `use`는 try-catch 블럭에서는 호출할 수 없습니다.

**error boundary**

`use` 훅을 사용하는 컴포넌트를 error boundary로 감싸주면 됩니다.

!codesandbox[dzl7jd?view=Editor+%2B+Preview&module=%2Fsrc%2Fmessage.js]

**Promise.catch**

Promise 객체에서 catch 메소드를 이용하면 됩니다.

```jsx
import { Message } from './message.js';

export default function App() {
  const messagePromise = new Promise((resolve, reject) => {
    reject();
  }).catch(() => {
    return "no new message found.";
  });

  return (
    <Suspense fallback={<p>waiting for message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

**참조**

[리액트 공식문서 use](https://react.dev/reference/react/use)