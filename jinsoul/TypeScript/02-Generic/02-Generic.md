### 제네릭(**Generics)**

- 일반적인 것: 특정하지 않고 일반적인 범주를 가리킬 때
- 타입스크립트에서 제네릭은 **타입을 변수화** 한 것
    - 여러가지 타입에서 동작하는 컴포넌트에 유용하게 사용할 수 있다.

```tsx
function getAnything<T>(p1: T): T {
   return p1;
}

getAnything<number>(1);
function getAnything<number>(p1: number): number {
   return p1;
}

getAnything<string>('ZZANG');
function getAnything<string>(p1: string): string {
   return p1;
}

getAnything<boolean>(true);
function getAnything<boolean>(p1: boolean): boolean {
   return p1;
}
```

- 사용 시점에 타입을 결정해주기 때문에 아무 타입이나 넣어도 상관없다.
    - any 와 다른점
        
        ```tsx
        function sayHello(name:any):any{
        	return `Hello ${name}`
        }
        ```
        
        - 타입 체크가 무력화 되기 때문에 컴파일 시점이 아닌 런타임에서야 타입 관련 오류를 알 수 있다.
        
        ```tsx
        function sayHello<T>(name:T):T{
        	return `Hello ${name}`
        }
        
        const hello1 = sayHello<string>("zzansol")
        const hello2 = sayHello("zzansol")
        ```
        
        - `<T>` 제네릭 타입을 통해 함수를 호출할 때 넘긴 타입에 대해 타입스크립트가 추정할 수 있게 되어 함수의 입력값에 대한 타입과 출력값에 대한 타입이 동일한지 검증할 수 있다.

### 제네릭 타입 변수

```tsx
function logText<T>(text: T): T {
  console.log(text.length); // Error: T doesn't have .length
  return text;
}
```

- 컴파일러는 `T` 의 타입을 알지 못하기 때문에 에러를 발생시킨다.
- 따라서 아래와 같이 제네릭에 타입을 줄 수 있다.

```tsx
function logText<T>(text: T[]): T[] {
  console.log(text.length);
  return text;
}
```

```tsx
function logText<T>(text: Array<T>): Array<T> {
  console.log(text.length);
  return text;
}
```

### 제네릭 타입

- 타입스크립트 함수 자체도 하나의 타입으로 지정할 수 있다.
    
    ```tsx
    //인터페이스로 함수 타입을 지정
    interface Add {
       (x: number, y: number): number;
    }
    
    let myFunc: Add = (x, y) => {
       return x + y;
    };
    ```
    
- 제네릭도 함수 자체 타입 구조로 만들어 할당 제한이 가능하다.
    
    ```tsx
    interface GenericIdentityFn {
       <T>(arg: T): T; // 제네릭 함수 타입 구조
    }
    
    function identity<T>(arg: T): T {
       return arg;
    }
    
    let myIdentity: GenericIdentityFn = identity;
    
    myIdentity<number>(100);
    myIdentity<string>('100');
    ```
    
- 함수를 할당 할 때 제네릭을 결정하는 방식
    
    ```tsx
    interface GenericIdentityFn<T> {
       (arg: T): T;
    }
    
    function identity<T>(arg: T): T {
       return arg;
    }
    
    let myIdentity: GenericIdentityFn<number> = identity;
    let myIdentity2: GenericIdentityFn<string> = identity;
    
    myIdentity(100);
    myIdentity2('100');
    ```
    

### 제네릭 제약조건

- 특정 프로퍼티
    
    ```tsx
    function logText<T>(text: T): T {
      console.log(text.length); // Error: T doesn't have .length
      return text;
    }
    ```
    
    ```tsx
    interface LengthWise {
      length: number;
    }
    
    function logText<T extends LengthWise>(text: T): T {
      console.log(text.length);
      return text;
    }
    ```
    
    ```tsx
    logText(10); // Error, 숫자 타입에는 `length`가 존재하지 않으므로 오류 발생
    logText({ length: 0, value: 'hi' }); // `text.length` 코드는 객체의 속성 접근과 같이 동작하므로 오류 없음
    ```
    
- 객체 속성 제약
    
    ```tsx
    function getProperty<T, O extends keyof T>(obj: T, key: O) {
      return obj[key];  
    }
    
    let obj = { a: 1, b: 2, c: 3 };
    
    getProperty(obj, "a");
    getProperty(obj, "z"); // error: "z"는 "a", "b", "c" 속성에 해당하지 않습니다.
    ```
    

# Ref

[타입스크립트 핸드북](https://joshua1988.github.io/ts/guide/generics.html#%EC%A0%9C%EB%84%A4%EB%A6%AD-generics-%EC%9D%98-%EC%82%AC%EC%A0%84%EC%A0%81-%EC%A0%95%EC%9D%98)

[타입스크립트 Generic 타입 정복하기 - Inpa Dev 블로그](https://inpa.tistory.com/entry/TS-%F0%9F%93%98-%ED%83%80%EC%9E%85%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Generic-%ED%83%80%EC%9E%85-%EC%A0%95%EB%B3%B5%ED%95%98%EA%B8%B0#%EC%A0%9C%EB%84%A4%EB%A6%ADgenerics_%EC%86%8C%EA%B0%9C)

[[Typescript] 제네릭(Generic) 실전 사용법](https://medium.com/jscode/typescript-%EC%A0%9C%EB%84%A4%EB%A6%AD-generic-%EC%8B%A4%EC%A0%84-%EC%82%AC%EC%9A%A9%EB%B2%95-b8580bf04ce3)