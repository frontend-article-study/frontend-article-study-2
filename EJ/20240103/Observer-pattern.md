# 객체들에게 연락돌리기 - 옵저버 패턴

- 뭔가 중요한 일이 일어났을 때 객체에게 `새 소식`을 알려줄 수 있는 패턴.
- 2장에서는 `일대다 관계`나 `느슨한 결합`과 관련된 내용을 배울 것이다.

![image](https://github.com/eileenjang/design-pattern/assets/82510378/753cbae7-de51-4db5-bcc1-2545fd8a09cc)

## 가상 모니터링 애플리케이션 알아보기

- 시스템은 기상 스테이션 (실제 기상 정보 수집) + WeatherData 객체 (기상 스테이션으로부터 오는 정보를 추적하는 객체) + 사용자에게 현재 기상조건을 보여주는 디스플레이 장비로 구성됨


## WeatherData 클래스 살펴보기

- WeatherData 클래스에 존재하는 메서드
  - getTemperature()
  - getHumidity()
  - getPressure()
  - measurementsChanged() <- WeatherData에서 갱신된 값을 가져올 때마다 호출됨 (우리가 수정해야 하는 메서드)

## 구현 목표

- WeatherData 클래스에는 온도, 습도, 기압 게터 메서드가 있음
- 새로운 기상 측정 데이터가 들어올 때마다 measurementsChanged()가 호출됨
- 현재 조건 디스플레이, 기상 통계 디스플레이, 기상 예보 디스플레이를 갱신해야 함
- 이를 measurementsChanged()에 추가해야 함
- 추가적인 목표
  - 확장성

## 기상 스테이션용 코드 추가하기

```ts
class WeatherData {
  // ...

  measurementsChanged() {
    const temp = this.getTemperature();
    const humidity = this.getHumidity();
    const pressure = this.getPressure();

    // 아래는 바뀔 수 있는 부분 -> 캡슐화 필요
    this.conditionDisplay.update(temp, humidity, pressure);
    this.statisticsDisplay.update(temp, humidity, pressure); 
    this.forecastDisplay.update(temp, humidity, pressure); 
  }
}
```

## 옵저버 패턴의 정의

- 신문사는 주제(subject), 구독자는 옵저버(observer)
- 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체에게 연락이 가고 자동으로 내용이 갱신되는 방식으로 일대다 의존성을 정의한다.
- 옵저버 패턴은 보통 주제 인터페이스와 옵저버 인터페이스가 들어있는 클래스로 구현함

## 옵저버 패턴의 구조

- 주제를 나타내는 Subject 인터페이스이며, 객체에서 옵저버로 등록하거나 옵저버 목록에서 탈퇴하고 싶을 때 이 인터페이스에 있는 메서드를 사용한다.
```ts
interface Subject {
  registerObserver(): void;
  removeObserver(): void;
  notifyObserver(): void;
}
```

- 옵저버가 될 가능성이 있는 객체는 반드시 Observer 인터페이스를 구현해야 하며, 이 인터페이스에는 주제의 상태가 바뀌었을 때 호출되는 update() 메서드밖에 없다.
```ts
interface Observer {
  update(): void;
}
```

- 주제 역할을 하는 구상 클래스에는 항상 Subject 인터페이스를 구현해야 한다. 주제 클래스에는 등록 및 해지용 메서드와 상태가 바뀔 때마다 모든 옵저버에게 연락하는 notifyMethod()를 구현해아 한다.
- 주제 클래스에는 상태를 설정하고 알아내는 세터/게터 메서드가 들어있을 수도 있다.
```ts
class ConcreteSubject implements Subject {
  registerObserver() {
    // ...
  }
  removeObserver() {
    // ...
  }
  notifyObserver() {
    // ...
  }

  getState() {
    // ...
  }
  setState() {
    // ...
  }
}
```

- Observer 인터페이스만 구현한다면 무엇인든 옵저버 클래스가 될 수 있다. 각 옵저버는 특정 주제에 등록해서 연락 받을 수 있다.
```ts
class ConcreteObserver implements Observer {
  update() {
   // ...
  }
}
```

## 무엇이든 물어보세요

- Q1. 이 내용이 일대다 관계와 무슨 상관이 있나요?
  - A1. 옵저버 패턴에서는 주제가 상태를 저장, 제어함. -> 상태가 들어있는 객체(주제)는 한개만 있을 수 있음
  - 반면, 옵저버는 상태를 사용하지만 소유할 필요 x -> 옵저버는 여러개 있을 수 있고 주제에 의존적인 성질을 가지게 됨.
  - 그러므로, 일대다 관계가 성립됨.

## 느슨한 결합의 위력

- 느슨한 결합(loose coupling)은 객체들이 `상호작용`할 수는 있지만, 서로를 잘 `모르는` 관계를 의미함.
- 느슨한 결합을 활용하면, `유연성`이 아주 좋아짐.
- 1. 주제는 옵저버가 특정 옵저버 인터페이스를 구현한다는 사실만 안다.
  - 옵저버의 구상클래스를 알 필요 X
- 2. 옵저버는 언제든지 새로 추가할 수 있다.
  - 주제는 Observer 인터페이스를 구현하는 객체의 목록에만 의존하므로 언제든 새 옵저버를 추가/제거 가능
- 3. 새로운 형식의 옵저버를 추가할 때도 주제를 변경할 필요가 전혀 없다.
  - 옵저버가 되어야 하는 새로운 구상 클래스가 있어도, 새로운 클래스에서 Observer 인터페이스를 구현하고 등록하면 되기에 주제는 신경쓸 필요 X
- 4. 주제와 옵저버는 서로 독립적으로 재사용할 수 있다.
  - 주제나 옵저버를 다른 용도로 활용할 일이 있다고 해도 재사용 가능, why? 그 둘의 느슨한 관계 때문.
- 5. 주제나 옵저버가 달라져도 서로에게 영향을 미치지 않는다.
  - 느슨한 결합 때문에, 주제/옵저버 인터페이스 구현 조건만 만족하면 상관 X

### 디자인 원칙

- 상호작용하는 객체 사이에는 가능하면 느슨한 결합을 사용해야 한다.

## 옵저버 패턴 특징

- MVC 패턴에서 사용됨 (Model, View, Controller)
  - Model과 View의 관계는 Observer 패턴의 Subject 역할과 Observer 역할의 관계에 대응됨.
  - 하나의 Model -> 복수의 View

![image](https://github.com/eileenjang/design-pattern/assets/82510378/d1282a42-bb3d-4c83-8f73-011a1dcf8a23)

- 구독자는 알림 순서를 제어하기 어려움.
- 다수의 옵저버 객체를 등록 이후 해지하지 않는다면 메모리 누수가 발생할 수도 있음.

## 가상 스테이션 설계하기

<img width="336" alt="image" src="https://github.com/eileenjang/design-pattern/assets/82510378/3fa2beac-0d3f-4e1c-bb5d-4c0ceb6c8851">

## 무엇이든 물어보세요

### 푸시를 풀로 바꾸는 건 정말 좋은 생각입니다

- 지금 만들어 놓은 WeatherData 디자인은 하나의 데이터만 갱신해도 되는 상황에서도 update() 메소드에 모든 데이터를 보내도록 되어 있다.
- 나중에 Weather-O-Rama에서 풍속 같은 새로운 데이터 값을 추가한다면 어떨까? -> 대부분 update() 메소드에서 풍속 데이터를 쓰지 않더라도 모든 디스플레이에 있는 update 메소드를 바꿔야 하지 않을까?
- 옵저버로 데이터를 보내는 push를 사용하거나 옵저버가 주제로부터 데이터를 당겨오는 pull을 사용하는 방법 중 어느 하나를 선택하는 일은 구현 방법의 문제이다.
  - `push: Subject -> Observer`
  - `pull: Observer <- Subject`
- 하지만 대체로 옵저버가 필요한 데이터를 골라서 가져가도록 만드는 방법이 더 좋다.
  - 주제가 자신의 데이터에 관한 게터 메서드를 가지게 만들고
  - 필요한 데이터를 당겨올 때 해당 메소드를 호출할 수 있도록 옵저버를 고쳐주면 됨

## 디자인 도구상자 안에 들어가야 할 도구들

### 객체지향 기초

- 추상화
- 캡슐화
- 다형성
- 상속

### 객체지향 원칙

- 바뀌는 부분은 캡슐화한다
- 상속보다는 구성을 활용한다
- 구현보다는 인터페이스에 맞춰서 프로그래밍한다
- 상호작용하는 객체 사이에서는 가능하면 느슨한 결합을 사용해아 한다

### 객체지향 패턴

- 전략 패턴
- 옵저버 패턴
  - 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들에게 연락이 가고 자동으로 갱신되는 방법
  - 일대다 의존성
  - 12장 MVC 패턴에서 다시 살펴볼 예정

## 디자인 원칙 경시대회

- 애플리케이션에서 달라지는 부분을 찾아내고 달라지지 않는 부분과 분리한다.
  - 옵저버 패턴에서 변하는 것은 주제의 상태와 옵저버의 개수, 형식이다. 옵저버 패턴에서는 주제를 바꾸지 않고도 주제의 상태에 의존하는 객체들을 바꿀 수 있다.
- 구현보다는 인터페이스에 맞춰서 프로그래밍한다.
  - 주제는 Subject 인터페이스로 Observer 인터페이스를 구현하는 객체들의 등록과 탈퇴를 관리하고, 그런 객체들에게 연락을 돌린다.
- 상속보다는 구성을 활용한다.
  - 옵저버 패턴에서는 구성을 활용해서 옵저버들을 관리한다. 주제와 옵저버 사이는 상속이 아닌 구성으로 이루어지며 실행 중에 구성되는 방식을 활용한다.
