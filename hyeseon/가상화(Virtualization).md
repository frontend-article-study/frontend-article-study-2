# 가상화 (Virtualization)

> 무한 스크롤 환경에서 수천 개의 DOM 요소를 한 번에 렌더링하면 성능이 급격히 저하된다. **가상화(Virtualization)**는 현재 화면에 보이는 항목만 실제로 렌더링하는 기법으로 이 문제를 근본적으로 해결한다.

# 1. 왜 가상화가 필요한가

## 브라우저 렌더링 비용

| 방식                   | DOM 노드 수 | 메모리    | 초기 렌더 |
| ---------------------- | ----------- | --------- | --------- |
| 일반 렌더링 (10,000개) | 10,000개    | 매우 높음 | 느림      |
| 가상화 적용            | 20~30개     | 낮음      | 빠름      |

브라우저는 DOM 노드가 많아질수록 **레이아웃 계산(reflow)**, **페인팅(repaint)**, **합성(compositing)** 비용이 기하급수적으로 증가한다. 스크롤 이벤트는 초당 수십 번 발생하기 때문에 이 비용이 누적되면 버벅거림(jank)이 발생한다.

## 무한 스크롤과의 관계

무한 스크롤은 데이터를 페이지 단위로 로드하지만, **로드된 데이터는 DOM에 계속 축적**된다. 100개씩 20번 로드하면 결국 2,000개의 DOM 노드가 생긴다. 가상화 없이는 시간이 지날수록 성능이 선형적으로 저하된다.

# 2. 가상화의 작동 원리

## 개념

실제로 렌더링되는 항목은 **뷰포트에 보이는 것 + 약간의 overscan(버퍼)**뿐이다. 나머지는 빈 공간(spacer)으로 처리해서 스크롤바 위치와 전체 높이를 유지한다.

```
┌─────────────────────────┐ ← 실제 스크롤 컨테이너
│  [Spacer: 위 여백]        │    (전체 높이 = 아이템 수 × 아이템 높이)
├─────────────────────────┤
│  Item 23  ← 실제 DOM     │ ← 뷰포트 영역 (보이는 것만)
│  Item 24  ← 실제 DOM     │
│  Item 25  ← 실제 DOM     │
├─────────────────────────┤
│  [Spacer: 아래 여백]      │
└─────────────────────────┘
```

## 단계별 동작 흐름

### Step 1: 전체 높이 계산

컨테이너의 전체 높이를 아이템 합계로 설정해 스크롤바가 올바르게 표시되게 한다.

```jsx
totalHeight = itemCount × itemHeight // 1열로 아이템을 나열한다고 가정
```

### Step 2: 현재 뷰포트의 시작/끝 인덱스 계산

```jsx
const startIndex = Math.floor(scrollTop / itemHeight);
const endIndex = Math.min(
  itemCount - 1,
  Math.floor((scrollTop + viewportHeight) / itemHeight),
);
```

### Step 3: overscan 적용

스크롤 시 빈 화면이 잠깐 보이는 flash를 방지하기 위해 뷰포트 밖으로 약간 더 렌더링한다.

```jsx
const overscanCount = 3;
const visibleStartIndex = Math.max(0, startIndex - overscanCount);
const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscanCount);
```

### Step 4: 각 아이템을 절대 위치로 배치

```jsx
// position: absolute + top으로 정확한 위치 지정
const itemTop = index × itemHeight;
```

### Step 5: 스크롤 → 인덱스 재계산 → 리렌더링

```
사용자 스크롤
  → scrollTop 업데이트
  → startIndex / endIndex 재계산
  → 보여줄 아이템 배열 교체
  → React 리렌더링
```

## 고정 높이 vs 동적 높이

|             | 고정 높이 (Fixed)  | 동적 높이 (Variable)  |
| ----------- | ------------------ | --------------------- |
| 계산 방식   | index × itemHeight | 실측 후 오프셋 캐싱   |
| 구현 난이도 | 쉬움               | 복잡함                |
| 성능        | 최고               | 약간 오버헤드         |
| 사용 케이스 | 테이블, 피드       | 채팅, 댓글, 가변 카드 |

동적 높이는 `ResizeObserver`로 각 아이템 높이를 측정하고, 누적 오프셋 배열을 **이진 탐색(binary search)**으로 빠르게 조회한다.

# 3. 주요 라이브러리 비교

## TanStack Virtual

```bash
npm install @tanstack/react-virtual
```

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**특징**

