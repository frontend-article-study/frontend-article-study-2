# Logging Sucks: 로그는 거짓말을 한다 (Wide Events)

원문 : https://loggingsucks.com/

한 줄 요약: **로그는 "코드가 무엇을 하고 있는지"가 아니라 "이 요청에 무슨 일이 있었는지"를 기록해야 한다.** 요청당 수십 줄의 문자열 로그 대신, 요청당 1개의 컨텍스트 풍부한 **Wide Event**를 남기고, 문자열 검색이 아닌 **구조화된 데이터 쿼리**로 디버깅해야 한다.

## 1. 핵심 문제: 로그는 2005년에 머물러 있다

- 로그는 모놀리스, 단일 서버, 로컬에서 재현 가능한 문제의 시대에 설계됐다.
- 지금은 요청 하나가 15개 서비스, 3개 DB, 2개 캐시, 메시지 큐를 거친다. 그런데 로그는 여전히 2005년처럼 동작한다.
- 저자의 예시: 성공한 체크아웃 요청 1건에 **17줄의 로그**가 찍힌다.
    - `[gateway] Received request POST /api/checkout` → `[auth] Validating JWT token` → `[orders] Creating order for cart_xyz` → `[inventory] Checking stock` → `[payments] Processing payment via Stripe` → `[payments] Payment declined: insufficient_funds` → `[payments] Retrying payment, attempt 2` → `[payments] Payment successful` → `[orders] Order confirmed` → `[gateway] Response sent: 200 OK`
- 동시 사용자 10,000명이면 초당 **130,000줄**. 대부분은 아무 의미 없는 내용이다.
- 진짜 문제: 장애가 나면 이 로그들이 도움이 안 된다. 가장 필요한 것, 즉 **컨텍스트**가 빠져 있기 때문이다.

## 2. 문자열 검색은 왜 망가졌나

- 유저가 "결제가 안 돼요"라고 하면 우리는 이메일이나 user ID로 로그를 검색한다.
- 문자열 검색은 로그를 **글자 뭉치(bag of characters)**로 취급한다. 구조도, 관계도, 서비스 간 상관관계도 모른다.
- 같은 `user-123`이 코드베이스 곳곳에서 47가지 다른 형태로 찍힌다.
    - `user-123`
    - `user_id=user-123`
    - `{"userId": "user-123"}`
    - `[USER:user-123]`
    - `processing user: user-123`
- 게다가 하위 서비스는 user ID 없이 order ID만 찍었을 수도 있다. 그러면 두 번째, 세 번째 검색이 필요하다. 한 손을 묶고 탐정 놀이를 하는 것과 같다.
- **근본 원인: 로그는 "쓰기"에 최적화되어 있지 "조회"에 최적화되어 있지 않다.**
    - 개발자는 그 순간 편하니까 `console.log("Payment failed")`를 쓴다.
    - 새벽 2시 장애 때 이걸 검색해야 할 사람은 아무도 생각하지 않는다.

## 3. 용어 정리 (자주 잘못 쓰이는 개념들)

- **Structured Logging (구조화 로깅)**
    - 평문 문자열 대신 key-value 쌍(보통 JSON)으로 로그를 남기는 것.
    - `"Payment failed for user 123"` 대신 `{"event": "payment_failed", "user_id": "123"}`
    - **필요조건이지 충분조건은 아니다.**
- **Cardinality (카디널리티)**
    - 한 필드가 가질 수 있는 고유 값의 개수.
    - `user_id`는 고카디널리티(수백만 개), `http_method`는 저카디널리티(GET/POST/PUT/DELETE 정도).
    - **고카디널리티 필드가 디버깅에서 실제로 유용한 필드다.** (user_id, request_id, trace_id, session_id 등)
        
        !image.png
        
- **Dimensionality (차원성)**
    - 로그 이벤트 하나에 들어있는 필드 수. 5개면 저차원, 50개면 고차원.
    - 차원이 많을수록 = 답할 수 있는 질문이 많아진다.
- **Wide Event (와이드 이벤트)**
    - 요청당, 서비스당 **단 하나**의 컨텍스트 풍부한 로그 이벤트.
    - 요청 하나에 13줄 대신, 디버깅에 필요한 모든 것을 담은 50개 이상 필드의 1줄.
