# 서론

자바스크립트는 인터프리터 언어라고 불립니다. 가장 처음 넷스케이프에서 JS를 실행한 엔진이 SpiderMonkey였고 이것이 인터프리터로 동작했기 때문입니다. 당시에는 1995년이었고 13년뒤 크롬과 함께 V8엔진이 등장합니다. V8엔진은 2008~2015 7년동안 인터프리터 언어라는 이름속에 컴파일러를 탑재하고 있었습니다. 

<br/>

**바쁜 직장인을 위한 결론 요약**

**2008 : Full-Codegen이라는 JIT-Compiler를 사용**
- 인터프리터처럼 한 줄씩 읽으며 컴파일
- 속도가 우선시 되어 컴파일은 최소한으로 진행
- 주로 메모리 접근 속도 증가를 목표

**2010~2015 : Crankshaft**
- Full-Codegen과 함께 사용
- 최적화 전용 컴파일러, 반복되는 코드를 최적화
- 메모리 접근이 아닌 x+y => 3+4 로 변수의 자리에 값을 직접 적용하거나 두가지 함수를 하나의 함수로 합치는 등 메모리에 접근하는 오버헤드 자체를 제거하여 최적화합니다.

**JS를 효율적으로 사용하는 법**
- Stack 메모리를 사용하도록 만들자. (지역변수)
- 반복문 중간에 if문 사용 자제 (필요할때만 사용)
- 불필요한 타입 변경 xx
- 등등.. 가능한 부분은 정적으로 사용하자.

<br/>

# 2008 : 크롬과 함께 Full-Codegen 등장

크롬, V8엔진과 함께 Full-Codegen JIT-Compiler가 등장합니다.

