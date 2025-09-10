> 코드 예제 : https://stackblitz.com/edit/react-ts-ojfewg57?file=App.tsx
> 

리액트에서 1초마다 증가하는 카운터를 구현한다면 어떻게 해야 할까?

맨 처음에는 다음과 같이 구상했다.

## Case 1 : useEffect 안에 count+1 사용하기

```jsx
import * as React from 'react';

export default function Case1() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setInterval(() => setCount(count + 1), 1000);
  }, []);

  return <>{count}</>;
}
```

이렇게 할 경우, useEffect 내부 로직이 돌아가는 시점의 count가 0으로 고정되어 있어 값이 0에서 변경되지 않는다.

이를 해결하기 위해 다음과 같이 setCount에 [업데이터 함수](https://ko.react.dev/reference/react/useState#updating-state-based-on-the-previous-state)를 전달할 수 있다.

## Case 2 : setCount에 업데이터 함수 사용하기

```jsx
import * as React from 'react';

export default function Case2() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setInterval(() => setCount((cnt) => cnt + 1), 1000);
  }, []);

  return <>{count}</>;
}
```

이렇게 할 경우, count 값이 변경되긴 하지만 2씩 증가하는 것을 볼 수 있다.

이는 React가 개발환경에서 Strict Mode가 활성화됐을 때 useEffect 내의 설정 함수와 정리 함수를 두 번씩 실행하는 구현 원리 때문인데,

이렇게 Effect를 두 번씩 실행하는 이유는 이펙트 내의 로직이 올바르게 구현되었는지 확인하기 위한 스트레스 테스트로, 일반적으로는 Effect 내부 로직이 한 번 실행되든 두 번 실행되든 같은 결과를 가져야 한다.

일반적으로 이렇게 결과가 다르게 적용될 경우, [클린업 함수](https://ko.react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)를 추가하지 않아서 생긴 문제일 확률이 크다.

setInterval은 clearInterval이 호출되어야 스케줄링이 취소되므로, Effect의 정리 함수에 clearInterval을 추가해서 설정-정리 로직이 짝을 이루도록 수정할 수 있다.

setInterval을 호출할 때 반환되는 타이머 식별자를 clearInterval에 넘겨서 스케줄링을 취소할 수 있다.

## Case 3 : clearInterval 추가하기

```jsx
import * as React from 'react';

export default function Case3() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setCount((cnt) => cnt + 1), 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return <>{count}</>;
}
```

clearInterval 정리 함수를 추가해주니 정상적으로 count가 1씩 증가하는 모습을 볼 수 있다.

이런 식으로 구현하면 간단한 setInterval은 문제 없이 사용 가능하다.

## Case 4 : useEffect에 디펜던시 주기

위 Case 3의 단점은 setInterval 로직에 영향을 주는 값을 전부 useEffect의 디펜던시에 넣어줘야 한다는 것이다.

그렇게 할 경우, 디펜던시 값이 변경될 때마다 setInterval이 해제되고 재설정되는데, 이는 때로 불필요할 수 있다. 가령 setInterval 내의 콜백에서 외부 값을 참조하는 경우가 있을 수 있는데, 이 값을 dependency에 넣을 경우 값이 변경될 때마다 해제-재설정이 이루어져 값이 빠르게 변경될 경우 원하는 대로 동작하지 않을 수 있다.

예시로 텍스트를 입력하면 카운트가 돌아가고, 텍스트가 비어 있으면 카운터가 돌지 않는 예제를 만들어 보았다.

```jsx
import * as React from 'react';

export default function Case4() {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    let id;
    if (text) {
      id = setInterval(() => setCount((cnt) => cnt + 1), 1000);
    }
    return () => {
      clearInterval(id);
    };
  }, [text]);

  return (
    <>
      <div>
        <label>텍스트를 입력하면 카운트가 돌아갑니다.</label>
        <input value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <span>{count}</span>
    </>
  );
}
```

이 경우, 텍스트가 입력될 때마다 Interval 재설정 로직이 돌면서 텍스트를 빠르게 입력하면 카운트가 계속 돌지 않는 모습을 보인다.

### Case 5 : Ref 활용하기

이 문제를 해결할 수 있는 이상적인 setInterval 사용법을 Dan Abramov 님이 정리해둔 블로그 글이 있다.

https://overreacted.io/making-setinterval-declarative-with-react-hooks/

(번역 : [https://velog.io/@jakeseo_me/번역-리액트-훅스-컴포넌트에서-setInterval-사용-시의-문제점](https://velog.io/@jakeseo_me/%EB%B2%88%EC%97%AD-%EB%A6%AC%EC%95%A1%ED%8A%B8-%ED%9B%85%EC%8A%A4-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EC%97%90%EC%84%9C-setInterval-%EC%82%AC%EC%9A%A9-%EC%8B%9C%EC%9D%98-%EB%AC%B8%EC%A0%9C%EC%A0%90))

리액트 컴포넌트는 props와 state가 변하면 리렌더링함으로써 변경을 허용하지만, setInterval()은 한번 선언되면 아예 새로 교체하지 않는 이상 어떠한 것도 변경할 수 없는 API이므로 리액트 모델과 불일치한다.

따라서 interval을 변경하는 대신, 변경 가능한 interval callback을 가리키는 savedCallback 변수를 도입하고 이를 interval에 전달하는 것이 해결책이다.

이 savedCallback은 재렌더링하는 동안에도 잘 보호되어야 하므로, ref()를 활용한다.(ref를 활용하면 렌더 사이에서 공유되는 변환 가능한 오브젝트를 사용할 수 있다.)

이러한 개념을 바탕으로 Case 4를 문제를 해결한 Case 5 코드는 다음과 같다.

```jsx
import * as React from 'react';

export default function Case5() {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState('');
  const savedCallback = React.useRef();

  function callback() {
    if (text) {
      setCount(count + 1);
    }
  }

  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div>
        <label>텍스트를 입력하면 카운트가 돌아갑니다.</label>
        <input value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <span>{count}</span>
    </>
  );
}
```

text가 빈 값이 아닐 때에만 setCount가 되도록 결정하는 로직을 useEffect 바깥의 callback 변수로 뺐고, 이 callback은 첫 번째 useEffect()를 통해 리렌더링이 될 때마다 savedCallback.current에 할당되도록 했다.

setInterval()의 콜백 함수에서는 savedCallback.current()가 전달되도록 했으며, 이 때 tick()으로 한 번 묶어서 함수가 호출되는 시점의 동적인 savedCallback 값이 전달될 수 있도록 했다.

이렇게 바꾸면 텍스트 입력이 계속되어도 카운트가 문제없이 돌아가며, 텍스트 값 또한 잘 참조하는 것을 확인할 수 있다.

# 출처

https://ko.javascript.info/settimeout-setinterval

https://ko.react.dev/reference/react/useEffect

https://overreacted.io/making-setinterval-declarative-with-react-hooks/

[https://velog.io/@jakeseo_me/번역-리액트-훅스-컴포넌트에서-setInterval-사용-시의-문제점](https://velog.io/@jakeseo_me/%EB%B2%88%EC%97%AD-%EB%A6%AC%EC%95%A1%ED%8A%B8-%ED%9B%85%EC%8A%A4-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EC%97%90%EC%84%9C-setInterval-%EC%82%AC%EC%9A%A9-%EC%8B%9C%EC%9D%98-%EB%AC%B8%EC%A0%9C%EC%A0%90)