- **Canonical Log Line (캐노니컬 로그 라인)**
    - Wide Event의 다른 이름. **Stripe**가 대중화시킨 용어.
    - 요청당 한 줄, 무슨 일이 있었는지에 대한 권위 있는 기록.

## 4. OpenTelemetry는 구원자가 아니다

> [!NOTE]
> **OpenTelemetry(OTel)란?** 로그, 트레이스, 메트릭 같은 텔레메트리 데이터를 수집하고 내보내는 방식을 표준화한 CNCF 오픈소스 프로젝트. 언어별 SDK, 라이브러리 자동 계측(HTTP/DB 호출 등의 캡처), 수집한 데이터를 Datadog, Grafana, ClickHouse 등 어디로든 보내주는 Collector로 구성되며, 벤더에 종속되지 않고 계측 코드를 한 번만 작성하게 해주는 것이 핵심 가치다.

- 흔한 주장: "OpenTelemetry 붙이면 observability 문제 해결됨" → 아니다.
- OTel은 **프로토콜 + SDK 모음**이다. 텔레메트리(로그, 트레이스, 메트릭)를 수집하고 내보내는 방식을 표준화한다. 벤더 락인을 막아주는 건 진짜 유용하다.
- 하지만 OTel이 **하지 않는 것**:
    1. **무엇을 로깅할지 결정해주지 않는다.** 여전히 의도적으로 계측(instrument)해야 한다.
    2. **비즈니스 컨텍스트를 추가해주지 않는다.** 구독 등급, 장바구니 금액, 활성화된 피처 플래그는 내가 넣지 않으면 OTel도 모른다.
    3. **멘탈 모델을 고쳐주지 않는다.** 여전히 "로그 문장" 단위로 생각하면, 표준화된 포맷으로 나쁜 텔레메트리를 내보낼 뿐이다.
- 같은 라이브러리, 같은 프로토콜인데 디버깅 경험은 완전히 다르다.
    - 게으른 계측: `span.recordException(error)` 만 호출
    - 의도적 계측: `span.setAttributes({ 'user.id', 'user.subscription', 'user.lifetime_value', 'cart.item_count', 'cart.total_cents', 'feature_flags', 'payment.provider', 'payment.latency_ms', 'error.code', 'error.retriable' ... })`

## 5. 해법: Wide Events / Canonical Log Lines

- 모든 것을 바꾸는 멘탈 모델 전환:
    - **"코드가 무엇을 하고 있는지"를 로깅하지 말고, "이 요청에 무슨 일이 일어났는지"를 로깅해야 한다.**
    - 로그를 디버깅 일기가 아니라, **비즈니스 이벤트의 구조화된 기록**으로 봐야 한다.
- 요청마다, 서비스 홉마다 **하나의 Wide Event**를 내보낸다.
    - 잘못된 것만이 아니라, 요청의 전체 그림을 담는다.
    - gateway → checkout → payment → inventory를 거친다고 가정하면, 각 계층은 **자기가 아는 정보만 채운다.** payment-service는 유저의 구독 등급을 모를 수 있지만, `stripe_decline_code`나 `attempt`는 payment-service만 안다.
    - 하위 계층에서도 필요한 핵심 컨텍스트(`user_id`, `subscription` 등)는 **상위에서 하위로 넘긴다.** HTTP 헤더나 메시지 메타데이터에 실어 전파한다 (OTel의 baggage가 이 용도다).
    - 서비스 간 이벤트는 **`trace_id`로 묶는다.** 요청 진입 시 발급된 trace_id가 헤더(`traceparent`)로 전파되어 모든 이벤트에 찍히고, `WHERE trace_id = 'abc123'` 한 번으로 전체 흐름을 조회한다. 이것이 "Wide Event가 곧 트레이스 span"이라는 말의 의미다.
- 실제 Wide Event 예시:

