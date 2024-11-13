# Generator

## Generator란

- 함수의 특별한 종류 중 하나로, Iterator를 반환하는 함수이다.
- 함수의 실행을 일시적으로 중지하고 나중에 재개할 수 있는 기능을 제공한다.
- 일반적인 함수와 다르게 함수가 호출될 때마다 새로운 Iterator 객체를 반환하며, 이 Iterator를 통해서 값을 한 번에 하나씩 생성할 수 있다.

<aside>
💡 Generator 객체는 Iterable이며 동시에 Iterator이다.
따라서, Symbol.iterator 메소드로 Iterator를 별도로 생성하지 않아도 Iterator로 치부된다.

</aside>

### Iterable ? Iterator ?

- Iteration : 반복 처리라는 의미로, 데이터 안의 요소를 연속적으로 꺼내는 행위를 말한다. (ex. forEach)
- Iterable : 반복 가능한 객체를 의미하며 iterable한 객체에는 Symbol.iterator라는 프로퍼티가 있다. (ex. array, string, Map, Set ..)
  - Symbol.iterator 프로퍼티에는 Iterator를 리턴하는 함수가 할당돼 있다.
- Iterator : Iterable 객체의 Symbol.iterator를 통해 얻을 수 있는 객체로, next() 메서드를 가진다.
- 참고 코드

  ```jsx
  // 배열은 기본적으로 iterable한 객체이다.
  const array = [1, 2, 3, 4]

  // array의 Symbol.iterator 프로퍼티에 할당돼 있는 함수를 실행하여 iterator 객체를 반환한다.
  const iterator = array[Symbol.iterator]()

  iterator.next() // Object { value: 1, done: false };
  iterator.next() // Object { value: 2, done: false };
  iterator.next() // Object { value: 3, done: false };
  iterator.next() // Object { value: 4, done: false };
  iterator.next() // Object { value: undefined, done: true };
  ```

## Generator 함수의 특징

### 함수 표기법

- Generator를 만들기 위해서는 ‘Generator 함수’라 불리는 특별한 문법 구조인 `function*`가 필요하다.

```jsx
function* generatorFunc() {
  yield 1
}
```

- 다양한 함수 표현법

  ```jsx
  // 제너레이터 **함수 선언식**
  function* genDecFunc() {
    yield 1;
  }
  let generatorObj = genDecFunc();

  --------------------------------------------------------------------

  // 제너레이터 **함수 표현식**
  const genExpFunc = function* () {
    yield 1;
  };
  generatorObj = genExpFunc();

  --------------------------------------------------------------------

  // 제너레이터 **메소드 식**
  const obj = {
    * generatorObjMethod() {
      yield 1;
    }
  };
  generatorObj = obj.generatorObjMethod();

  --------------------------------------------------------------------

  // 제너레이터 **클래스 메소드 식**
  class MyClass {
    * generatorClsMethod() {
      yield 1;
    }
  }
  const myClass = new MyClass();
  generatorObj = myClass.generatorClsMethod();

  [*출처 : Inpa 블로그*](https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EC%A0%9C%EB%84%88%EB%A0%88%EC%9D%B4%ED%84%B0-%EC%9D%B4%ED%84%B0%EB%A0%88%EC%9D%B4%ED%84%B0-%EA%B0%95%ED%99%94%ED%8C%90)
  ```

### Generator 객체 반환

- Generator 함수는 일반 함수와 다른게 독특한 동작 방식을 가진다.

```jsx
function* generatorFunc() {
  yield 1
  return 2
}

let generator = generatorFunc()
console.log(generator) // Object [Generator] {}
```

- Generator 함수를 호출하면 일반 함수와 달리 코드를 한 번에 실행하지 않고, 실행을 처리하는 특별한 객체인 Generator 객체를 반환하며, 함수의 본문 코드를 실행하지 않는다.
- Generator 객체는 Iterator 객체이다.

### yield

- yield 키워드는 Generator 함수의 실행을 일시적으로 정지시키며, yield 뒤에 오는 표현식은 Generator의 호출자에게 반환된다.

```jsx
function* generatorFunc() {
  yield 1
  console.log('After first yield')
  yield 2
  console.log('After second yield')
  yield 3
}

let generator = generatorFunc()

console.log(generator.next()) // { value: 1, done: false }
console.log(generator.next()) // After first yield, { value: 2, done: false }
console.log(generator.next()) // After second yield, { value: 3, done: false }
console.log(generator.next()) // { value: undefined, done: true }
```

