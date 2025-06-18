- TanStack DB는 **로컬-우선(Local-First)** 아키텍처에서 **상태 저장**, **실시간 쿼리**, **낙관적 업데이트**, **동기화(sync)** 를 지원하는 반응형 클라이언트 저장소(reactive client store)
- 복잡한 애플리케이션에서도 **빠르고 일관된 UI 반응성과 데이터 흐름**을 제공

---

## 배경 (ElectricSQL → TanStack DB)

ElectricSQL에서의 실무적 한계:

| 문제                  | 설명                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| 충돌 해결의 복잡성    | 로컬과 서버 간의 상태 충돌을 조정하는 로직이 복잡하고, 실무에서 버그가 자주 발생                     |
| 참조 무결성 처리 부담 | 관계형 모델(예: 외래 키) 기반 구조에서 로컬 상태의 일관성을 유지하기 어렵고, 필터링된 뷰 처리도 복잡 |
| 로직 난이도           | CRDT, 분산 로그 등 고급 동기화 모델을 이해하고 적용해야 했음                                         |
| 점진적 도입 어려움    | 기존 API 기반 앱에 Local-First 동기화를 부분적으로 적용하는 것이 사실상 불가능                       |
| 실용성 부족           | 실제 제품 개발에서 빠르게 도입하거나 디버깅하기에 비현실적이고 유지보수 난이도 높음                  |

> TanStack DB는 ElectricSQL이 겪었던 로컬 우선 동기화의 복잡성을 최소화하고, 기존 REST/GQL 앱에서도 단계적으로 로컬 동기화를 적용할 수 있는 현실적 대안으로 설계됨

---

## 주요 기능

| 구성 요소                 | 설명                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| **Collection**            | 타입이 지정된 객체 집합. 서버 DB 테이블처럼 또는 필터된 뷰처럼 동작 |
| **Live Query**            | 컬렉션에 반응하는 쿼리. 변경 시 UI 자동 갱신                        |
| **Optimistic Mutation**   | 로컬에서 즉시 반영 → 서버에 반영 → 실패 시 자동 롤백                |
| **Transactional Mutator** | 여러 변경을 트랜잭션 단위로 처리                                    |
| **Sync Layer**            | REST, GraphQL, ElectricSQL 등 백엔드 연동 가능                      |
| **Differential Dataflow** | 변경된 부분만 계산하여 쿼리 성능 최적화                             |

---

### 컬렉션 정의

- transaction.mutations 배열에는 로컬에서 발생한 변경들이 담기고, 그 중 첫 번째를 가져와 처리
- original: 변경 전 데이터
- changes: draft에서 수정한 부분만 담긴 객체

```tsx
const todoCollection = createCollection({
  getKey: (todo) => todo.id,
  onUpdate: async ({ transaction }) => {
    const { original, changes } = transaction.mutations[0];
    await api.todos.update(original.id, changes);
  },
});
```

- `createCollection`은 **로컬에서 관리할 데이터 컬렉션을 정의**
- `getKey`: 각 객체를 고유하게 식별할 키 (여기선 `todo.id`)
- `onUpdate`: 로컬에서 변경된 내용을 서버에 동기화하는 핸들러

### 라이브 쿼리

- 해당 컬렉션에 변경이 생기면, 해당 조건을 만족하는 결과가 자동으로 업데이트됨
- 컴포넌트는 **별도 이벤트 핸들링 없이 자동 리렌더링**됨
- 컬렉션이 어디서 왔는지 관계없이 동일한 쿼리 인터페이스 제공

```tsx
const { data: todos } = useLiveQuery((query) =>
  query.from({ todoCollection }).where('@completed', '=', false),
);
```

- `useLiveQuery`: 컬렉션을 대상으로 하는 **반응형 쿼리 훅**
- `query.from(...)`: 어떤 컬렉션에서 데이터를 가져올지 지정
- `.where(...)`: 필터 조건 (완료되지 않은 todo만 가져오기)

### 낙관적 업데이트

- 실제 서버 요청은 `onUpdate` 핸들러에서 이루어짐
- 실패 시 자동 롤백 기능도 내장됨

```tsx
const Todos = () => {
  const { data: todos } = useLiveQuery((query) =>
    query.from({ todoCollection }).where('@completed', '=', false),
  );

  const complete = (todo) => {
    todoCollection.update(todo.id, (draft) => {
      draft.completed = true;
    });
  };

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} onClick={() => complete(todo)}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
};
```

- `todoCollection.update`: 로컬에서 특정 항목을 즉시 수정
- `draft`: Immer와 유사한 방식의 **불변성 유지 객체**
- `todo.id`: 어떤 항목을 수정할지 지정

---

## FAQ

### Q. TanStack Query와 어떤 차이가 있나요?

- **TanStack Query**: 서버에서 데이터를 fetch
- **TanStack DB**: 로컬 컬렉션에 저장하고, 이를 기반으로 반응형 UI 구성 및 상태 업데이트

### Q. ElectricSQL이 꼭 필요한가요?

- 필요 없습니다. REST, GraphQL, polling 등 어떤 백엔드와도 사용할 수 있습니다.

### Q. Collection은 DB 테이블인가요?

- 비슷하지만 더 유연합니다. 정규화된 데이터 외에도 필터된 뷰, 파생 상태 등 다양한 형태로 정의할 수 있습니다.

### Q. ORM인가요?

- 아닙니다. 쿼리는 서버가 아니라 **클라이언트 내 로컬 컬렉션에만 동작**합니다.

---

## 결론

- **클라우드 중심의 서버 기반 아키텍처를 클라이언트 중심의 반응형, 로컬 우선 아키텍처로 전환**하는도구
- 기존 API 기반 앱에 점진적으로 도입 가능
- 반응성, 일관성, 성능을 모두 만족
- 오프라인에서도 작동
- 복잡한 동기화 로직을 자동화
