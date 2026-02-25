# 우리는 왜 어떤 코드를 읽기 쉽다고 느낄까

- 원문: https://evan-moon.github.io/2026/01/30/developer-intuition-readable-code-and-neuroscience

## 작업 기억: 일종의 고정 크기 스택

- 인지심리학자 조지 밀러와 이후 연구들에 따르면, 인간이 **동시에 유지할 수 있는 작업 기억의 청크는 약 3~4개 수준** (과제의 종류, 숙련도, 정보의 양식에 따라 달라질 수 있음)
  - 코드를 읽을 때는 **변수 상태, 제어 흐름, 스코프** 등이 이 슬롯을 차지하게 됨

- 이러한 작업 기억은 일종의 **고정 크기 스택**과 같음
  - 용량이 한계에 부딪혀 초과(StackOverflow)하는 순간 뇌가 더 이상 정보를 받아들이지 못하고 처리 능력이 무너지며 **"이 코드는 복잡하다"는 감각**을 느끼게 됨

- 따라서 복잡한 조건이나 계산 로직을 **적절한 단위의 함수로 분리(패키징)** 하여, ‘한 번에 머릿속에 올려야 할 정보’의 맥락을 제어하는 것이 **추상화와 설계의 핵심 목적**

### 예시

```ts
// 작업 기억 슬롯 4개를 빠르게 소진하는 코드
function processOrder(order: Order) {
  if (order.status === 'pending' && order.items.length > 0) {
    const discount =
      order.customer.tier === 'premium'
        ? order.items.reduce((sum, item) => sum + item.price, 0) * 0.1
        : (order.coupon?.discount ?? 0);

    const tax = (order.total - discount) * (order.shipping.domestic ? 0.1 : 0);
    const finalPrice = order.total - discount + tax + order.shipping.cost;

    return { ...order, finalPrice, status: 'processed' };
  }
  return order;
}
```

- `order.status`의 조건, `order.items`의 존재 여부, `customer.tier`에 따른 할인 분기, 쿠폰의 널 체크, 세금 계산의 국내/해외 분기, 최종 가격 산출 등 모든 맥락을 3~4개의 슬롯에 담아야 함

```typescript
// 작업 기억 부담을 줄인 버전
function calculateDiscount(order: Order): number {
  if (order.customer.tier === 'premium') {
    const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
    return subtotal * 0.1;
  }
  return order.coupon?.discount ?? 0;
}

function calculateTax(amount: number, shipping: ShippingInfo): number {
  return shipping.domestic ? amount * 0.1 : 0;
}

function processOrder(order: Order) {
  if (order.status !== 'pending' || order.items.length === 0) {
    return order;
  }

  const discount = calculateDiscount(order);
  const tax = calculateTax(order.total - discount, order.shipping);
  const finalPrice = order.total - discount + tax + order.shipping.cost;

  return { ...order, finalPrice, status: 'processed' };
}
```

- 함수를 활용해 **정보를 일정한 단위로 패키징**
  - `calculateDiscount`를 읽을 때는 할인 로직에만 집중
  - `processOrder`를 읽을 때는 각 계산의 세부 구현을 몰라도 전체 흐름을 이해할 수 있음

## 청킹: 뇌의 데이터 압축 알고리즘

