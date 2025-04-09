# Index Signature

## Index Signature란

- 객체의 **동적 속성**을 정의하기 위한 문법
- 다음 3가지 의미를 가짐
  - `키의 이름`: 키의 위치 표시
  - `키의 타입`: string/number/symbol의 조합이어야 함. 일반적으로는 string
  - `값의 타입`: 어떤 것이든 가능

```tsx
type Rocket = { [property: string]: string };
const rocket: Rocket = {
  name: 'Falcon 9',
  variant: 'v1.0',
  thrust: '4,940 kN',
};
```

→ `{[property: string]: string}` 부분이 Rocket 타입의 Index Signature임

### Index Signature로 타입 체크를 수행했을 때의 단점

- 잘못된 키를 포함해 모든 키를 허용
  - e.g. `name` 대신 `Name`으로 작성해도 유효한 `Rocket` 타입임
- 특정 키가 필요하지 않음
  - e.g. `{}`도 `Rocket` 타입임
- 키마다 다른 카입을 가질 수 없음
  - e.g. `thrust`는 `number`여야할 수도 있지만, index signature에 의해 `string` 타입이 강제됨
- 모든 키를 허용하기 때문에 자동 완성 기능이 동작하지 않음

따라서, index signature는 **런타임 때까지 객체의 속성을 알 수 없는 경우**에 유용함

## Implicit Index signature

> An object literal type is now assignable to a type with an index signature if all known properties in the object literal are assignable to that index signature. This makes it possible to pass a variable that was initialized with an object literal as parameter to a function that expects a map or dictionary:

이제 객체 리터럴의 모든 알려진 프로퍼티를 해당 색인 서명에 할당할 수 있는 경우 객체 리터럴 타입을 색인 서명이 있는 타입에 할당할 수 있습니다. 따라서 객체 리터럴을 매개변수로 초기화된 변수를 맵이나 사전을 기대하는 함수에 전달할 수 있습니다:

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#implicit-index-signatures](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#implicit-index-signatures)

>

```tsx
function httpService(path: string, headers: { [x: string]: string }) {}
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
};
httpService('', { 'Content-Type': 'application/x-www-form-urlencoded' }); // Ok
httpService('', headers); // Now ok, previously wasn't
```

- 타입에 Index signature를 명시적으로 선언하지 않아도, 암묵적으로 Index signature를 가지는 것
- 여기서 주의할 점!
  - `type`으로 선언한 타입은 **index signature가 암묵적으로 적용됨**
  - `interface`로 선언한 타입은 **index signature가 암묵적으로 적용되지 않음**

### 예시

```tsx
type Anything = string | number | boolean | object | null | undefined;

type AnythingObj = {
  [key: string]: Anything;
};

// type alias
type ObjType = {
  // -> implicit index signature 적용
  name: '지현';
};

// interface
interface ObjInterface {
  name: '지현';
}
```

```tsx
type ExtendsAnythingObj<T> = T extends AnythingObj ? true : false;

type TestObjType = ExtendsAnythingObj<ObjType>; // true
type TestObjInterface = ExtendsAnythingObj<ObjInterface>; // false
```

- `TestObjType`의 경우
  - `type`으로 선언된 `ObjType`은 암묵적으로 `[key: string]: string`임
  - → `[key: string]: string`은 `[key: string]: Anything`에 할당할 수 있음
  - → extends 여부: true
- `TestObjInterface`의 경우
  - `interface`로 선언된 `ObjInterface`는 index signature를 갖지 않음
  - → `[key: string]: Anything`에 할당할 수 있는 index signature가 없음
  - → extends 여부: false

## 출처

- [https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#implicit-index-signatures](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#implicit-index-signatures)
- 이펙티브 타입스크립트
