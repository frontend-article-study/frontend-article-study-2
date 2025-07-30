# Temporal

# Date

- JavaScript에서 시간과 날짜를 다루는 기본 내장 객체
- 내부적으로 **UTC 기준 시각을 숫자(타임스탬프)** 로 저장함

## Date의 문제점

### 시간대(Timezone) 처리

- Date 객체는 시간대를 저장하지 않고,
- 출력 시 **항상 컴퓨터의 로컬 시간대로 자동 변환됨**
- 그래서 같은 순간의 시간이 사용자 컴퓨터 위치에 따라 다르게 보임

```tsx
const date = new Date('2024-06-11T00:00:00Z');
console.log(date.toString());
// 한국 컴퓨터: "Tue Jun 11 2024 09:00:00 GMT+0900 (KST)"
// 뉴욕 컴퓨터: "Mon Jun 10 2024 20:00:00 GMT-0400 (EDT)"
```

### 시간대 변환과 계산이 번거로움

- Date 객체는 시간대를 바꾸거나 특정 시간대를 기준으로 계산하는 기능이 부족함
- 복잡한 시간대 처리는 외부 라이브러리에 의존해야 함

### mutable한 객체

- Date는 직접 수정이 가능함
- 사이드 이펙 발생 가능성

### 혼란스러운 API

```tsx
let date = new Date('2024-06-11');
console.log(date.getMonth()); // 5 출력 (6월인데 5가 나옴)
```

# Temporal

- 최신 자바스크립트 표준에서 제안된 시간/날짜 처리 API
- 전역 객체, 다양한 날짜와 시간 작업을 위한 클래스를 포함하는 최상위 네임스페이스
- 현재 Stage 3으로 최종 승인 단계
  - 아직은 Firefox만 지원
- Date의 한계를 보완하기 위함
  - 시간대와 함께 날짜와 시간을 나타내는 Temporal.ZonedDateTime 객체
    - e.g. `1996-12-19T16:39:57-08:00[America/Los_Angeles]`
- 윤년이나 서머타임을 반영하여 날짜를 계산함
- 불변성
- 나노초 지원

## 주요 컨셉

- instants(고유한 시점), wall-clock times(지역 시간), durations(기간) 이라는 키 컨셉

| 객체명                     | 설명                               |
| -------------------------- | ---------------------------------- |
| **Temporal.PlainDate**     | 시간대 없는 순수 날짜 (YYYY-MM-DD) |
| **Temporal.PlainTime**     | 시간만 있는 객체 (HH\:MM\:SS)      |
| **Temporal.PlainDateTime** | 날짜와 시간 (시간대 없이)          |
| **Temporal.ZonedDateTime** | 날짜 + 시간 + 시간대 정보 포함     |
| **Temporal.Instant**       | UTC 기준의 절대 시간 (타임스탬프)  |
| **Temporal.Duration**      | 시간 간격 표현 객체                |
| **Temporal.Now**           | 현재 시간 관련 도우미 메서드 제공  |

## 예제

### 날짜 생성하기

- 객체를 생성할 때 시간대가 정확히 반영되도록 함

```tsx
const zonedDateTime = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 8,
  day: 16,
  hour: 12,
  minute: 30,
  second: 0,
  timeZone: 'Europe/Madrid',
});
```

### 현재 날짜와 시간 가져오기

- 여러 메서드에서 시간대를 제공하기에 복잡한 계산을 직접 수행할 필요 없음

```tsx
// 시스템의 시간대(서울)에서 현재 날짜 가져오기
Temporal.Now.plainDateTimeISO(); // 2025-06-11T00:07:30.123

// 뉴욕 시간대(서울과 13시간 차)에서 현재 날짜 가져오기
Temporal.Now.plainDateTimeISO('America/New_York'); // 2025-06-10T11:07:30.123
```

### 1달 뒤 날짜 구하기

- Date

```tsx
const now = new Date();
const nextMonth = new Date(now);
nextMonth.setMonth(now.getMonth() + 1); // 오류 발생 가능성
// (1/31 + 1개월 = 존재하지 않는 2/31 -> 3/31이 됨 (?)
```

- Temporal

```tsx
const now = Temporal.Now.plainDateISO();
const nextMonth = now.add({ months: 1 });
```

### 날짜 비교하기

```tsx
const one = Temporal.ZonedDateTime.from('2020-11-01T01:45-07:00[America/Los_Angeles]');
const two = Temporal.ZonedDateTime.from('2020-11-01T01:15-08:00[America/Los_Angeles]');
Temporal.ZonedDateTime.compare(one, two); // -1 (dateTime1 < dateTime2)
```

# ref

- https://apidog.com/kr/blog/temporal-date-api-javascript-kr/
- [https://velog.io/@eunbinn/javascript-temporal-is-coming](https://velog.io/@eunbinn/javascript-temporal-is-coming)