```json
{
  "timestamp": "2025-01-15T10:23:45.612Z",
  "request_id": "req_8bf7ec2d",
  "trace_id": "abc123",

  "service": "checkout-service",
  "version": "2.4.1",
  "deployment_id": "deploy_789",
  "region": "us-east-1",

  "method": "POST",
  "path": "/api/checkout",
  "status_code": 500,
  "duration_ms": 1247,

  "user": {
    "id": "user_456",
    "subscription": "premium",
    "account_age_days": 847,
    "lifetime_value_cents": 284700
  },

  "cart": {
    "id": "cart_xyz",
    "item_count": 3,
    "total_cents": 15999,
    "coupon_applied": "SAVE20"
  },

  "payment": {
    "method": "card",
    "provider": "stripe",
    "latency_ms": 1089,
    "attempt": 3
  },

  "error": {
    "type": "PaymentError",
    "code": "card_declined",
    "message": "Card declined by issuer",
    "retriable": false,
    "stripe_decline_code": "insufficient_funds"
  },

  "feature_flags": {
    "new_checkout_flow": true,
    "express_payment": false
  }
}
```

- 이벤트 하나로 `user_id = "user_456"` 검색 즉시 알 수 있는 것:
    - 프리미엄 고객이다 (높은 우선순위)
    - 2년 넘게 함께한 고객이다 (매우 높은 우선순위)
    - 결제가 3번째 시도에서 실패했다
    - 실제 원인: 잔액 부족 (insufficient_funds)
    - 새 체크아웃 플로우를 쓰고 있었다 (상관관계 가능성?)
- 필드가 없으면 못 답하는 질문의 예:
    - "유저 X의 체크아웃이 왜 실패했나?" → `payment_method` 없으면 불가
    - "어느 배포가 레이턴시 회귀를 일으켰나?" → `deployment_id` 없으면 불가
    - "새 체크아웃 기능의 에러율은?" → `feature_flags` 없으면 불가

## 6. 이제 실행할 수 있는 쿼리들

- Wide Event가 있으면 더 이상 텍스트를 검색하지 않고 **구조화된 데이터를 쿼리할 수 있다**.
- 구독 등급별 에러율:

```sql
SELECT subscription, COUNT(*) as total,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors,
  ROUND(errors * 100.0 / total, 2) as error_rate
FROM events GROUP BY subscription
```

- 프리미엄 유저의 에러만:

```sql
SELECT * FROM events
WHERE subscription = 'premium' AND status_code >= 500
ORDER BY timestamp DESC
```

- 피처 플래그가 에러에 미치는 영향:

```sql
SELECT feature_flags.new_checkout_flow as new_checkout,
  COUNT(*) as total,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors
FROM events GROUP BY new_checkout
```

- 결제 실패를 거절 코드별로:

```sql
SELECT error.code, COUNT(*) as count
FROM events WHERE error.type = 'PaymentError'
GROUP BY error.code ORDER BY count DESC
```

- **Wide Event + 고카디널리티 + 고차원 데이터가 쌓이면 로그를 검색하는 게 아니라 프로덕션 트래픽에 대한 분석(analytics)을 돌릴 수 있다.**

## 7. 구현 패턴

- 핵심 인사이트: **요청 생명주기 동안 이벤트를 계속 채워나가다가, 마지막에 한 번만 내보낸다.** 여기서 "내보낸다(emit)"는 `logger.info(event)` 한 번, 즉 **로그 한 줄을 찍는 것**이다.
- 전제: 서비스(gateway, checkout-service, payment-service)는 **각각 따로 돌아가는 서버 프로그램**이다. 서로 HTTP로 부르는 것이지, 한 코드베이스 안에서 함수를 호출하는 것이 아니다. 따라서 각 서비스는 자기 로그를 자기가 찍고, 그 로그들이 중앙 저장소(ClickHouse, Datadog 등)로 모인다.
- 아래는 checkout 요청 하나가 gateway → checkout-service → payment-service를 거치는 과정을 시간순으로 따라간 것이다. 코드는 checkout-service 안에서 일어나는 일이다.

### ① gateway: 브라우저 요청 수신

- 브라우저가 `POST /api/checkout`을 보낸다.
- gateway가 받는 순간 `trace_id = abc123`을 발급하고, 자기 이벤트 A를 만든다.
- checkout-service에 HTTP 요청을 보내면서 헤더에 `traceparent: abc123`을 실어 보낸다. 응답을 기다린다.

### ② 미들웨어: 요청 수신, 이벤트 B 생성

