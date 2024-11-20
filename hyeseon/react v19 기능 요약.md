# react 19 기능 요약

## React Compiler
>리액트의 재렌더링 비용을 최소화하기 위해서 개발되었습니다. <br/>
기존에 불필요한 렌더링을 줄이기 위해 메모이제이션(Memoization)을 위한 useCallback, useMemo, memo와 같은 것들을 사용해 왔지만, 너무 불필요하게 많이 쓰면 오히려 더 성능을 저하 시키는 경우도 발생했습니다.
이러한 문제를 리액트 컴파일러가 자동으로 리액트 코드를 최적화 시켜줍니다. 

<br>
<br>

## hook
* <a href='#use'>use(Promise), use(Context)</a>
* <a href='#useOptimistic'>useOptimistic()</a>
* <a href='#useActionState'>useActionState()</a>
* <a href='#useFormStatus'>useFormStatus()</a>


### <div id="use">use(Promise), use(Context)</div>
기존에 데이터 fetch를 위해 사용 했던 useEffect나 react context에 접근하기 위해 사용했던 useContext hook을 대체 할 수 있습니다.
<br>
데이터를 비동기적으로 호출 할 수 있도록 도와주는 hook 이며, 컴포넌트 내에서만 사용 가능하고 `조건부 내에서 호출` 될 수 있고, `블록 구문내에 존재`할 수도 있으며, 심지어 `루프 구문에서도 존재`할 수 있습니다.
<br>
use hook이 반환하는 값은 `요청에 대한 결과 데이터만 반환해서` error나 loading에 대해서는 반환하고 있지 않습니다. 따라서 Suspense와 ErrorBoundary로 감싸 주면 Promise가 해결 될 때까지 Suspense fallback이 표시되고 에러가 발생할 경우 ErrorBoundary fallback이 표시 됩니다.

```
// App.js
export default function App() {
  const promiseData = fetchPromiseData();
  return (
    <Suspense fallback={<h1>로딩중...</h1>}>
      <Test promiseData={promiseData} />
    </Suspense>
  );
}

// Test.js
import { use } from 'react';

export default function Test({ promiseData }) {
  const data = use(promiseData);
  return <h1>{data}</h1>;
}
```

```
const UserContext = createContext();

function User() {
  const user = use(UserContext);
  return <h1>안녕 {user.name}!</h1>;
}

function App() {
  return (
    <UserContext value={{ name: "Yongveloper" }}>
      <User />
    </UserContext>
  );
}
```
### <div id="useOptimistic">useOptimistic</div>
 비동기 작업이 진행 중일 때 다른 상태를 보여줄 수 있게 해줍니다. 인자로 주어진 일부 상태를 받아, 네트워크 요청과 같은 비동기 작업 기간 동안 달라질 수 있는 그 상태의 복사본을 반환합니다. 현재 상태와 작업의 입력을 취하는 함수를 제공하고, 작업이 대기 중일 때 사용할 낙관적인 상태를 반환합니다.
<br>
이 상태는 `낙관적` 상태라고 불리는데, 실제로 작업을 완료하는 데 시간이 걸리더라도 사용자에게 즉시 작업의 결과를 표시하기 위해 일반적으로 사용됩니다.

```
function ChatApp() {
  const [messages, setMessages] = useState([]);

  const [optimisticMessage, addOptimisticMessage] = useOptimistic(
    // 작업이 대기 중이지 않을 때 초기에 반환될 값
    messages,
    // 현재 상태와 addOptimisticMessage 전달된 낙관적인 값을 취하는 함수로, 결과적인 낙관적인 상태를 반환합니다. 순수 함수여야 합니다. updateFn은 두 개의 매개변수를 취합니다. currentState와 optimisticValue. 반환 값은 currentState와 optimisticValue의 병합된 값입니다.
    (state, newMessage) => [...state, { text: newMessage, sending: true }]
  );

  async function formAction(formData) {
    const message = formData.get('message');
    addOptimisticMessage(message);
    const createMessage = await createMessage(message);
    setMessages((messages) => [...messages, { text: createMessage }]);
  }
  //...
}
```


### <div id="useActionState">useActionState</div>
action 함수를 사용하여 새로운 상태를 설정 할 수 있습니다.
useActionState hook을 사용하여 더 편리하게 form을 처리 할 수 있습니다.

```
import { useActionState } from "react"; // not react-dom

function Form({ formAction }) {
  const [state, action, isPending] = useActionState(formAction);

  return (
    <form action={action}>
      <input type="email" name="email" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        Submit
      </button>
      {state.errorMessage && <p>{state.errorMessage}</p>}
    </form>
  );
}
```

### <div id="useFormStatus">useFormStatus</div>
useFormStatus 호출하여, 폼이 마지막으로 제출 됐을 때 액션의 반환값에 접근 할 수 있습니다. 
```
const { pending, data, method, action } = useFormStatus();
```

```
import { useFormStatus } from "react-dom";
import action from './actions';

function Submit() {
  const status = useFormStatus();
  return <button disabled={status.pending}>Submit</button>
}

export default function App() {
  return (
    <form action={action}>
      <Submit />
    </form>
  );
}
```

<br>
<br>

## form-action
`<form>,<input>,<button>` 요소에 action과 formAction 프로퍼티로 함수를 전달하는 기능이 추가되었습니다. <br>
서버, 클라이언트에서 실행 할 수 있습니다. 

```
'use client';

function App() {
  function formAction(formData) {
    alert('type:' + formData.get('name'));
  }

  return (
    <form action={formAction}>
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```




