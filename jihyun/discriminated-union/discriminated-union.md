# Discriminated Union

리터럴 멤버 프로퍼티가 있는 클래스가 있다면, 그 프로퍼티로 유니온 타입을 구별할 수 있다는 개념입니다.

흔하게 접할 수 있는 타입 코드를 하나 볼게요.

```tsx
interface RoundIcon {
	shape: 'circle';
	radius: number;
	color: string;
}

interface SquareIcon {
	shape: 'square';
	width: number;
	height: number;
	color: string;
}
```

`RoundIcon`과 `SquareIcon`은 **리터럴 타입**의 `shape`이라는 프로퍼티를 공통으로 가지고 있습니다.

이러한 경우 우리는 shape의 타입을 통해 특정 객체의 정확한 타입을 알아낼 수 있습니다.

```tsx
type Icon = RoundIcon | SquareIcon;

const renderIcon = (icon: Icon) => {
	if (icon.shape === 'circle') {
	  // icon은 RoundIcon 타입이겠구나!
	  icon.radius;
	  // icon.width <- X
	} else {
	  // Icon 타입에서 shape가 circle이 아닌 타입은 SquareIcon이 유일하니
	  // 여기서부터 icon은 SquareIcon 타입이겠구나!
	  icon.width
	  // icon.radius <- X
	}
```

여기서 `shape`와 같이 특정한 리터럴을 가진 객체를 식별할 수 있는 프로퍼티를 **구별 프로퍼티**라 표현하고, `RoundIcon`과 `SquareIcon`을 유니온한 타입을 **구별된 유니온(Discriminated Union)**이라 표현합니다.

## example

각각 여러 개의 타입이 `동일한 이름의 리터럴 타입 프로퍼티(구별 프로퍼티)`를 가지고 있다면, 그 여러 개의 타입을 구별해낼 수 있다는 점을 활용해 타입의 버전 관리를 할 수 있습니다.

```tsx
type DTO = |
{
  version: undefined, // 버전 0
  name: string;
} | {
  version : 1,
  firstName: string;
  lastName: string;
} | {
  version : 2,
  firstName: string;
  middleName: string;
  lastName: string;
} | ...
```

## real-world usage

이 구별된 유니온 타입을 활용하는 대표적인 예시가 Redux의 액션 객체입니다.

액션 객체는 `type`이라는 구별 프로퍼티를 가지고 있고, switch문을 통해 이 프로퍼티를 기준으로 분기 처리를 합니다. 즉, 타입이 좁혀집니다.

```tsx
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO': {
      return state.concat(action.payload)
    }
    case 'TOGGLE_TODO': {
      const { index } = action.payload
      return state.map((todo, i) => {
        if (i !== index) return todo

        return {
          ...todo,
          completed: !todo.completed,
        }
      })
    }
    case 'REMOVE_TODO': {
      return state.filter((todo, i) => i !== action.payload.index)
    }
    default:
      return state
  }
}
```

# Exhaustive Check

```tsx
interface RoundIcon {
	shape: 'circle';
	radius: number;
	color: string;
}

interface SquareIcon {
	shape: 'square';
	width: number;
	height: number;
	color: string;
}

export type Icon = RoundIcon | SquareIcon;
```

```tsx
function getIconArea(icon: Icon) {
	if (icon.shape === 'circle') {
		return (icon.radius ** 2) * PI;
	}
	if (icon.shape === 'square') {
		return icon.width * icon.height;
	}
}
```

위와 같이 유니온 타입의 `Icon`이 있고 유니온으로 묶인 각 타입들을 모두 대응하는 함수가 있는 상황이라 했을 때, 새로운 아이콘 타입을 추가하고 싶다면 `Icon`과 `getIconArea`를 모두 수정해 주어야 합니다.

이때 `Icon`이 추가되었으면 `getIconArea`에도 조건문을 추가해 주어야 한다라는 일종의 가이드를 두고 싶은 경우, exhaustive 검사를 추가할 수 있습니다.

exhaustive 검사는 다음과 같이 해당 블록에서 추론한 타입이 never 타입과 호환되는 것처럼 작성하면 됩니다.

```tsx
function getIconArea(icon: Icon) {
	if (icon.shape === 'circle') {
		return (icon.radius ** 2) * PI;
	}
	if (icon.shape === 'square') {
		return icon.width * icon.height;
	}
	const _exhaustiveCheck: never = icon; // Here!
}
```

새로운 타입을 추가한 상황이라면, 마지막 타입에서 추론되는 새로운 타입은 never 타입이 아닐 것이기 때문에 never 타입에 할당할 수 없어 에러가 발생합니다.

```tsx
// error: 'TriangleIcon' is not assignable to 'never'
```

이렇게 에러를 발생시킴으로써 새로운 타입이 추가되었을 때 함께 변경되어야 하는 부분의 누락을 방지할 수 있습니다.

## 참고

[https://radlohead.gitbook.io/typescript-deep-dive/type-system/discriminated-unions](https://radlohead.gitbook.io/typescript-deep-dive/type-system/discriminated-unions)