- gateway의 호출이 checkout-service에 도착하기 전 미들웨어가 실행되어 **빈 이벤트 B를 만들고 요청 컨텍스트(`ctx`)에 넣는다.**
- 이 시점의 이벤트 B는 `request_id`, `trace_id`(헤더에서 읽음), `method`, `path`, `service`, `version` 정도만 있다.
- `await next()`가 핸들러(③)를 실행하고, 핸들러가 끝나면 다시 이 미들웨어로 돌아와 `finally`(⑤)가 실행된다.

```tsx
// middleware/wideEvent.ts  (checkout-service, payment-service 모두 같은 미들웨어를 쓴다)
export function wideEventMiddleware() {
  return async (ctx, next) => {
    const startTime = Date.now();

    // ② 요청이 들어온 순간: 빈 이벤트 생성
    const event: Record<string, unknown> = {
      request_id: ctx.get('requestId'),
      trace_id: ctx.get('traceId'),          // 헤더(traceparent)에서 읽은 값
      timestamp: new Date().toISOString(),
      method: ctx.req.method,
      path: ctx.req.path,
      service: process.env.SERVICE_NAME,     // 'checkout-service'
      version: process.env.SERVICE_VERSION,
      deployment_id: process.env.DEPLOYMENT_ID,
      region: process.env.REGION,
    };

    // 핸들러(③)에서 꺼내 쓸 수 있게 컨텍스트에 저장
    ctx.set('wideEvent', event);

    try {
      await next();                          // ③ 핸들러 실행 (여기서 시간이 흐른다)
      event.status_code = ctx.res.status;
      event.outcome = 'success';
    } catch (error) {
      event.status_code = 500;
      event.outcome = 'error';
      event.error = {
        type: error.name,
        message: error.message,
        code: error.code,
        retriable: error.retriable ?? false,
      };
      throw error;
    } finally {
      // ⑤ 핸들러가 끝난 뒤: 소요 시간 기록하고 딱 한 번 로그를 찍는다
      event.duration_ms = Date.now() - startTime;
      logger.info(event);
    }
  };
}
```

### ③ checkout-service: 핸들러가 비즈니스 컨텍스트를 채움

- 미들웨어가 만든 이벤트 B를 `ctx.get('wideEvent')`로 꺼내서, 처리하는 순서대로 필드를 덧붙인다.
- 유저 정보 → 장바구니 → 결제 호출 순서로 채워진다.
- `processPayment(cart, user)`가 **payment-service를 HTTP로 호출하는 지점**이다. 이때도 `traceparent: abc123` 헤더가 같이 나간다. 응답이 올 때까지 checkout-service는 기다린다(④).

```tsx
app.post('/checkout', async (ctx) => {
  const event = ctx.get('wideEvent');        // ②에서 만든 이벤트 B
  const user = ctx.get('user');

  // ③-1 유저 컨텍스트 추가
  event.user = {
    id: user.id,
    subscription: user.subscription,
    account_age_days: daysSince(user.createdAt),
    lifetime_value_cents: user.ltv,
  };

  // ③-2 장바구니 조회(DB) 후 비즈니스 컨텍스트 추가
  const cart = await getCart(user.id);
  event.cart = {
    id: cart.id,
    item_count: cart.items.length,
    total_cents: cart.total,
    coupon_applied: cart.coupon?.code,
  };

  // ③-3 payment-service 호출 → ④로 넘어간다. 응답 올 때까지 대기
  const paymentStart = Date.now();
  const payment = await processPayment(cart, user);

  // ⑤-1 응답이 돌아온 뒤: 결제 결과를 이벤트 B에 추가
  event.payment = {
    method: payment.method,
    provider: payment.provider,
    latency_ms: Date.now() - paymentStart,   // payment-service 왕복 시간
    attempt: payment.attemptNumber,
  };

  // ⑤-2 실패였다면 에러 상세 추가
  if (payment.error) {
    event.error = {
      type: 'PaymentError',
      code: payment.error.code,
      stripe_decline_code: payment.error.declineCode,
    };
  }

  return ctx.json({ orderId: payment.orderId });
  // 핸들러 종료 → 미들웨어의 finally(⑤-3)로 돌아간다
});
```

### ④ payment-service: 자기 이벤트 C를 만들고, 첫 번째 로그를 찍는다

