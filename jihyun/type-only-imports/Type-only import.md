# Type-only import

# 프롤로그

두 import문의 차이점은…?

```jsx
import { Props } from './types';
import type { Props } from './types';
```

# Type-only import와 export

Typescript v3.8의 신규 문법으로, 오직 타입만을 import하거나 export하는 문법입니다.

```jsx
import type { PropsType } from '.';
```

```jsx
export type { PropsType };
```

이렇게 type-only import/export를 사용하면, 모듈이 내보내는 것 중 타입만을 가져오거나 내보낼 수 있습니다.

그런데, 타입스크립트의 타입들은 자바스크립트로 컴파일되면서 모두 제거된다는 특징이 있어요. 즉, 타입 연산은 런타임에 영향을 주지 않습니다. 그래서 우리는 다음과 같이 런타임에 타입을 체크하는 코드를 작성하기도 합니다.

```jsx
function asNumber(val: number | string): number {
  return typeof val === 'string' ? Number(val) : val;
}
```

이러한 특징 즉, 타입 시스템과 런타임은 무관하다는 점으로 인하여 type-only import/export를 사용하면 다음과 같은 이점을 얻을 수 있어요.

- 타입은 제거되고, 사용하지 않는 모듈은 import되지 않기 때문에 **번들링 크기가 작아진다.**
- 런타임에 불필요한 의존성을 줄일 수 있어 **런타임 성능이 최적화된다.**
- import문이 제거되기 때문에 **모듈 간 순환 의존성을 방지(하기도) 한다.**

## 예외: Class

타입을 런타임에서도 사용하고 싶다면 class를 활용할 수 있어요. 클래스는 런타임에서 제거되는 게 아니므로, 타입으로도 값으로도 활용할 수 있습니다.

```jsx
class Square {
	constructor(public width: number) {}
}
class Rectangle extends Square {
	constructor(public width: number, public height: number) {
		super(width);
	}
}
type Shape = Square | Rectangle; // 타입으로 참조되는 부분
function calculateArea(shape: Shape) {
	if (shape instanceof Rectangle) { // 값으로 참조되는 부분
		//...
	}
}
```

이러한 클래스를 type-only import 한다면 런타임에는 참조할 수 없는 타입이 되어 버립니다. 그저 타입으로 인식하기 때문이에요.

```jsx
import type { Component } from 'react';
interface ButtonProps {
  // ...
}
class Button extends Component<ButtonProps> {
  //               ~~~~~~~~~
  // error! 'Component' only refers to a type, but is being used as a value here.
  // ...
}
```

# 컴파일러 플래그

type-only import의 도입과 함께, **런타임 시 사용되지 않는 import를 제어하는 방법**에 대한 컴파일러 플래그 `importsNotUsedAsValues`가 추가되었습니다.

- `remove`: imports 제거 (기본값)
- `preserve`: 보존 (제거하지X)
- `error`: 모든 import를 보존하지만, 모듈에서 타입만 import 하는 경우 에러 발생

# 에필로그

차이점은 바로 바로

```jsx
import { Props } from './types'; // 런타임에 남아있음
import type { Props } from './types'; // 런타임에 사라짐
```
