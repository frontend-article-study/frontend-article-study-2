리액트의 랜더링이 일어나는 이유중 하나는 props의 동등 비교에 따른 결과입니다.

props의 동등비교는 객체의 **얕은 비교**를 기반으로 이뤄지는데

이 얕은 비교가 리액트에서 어떻게 이루어지는지 알아보겠습니다.

# JavaScript의 값의 비교

자바스크립트에서 값의 비교는 값의 타입에 따라 다르게 이루어집니다.

```tsx
let val1 = 'react'
let val2 = val1
let val3 = 'react'

console.log(val1 === val2) // true
console.log(val1 === val3) // true
```

원시타입은 값이 저장됩니다.

**값을 비교**하기 때문에 값을 전달하는 방식이 아닌 각각 선언하는 방식으로도 동일한 결과가 나옵니다.

```tsx
let obj1 = {
	key: 'react'
}

let obj2 = {
	key: 'react'
}

let obj3 = obj1

console.log(obj1 === obj2) //false
console.log(obj1.key === obj2.key) //true
console.log(obj1 === obj3) // true
```

객체타입은 저장된 참조값이 저장됩니다.

값을 복사할 때도 값이 아닌 참조를 전달하게 됩니다.

# Object.is

ES6에서 새로 도입된 비교 문법으로 일치 비교 (===)가 가지는 한계를 극복하기 위해서 만들어졌습니다.

```tsx
-0 === +0 // true
Object.is(-0, +0) // false

Number.NaN === NaN // false
Object.is(Number.NaN, NaN) //true

NaN === 0/0 // false
Object.is(NaN, 0/0) // true
```

하지만 객체간의 비교는 여전히 일치 비교(===)와 같은 동작을 합니다.

```tsx
Object.is({},{}) // false

const obj1 = {
	key: 'react',
}

const obj2 = obj1

Object.is(obj1, obj2) //true
obj1 === obj2 //true
```

# 리액트에서 동등비교

리액트에서는 동등비교(==)나 일치 비교(===)가 아닌 `Object.is`로 비교합니다.

`Object.is`는 **ES6**문법이기 때문에 리액트에서는 이를 구현한 **폴리필**을 함께 사용합니다.

> **폴리필**
웹 개발에서 특정 기능이나 API를 지원하지 않는 구형 브라우저에 대응하기 위해 사용되는 코드 조각
> 

```tsx
function is(x: any, y:any){
	return(
		(x === y && (x!==0 || 1/x === 1/y)) || (x !== x && y !== y)
	)
}

// 런타임에서 Object.is가 존재하면 그것을 사용하고 아니라면 위 함수를 사용합니다.
const objectIs: (x: any, y:any) => boolean =
	typeof Object.is === 'function' ? Object.is : is

export default objectIs
```

리액트에서는 `ObjectIs`를 바탕으로 동등비교를 하는 `shallowEqual` 이라는 함수를 만들어 사용합니다.

`shallowEqual`은 의존성 비교 등 리액트의 **동등 비교**가 필요할 때 사용됩니다.

```tsx
import is from './objectIs';

// Object.prototype.hasOwnProperty
// 객체에 특정 프로퍼티가 있는지 확인하는 메서드
import hasOwnProperty from './hasOwnProperty';

// 주어진 객체의 키를 순회하면서 두 값이 엄격한 동등성을 가지는지 확인하고
// 다른 값이 있다면 false를 반환합니다.
// 모든 키의 값이 동일하다면 true를 반환합니다.
function shallowEqual(objA: mixed, objB: mixed): boolean {
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

// 각 키의 배열을 꺼내서 
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

// 배열의 길이가 다르면 false
  if (keysA.length !== keysB.length) {
    return false;
  }

// A의 키를 기준으로, B에 같은 키가 있는지, 값이 같은지 확인합니다.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

export default shallowEqual;
```

리액트에서는 `Object.is`로 먼저 같은 참조값을 가지는지 확인한 후

`Object.is`가 수행하지 못하는 **얕은 비교**를 한번 더 수행합니다.

얕은 비교란 객체의 **첫 번째 깊이에 존재하는 값만 비교**한다는 것을 의미합니다.

리액트가 얕은 비교까지만 구현한 이유는 무엇일까요?

JSX props는 객체이고 여기에 있는 props만 일차적으로 비교하면 되기 때문입니다.

기본적으로 리액트는 props에서 꺼내온 값을 기준으로 렌더링을 수행하기 때문에

**일반적 케이스**에서는 얕은 비교로 충분합니다.

# 깊은 비교 문제

```tsx
import { React, memo, useEffect, useState } from "react";

const Component = memo((props) => {
  useEffect(() => {
    console.log("Component has been rendered!");
  });

  return <h1>{props.counter}</h1>;
});

const DeeperComponent = memo((props) => {
  useEffect(() => {
    console.log("DeeperComponent has been rerendered!");
  });

  return <h1>{props.counter.counter}</h1>;
});

export default function App() {
  const [, setCounter] = useState(0);

  function handleClick() {
    setCounter((prev) => prev + 1);
  }

  return (
    <div>
      <Component counter={100} /> // props가 원시타입
      <DeeperComponent counter={{ counter: 100 }} /> // props가 객체타입
      <button onClick={handleClick}>+</button>
    </div>
  );
}

{counter:{counter:100}}
```

![](./asset/Feb-21-2024%2013-01-31.gif)

# useMemo로 리랜더링 방지하기

```tsx
export default function App() {
  const [, setCounter] = useState(0);

  function handleClick() {
    setCounter((prev) => prev + 1);
  }

 // useMemo로 객체 참조값 메모이제이션
  const memoizedObject = useMemo(() => ({ counter: 100 }), []);

  return (
    <div>
      <Component counter={100} />
      <DeeperComponent counter={memoizedObject} />
      <button onClick={handleClick}>+</button>
    </div>
  );
}
```

![](./asset//Feb-21-2024%2015-16-24.gif)

# Ref

책) 모던 리액트 딥다이브