- checkout-service의 호출이 payment-service에 도착한다. **payment-service에도 ②와 같은 미들웨어가 돌고 있으므로**, 자기 이벤트 C를 새로 만든다. 이벤트 B와는 별개의 객체다.
- 핸들러가 Stripe를 호출하고, 3번째 시도에서 거절당한다. `payment.attempt`, `stripe_decline_code`를 이벤트 C에 추가한다.
- 핸들러가 끝나면 payment-service 미들웨어의 `finally`가 실행되어 **이벤트 C를 로그로 찍는다. 이것이 첫 번째 로그다.** 그리고 checkout-service에 에러 응답을 돌려준다.

```json
// payment-service가 찍은 로그 (이벤트 C)
{
  "trace_id": "abc123",
  "service": "payment-service",
  "path": "/internal/charge",
  "status_code": 402,
  "duration_ms": 1089,
  "user": { "id": "user_456" },
  "payment": {
    "provider": "stripe",
    "attempt": 3,
    "stripe_latency_ms": 1041,
    "stripe_decline_code": "insufficient_funds"
  },
  "error": { "type": "CardDeclined", "retriable": false }
}
```

### ⑤ checkout-service: 응답을 받고 이벤트 B를 마저 채운 뒤, 두 번째 로그를 찍는다

- ③에서 기다리던 `processPayment`가 돌아온다. 핸들러 코드의 ⑤-1, ⑤-2가 실행되어 `payment`, `error` 필드가 이벤트 B에 추가된다.
- 핸들러가 끝나면 미들웨어의 `finally`(⑤-3)가 실행되어 `duration_ms`를 기록하고 **이벤트 B를 로그로 찍는다. 이것이 두 번째 로그다.** gateway에 500 응답을 돌려준다.

```json
// checkout-service가 찍은 로그 (이벤트 B)
{
  "trace_id": "abc123",
  "service": "checkout-service",
  "path": "/api/checkout",
  "status_code": 500,
  "duration_ms": 1247,
  "user": { "id": "user_456", "subscription": "premium", "account_age_days": 847 },
  "cart": { "id": "cart_xyz", "item_count": 3, "total_cents": 15999 },
  "payment": { "provider": "stripe", "latency_ms": 1089, "attempt": 3 },
  "error": { "type": "PaymentError", "code": "card_declined", "stripe_decline_code": "insufficient_funds" }
}
```

### ⑥ gateway: 응답을 받고 이벤트 A를 찍는다

- ①에서 기다리던 gateway가 500 응답을 받는다. 이벤트 A에 `status_code`, `downstream_latency_ms`를 채우고 **세 번째 로그를 찍는다.** 브라우저에 500을 돌려준다.

### 결과

- 요청 하나에 **로그 3줄**(A, B, C)이 나왔다. 각각 다른 서버가 찍었고, 전부 `trace_id: abc123`을 갖고 있다.
- 각 서비스는 **자기가 아는 것만 채웠다.** checkout-service는 장바구니와 결제 왕복 시간을 알지만 Stripe 내부 지연은 모른다. payment-service는 그 반대다.
- 중앙 저장소에서 `WHERE trace_id = 'abc123'`으로 조회하면 3줄이 함께 나오고, 합치면 전체 그림이 된다.
- 기존 방식이었다면 payment-service 하나만 해도 "Stripe 호출 중", "느린 응답", "거절됨", "재시도", ... 로 5~6줄이 찍혔을 것이다. 그것을 필드로 모아 **서비스당 1줄**로 만든 것이 Wide Event다.

## 8. 샘플링: 비용 통제하기

- 예상되는 반론: "요청당 50개 필드를 초당 10,000건 로깅하면 observability 청구서로 파산한다."
- 타당한 우려. 그래서 **샘플링**이 필요하다.
    - 샘플링 = 이벤트의 일부 비율만 보관. 100% 대신 10%나 1%.
    - 규모가 커지면 이것이 제정신(과 지갑)을 유지하는 유일한 방법.
- **하지만 순진한(랜덤) 샘플링은 위험하다.**
    - 1% 랜덤 샘플링을 하면, 장애를 설명해주는 바로 그 요청을 버릴 수 있다.
    - 원문 시뮬레이터: 10,000 이벤트(성공 85%, 느림 10%, 에러 5%)를 10% 랜덤 샘플링하면 에러 500개 중 약 50개만 남는다. **특정 에러 하나를 놓칠 확률 90%.**