- 프레임워크 종속적X (React, Vue, Solid 지원)
- Headless — UI 없이 로직만 제공, 높은 커스터마이징 자유도
- 동적 높이 완벽 지원 (`measureElement` 옵션)
- 수평 / 수직 / 그리드 모두 지원
- 번들 사이즈 매우 작음 (~3KB)
- TanStack Query와 자연스럽게 조합 가능

## react-window

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from "react-window";

const Row = ({ index, style }) => <div style={style}>Row {index}</div>;

<FixedSizeList height={500} width="100%" itemCount={items.length} itemSize={50}>
  {Row}
</FixedSizeList>;
```

**특징**

- Brian Vaughn(전 React 팀) 제작, 안정성 높음
- API가 심플하고 학습 곡선 낮음
- `FixedSizeList` / `VariableSizeList` / `FixedSizeGrid` 제공
- **현재 유지보수 모드** (신규 기능 추가 없음)
- 번들 사이즈 ~6KB

## react-virtuoso

```bash
npm install react-virtuoso
```

```jsx
import { Virtuoso } from "react-virtuoso";

<Virtuoso
  style={{ height: "500px" }}
  totalCount={items.length}
  itemContent={(index) => <div>Item {index}</div>}
  endReached={() => fetchMore()}
/>;
```

**특징**

- **무한 스크롤 기능 내장** (`endReached`)
- 동적 높이 자동 처리 (측정 자동화)
- **역방향 스크롤 지원** (채팅 UI에 최적)
- GroupedList, TableVirtuoso 등 고급 컴포넌트 제공
- API가 가장 고수준 — 설정 최소화
- 번들 사이즈 ~15KB

## 라이브러리 선택 가이드

| 상황                              | 추천                 |
| --------------------------------- | -------------------- |
| 가볍고 커스터마이징이 중요할 때   | **TanStack Virtual** |
| 간단한 고정 높이 리스트           | **react-window**     |
| 채팅 UI, 역방향 스크롤            | **react-virtuoso**   |
| 무한 스크롤 기능이 바로 필요할 때 | **react-virtuoso**   |
| TanStack Query 이미 사용 중       | **TanStack Virtual** |

# 4. 무한 스크롤 + 가상화 조합 패턴

`useInfiniteQuery` + `useVirtualizer` 실전 조합:

```jsx
function InfiniteVirtualList() {
  const parentRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["items"],
      queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  // 마지막 아이템 감지 → 다음 페이지 로드
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (!lastItem) return;

    if (
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage]);

  return (
    <div ref={parentRef} style={{ height: "100vh", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaderRow = virtualItem.index > allItems.length - 1;
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: virtualItem.start,
                width: "100%",
              }}
            >
              {isLoaderRow ? (
                <div>Loading more...</div>
              ) : (
                <ItemCard item={allItems[virtualItem.index]} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

# 5. 성능 최적화 포인트

## React.memo로 아이템 리렌더링 방지

스크롤할 때마다 모든 아이템이 리렌더링되는 것을 방지한다.

```jsx
const ItemCard = React.memo(
  ({ item }) => {
    return <div>{item.name}</div>;
  },
  (prev, next) => prev.item.id === next.item.id,
);
```

## measureElement로 동적 높이 측정

```jsx
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
  measureElement: (element) => element.getBoundingClientRect().height,
});

{
  virtualizer.getVirtualItems().map((item) => (
    <div
      key={item.key}
      ref={virtualizer.measureElement}
      data-index={item.index}
    >
      ...
    </div>
  ));
}
```

## 스크롤 이벤트 최적화

가상화 라이브러리들은 내부적으로 `requestAnimationFrame`이나 스로틀링을 적용해 스크롤 이벤트 처리 비용을 낮춘다. 직접 구현 시 반드시 적용해야 하는 패턴이다.

# 6. 트레이드오프와 주의사항

- 가상화를 쓰면 안 되는 경우
  - 아이템이 **100개 미만**일 때 → 오버엔지니어링
  - **Ctrl+F (브라우저 검색)**이 중요한 경우 → DOM에 없는 요소는 검색 불가
  - **SEO가 중요한** 페이지 → 서버 렌더링 시 별도 처리 필요
  - **스크린 리더 의존도가 높은** 경우 → DOM에 없는 요소는 읽지 못함
- 스크롤 위치 복원 문제
  페이지 이동 후 뒤로가기 시 스크롤 위치 복원이 일반 리스트보다 까다롭다. 가상화 리스트는 컴포넌트가 언마운트되면 DOM이 사라지기 때문에 브라우저의 자동 스크롤 복원이 동작하지 않는다. 직접 위치를 저장하고 복원해야 한다.
  ## 방법 1: scrollTop 저장 + 복원 (가장 단순)
  scrollTop 값 자체를 sessionStorage에 저장하고, 컴포넌트가 다시 마운트될 때 해당 위치로 복원한다.
  ```jsx
  function VirtualListPage() {
    const parentRef = useRef(null);
    const STORAGE_KEY = "list-scroll-top";

    // 마운트 시: 저장된 scrollTop 복원
    useEffect(() => {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved && parentRef.current) {
        parentRef.current.scrollTop = Number(saved);
      }
    }, []);

    // 언마운트 시: 현재 scrollTop 저장
    useEffect(() => {
      return () => {
        if (parentRef.current) {
          sessionStorage.setItem(STORAGE_KEY, parentRef.current.scrollTop);
        }
      };
    }, []);

    // ... virtualizer 설정
  }
  ```
  ## 방법 2: scrollToIndex 활용 (아이템 인덱스 기반)
  아이템의 **인덱스**를 저장하고, 복원 시 `scrollToIndex`로 해당 위치로 이동하는 방식이다. 아이템 높이가 동적일 때도 비교적 정확하게 복원된다.
  ```jsx
  function VirtualListPage() {
    const parentRef = useRef(null);
    const STORAGE_KEY = "list-scroll-index";

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 120,
    });

    // 마운트 시: 저장된 인덱스로 스크롤 복원
    useEffect(() => {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        virtualizer.scrollToIndex(Number(saved), { align: "start" });
      }
    }, []);

    // 스크롤 시: 현재 보이는 첫 번째 아이템 인덱스 저장
    const handleScroll = () => {
      const firstVisible = virtualizer.getVirtualItems()[0];
      if (firstVisible) {
        sessionStorage.setItem(STORAGE_KEY, firstVisible.index);
      }
    };

    return (
      <div
        ref={parentRef}
        onScroll={handleScroll}
        style={{ height: "100vh", overflow: "auto" }}
      >
        {/* ... */}
      </div>
    );
  }
  ```
  ## 방법 3: Jotai/Zustand 전역 상태로 관리
  여러 페이지에서 같은 리스트 상태를 공유하거나, 내부 탭 이동 시에도 유지해야 할 때는 전역 상태로 관리하는 것이 깔끔하다.
  ```jsx
  // atoms.js (Jotai)
  export const listScrollIndexAtom = atom(0);

  // VirtualListPage.jsx
  function VirtualListPage() {
    const [scrollIndex, setScrollIndex] = useAtom(listScrollIndexAtom);
    const parentRef = useRef(null);

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 120,
    });

    // 마운트 시 복원
    useEffect(() => {
      if (scrollIndex > 0) {
        virtualizer.scrollToIndex(scrollIndex, { align: "start" });
      }
    }, []);

    const handleScroll = () => {
      const firstVisible = virtualizer.getVirtualItems()[0];
      if (firstVisible) setScrollIndex(firstVisible.index);
    };

    return (
      <div
        ref={parentRef}
        onScroll={handleScroll}
        style={{ height: "100vh", overflow: "auto" }}
      >
        {/* ... */}
      </div>
    );
  }
  ```
  ## 방법별 비교
  | 방법           | 장점                    | 단점                          | 적합한 상황        |
  | -------------- | ----------------------- | ----------------------------- | ------------------ |
  | scrollTop 저장 | 구현 단순               | 동적 높이 시 부정확할 수 있음 | 고정 높이 리스트   |
  | scrollToIndex  | 아이템 기준이라 안정적  | 약간의 점프 발생 가능         | 동적 높이 리스트   |
  | 전역 상태      | 탭/페이지 이동에도 유지 | 상태 관리 복잡도 증가         | 복잡한 앱, 다중 뷰 |

# 7. 정리

- **쓰는이유**: 대량 DOM 노드 → 레이아웃/페인팅 비용 증가 → 버벅거림
- **방법**: scrollTop으로 시작/끝 인덱스 계산 → 해당 범위만 DOM 렌더링 + spacer로 전체 높이 유지
- **라이브러리**: 가볍고 유연 → TanStack Virtual / 기능 내장 → react-virtuoso
- **무한 스크롤 조합**: `useInfiniteQuery` + `useVirtualizer` + 마지막 아이템 감지
