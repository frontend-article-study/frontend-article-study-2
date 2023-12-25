# 전략 패턴 (Strategy pattern)

## 목차

- 디자인 패턴
- 전략 패턴의 개념
- 예제로 알아보기
  - 시나리오
  - 클래스 구조
  - 소스 코드

## 디자인 패턴

- 소프트웨어 디자인 과정 (디자인) 에서 자주 발생하는 문제들에 대한 일반적인 해결책 (패턴)
- 디자인 패턴은 코드가 아닌 경험을 재사용하는 것.

## 전략 패턴의 개념

- `알고리즘군`을 정의하고 `캡슐화`해서 각각의 알고리즘군을 `수정`해서 쓸 수 있게 해준다.
- `전략`이란, 특정한 목표를 수행하기 위한 행동 계획으로, 알고리즘, 기능, 동작 등을 의미한다.
- 그러므로, `알고리즘 변형`이 빈번히 일어나는 경우 적합한 디자인 패턴이다.

## 예제로 알아보기

### 문제의 코드 - 상속을 이용한 설계

<img width="315" alt="image" src="https://github.com/eileenjang/design-pattern/assets/82510378/9cb970d5-be0d-4b7b-80a7-3eebee93b9a1">

만약 빽빽거리는 기능을 추가한다면, 아래처럼 모든 class 들을 건들여야 함.

<img width="323" alt="image" src="https://github.com/eileenjang/design-pattern/assets/82510378/4cfa4ac5-049c-458a-aeef-cb369b1710d4">

- Method 수정이 번거로운 문제
  - 동일한 내용의 Method 더라도 모든 class 들을 건들여야 하기에 번거로움.
- 새로운 기능 추가가 어려운 문제
  - class 들의 숫자가 기하급수적으로 늘어날 수도 있게됨.

### 전략 패턴을 이용한 코드 - src 폴더 참고

- 만약 `fly()` 메소드를 변경하고 싶다면?
  - Fly.ts 의 fly 메소드만 건들이면 수정 가능함.
- 만약 새로운 기능을 추가하고 싶다면?
  - 새로운 기능에 해당하는 인터페이스 / 클래스를 만들고 이 부분만 수정하면 됨.
- 만약 객체 생성 후에도 전략 수정이 필요하다면?
  - setter 메소드를 포함해서 프로그래밍 실행 중에도 행동을 바꿀 수 있게 하면 됨.

## 전략 패턴의 구조

- TODO: 다이어그램

## 개방 폐쇄 원칙 OCP

- TODO: https://inpa.tistory.com/entry/OOP-%F0%9F%92%A0-%EC%95%84%EC%A3%BC-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EB%8A%94-OCP-%EA%B0%9C%EB%B0%A9-%ED%8F%90%EC%87%84-%EC%9B%90%EC%B9%99

## 레퍼런스

- https://www.yes24.com/Product/Goods/108192370
- https://inpa.tistory.com/entry/GOF-%F0%9F%92%A0-%EC%A0%84%EB%9E%B5Strategy-%ED%8C%A8%ED%84%B4-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%90#thankYou
- https://www.youtube.com/watch?v=vNsZXC3VgUA
