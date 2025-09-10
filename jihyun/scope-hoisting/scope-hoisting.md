# Scope hoisting

# 스코프 호이스팅

- 모듈을 단일 스코프로 연결하는 것

```tsx
// BEFORE
// index.js
import { add } from './math';

console.log(add(2, 3));

// math.js
export function add(a, b) {
  return a + b;
}

// AFTER
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
```

- 컴파일러는 두 모듈 간 충돌 가능성이 있는 최상위 레벨 변수의 이름을 변경하고, import 문 순서에 따라 연결함
  - Rollup에 의해 대중화, Parcel/ESBuild 등에도 구현되어 있음
- 스코프 호이스팅 이전에 사용됐던 방식은 **모듈을 별도의 함수로 감싸는 것**
  - 모듈과 스코프가 분리됨
  - 스코프 호이스팅 방식에 비해 큰 번들 사이즈
  - 런타임에 require과 exports를 통한 추가 동작이 있음

```tsx
let modules = {
  'index.js': (require, exports) => {
    let { add } = require('math.js');
    console.log(add(2, 3));
  },
  'math.js': (require, exports) => {
    exports.add = function add(a, b) {
      return a + b;
    };
  },
};
```

# 코드 스플리팅

- 의존성을 단일 번들에 이어 붙일 때는 OK
  - import된 코드가 선형적으로 실행 → import문을 가져온 코드로 대체해버리면 그만
- 코드 스플리팅은 위 가정을 깨뜨림
  - 대부분 앱은 여러 페이지, 동적 Import 등 하나 이상의 엔트리 포인트를 가짐
  - 각 엔트리 포인트는 React나 lodash 같은 공통 의존성을 가지기 마련
- 번들러는 엔트리 간의 공통 모듈을 별도의 번들로 추출하는 알고리즘을 사용
  - → 의존성을 인라이닝X
  - 페이지 간 중복 코드 방지 및 브라우저 HTTP 캐시 활용

```tsx
// entry-a.js
import React from 'react';
import _ from 'lodash';

export function EntryA() {
  return <div>Entry A</div>;
}

// entry-b.js
import React from 'react';
import _ from 'lodash';

export function EntryB() {
  return <div>Entry B</div>;
}
```

- 기본적으로는 2개의 번들이 생성됨
  - `entry-a.js` + `react.js` + `lodash.js`
  - `entry-b.js` + `react.js` + `lodash.js`
  - ❗️react와 lodash가 중복됨
- 대부분의 번들러는 공통 의존성을 번들로 분리하여 각 엔트리 간에 공유하도록 함
  - `entry-a.js`
  - `entry-b.js`
  - `react.js` + `lodash.js`

# 스코프 호이스팅의 사이드 이펙

## 1. 모듈의 실행 순서

- 코드 스플리팅을 사용하면 번들러는 import문을 인라이닝할 수 없음
- 따라서 특정 모듈들은 다른 번들에 위치하게 됨
- 공유 번들을 가져오려면?

```tsx
// entry-a.bundle.js
import { React, _ } from 'shared.bundle.js';

export function EntryA() {
  return <div>Entry A</div>;
}

// entry-b.bundle.js
import { React, _ } from 'shared.bundle.js';

export function EntryB() {
  return <div>Entry B</div>;
}

// shared.bundle.js
// ...
export { React, _ };
```

- 자바스크립트 모듈은 export 뿐만 아니라 함수 호출, 변수 할당 등의 문을 포함할 수 있음
- 이는 실행 환경에서 사이드 이펙을 발생시킬 수 있음
- 즉, 모듈은 실행 순서에 매우 민감

### 예제

- 번들링없이 `entry-a.js`를 실행한다면?

```tsx
// entry-a.js
import './a1';
import './a2';

// entry-b.js
import './b1';
import './b2';

// a1.js
import './shared1';
console.log('a1');

// a2.js
import './shared2';
console.log('a2');

// b1.js
import './shared1';
console.log('b1');

// b2.js
import './shared2';
console.log('b2');

// shared1.js
console.log('shared1');

// shared2.js
console.log('shared2');
```

```
shared1
a1
shared2
a2
```

- 번들링을 한다면?
  - 코드 스플리팅 알고리즘은 공통 의존성을 별도의 번들로 분리함
  - 그 다음 스코프 호이스팅이 실행되어 모듈을 인라이닝

```tsx
// entry-a.bundle.js
import 'shared.bundle.js';

console.log('a1');
console.log('a2');

// entry-b.bundle.js
import 'shared.bundle.js';

console.log('b1');
console.log('b2');

// shared.bundle.js
console.log('shared1');
console.log('shared2');
```

```
shared1
shared2
a1
a2
```

### 해결책

- 각 공유 모듈을 함수로 감싸서 모듈의 실행 순서를 제어 (`Parcel`의 동작 방식)
- 선언된 번들 외부에서 접근이 이뤄지는 각 모듈은 함수로 래핑되고, 이 함수를 필요로하는 모듈에서 호출됨
- 만약 어떤 모듈이 함수로 래핑된다면, 이 모듈의 의존성 또한 래핑돼야 함
- 즉, 대부분의 모듈이 결국엔 함수로 감싸져야 함 → 스코프 호이스팅의 이점을 무효화

```tsx
// entry-a.bundle.js
import modules from 'shared.bundle.js';

modules['shared1']();
console.log('a1');
modules['shared2']();
console.log('a2');

// entry-b.bundle.js
import modules from 'shared.bundle.js';

modules['shared1']();
console.log('b1');
modules['shared2']();
console.log('b2');

// shared.bundle.js
export default {
  shared1: () => console.log('shared1'),
  shared2: () => console.log('shared2'),
};
```

- webpack도 유사하게 구현되어 있으며, 같은 번들 내에서만 접근되는 모듈 그릅을 위해 부분적인 스코프 호이스팅을 지원함(`module concatenation`)

## 2. this 깨짐

- 번들링하지 않으면 foo.js 모듈(bar 함수를 가지는 객체)을 로깅

```tsx
// entry.js
import * as foo from './foo';

foo.bar();

// foo.js
export function bar() {
  console.log(this);
}
```

- 스코프 호이스팅으로 번들링하면 bar함수가 객체 프로퍼티를 거치지 않고 호출되어 undefined (in strict mode)

```tsx
// bundle.js
function bar() {
  console.log(this);
}

bar();
```

# 스코프 호이스팅은 가치가 있는가?

최적화 가능성이 제한적인 것에 비해 너무 복잡한 것 아닌가?

- Rollup 개발 당시, 코드 스플리팅은 전혀 지원되지 않았음
  - 코드 스플리팅이 도입된 이후, 스코프 호이스팅의 이점이 매우 축소됨
- 트리 셰이킹에 스코프 호이스팅이 도움될 것이라 생각했으나(=모듈 간 접근이 함수 호출이 아니고 변수 접근이기 때문),
- 스코프 호이스팅을 하면, 모듈 간 접근이 함수 호출이 아닌 변수 접근올 바뀌므로, minifier를 활용한 트리셰이킹에도 도움이 될 것이라 생각했지만, 번들러가 트리셰이킹을 직접 구현하면 됨
  - 즉, 트리셰이킹 하려고 스코프 호이스팅할 필요까진 없음

# 출처

- [https://devongovett.me/blog/scope-hoisting.html](https://devongovett.me/blog/scope-hoisting.html)
- [https://velog.io/@sehyunny/js-scope-hoisting-is-broken](https://velog.io/@sehyunny/js-scope-hoisting-is-broken)
