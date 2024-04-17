# 고차컴포넌트(HOC, Higher Order Component)

고차 컴포넌트란 컴포넌트 자체의 로직을 재사용하기 위한 **리액트의 기술**입니다.

고차+로직 이라고하니 `고차 함수`와 비슷한 느낌이 드는데요,

고차 컴포넌트는 고차 함수의 일종으로 자바스크립트의 `일급 객체` 함수의 특징을 이용합니다.

<aside>
💡 일급객체
- 함수의 **매개변수**로 전달할 수 있고 **반환값**으로 사용할 수 있다.
- 변수나 자료구조에 저장할 수 있다.

</aside>

## React.memo

리액트에서 가장 유명한 고차 컴포넌트입니다.

props의 변화가 없음에도 컴포넌트의 리렌더링하는 경우를 방지하기 위한 API 입니다.

```jsx
import { memo, useState } from 'react';

export default function MyApp() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  return (
    <>
      <label>
        Name{': '}
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Address{': '}
        <input value={address} onChange={e => setAddress(e.target.value)} />
      </label>
      <Greeting name={name} />
    </>
  );
}

const Greeting = memo(function Greeting({ name }) {
  console.log("Greeting was rendered at", new Date().toLocaleTimeString());
  return <h3>Hello{name && ', '}{name}!</h3>;
});
```

컴포넌트를 값이라는 관점에서 memoization 한 컴포넌트를 반환함으로

비싼 연산을 저장하는 useMemo를 사용하게 된다면 어떻게 될까요?

useMemo는 값을 반환받기 때문에 JSX함수가 아닌 `{}` 를 사용한 할당식을 사용합니다.

필요에 따라 이런식으로 구현할 수 있지만 목적과 용도가 뚜렷한 `memo` 를 사용하는 것이 좋습니다.

## 고차 컴포넌트 만들어보기

```jsx
function withLoginComponent(HelloComponent){
	return function (props) {
		const { loginRequired, ...restProps } = props
		
		if(loginRequired) {
			return <>Login Please</>
		}
		
		return <HelloComponent {...(restProps)} />
	}
}

const HelloComponent = withLoginComponent((props) => {
	return <h3>{props.greeting}</h3>
})

export default function App() {
	const isLogin = true
	return <HelloComponent greeting="Hello!" loginRequired={isLogin} />
}
```

`Component` 는 평범한 컴포넌트지만 함수 자체를 `withLoginComponent` 라는 고차 컴포넌트로 감싸뒀습니다.

`withLoginComponent` 는 함수를 인수로 받으며 컴포넌트를 반환하는 고차 컴포넌트입니다.

props에 loginRequired가 있다면 넘겨받은 `Component` 를 반환하는 것이 아니라

“Login Please” 라는 결과를 반환하게 되어 있습니다.

### 주의할 점

- 사용자 정의 훅은 `use` 로 실행하지만 고차 컴포넌트는 `with` 으로 시작합니다.
- 부수 효과를 최소화해야합니다. 고차 컴포넌트는 반드시 컴포넌트를 인수로 받게 되는데 컴포넌트의 props가 임의로 변경된다면 고차 컴포넌트를 사용하는 쪽에서 예측하지 못하는 상황이 생길 수 있는 불편함이 생깁니다.
- 여러개의 고차 컴포넌트를 감쌀 경우 어떤 결과가 나올지 예측하기 어려우므로 최소화하는 것이 좋습니다.

## 사용자 정의 훅 vs 고차 컴포넌트

사용자 정의 훅과 고차 컴포넌트 모두 로직을 재사용할 수 있다는 특징이 있습니다.

언제 어떻게 둘 중 무엇을 사용해야할까요?

### 사용자 정의 훅

사용자 정의 훅 자체로는 렌더링에 영향을 미치지 못하기 때문에 사용이 제한적이므로 반환하는 값으로 무엇을 할지는 개발자에게 달려있습니다. 따라서 컴포넌트 내부에 미치는 영향을 최소화해 개발자가 원하는 훅을 원하는 방향으로만 사용할 수 있다는 장점이 있습니다.

```jsx
// 커스텀 훅
function HookComponent() {
	const { loggedIn } = useLogin()
	
  return (
      <div>
          {loggedIn ? (
              <p>로그인되었습니다.</p>
          ) : (
              <button onClick={login}>로그인</button>
          )}
      </div>
  );
}
```

반면에 고차 컴포넌트는 대부분 렌더링에 영향을 미치는 로직을 가지고 있으므로 사용자 정의 훅에 비해 예측하기가 어렵습니다.

### 고차 컴포넌트

로그인이나 에러 발생시 현재 컴포넌트를 감추고 다른 컴포넌트를 노출 할 때 사용할 수 있습니다.

```jsx
function HookComponent() {
	const { loggedIn } = useLogin()
	
	if(!loggedIn) {
		return <LoginComponent/>
	}
	
	return <>Hello!</>
}

function withLoginComponent(Component){
	return function (props) {
		const { loginRequired, ...restProps } = props
		
		if(loginRequired) {
			return <LoginComponent/>
		}
		
		return <HelloComponent {...(restProps)} />
	}
}

const HelloComponent = withLoginComponent((props) => {
	return <h3>{props.greeting}</h3>
})

export default function App() {
	const isLogin = true
	return <HelloComponent value="Hello!" loginRequired={isLogin} />
}
```

`loggedIn`이 `false`인 경우에 렌더링 해야하는 컴포넌트는 같지만

사용자 정의 훅은 해당 컴포넌트가 반환하는 렌더링 결과물에 까지 영향을 미치기는 어렵습니다.

함수 컴포넌트의 반환값인 렌더링의 결과물에도 영향을 미치는 공통로직이라면

고차 컴포넌트를 사용하는것이 좋습니다.

고차 컴포넌트는 이처럼 공통화된 렌더링 로직을 처리하기에 좋은 방법입니다.