- **Tail Sampling (테일 샘플링)**
    - 요청이 **완료된 후**, 결과를 보고 샘플링 여부를 결정한다.
    - 규칙 4가지:
        1. **에러는 항상 보관.** 500 에러, 예외, 실패는 100% 저장.
        2. **느린 요청은 항상 보관.** p99 레이턴시 임계값을 넘는 것.
        3. **특정 유저는 항상 보관.** VIP 고객, 내부 테스트 계정, 플래그된 세션.
        4. **나머지는 랜덤 샘플링.** 정상이고 빠른 요청은 1~5%만.
    - 비용은 관리 가능하면서, 중요한 이벤트는 절대 잃지 않는다.

```tsx
// Tail sampling 결정 함수
function shouldSample(event: WideEvent): boolean {
  // 에러는 항상 보관
  if (event.status_code >= 500) return true;
  if (event.error) return true;

  // 느린 요청은 항상 보관 (p99 초과)
  if (event.duration_ms > 2000) return true;

  // VIP 유저는 항상 보관
  if (event.user?.subscription === 'enterprise') return true;

  // 특정 피처 플래그 요청은 항상 보관 (롤아웃 디버깅)
  if (event.feature_flags?.new_checkout_flow) return true;

  // 나머지는 5% 랜덤 샘플링
  return Math.random() < 0.05;
}
```

## 9. 흔한 오해 5가지

- **"구조화 로깅 = Wide Event 아닌가?"**
    - 아니다. 구조화 로깅은 로그가 문자열 대신 JSON이라는 뜻일 뿐, 기본 중의 기본(table stakes)이다.
    - Wide Event는 **철학**이다: 요청당 하나의 포괄적 이벤트에 모든 컨텍스트를 붙이는 것.
    - 구조화됐지만 여전히 쓸모없는 로그도 얼마든지 가능하다 (필드 5개, 유저 컨텍스트 없음, 20줄에 흩어짐).
- **"우리 OpenTelemetry 쓰니까 괜찮아"**
    - 배송 수단을 쓰고 있을 뿐이다. 무엇을 캡처할지는 OTel이 아니라 당신이 정한다.
    - 대부분의 OTel 구현은 최소한만 캡처한다: span 이름, duration, status. 그걸로는 부족하다.
- **"이거 그냥 트레이싱에 단계 추가한 거 아님?"**
    - 트레이싱은 **서비스 간** 요청 흐름(누가 누굴 호출했나)을 준다.
    - Wide Event는 **서비스 내부**의 컨텍스트를 준다. 둘은 상호보완적이다.
    - **이상적으로는 Wide Event가 곧 트레이스 span이고, 거기에 필요한 모든 컨텍스트가 붙어 있는 형태.**
- **"로그는 디버깅용, 메트릭은 대시보드용"**
    - 인위적이고 해로운 구분이다. Wide Event는 둘 다 가능하다.
    - 디버깅할 땐 쿼리하고, 대시보드는 집계(aggregate)하면 된다.
- **"고카디널리티 데이터는 비싸고 느리다"**
    - 저카디널리티 문자열 검색용으로 만들어진 **레거시 로깅 시스템**에서만 그렇다.
    - 현대 컬럼형 DB(ClickHouse, BigQuery 등)는 고카디널리티, 고차원 데이터를 위해 설계됐다.
    - 툴은 이미 따라잡았다. 이제 관행이 따라잡아야 할 차례다.

## 10. 결론: 고고학에서 분석으로

- Wide Event를 제대로 구현하면 디버깅이 **고고학(archaeology)에서 분석(analytics)으로** 바뀐다.
- Before: "유저가 체크아웃에 실패했다고 한다. 50개 서비스를 grep 하면서 뭐라도 나오길 바란다."
- After: "지난 1시간 동안 새 체크아웃 플로우가 켜진 프리미엄 유저의 체크아웃 실패를 에러 코드별로 조회한다."
- 저자는 이 내용을 코딩 에이전트용 스킬로도 배포했다: `npx add-skill boristane/agent-skills --skill "logging-best-practices"`
