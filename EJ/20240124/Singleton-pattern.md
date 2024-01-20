## 싱글턴 패턴 (SingleTon Pattern)

- 클래스 인스턴스화를 하나의 객체로 제한하는 패턴이다. 즉, 오직 하나의 객체만이 메모리 상에 존재한다는 것을 보장한다. 싱글턴 패턴이 유용한가에 대한 논란은 계속 있어왔으나, 우선 어떻게 만들 수 있는지 구현해보도록 하자.

### Object literal

```ts
const person = {
  name: "Lee",
  age: 30,
  sayHello: function () {
    return `Hello! My name is ${this.name}.`;
  },
};

Object.freeze(person);
export default person;
```

- const keyword를 통해 변수 재할당을 할 수 없으며, Object.freeze()를 통해 method/property 의 변경을 할 수 없게 만들었다.
- Object.assign()을 통해 리터럴을 복사한다면, 객체 불변성이 깨지며 Object.freeze()의 경우 얕은 동결이기 대문에 중첩된 Object가 있다면 불변성은 깨진다.

### IIFE + Closer

```ts
const Person = (function () {
  let instance: IPerson |  undefined;

  function createInstance(): IPerson {
    return {
      name: 'Lee',
      age: 30,
      sayHello: function () {
        return `Hello! My name is ${this.name}.`;
      },
    };
  }

  return {
    getInstance: function () {
      if (instance === undefined) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

const a = Person.getInstance();
const b = Person.getInstance();
console.log(a === b) // true
```

### Class

class에서는 private 접근 제어와 static keyword를 사용하였다.

```ts
class Person {
  private static instance: Person;
  private name = 'Lee';
  private age = 30;

  private constructor() {};
  static getInstance(): Person {
    if (Person.instance === undefined) {
      Person.instance = new Person();
    }
    return Person.instance;
  }

  sayHello() {
    return `Hello! My name is ${this.name}.`;
  }
  getName() {
    return this.name;
  }
  setName(name: string) {
    this.name = name;
  }
}

const a = Person.getInstance();
const b = Person.getInstance();

console.log(a.getName()) // 'Lee'
console.log(b.getName()) // 'Lee'

a.setName('Park');

console.log(a.getName()) // 'Park'
console.log(b.getName()) // 'Park'

const c = new Person(); // Error
```

- private class 생성자를 통해 `new` 키워드로 인스턴스를 여러개 생성할 수 없도록 하였고,
- static keyword로 클래스 메서드를 `정적` 메서드로 만들어, 특정 인스턴스가 아닌 클래스에 속하도록 만듬
- getInstance()는 정적 메서드이므로, 클래스 인스턴스가 없을 때 호출되며,
- instance member에 저장된 인스턴스가 없을 경우 새 인스턴스를 만들고, 그렇지 않다면 저장된 인스턴스를 반환한다.

## Conclusion

- 싱글톤 패턴은, 전역 범위에서 런타임 중 싱글톤은 한번만 생성된다.
- 장점?
  - 인스턴스가 1개만 필요한 객체 (e.g. 캐시, 로깅, 컨트롤러) 에서 전역변수를 사용하지 않아 자원을 불필요하게 쓰지 않을 수 있다.
  - e.g. 전체에서 log를 수집할 하나의 log instance를 사용하여, 중복 로깅을 방지하고 로그를 한 곳에서 관리할 수 있다. 로깅 시스템을 singleton으로 구현하면, 다른 모듈에서 쉽게 로그를 기록하고, 필요한 경우에 로그 데이터를 조회할 수 있도록 만들 수 있다.
- 단점?
  - OCP를 위반하게 될 수도 있다. (싱글톤에 많은 책임을 부여하고 데이터를 공유한다면, 클래스간 결합도의 상승으로)
  - SRP를 위반하게 될 수도 있다. (싱글톤에 많은 책임을 부여한다면)
