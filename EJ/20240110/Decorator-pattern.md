## 데코레이터 패턴

3장에서는 `상속을 남용하는 사례`를 살펴보고 객체 작성이라는 형식으로 `실행 중에 클래스를 꾸미는 방법`을 배웁니다. 데코레이터 패턴을 배우면 기존 클래스 코드를 바꾸지 않고도 객체에 새로운 임무를 추가할 수 있습니다.

### 초대형 커피 전문점, 스타버즈

스타버즈 커피는 단기간에 폭발적으로 성장한 초대형 커피 전문점으로, 사업을 시작할 무렵에 만들어진 주문 시스템 클래스는 다음과 같습니다.

```ts
abstract class Beverage { // 매장에서 판매되는 모든 음료는 이 클래스의 subclass가 됨
  private description: string; // 각 subclass에서 description 인스턴스 변수를 설정
  constructor() {};
  public getDescription() { // description을 꺼내 볼 수 있음
    this.description;
  };
  public abstract cost(): number; // 각 subclass에서 메소드 구현함
}
```
![image](https://github.com/eileenjang/design-pattern/assets/82510378/6fac0067-0363-468f-9023-fb9c65bb165a)

만약 그냥 `인스턴스 변수`와 슈퍼 클래스 `상속`을 써서 관리한다면?

```ts
abstract class Beverage {
  private description: string;
  private milk: boolean;
  private soy: boolean;
  private mocha: boolean;
  private whip: boolean;

  constructor() {};
  
  public getDescription() {
    return this.description;
  }

  /**
  default cost : 1000
  milk : 100
  soy : 100
  mocha : 100
  whip : 100
  **/

  public cost() {
    let cost = 1000;
    if (this.hasMilk()) {
      cost += 100;
    }
    if (this.hasSoy()) {
      cost += 100;
    }
    if (this.hasMocha()) {
      cost += 100;
    }
    if (this.hasWhip()) {
      cost += 100;
    }
  }

  public hasMilk() {
    return this.milk;
  }

  public setMilk(milk: boolean) {
    this.milk = milk;
  }

  public hasSoy() {
    return this.soy;
  }

  public setSoy(soy: boolean) {
    this.soy = soy;
  }
    
  public hasMocha() {
    return this.mocha;
  }

  public setMocha(mocha: boolean) {
    this.mocha = mocha;
  }

  public hasWhip() {
    return this.whip;
  }

  public setWhip(whip: boolean) {
    this.whip = whip;
  }
```

```ts
class Espresso extends Beverage {
  constructor() {
    super();
    this.description = "Espresso";
  }

  public cost {
    return super.cost() + 200; // 첨가물 + 에스프레소 가격
  }
```

### 발생 가능한 문제점

- 첨가물 가격이 바뀔 때마다 기존 코드를 수정해야 함
- 첨가물 종류가 많아지면 새로운 메소드를 추가해야 하고, super class의 cost() 메소드도 고쳐야 함
- 새로운 음료 출시 시, 특정 첨가물이 들어가면 안되는 음료도 있을 수 있음. 예를 들어 아이스티 서브클래스에서 hasWhip() 같은 메소드도 상속받게 됨
- 고객이 더블 모카를 주문할 수도 있음..

### OCP (Open-Closed Principle)

클래스는 확장에는 열려 있어야 하지만 변경에는 닫혀 있어야 한다
-> 디자인한 것중에서 가장 바뀔 가능성이 높은 부분부터 살펴보고 OCP를 적용해보기

### 데코레이터 패턴 살펴보기

특정 음료 (e.g. dark roast 커피) 에서 시작해서 그 음료를 장식(decorate) 해보면
01. DarkRoast 객체 가져오기
02. Mocha 객체로 장식하기
03. Whip 객체로 장식하기
04. cost() 메소드 호출하기 <- 이때 첨가물 가격 계산은 해당 객체에게 위임하기

--> 데코레이터 객체가 wrapper라고 생각하는 개념

### 데코레이터 패턴의 정의

데코레이터 패턴으로 객체에 추가 요소를 `동적으로 더할 수 있다`. 데코레이터를 사용하면 서브클래스를 만들 때보다 훨씬 유연하게 기능을 확장할 수 있다.

```ts
abstract class Component {
  methodA()
  methodB()
}

// 데코레이터 안에는 Component 객체가 들어있음. 즉, 데코레이터에는 구성 요소 레퍼런스를 포함한 인스턴스 변수가 있음.
class Decorator extends Component {
  protected wrappedObj: Component; // 자신이 장식할 구성요소와 동일한 인터페이스 또는 추상클래스를 구현
  methodA()
  methodB()
}

class ConcreteComponent extends Component {
  methodA() { // 새로운 행동의 동적 추가
    const a = super.methodA();
    return a + 'sth new';
  }
  methodB()
}

class ConcreteDecoratorA extends Decorator {
  methodA()
  methodB()
  newBehavior() // 새로운 메소드 e.g. 기존 메소드 호출 후 새로운 기능 추가
  // ... other methods
}

class ConcreteDecoratorB extends Decorator {
  protected newState: Object; // 상태를 확장할 수 있음
  methodA()
  methodB()
  // ... other methods
}
```