- Generator 함수를 호출하면 Iterator 객체를 반환하는데, value 속성은 yield문이 반환한 값이고, done 속성은 Generator 함수 내의 모든 yield 문이 실행되었는지 여부를 나타내는 boolean 값이다.
- Iterator 객체의 `next()` 메소드가 호출될 때마다 다음 yield를 만날 때까지 실행이 진행된다.
- 이 후 함수를 호출하게 되면 yield 다음에 오는 코드 블록부터 실행이 된다.
- throw, return 등의 메소드를 만나거나 done이 true가 되면 순회를 종료한다.
  - generator.throw()
  - generator.return()

### yield\*

- 다른 Generator 함수나 Iterable한 객체의 값을 현재 Generator 함수에서 yield 할 때 사용한다.
- yiled\*를 통해 Generator 함수가 다른 Generator 함수나 Iterable한 객체의 값을 반복적으로 생성할 수 있다.

```jsx
function* generatorFunc1() {
  yield 1
  yield 2
}

function* generatorFunc2() {
  yield* generatorFunc1() // 다른 Generator 함수의 값을 yield
  yield 3
}

const generator = generatorFunc2()

console.log(generator.next()) // { value: 1, done: false }
console.log(generator.next()) // { value: 2, done: false }
console.log(generator.next()) // { value: 3, done: false }
console.log(generator.next()) // { value: undefined, done: true }
```

- generatorFunc2는 generatorFunc1의 값을 yield\*를 통해 가져와 순차적으로 yield하고, 그 후 자체적으로 값을 yield한다.

```jsx
function* generatorFromIterable() {
  yield* [1, 2, 3, 4, 5]
}

const generator = generatorFromIterable()

console.log(generator.next()) // { value: 1, done: false }
console.log(generator.next()) // { value: 2, done: false }
// ...
```

- 위와 같이 Generator 함수에서만 사용되는 것이 아니라, Iterable 객체를 반복하는 데에도 사용될 수 있다.

### next()에 인자 전달

```jsx
function* generatorFunc() {
  const x = yield 'Give me a value for x' // yield에서 멈추고 호출자에게 'Give me a value for x'를 반환
  console.log('x에 할당 된 값 : ', x)
  const y = yield 'Give me a value for y' // yield에서 멈추고 호출자에게 'Give me a value for y'를 반환
  console.log('y에 할당 된 값 : ', y)

  return x + y
}

const generator = generatorFunc()

console.log(generator.next())
console.log('------------------------------------')
console.log(generator.next(5))
console.log('------------------------------------')
console.log(generator.next(3))

// { value: 'Give me a value for x', done: false }
// ------------------------------------
// x에 할당 된 값 :  5
// { value: 'Give me a value for y', done: false }
// ------------------------------------
// y에 할당 된 값 :  3
// { value: 8, done: true }
```

- 2번째 호출과 함께 전달된 정수 5는 Generator 내부의 yield 키워드에 전달되어 변수 x에 할당되었고, 이에 따라 `console.log`에 출력 되었다.
- 주의할 점은 첫 번째 next() 호출 시에는 yield 표현식에 값을 전달할 수 없으므로, 인자를 생략해야 한다.
  - 인자를 넣어도 에러가 나지는 않지만, 반영되지 않는다.

### … 전개연산자 Generator

- spread 문법은 Iterable한 객체에 한해서 작동하는데, Generator는 Iterable이자 Iterator기 때문에 적용이 가능하다.

```jsx
function* generatorFunc() {
  yield 'W'
  yield 'O'
  yield 'N'
  yield 'I'
  yield 'S'
  yield 'M'
}

// 반복문을 사용하는 경우
const generatorForFor = generatorFunc()
for (let i of generatorForFor) {
  console.log(i)
}
// 'W'
// 'O'
// 'N'
// 'I'
// 'S'
// 'M'

// 전개연산자를 사용하는 경우
const generatorForSpread = generatorFunc()
console.log([...generatorForSpread]) // ['W', 'O', 'N', 'I', 'S', 'M']
```

- spread 문법을 통해 Generator 객체를 변수에 넣고, next() 메소드를 반복문 돌릴 필요 없이 바로 펼치면 요소값들이 순회 나열된다.