- 작업 기억의 슬롯이 4개뿐임에도 수백 줄의 코드를 이해할 수 있는 이유는 **청킹이라는 인지 메커니즘** 덕분
  - 여러 개의 작은 정보 단위를 **하나의 의미 있는 덩어리(청크)** 로 묶어서 처리하는 방식
  - [취리히 대학교의 연구](https://doi.org/10.5334/joc.451)에 따르면, 청킹은 장기 기억에서 압축된 청크를 불러와 개별 요소를 대체함으로써 **작업 기억의 부하를 줄임**
  - 예: `01012345678` (11자리) → `010-1234-5678` (3덩어리) → `010`은 "한국 번호"라는 익숙한 청크로 자동 처리

```ts
const activeUsers = users.filter((u) => u.isActive).map((u) => u.name);
```

- 초보 개발자의 처리 방식: 모든 요소를 개별 슬롯에 할당
  - `users` 변수, `.filter` 동작, 화살표 함수 문법, `u.isActive` 속성 접근, `.map` 동작 등
- 숙련된 개발자의 처리 방식: **"배열 필터링 후 변환"이라는 단 하나의 청크**로 인식
  - → **관용적인 코드가 읽기 쉬운 이유**
    - 정답이라서가 아니라, **개발자의 장기 기억에 저장된 청크와 일치하기 때문**
    - 지나치게 창의적인 코드는 뇌를 피곤하게 함

## 시스템 1과 시스템 2: 직관과 분석

- 다니엘 카너먼의 이중 처리 이론에 따른 인간 사고의 두 가지 시스템
  - **시스템 1**: 빠르고, 자동적이고, 직관적인 사고 (패턴 인식 기반)
  - **시스템 2**: 느리고, 의식적이고, 분석적인 사고 (논리적 추론 기반)

- **읽기 쉬운 코드의 본질**은 대부분 시스템 1의 패턴 인식으로 처리되고 **시스템 2의 개입이 최소화되는 코드**
  - 숙련된 개발자가 코드를 읽을 때, `for` 루프, `if-else` 분기, `map`/`filter`/`reduce` 체이닝 등 익숙한 패턴은 의식적 노력 없이 시스템 1이 처리
  - 시스템 1이 막히면 그때서야 시스템 2가 호출된다. “이게 뭐지?” 하고 의식적으로 분석을 시작하는 순간이 바로 시스템 2가 개입하는 시점

```ts
// 시스템 1이 처리 가능한 코드
const canPurchase = user.age >= 18 && user.isVerified;
```

- 익숙한 패턴으로 시스템 1이 자동 처리

```ts
// 시스템 2를 호출하는 코드
const canPurchase =
  !(user.age < 18 || !user.isVerified) && user.age !== undefined;
```

- 시스템 1이 "모르겠다"는 신호를 보내고, **시스템 2가 비싼 비용을 들여 분석을 시작**
  - 이중 부정 해석, 드모르간 법칙 적용 등
  - 코드 리뷰에서 "이해하기 어렵다"는 피드백은 취향 문제가 아니라, **인지 시스템의 전환 비용**(인지적 긴장)이 실제로 발생했다는 신호

## 게슈탈트 원리: 코드의 시각적 구조가 이해에 미치는 영향

- 게슈탈트 심리학: 인간의 뇌가 개별 요소가 아닌 **전체 패턴과 구조를 우선적으로 인식**한다는 지각 원리
  - 읽기 쉬운 코드에는 논리적 구조뿐만 아니라 시각적 구조도 중요함

### 근접성의 원리

```ts
// 근접성 원리가 적용되지 않은 코드
const name = user.firstName + ' ' + user.lastName;
const email = user.email.toLowerCase();
const isValid = email.includes('@') && email.includes('.');
const role = determineRole(user.permissions);
const dashboard = getDashboard(role);
const notifications = getNotifications(user.id, role);

// 근접성 원리가 적용된 코드
const name = user.firstName + ' ' + user.lastName;
const email = user.email.toLowerCase();
const isValid = email.includes('@') && email.includes('.');

const role = determineRole(user.permissions);
const dashboard = getDashboard(role);
const notifications = getNotifications(user.id, role);
```

- 가까이 있는 요소들은 하나의 그룹으로 인식됨
- 빈 줄 하나로 뇌는 자동으로 "사용자 정보 처리"와 "권한 기반 데이터 조회"라는 **두 그룹을 명확히 인식**
- 코드의 빈 줄과 들여쓰기는 단순한 미관이 아니라 **뇌의 구조 파악을 돕는 강력한 단서**

### 유사성의 원리

```ts
// 유사성 원리가 깨진 네이밍
const userData = fetchUser(id);
const get_orders = retrieveOrderList(userId);
const pmtHistory = loadPayments(uid);

// 유사성 원리가 적용된 네이밍
const user = fetchUser(id);
const orders = fetchOrders(id);
const payments = fetchPayments(id);
```

- 규칙이 제각각인 첫 코드는 뇌가 개별 항목으로 처리하며 작업 기억을 소진함
- `fetch + 리소스명` 형태의 일관된 네이밍은 **"동일한 패턴의 데이터 패칭"이라는 하나의 청크**로 인식됨

### 연속성의 원리

```typescript
// 연속성이 깨지는 코드
function getPrice(user: User, product: Product): number {
  if (user.isActive) {
    if (product.inStock) {
      if (user.tier === 'premium') {
        return product.price * 0.8;
      } else {
        if (product.onSale) {
          return product.salePrice;
        } else {
          return product.price;
        }
      }
    } else {
      throw new Error('Out of stock');
    }
  } else {
    throw new Error('Inactive user');
  }
}

// 연속성이 유지되는 코드 (얼리 리턴 패턴)
function getPrice(user: User, product: Product): number {
  if (!user.isActive) throw new Error('Inactive user');
  if (!product.inStock) throw new Error('Out of stock');

  if (user.tier === 'premium') return product.price * 0.8;
  if (product.onSale) return product.salePrice;

  return product.price;
}
```

- 시선이 자연스럽게 흐르는 방향을 따라 하나의 연속된 것으로 인식함 (위에서 아래로, 왼쪽에서 오른쪽으로)
- 첫 번째 코드는 깊은 중첩(지그재그 사선 이동)이 존재하고 뇌는 “지금 어느 중첩 안에 있는가”를 작업 기억에 유지해야 함
- 두 번째 코드는 예외를 먼저 걸러낸 뒤, 위에서 아래로 한 방향으로 흘러감

## 인지 부하 이론: 세 가지 부하의 종류

- 존 스웰러의 인지 부하 이론에 따른 세 가지 분류
  1.  **내재적 부하**: 과제 자체의 본질적 복잡성 (예: 분산 시스템 합의 알고리즘)
  2.  **외재적 부하**: 표현 방식에서 오는 불필요한 복잡성 (예: 혼란스러운 네이밍, 불필요한 간접 참조)
  3.  **본유적 부하**: 새로운 스키마를 학습하는 데 드는 유익한 부하

- 이 이론에 따르면, 읽기 쉬운 코드를 작성하는 핵심은 **외재적 부하를 최소화하는 것**
  - 뇌의 제한된 자원을 **불필요한 표현 해석에 낭비하지 않고, 내재적 부하(실제 문제) 처리에 집중**하게 해줌
  - [2023년 연구](https://linkinghub.elsevier.com/retrieve/pii/S0164121223000146)에 따르면 기계적인 '코드 복잡도' 메트릭과 개발자가 느끼는 '실제 인지 부하'는 다름
    - 즉, 우리가 “복잡도”라고 측정하는 것과 뇌가 실제로 “복잡하다”고 느끼는 것은 다를 수 있음
    - 우리가 겪는 인지 부하는 패턴의 익숙함, 청킹의 효율성, 시각적 구조의 명확성과 같이 주관적 인식에 영향을 받음

## 경험이 뇌를 물리적으로 바꾼다

- 2024년 뇌파 연구 결과, 숙련된 프로그래머는 코드의 문법 오류와 의미 오류에 대해 자연어를 읽을 때와 유사한 각기 다른 뇌파 패턴을 보임
- 코딩 경험은 신경가소성에 의해 **특정 언어와 패턴을 처리하기 위한 신경 회로를 뇌에 물리적으로 형성**함
- 팀의 **코딩 컨벤션**은 단순한 통일성 문제가 아니라, 팀원들의 뇌에 동일한 스키마(청크)를 공유하여 **집단적 인지 효율성을 높이는 과정**임

## 예측 부호화: 뇌는 코드를 읽는게 아니라 예측한다

- 인지과학의 예측 부호화 이론
  - 뇌는 정보를 수동적으로 수신하지 않고 **끊임없이 다음 정보를 예측**하며, 예측이 빗나갈 때만 추가 처리를 함

```ts
// 뇌의 예측을 벗어나는 코드
async function fetchUserProfile(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    globalEventBus.emit('user-fetched', response.data); // 엥 이거 뭐임?
    localStorage.setItem('lastUser', JSON.stringify(response.data)); // 어라?
    analytics.track('profile_view', { userId }); // 아 로깅을 왜 여기서 해
    return response.data;
```

- `fetchUserProfile`이라는 이름과 달리 이벤트 발행, 로컬 스토리지 저장 등 **예측 밖의 사이드 이펙트 발생**
  - 이때마다 뇌는 예측 오류 신호를 내고 **시스템 2를 호출하여 인지 비용을 급증**시킴

```tsx
// 예측 가능한 인터페이스
<TextInput
  value={name}
  onChange={setName}
  placeholder="이름을 입력하세요"
/>

// 예측이 어려운 인터페이스
<UserNameInput
  user={name}
  setUser={setUser}
  blank="이름을 입력하세요"
/>
```

- 첫 번째 컴포넌트는 React 생태계에서 **거의 모든 입력 컴포넌트가 공유하는 인터페이스**를 따름
- 두 번째는 비즈니스 로직에 강하게 결합되었거나 **의미를 알기 어려운 인터페이스**를 가지고 있음
  - 컴포넌트가 내부에서 `user` 객체의 어떤 필드를 건드리는지, `blank`는 언제 사용되는지 파악해야 함
  - 내부 구현을 들여다보기 전까지는 안심하고 사용할 수 없어 매번 예측 오류가 발생

즉 읽기 쉬운 코드를 작성하려면 함수명, 변수명, API 설계 등 **코드베이스 모든 수준에서 예측 가능성을 높여야 함**

## 그래서 “좋은 코드”란 결국

- “읽기 쉬운 코드”라는 주관적 느낌의 실체
  - **작업 기억을 초과하지 않는 코드** (맥락 3~4개 이내)
  - **기존 청크와 매칭되는 코드** (익숙한 패턴 활용)
  - **시스템 1에서 처리 가능한 코드** (불필요한 시스템 2 호출 방지)
  - **시각적 구조가 논리적 구조와 일치하는 코드** (게슈탈트 원리)
  - **예측 가능한 코드** (기대를 위반하지 않음)
  - **외재적 인지 부하가 낮은 코드** (표현의 복잡성 제거)

- **가독성과 정확성은 별개의 축**이다
  - 다만 가독성이 높으면 버그를 발견하기도 쉬움
  - 외재적 부하가 낮으니, 뇌의 자원을 논리 오류(버그)를 찾는 데 집중할 수 있기 때문

- 단, 시스템 1의 **익숙함 편향**을 주의해야 함
  - "읽기 어렵다"는 느낌이 어디에서 오는 것인지 구분 필요
    - **객관적인 인지 부하** 때문인지
    - **내 시스템 1에 등록되지 않은 낯선 패턴** 때문인지 (예: FP vs OOP)
  - → **코드 리뷰에서 “이해하기 어렵다”는 피드백을 줄 때, 이게 정말로 인지 부하가 높은 코드인가, 아니면 단순히 내 시스템 1에 등록되지 않은 패턴인가? 생각해보아야 함**
    - 전자: 리팩토링 / 후자: 내 청크 라이브러리의 확장

- 결론적으로 "읽기 쉬운 코드"는 단순 취향의 문제가 아니라, 인간의 인지 구조가 만들어내는 자연스러운 결과
