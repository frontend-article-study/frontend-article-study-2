## 디자인 패턴

- 소프트웨어 디자인 과정 (디자인) 에서 자주 발생하는 문제들에 대한 일반적인 해결책 (패턴)
- 디자인 패턴은 코드가 아닌 경험을 재사용하는 것.

## 전략 패턴의 개념

- `알고리즘군`을 정의하고 `캡슐화`해서 각각의 알고리즘군을 `수정`해서 쓸 수 있게 해준다.
- `전략`이란, 특정한 목표를 수행하기 위한 행동 계획으로, 알고리즘, 기능, 동작 등을 의미한다.
- 그러므로, `알고리즘 변형`이 빈번히 일어나는 경우 적합한 디자인 패턴이다.

## 예제로 알아보기

### 문제의 코드 - 상속을 이용한 설계

![image](https://github.com/eileenjang/design-pattern/assets/82510378/05623e08-969c-473a-a8da-03db92317b6b)

- Duck이라는 `추상클래스`가 있고, 다양한 유형의 오리가 Duck 클래스로부터 상속을 받음.
- 현재, 모든 오리가 헤엄을 칠 수 있고 꽥꽥 거리는 소리를 낼 수 있으므로 swim()과 quark()를 `슈퍼클래스`에 작성을 함.
- 그리고 오리별로 다른 모양을 가지고 있기 때문에 display() 메서드는 `추상 메서드`로 선언해서, `서브 클래스`에서 반드시 구현하도록 함.

![image](https://github.com/eileenjang/design-pattern/assets/82510378/2d65b330-5f01-40e6-8e50-8c69eeab6d99)

- 하지만, Duck이라는 슈퍼 클래스에 fly() 메서드를 추가하면서, 날 수 없는 특징을 가진 RubberDuck, 고무오리 서브클래스에 `적합하지 않은` 행동 method 가 추가됨.
- 그래서 RubberDuck의 fly() 메서드를 `오버라이드`를 함.
- But, 앞으로 규격은 계속 바뀜, 6개월마다 제품 업데이트
- 상속을 활용하면 제품 업데이트 시, 프로그램에 추가했던 Duck 클래스의 메서드를 하나하나 찾아보고 상황에 따라 `오버라이드` 해야 함

<img width="491" alt="image" src="https://github.com/eileenjang/design-pattern/assets/82510378/f321d886-289e-488a-8719-22e695718a1e">
<img width="887" alt="image" src="https://github.com/eileenjang/design-pattern/assets/82510378/6dc3cd1b-394a-4b0a-8b95-82b755e63d94">

- 상속은 올바른 방법이 아님
- fly() 메서드를 슈퍼 클래스에서 분리시켜 `Flyable 인터페이스`를 만듬
- But, 이러한 행동 인터페이스 설계는 `코드 재사용` 측면 문제 존재
  - Flyable 인터페이스와 fly() 메서드가 default이고 A 방식으로 작성되어 있다 가정할 때,
  - B 방식으로 날아다니는 새로운 오리 클래스 DuckD 클래스가 새로 추가되면,
  - B방식으로 날아다니는 DuckB 클래스의 B 메서드는 D 클래스에서 `중복`되고 재사용할 수 없기에 `유지 보수`에 문제 있음

### 전략 패턴을 이용한 코드

![image](https://github.com/eileenjang/design-pattern/assets/82510378/e157c419-7a7f-4903-944e-113860961c94)

- 이런 문제를 해결하기 위해서, 실제 실행 시에 쓰이는 객체가 코드에 고정되지 않도록 `상위 형식에 맞춰 프로그래밍하여 다형성을 활용`해야 함.
- 각 행동은 인터페이스(ex. FlyBehavior, QuackBehavior)로 표현하도록 수정함.
- 이를 통해, 각 행동들은 Duck 클래스에서 구현하는 것이 아니라, 특정 행동만을 목적으로 하는 클래스 집합에서 구현될 수 있음.
- 앞으로 FlyBehavior과 QuackBehavior 인터페이스에는 `구현 클래스`에서 반드시 구현하도록 특정 행동을 나타내는 `메서드`가 선언되어 있음
- 각 구현 클래스는 특정 행동에 맞춰서 이 메서드를 구현하는 방식은, 
  - 다른 형식의 객체에서도 나는 행동과 꽥꽥거리는 행동을 재사용 가능
  - Duck 클래스를 전혀 건드리지 않고도 새로운 행동을 추가 가능 
  - 즉, 상속의 부담을 떨쳐 버리고도, 재사용의 장점 활용

####  src 폴더 참고
- 만약 `fly()` 메소드를 변경하고 싶다면?
  - Fly.ts 의 fly 메소드만 건들이면 수정 가능함.
- 만약 새로운 기능을 추가하고 싶다면?
  - 새로운 기능에 해당하는 인터페이스 / 클래스를 만들고 이 부분만 수정하면 됨.
- 만약 객체 생성 후에도 전략 수정이 필요하다면?
  - setter 메소드를 포함해서 프로그래밍 실행 중에도 행동을 바꿀 수 있게 하면 됨.

## 개방 폐쇄 원칙 OCP

- 기존의 코드를 변경하지 않으면서, 기능을 추가할 수 있도록 설계가 되어야 한다는 원칙.
- 확장에 대해서는 개방적(open)이고, 수정에 대해서는 폐쇄적(closed)이어야 한다.
			
## 레퍼런스

- https://www.yes24.com/Product/Goods/108192370
- https://inpa.tistory.com/entry/GOF-%F0%9F%92%A0-%EC%A0%84%EB%9E%B5Strategy-%ED%8C%A8%ED%84%B4-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%90#thankYou
- https://www.youtube.com/watch?v=vNsZXC3VgUA
- https://codingnotes.tistory.com/236#-%EB%-B%A-%EA%B-%--%---%EB%-F%--%EC%A-%--%EC%-C%BC%EB%A-%-C%--%ED%--%--%EB%-F%--%--%EC%A-%--%EC%A-%--%ED%--%--%EA%B-%B--