![](https://velog.velcdn.com/images/jaehwan/post/dc96a72d-2f93-4fbd-8563-ff27466824f6/image.png)


출처 : https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g1453eb7f19_0_328

## Full-Codegen?

AST(추상 구문 트리)를 순회한 후 신속하게 기계어로 변환하는 방식의 Fast JIT-Compiler입니다. 인라인 캐싱 기법을 활용하여 간단한 캐싱 기능도 제공합니다.

아래의 Sum함수를 통해 예를 들어보겠습니다.

### Source : Script 작성

```jsx
function Sum(point) = {
  return point.x + point.y;
};
```

- 개발자가 스크립트를 작성 후 실행하면 Parser가 실행됩니다.

<br/>

### **Parser : AST 순회**

- Sum함수는 Parser를 통해 AST로 변환됩니다.

![](https://velog.velcdn.com/images/jaehwan/post/988a6130-9dfe-453e-8268-b1ed7a6bf937/image.png)


### **Full Codegen**

- Full-Codegen은 AST를 순회하여 Assembly로 변환합니다.
![](https://velog.velcdn.com/images/jaehwan/post/4add3fb3-bcf0-4e5f-86f2-0bfc3568c05e/image.png)


만들어진 Assembly의 경우 곧바로 기계어로 변환하며 CPU에게 전달할 수 있습니다. 하지만 항상 Assembly어를 바로 사용하는 것은 메모리의 낭비가 될 수 있습니다. 그래서 Full-Codegen의 대표적인 캐싱 기능 두가지가 존재합니다.

**hidden class :** 객체 메모리 주소 고정 방식

**inline cache :** 함수 호출 위치를 호출된 함수의 본문으로 대체하는 최적화

<br/>


### **Hidden Class**

히든 클래스는 객체의 구조를 Offset이라는 형태로 캐싱합니다. Offset이란 객체가 가지고 있는 프로퍼티의 위치를 정의한 형태입니다. 히든클래스에 접근하게 된다면 객체를 탐색하지 않아도 프로퍼티의 위치를 알 수 있습니다.

항상 동적 타입 언어를 사용하여 이 개념이 잘 이해가 안갔습니다. 이것을 이해하기 위해서는 동적 타입 언어와 정적 타입 언어의 차이를 알 필요가 있습니다.

<br/>

### **동적 & 정적 타입 언어**

**동적 타입 언어**

JS의 경우 속성의 위치가 **동적으로 변하는 언어**입니다. 그래서 고정된 주소는 사용하지 못합니다.

간단한 예시로 아래의 경우 name은 런타입에서 계속 변경될 수 있습니다.

```jsx
let name = "Alice";   // 문자열 "Alice" 저장
console.log(name);    // Alice

name = "Bob";         // "Bob"을 새로 할당 → 새로운 메모리 주소
console.log(name);    // Bob
```
![](https://velog.velcdn.com/images/jaehwan/post/9c4c6319-a0c8-4479-85c0-28ffebd6f56d/image.png)



**정적 타입 언어**

C++과 같은 **정적 타입 언어**의 경우 일반적으로 변수선언시 메모리주소가 고정됩니다. 스택과 힙에 따라서 약간의 차이가 있습니다.

<br/>

**스택과 힙의 차이**

- 스택(Stack) : 선언과 동시에 메모리 고정
    
    타겟 : 지역 변수
    
    - 스택은 연속된 메모리 공간을 사용하며, 변수를 선언하면 **그 위치가 고정**됩니다.
- 힙(Heap)
    
    타겟 : new 연산자
    
    new 연산자를 사용시 동적 할당됩니다.  ⇒ 런타임에 메모리 위치 설정
    
    - 하지만 완전 동적할당은 아닙니다. 해당 변수의 포인터의 주소값은 변해도 실제 데이터가 저장된 메모리는 고정입니다.

![](https://velog.velcdn.com/images/jaehwan/post/d609b897-2800-4e32-95fd-29fac062c77f/image.png)


즉, 스택에 있는 변수들은 선언되는 순간 메모리가 고정되며, 힙에 있는 변수들도 할당된 주소를 변경하지 않는 한 위치가 유지됩니다.

위의 과정에서 여러 단계의 포인터 주소를 거쳐 실제 Heap 메모리 값에 접근하는 것은 오버헤드가 될 수 있습니다.

<br/>

### Hidden Class

위의 그림에서 매번 Person p에 접근하기위해 주소를 찾고 멤버변수에 접근하는 수고로움을 제거하고 싶었습니다.

그래서  C++의 메모리 주소 오프셋 방식을 채택하여 객체 구조를 미리 정의하도록 합니다.

![](https://velog.velcdn.com/images/jaehwan/post/6e8107aa-6c05-4da3-b65e-b3e2607c77f2/image.png)


Hidden Class를 통해 오프셋을 만들었습니다. 같은 객체의 구조를 여러번 사용하니 매번 같은 구조를 만들기 위해 오프셋을 사용합니다.

오프셋을 통해 만들어진 객체는 메모리위치가 순서대로 위치하여 어느정도 자동으로 객체의 위치를 찾을 수 있게 됩니다.

<br/>


### Inline Caches (ICs)

- 동적 타입을 최적화하는 기법 중 하나입니다. JS는 런타임에서 객체의 속성이 어디있는지 매번 찾아야함으로 성능이 떨어집니다. (히든클래스의 경우 어느정도 위치를 알려주지만 결국 메모리에 접근을 하는 단계는 존재합니다.)
    
    ex) hidden class 확인 ⇒ name or age와 같은 속성 위치 확인 후 검색
    
- 이러한 경우를 최적화하기 위해 IC가 등장합니다.

**처음 실행 : UNINITIALIZED_LOAD_IC**

- 상태 : 해당 속성이 한 번도 접근된 적이 없는 상태
- 단계 : 캐시 생성을 위한 데이터를 수집


![](https://velog.velcdn.com/images/jaehwan/post/cde60d00-1114-47ac-b45b-a7ce57b3b6fa/image.png)
출처 : https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g17d335048f_1_2957

- UNINITIALIZED_LOAD_IC → 속성이 처음 접근됨 (IC 없음, 런타임 호출)
- 런타임 호출(Runtime Call) → 속성을 찾고 객체 구조(Hidden Class) 확인
- 속성 `x`, `y`의 메모리 위치(Offset)를 기록하여 **IC를 생성할 준비**

**두번째 실행 : MONOMORPHIC_LOAD_IC**

- 상태 : 해당 속성에 두번째 접근
- 단계 : 메모리에 다이렉트 접근이 가능하도록 만드는 단계

![](https://velog.velcdn.com/images/jaehwan/post/738c9f9c-54af-4ac3-9608-ad3a7817ee77/image.png)

출처 : https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g17d335048f_1_3014



... ; Check object's map is 

- 객체(Instance)의 히든 클래스(Hidden Class)를 확인

... ; Point type, or bailout

- 해당 히든 클래스에 캐싱된 메모리 오프셋(Offset)을 사용하여 속성을 바로 찾습니다.

mov eax, [eax + 0x4]

- x 속성을 메모리 0x4에 저장합니다. → 검색이 필요없이 곧바로 접근하기 위함

<br/>

**단계 종류**

- UNINITIALIZED_LOAD_IC →  속성이 처음 접근됨 (캐싱되지 않은 상태)
- MONOMORPHIC_LOAD_IC →  하나의 객체 형태(히든 클래스)로 접근됨 (최적화 시작)
- POLYMORPHIC_LOAD_IC →  여러 객체 형태(다른 히든 클래스)로 접근됨 (캐싱 범위 확장)
- MEGAMORPHIC_LOAD_IC →  너무 많은 객체 형태가 사용되어 더 이상 최적화할 수 없음

![](https://velog.velcdn.com/images/jaehwan/post/779692ae-e460-4cf2-99ae-688b2f52936d/image.png)


정리

- Hidden Class : 객체 구조를 재활용하여 객체 프로퍼티의 위치를 예측하고 순서대로 정렬하여 객체 자체 위치를 예측하기 쉽도록 합니다.
- IC : Hidden Class를 통해 같은 구조임을 확인하고 캐싱을 시작합니다. 캐싱을 하게되면 속성을 직접 로드하여 메모리 접근 경로를 줄입니다.

<br/>

# **2010 ~ 2015 : Crankshaft**

첫 최적화 컴파일러입니다. Full-Codegen이 속도가 최우선인 JIT-Compiler였다면 Crankshaft의 경우 최적화에 중점을 두었습니다. 그래서 항상 실행하는 것이 아닌 최적화가 필요한 반복되는 경우들에 한해서 최적화를 진행합니다.

![](https://velog.velcdn.com/images/jaehwan/post/5ed5a274-57ae-40cb-8b53-69c888f0bd7f/image.png)


출처 : https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g1453eb7f19_0_359

<br/>

## **최적화 과정**

Full-Codegen과는 조금 다른 양상을 보여줍니다. Full-Codegen은 메모리 접근 루트를 최소한으로 하여 빠르게메모리를 찾고 가져올 수 있도록 하는 반면 Crankshaft의 경우 메모리접근이 아닌 결과값 그 자체를 코드에 반영하여 메모리접근 자체를 하지 않아도 되도록 최적화 됩니다.

![](https://velog.velcdn.com/images/jaehwan/post/ed6851ef-7445-4e61-8112-cbf2142ccb72/image.png)


출처 : https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g17d335048f_1_3176

<br/>

### 객체의 타입 분석 (Type Analysis)
- Elide map checks : 객체의 히든 클래스가 변하지 않는다면 객체 구조 검사 자체를 제거합니다.
- Inlining (인라이닝)
    
    new Point에 접근하기 위해서는 히든 클래스를 접근하고 point의 프로퍼티 x, y를 찾고 x,y의 값이 저장된 메모리에 접근하는 과정이 존재합니다. Inlining은 해당 과정을 줄이기 위해서 값혹은 프로퍼티를 직접 함수 내부에 적용하는 것입니다.
    
    - 아래의 내용이 어셈블리어 단위에서 진행됩니다.
    
        
        AS-IS
        
        ```jsx
        function square(x) {
          return x * x;
        }
        
        function compute(a, b) {
          return square(a) + square(b);
        }
        
        console.log(compute(3, 4)); // 9 + 16 = 25
        ```
        
        TO-BE
        
        ```jsx
        function compute(a, b) {
          return (a * a) + (b * b); // square() 호출이 사라짐
        }
        
        console.log(compute(3, 4)); // 9 + 16 = 25
        ```
        
        <br/>

### 연산의 타입 결정 (Always a Number)
- Inline FP addition : point.x와 point.y는 항상 숫자(Number)이므로
    
    AS-IS
    
    ```jsx
    function add(a, b) {
      return a + b;
    }
    console.log(add(1.2, 2.3)); // 3.5
    ```
    
    TO-BE
    
    ```jsx
    console.log(1.2 + 2.3); // add() 함수 호출 없이 직접 연산 수행
    ```
    

<details>
    <summary>Floating Point(FP)?</summary>

 JavaScript에서 숫자는 기본적으로 **IEEE 754 64-bit 부동소수점(Floating Point) 형식**을 사용합니다.
    
 
  ```jsx
  let x = 1.2;
  let y = 2.3;
  let z = x + y; // Floating Point Addition
  ```
    
위 코드에서 x + y 연산은 부동소수점 덧셈(FP Addition)이며, CPU의 FPU(Floating Point Unit)을 사용하여 수행됩니다.
</details>

<br/>

### Escape analysis (탈출 분석) : 객체 탈출

- JavaScript에서는 일반적으로 객체가 **Heap(힙) 메모리**에 할당됩니다. 메모리할당을 줄임으로서 성능을 최적화합니다.
- 힙에 할당된 객체는 GC(Garbage Collector)에 의해 주기적으로 정리됩니다. 그러나 이것은 성능 저하가 발생 합니다.

    1. **객체가 함수 내부에서만 사용되는 경우 : Stack 메모리 사용**
    
    ```jsx
    function createPoint(x, y) {
      return { x, y }; // 객체가 createPoint() 내부에서만 사용되므로 Stack
    }
    
    function compute() {
    	const p = createPoint(1, 2);  // Escape Analysis 수행
      return p.x + p.y; // p가 함수 외부로 탈출하지 않음
    }
    ```
    
    - { x, y } 객체가 compute() 함수 내부에서만 사용됨 → **Stack 할당 가능**
    - JIT 컴파일 시, { x, y }를 Stack 메모리에 저장하여 힙 할당을 방지
    <br/>
    
    2.  **Scalar Replacement (스칼라 치환)**
        
        객체의 필드를  **Scalar(단일 값)로 변환하여 Heap 할당을 제거하는 기법**
        
        Crankshaft는 Escape Analysis를 통해 **객체를 구성하는 필드(속성)들을 Scalar로 변환하여 최적화.**
        
        ```jsx
        function createPoint(x, y) {
          return { x, y }; // 객체 생성
        }
        
        function compute() {
          const p = createPoint(3, 4);
          return p.x * p.y;
        }
        ```
        
        최적화 결과
        
        - createPoint() 객체 자체를 제거하고, x와 y를 **Scalar**로 변환하여 성능 최적화!
        - 객체가 없어지면서, Heap 메모리 할당과 GC 부담 제거
        
        ```jsx
        function compute() {
          const x = 3;
          const y = 4;
          return x * y; // 객체가 개별 변수로 변환됨
        }
        ```
        
    
    3. **Dead Object Elimination (불필요한 객체 제거)**
    
    <br/>

### GVN (Global Value Numbering, 전역 값 번호 매기기)

- 중복 연산 제거(공통 부분식 제거, CSE; Common Subexpression Elimination) 최적화 기법입니다.
    
![](https://velog.velcdn.com/images/jaehwan/post/b6e07a39-653d-41b2-bccc-55ebe42ccb7b/image.png)

    
<br/>

### **Crankshaft의 Deoptimization**

- Crankshaft는 최적화를 시도하지만, 필요할 경우 다시 안전한 Base line code(Full-Codegen 코드)로 복귀할 수 있도록 백업을 유지합니다.

<br/>

**Deoptimization 발생 원인**

- Hidden Class 변경
    
    ```jsx
    add(10, 20);  // 숫자 연산 (최적화됨)
    add("10", "20"); // 문자열 연산 (예상과 다름) → Deopt 발생
    ```
    
- Speculative Optimization 실패
    
    ```jsx
    add(10, 20);  // 숫자 연산 (최적화됨)
    add("10", "20"); // 문자열 연산 (예상과 다름) → Deopt 발생
    ```
    
- OSR(온스택 교체, On-Stack Replacement) 중 예외 발생
    
    ```jsx
    function loop(n) {
      for (let i = 0; i < n; i++) {
        if (i === 1000) throw new Error("Break");
      }
    }
    loop(5000);
    ```
    
    - for 루프이므로 최적화를 수행합니다.
    - i === 1000에서 예외가 발생하면 Deopt가 발생합니다.
    
    <br/>

**Deoptimization 과정**

Crankshaft는 Deoptimization을 수행하기 위해 Full-Codegen의 스택 프레임을 다시 구성해야 합니다.

1. Deopt points(디옵트 포인트) 삽입
    
    Crankshaft는 최적화된 코드 실행 전에 Deopt points를 추가하여 문제가 발생할 경우 복귀 가능하도록 준비합니다.
    
2. 최적화된 코드 실행
3. Deoptimization 감지
    
    실행 도중 Hidden Class 변경, OSR 예외, Speculative Optimization 실패 등이 발생하면 Deoptimization **트리거**가 감지됨.
    
4. Baseline Code로 복귀
    
    Crankshaft는 Full-Codegen의 실행을 모델링하여 Deopt point에서 기존 스택 프레임을 복원하고, Baseline Code로 돌아감.
    
<br/>


## 후기

**JS도 적당히 정적으로 사용하자.**

- 타입이 변경되지 않도록 하자.
- 루프 중간에 if를 넣으면 캐싱이 깨진다. (필요없다면 제거하자)
- + 연산에 string, number 아무거나 상관없으니 하나만 넣어서 사용하자.
- 등등..

<br/>

**처음부터 완벽한 것보다 지속적 관심과 업데이트가 중요**

V8엔진이 진화하는 과정을 보니 구글도 처음부터 모든것을 완벽하게 하지 않는 구나. 라는 생각이 들었습니다. (물론 그 당시에는 기존보다 10배나 빠른 획기적인 방법 이었지만)

V8만 보아도 Full-Codegen을 만들었을 때 단점이 존재했고 계속 보완하는 과정이 필요했습니다. 그러한 과정에서 이 다음에 이야기할 내용이지만 설계가 복잡해져 3개의 JIT-Compiler를 동시에 사용하는 상황도 발생하게 됩니다. 물론 현재에는 모두 해결된 상태입니다. 여기서 생각해본 것은 프로덕트는 항상 단점이 존재한다는 것 입니다.

결국 지속적 관심과 업데이트 중요하다는 생각이 들며 너무 처음부터 완벽하게 할 필요는 없다. 라는 생각이 듭니다.
<br/>

**현대의 JS 프레임워크 아키텍처는 이러한 과거의 행적에 영향을 받지 않았을까.**

Full-Codegen과 Crankshaft.. 어떻게 보면 컴파일러에 대한 공부를 해본 것인데 React와 Vue가 떠올랐습니다. 리액트도 JS를 Dom Tree로 만들고 그것을 조작하고 Vue는 그것을 컴파일합니다. 어떻게 보면 컴파일러적 사고(?)를 할 수 있다면 VDOM과 같은 개념을 나도 만들 수 있지 않을까? 하는 생각이 들며 JS, Web에 너무 갇혀있지 않고 여러 방향으로 공부를 해야할 필요가 있다는 것을 느꼈습니다.

<br/>
<br/>
다음 글 → 2015 ~ 현재 v8 JIT-Compiler
<br/>
<br/>

출처 : 

**DLS Keynote: Ignition: Jump-starting an Interpreter for V8 :** 

https://docs.google.com/presentation/d/1HgDDXBYqCJNasBKBDf9szap1j4q4wnSHhOYpaNy5mHU/edit#slide=id.g17d335048f_1_3210

https://blog.chromium.org/2010/12/new-crankshaft-for-v8.html

https://en.wikipedia.org/wiki/Static_single-assignment_form

https://en.wikipedia.org/wiki/Register_allocation

https://en.wikipedia.org/wiki/Inline_expansion

https://en.wikipedia.org/wiki/Loop-invariant_code_motion
