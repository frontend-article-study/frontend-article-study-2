# 커링(Currying)

## 개념

커링은 여러개의 인자를 받는 함수를 인자를 하나씩 받는 함수들의 체인으로 변환하는 기법입니다. <br/><br/>
`f(a, b, c) → f(a)(b)(c)`

- 커링이 가능한 이유는 클로저 때문입니다. 이전에 받은 인자를 클로저가 기억하고 있다가 인자가 다 모이면 실행하는 구조입니다. 이 특성 때문에 부분 적용과 함수 합성등 가능해집니다.

- 커링은 고차함수를 활용한 기법입니다.
  고차함수는 함수를 인자로 받거나 함수를 반환하는 특징이 있는데
  커링은 함수를 반환하여 인자를 하나씩 받도록 구현합니다.

## 간단한 예시

```javascript
// 일반함수
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

function curriedAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

curriedAdd(1)(2)(3); // 6

// 화살표 함수로 간결하게
const curriedAddArrow = (a) => (b) => (c) => a + b + c;
curriedAddArrow(1)(2)(3); // 6
```

## 사용하는 이유

### 부분 적용(Partial Application) — 재사용성

인자를 미리 고정해서 특화된 함수를 만들 수 있습니다.

```javascript
// 커링 사용전
const multiply = (a, b) => a * b;

const double = (b) => multiply(2, b);
const triple = (b) => multiply(3, b);

double(5); // 10
triple(5); // 15
[1, 2, 3].map(double); // [2, 4, 6]

// 커링 사용후
const multiply = (a) => (b) => a * b;

const double = multiply(2); // b => 2 * b
const triple = multiply(3); // b => 3 * b

double(5); // 10
triple(5); // 15
[1, 2, 3].map(double); // [2, 4, 6]
```

double, triple 같이 맥락이 명확한 함수를 뽑아낼 수 있어서 코드 의도가 명확해집니다.

### 함수합성(Function Composition)을 하기에 용이합니다.

```javascript
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const add10 = (x) => x + 10;
const multiplyBy2 = (x) => x * 2;
const subtract3 = (x) => x - 3;

const transform = pipe(add10, multiplyBy2, subtract3);
transform(5); // ((5+10)*2)-3 = 27
```

커링된 함수는 인자가 하나라서 pipe, compose 같은 합성 유틸과 바로 연결됩니다.

### 지연 실행(Lazy Evaluation)

인자를 다 모을 때까지 실행을 미룰 수 있습니다.

```javascript
const fetchData = (baseUrl) => (endpoint) => (params) =>
  fetch(`${baseUrl}${endpoint}?${new URLSearchParams(params)}`);

// baseUrl은 한 번만 설정
const api = fetchData("https://api.example.com");

// endpoint 고정
const getUser = api("/users");
const getPost = api("/posts");

// 실제 호출
getUser({ id: 1 });
getPost({ page: 2 });
```

### 범용 curry 유틸 구현

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // 인자가 충분하면 바로 실행
      return fn(...args);
    }
    // 부족하면 나머지 인자를 기다리는 함수 반환
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

// 사용
const add = curry((a, b, c) => a + b + c);

add(1)(2)(3); // 6
add(1, 2)(3); // 6  ← 여러 개 한 번에 줘도 가능
add(1)(2, 3); // 6
add(1, 2, 3); // 6
```

fn.length로 원래 함수의 인자 개수를 파악해서 다 채워졌을 때 실행하는 방식입니다. <br/>
하지만 rest parameter나 default parameter 는 length에 잡히지 않아서 주의가 필요합니다.

## 실무 예시

### 이벤트 핸들러

```javascript
// 커링 없이
<input onChange={(e) => handleChange('email', e)} />
<input onChange={(e) => handleChange('password', e)} />

// 커링으로
const handleChange = field => e => {
  setForm(prev => ({ ...prev, [field]: e.target.value }));
};

<input onChange={handleChange('email')} />
<input onChange={handleChange('password')} />
```

### 스타일 유틸 (Tailwind / CSS-in-JS) - 추상화

```javascript
const withBreakpoint = (bp) => (className) => `${bp}:${className}`;

const sm = withBreakpoint("sm");
const lg = withBreakpoint("lg");

sm("text-sm"); // 'sm:text-sm'
sm("hidden"); // 'sm:hidden'
lg("flex-row"); // 'lg:flex-row'
```
