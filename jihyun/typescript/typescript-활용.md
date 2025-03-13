# typescript 활용

> [https://medium.com/@jiwoochoics/더욱-풍부한-typescript활용을-위한-방법-mapped-types-c90d8794818f](https://medium.com/@jiwoochoics/%EB%8D%94%EC%9A%B1-%ED%92%8D%EB%B6%80%ED%95%9C-typescript%ED%99%9C%EC%9A%A9%EC%9D%84-%EC%9C%84%ED%95%9C-%EB%B0%A9%EB%B2%95-mapped-types-c90d8794818f)

## Indexed Access Type

Record라면, key를 통해 타입을 조회할 수 있음

```tsx
type PersonalInfo = {
  name: string;
  age: number;
  address: string;
};

PersonalInfo['name']; // string
PersonalInfo['age']; // number
PersonalInfo['address']; // string
```

Array이라면, index(숫자)를 통해 타입을 조회할 수 있음

```tsx
type PersonalInfoArr = [string, number, string];

PersonalInfoArr[0]; // string
PersonalInfoArr[1]; // number
PersonalInfoArr[2]; // string
```

## 반복/순회 활용하기

### keyof

특정 Record의 key를 순회하며 조회할 수 있음

```tsx
type PersonalInfo = {
  name: string;
  age: number;
  address: string;
};

type PersonalInfoKey = keyof PersonalInfo; // 'name' | 'age' | 'address'
```

### in + keyof

Record 내부의 key를 조회하며 타입을 지정할 수 있음

```tsx
type PersonalInfo = {
  name: string;
  age: number;
  address: string;
};

type PersonalInfoKeyMap = { [Key in keyof PersonalInfo]: Key };
// { name: 'name', age: 'age', address: 'address' }
```

### T[keyof T]

keyof의 순회하는 역할과 Indexed Access Type이 만나 Record의 value 타입을 유니온으로 만들 수 있음

```tsx
type PersonalInfo = {
  name: string,
  age: number,
  address: string,
}

PersonalInfo[keyof PersonalInfo] // 'string' | 'number'
```

## Array 타입 순회하기

### number 키워드

Array의 요소를 순회하며 각 요소의 타입을 유니온으로 만들 수 있음

```tsx
type Me = ['성이름', 20, '서울'];

Me[number]; // "성이름" | 20 | "서울"
```

## 조건문

타입 조건 검사를 통해 결과 타입을 생성할 수 있는 기능

다음과 같은 제약 사항 존재

- 조건 비교의 기준이 될 `주어진 타입`이 필요
- 조건의 결과는 항상 있어야 함
- 삼항연산자로 조건문을 표기해야 함

```tsx
type A = number; // 주어진 타입.
type RESULT = A extends number ? number : never; // 조건식
// 결과 : number
```

### Typescript에서 사용되는 extends

- `interface`의 extends: 타입 상속 목적
  ```jsx
  interface A extends B {}
  // A타입은 B타입에 호환될 수 있도록 프로퍼티를 받음.
  ```
- `generic`의 extends: generic으로 들어오는 type을 제한
  ```tsx
  type A<T extends number> = T;
  // T는 number 타입과 호환되는것만 가능함.
  ```
- `conditional types`의 extends: 조건 타입 호환 체크에 사용함
  ```tsx
  type B<T> = T extends number ? number : never;
  ```

### Union Type 순회하기

조건부 타입을 응용하여 유니온 타입을 순회할 수 있음

```tsx
type Union<T, K> = T extends K ? T : never;

type Test = Union<'a' | 'b' | 1, string>; // string인 타입만 뽑아낸다.
// 'a' | 'b'
```

1. `‘a’ | ‘b’ | 1` 중, 첫번째 ‘a’를 T에 배치시킨다. `‘a’ extends string` 연산을 진행한다. 조건 결과는 참이므로 T를 그대로 리턴한다. (‘a’)
2. `‘a’ | ‘b’ | 1` 중, 두번째 ‘b’를 T에 배치시킨다. `‘b’ extends string` 연산을 진행한다. 조건 결과는 참이므로 T를 그대로 리턴한다. (‘b’)
3. `‘a’ | ‘b’ | 1` 중, 세번째 1을 T에 배치시킨다. `1 extends string` 연산을 진행한다. 조건 결과는 거짓이므로 never를 리턴한다.

→ 결과는 ‘a’ | ‘b’ | never인데, 유니온에서 never 개념은 의미 없기 때문에 제외됨

### 보다 복잡한 타입에서 타입 정보 가져오기

조회하려고 하는 타입이 `Record<string, ?>`, `Promise<?>` 에서 한번 감싸진 타입에서의 ?를 조회하려고 하면 어떻게 해야할까?

#### 조건식을 활용해서 얻기

```tsx
// Record<string, ?> 중 ?에 있는 값을 가져온다.
type FindRecordValueType<T extends Record<string, unknown>> =
    T extends Record<string, number> ? number  // number와 호환되면 number 리턴.
        : T extends Record<string, string> ? string  // string과 호환되면 string 리턴..
             : T extends Record<string, array> ? array   // array와 호환되면 array리턴.
            : never
        : never
    : never
```

#### string 키워드 활용하기

만약 타입이 `Record<string, ?>` 이런 형태거나 `{[x : string] : ?}` 형태에서 `?`를 구하고 싶다면, index에 ‘string’ 키워드를 넣어주면 됨

```tsx
type MyMapType = {
  a: Record<string, string>;
  b: Record<string, number>;
};

type Result = MyMapType['a'][string];
// string
type Result2 = MyMapType['b'][string];
// number
```

```tsx
type Obj = {
  [key: string]: string;
};
type Me = {
  name: string;
};

type MeHasImplicitIndexSignature = Me extends Obj ? true : false; // true
type TypeOfMeName = Me['name'][string]; // Type 'String' has no matching index signature for type 'string'.
```

#### infer 활용하기

```tsx
type C<InputType> = InputType extends SomeType<infer R> ? R : never;
```

1. InputType이 SomeType에 호환되는지 체크하기
2. InputType이 SomeType에 호환된다면, SomeType<?>에서 ?를 가져오길 시도하기.
3. 가져왔다면 ? 를 리턴하기
4. 가져오지 않았으면 never를 리턴하기

## 커스텀 유틸 타입 만들기 연습

### Pick

```tsx
type MyObject = {
  a: number;
  b: number;
};

type Picked = Pick<MyObject, 'a'>;
// 결과 : { a : number }
```

```tsx
const pick = (obj: any, targetKeys: any) => {
  return Object.entries(obj)
    .filter(([k]) => targetKeys.includes(k))
    .map(([k, v]) => ({
      [k]: v,
    }));
};
```

```tsx
type CustomPick<T, K extends keyof T> = {
  [Key in K]: T[Key];
};
```

### Exclude

```tsx
type Excluded = Exclude<'a' | 'b', 'a'>;
// 결과 : 'b'
```

```tsx
type CustomExclude<T, K extends T> = T extends K ? never : T;

type b = CustomExclude<'a' | 'b', 'a'>;
// 결과 : 'b'

type c = CustomExclude<'a' | 'b', 'a' | 'b'>;
// 결과 : never
```

### Omit

```tsx
type CustomOmit<T, K extends keyof T> = {
  [Key in keyof T]: Key extends K ? never : T[Key];
};

type d = CustomOmit<MyObject, 'a'>;
// 결과 : { a: never, b: number }

type e = CustomOmit<MyObject, 'a' | 'b'>;
// 결과 : { a: never, b: never }
```

```tsx
type CustomOmit<T, K extends keyof T> = {
  [Key in Exclude<keyof T, K>]: T[Key];
};

type d = CustomOmit<MyObject, 'a'>;
// 결과 : { b: number }

type e = CustomOmit<MyObject, 'a' | 'b'>;
// 결과 : {}
```
