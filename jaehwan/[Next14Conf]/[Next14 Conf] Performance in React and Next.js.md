## JS 단일 스레드의 문제

JavaScript는 단일 스레드로 동작하는 다는 것은 모두 알고 있을 것입니다. 해당 스레드는 메인스레드라고 불리며 사용자의 이벤트 처리, 네트워크 요청, 타이머 등 여러 작업을 담당합니다.

단일 스레드이기 때문에 하나의 작업으로 인해 모든 작업은 대기해야한 다는 점이 있습니다. 

당연히 브라우저는 이것을 빠르게 처리하도록 최적화 되어있지만 하나의 태스크가 50ms이상 걸릴 경우 문제가 생깁니다.

우리가 원하는 것은 사용자 인터랙션을 빠르게 감지하고 상태 변화가 일어나는 것입니다.

그러나 long task가 시작될 경우 브라우저는 해당 작업이 끝날 때까지 기다려야합니다.

![Untitled](./PerformanceInReactAndNext/1.png)

60프레임이상이면 사람의 눈이 자연스럽게 느낍니다. 그렇다면 자연스러운 렌더링의 한 프레임은 16.7ms입니다.

그러나 위 이미지 처럼 작업이 오래걸릴 경우 프레임이 드롭되며 애니메니션 스크롤이 끊기는 안좋은 경험을 가질 수 있습니다.

웹사이트에서는 Long Task의 영향도를 측정할 수 있는 두 가지 방법이 있습니다.

1. Total Blocking Time(TBT) : 총 차단 시간
    1. 첫 번째 콘텐츠가 그려지고 인터랙티브 타임이 될 때까지 메인 스레드가 50밀리초 이상 차단된 시간을 측정합니다. 
2. Interaction to Next Paint(INP) : 다음 페인트까지의 상호작용 시간
    1. 사용자 입력과 실제 시각적 피드백 간의 시간을 측정합니다. 이 지표는 사용자의 전체 방문 동안 측정되며, 최종 결과는 보통 최악의 측정 값입니다.

TBT, INP 모두 200ms 이하로 유지하고 싶습니다. 하지만 우리는 긴 작업을 통제 할 수 없습니다. React의 경우 컴포넌트를 렌더링하는 방식으로 인해 긴 작업을 자주 직면하게 됩니다.

## 단일 스레드 문제 해결을 위한 React의 렌더링 과정

### 동기적 렌더링

CityList를 검색하는 코드입니다.  해당 렌더링은 동기 렌더링으로 React는 키 입력 마다 컴포넌트 목록을 다시 렌더링 합니다.

도시는 5000개라고 가정해 봅시다. 매 키입력 마다 5000개의 도시를 검색하여 필터링합니다.

- 해당 코드는 키 입력과 실제 컴포넌트를 업데이트 하는 데 시각적 지연이 있습니다.

```jsx
import React, { useState } from "react";

function SearchCities() {
  const [text, setText] = useState('');

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <CityList searchQuery={text} />
    </div>
  );
}
```

- 위의 코드 같은 경우는 5000개의 검색과 onChange의 렌더링이 모두 같은 우선순위에 존재합니다.
    - 동기 블로킹 렌더링이 발생하여 CityList의 렌더링을 onChange가 기다리게 됩니다.
    
    (아마 기존에는 검색 버튼을 통해 해결할 것이다.)
    

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/39757699-165d-434d-b095-d8dbcccc9f54/2.png)

1. **Rendering**
    
    reconciliation : 현재 VDOM과 UPDATE VDOM을 비교하여 변경 사항을 적용합니다.
    
2. **Commit**

변경사항을 Real DOM에 적용합니다.

두가지 작업은 모두 중단할 수 없습니다. React는 모든 컴포넌트에 동일한 우선순위를 부여하며, 컴포넌트나 업데이트의 복잡성에 따라 렌더링이 오래걸릴 수 있고 메인 스레드는 차단됩니다. 이는 상당한 지연을 일으킬 수 있습니다.

### React 18의 동시성 렌더링.

동시성 렌더러를 사용한다면 이전의 모든 컴포넌트가 동일한 우선순위를 가진 상태에서 특정 부분을 낮은 우선순위로 표시할 수 있습니다.

낮은 우선순위의 렌더링 동안 React는 5ms마다 중요한 작업 여부를 확인하고 중요한 작업이 있을 경우 렌더러는 현재 렌더링을 일시 중지하고 더 중요한 상호작용을 처리한 후 나중에 렌더링을 재개합니다.

낮은 우선순위 표시방법 : startTransition

- 해당 업데이트는 백그라운드에서 렌더링하지만 즉시 DOM에 커밋하지 않습니다.
- 변경사항은 브라우저가 유휴상태이거나 중요한 작업이 없을 경우 적용됩니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/7cb49afb-fe94-4f2e-a4e7-35c4a53e8a3b/3.png)

**useTransition을 사용한 상태관리**

```jsx
import React, { useState, useTransition } from "react";

function SearchCities() {
  const [text, setText] = useState();
  const [searchQuery, setSearchQuery] = useState(text);
  const [_, startTransition] = useTransition();

  return (
    ...
    <input
      type="text"
      onChange={(e) => {
        setText(e.target.value);
        startTransition(() => {
          setSearchQuery(e.target.value);
        });
      }}
    />
    <CityList searchQuery={searchQuery} />
    ...
  );
}

```

- 상태를 둘로 나누었습니다.
    - text
    - searchQuery
- 두개의 상태변경 중 setSearchQuery에 startTransition을 적용하여 우선순위를 낮춥니다.
- 결과 : text 변경의 우선순위가 높아져 searchQuery에 막히지 않고 이벤트가 실행됩니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/b789b396-3678-493d-941b-0e99392cf94d/4.png)

출처 : https://www.youtube.com/watch?v=SqVLqvsiAYQ&t=473s

### React Server Component

React18에서 도입된 React Server Component입니다. Server Component의 Server는 SSR Server, DB Server, React Background 등 여러가지 의미를 내포하고 있습니다.

- HTML, JS 번들 단계를 건너뜁니다.
- 서버에서 전달된 RSC payload를 처리하여 트리를 재구성하는 클라이언트 측 렌더러만 필요하게 됩니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/472045e2-b1f5-4f70-86e1-f0741d76247f/5.png)

<aside>
💡 **React Server Component payload(RSC Payload)**
RSC 페이로드는 렌더링된 리액트 서버 컴포넌트 트리의 압축된 바이너리 데이터 입니다.

구성 요소

- 서버 컴포넌트의 렌더링 결과
- 클라이언트 컴포넌트가 렌더링되어야 하는 위치에 대한 플레이스홀더
- 해당 JavaScript 파일에 대한 참조
- 서버 컴포넌트에서 클라이언트 컴포넌트로 전달된 모든 프로퍼티
</aside>

: 결론적으로 Suspence를 사용하지 못한다면 다른 컴포넌트가 더 큰 우선순위를 갖기 때문에 우선순위가 낮게 처리된다고 볼 수 있습니다.

### **Streaming Control**

useTransition + Suspense

- Suspense :  React에게 특정 조건이 충족될 때까지 해당 트리의 렌더링을 지연
1. React 컴포넌트 트리 렌더 시작
2. Suspence 컴포넌트 발견 시  해당 트리 구조에서 Suspence의 fallback를 렌더링하고 다른 요소를 먼저 클라이언트에서 스트리밍합니다.
3. Suspence는 예외로 두어져 데이터가 사용 가능해지는 것을 기다립니다.
4. Suspence의 데이터가 사용가능해지면 Suspence의 컴포넌트가 fallback을 대체합니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/18d7baab-b390-479c-9460-a1a99def0c11/6.png)

 

<aside>
💡 **비차단 방식** : 데이터가 존재하지 않을 때 웹을 차단하지 않고 데이터가 들어오기까지 기다리는 것으로 차단이 없는 방식을 말한다.

</aside>

Suspence : 낮은 우선순위 컴포넌트 렌더링

useTransition : 브라우저가 유휴상태일 때 렌더링

리액트 서버 컴포넌트 : 백그라운드에서 컴포넌트 렌더링 후 바이너리로 웹에 송출하여 웹에서 재구축하여 컴포넌트를 생성

**Out-Of-Order Streaming**

예제 코드 : https://app-directory-ashen-nine.vercel.app/

비 순차 스트리밍 가능 : 모두 형제 구성요소인 경우.

- 비 순차 : 로딩이 빠른 순서대로 로드됩니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/6074972f-d401-48b1-8e2d-cdb101b640e5/7.png)

**In-Order Streaming**

- 순차 스트리밍 가능 : 구성요소가 부모-자식 관계일 경우
    - 부모에서부터 순차적으로 렌더링됩니다.
    - 이는 PHP의 접근방식과 비슷합니다.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/16f344ed-25d3-4743-89ad-7bfdd9436949/8.png)

Streaming Control은 결국 Suspence의 기능과 useTransition을 섞어서  데이터컨트롤을 한다는 것인데. Suspence와 useTransition의 동작을 이해하는 게 좀 더 필요할듯.

### In Memory Cache

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/1dc87faa-6d9c-4653-b781-5a4666e9bc6b/9.png)

- fetch API를 사용하여 API를 호출할 경우 In-Memory-Cache에 response data가 저장됩니다.
    - In-Memory-Cache에 response data를 저장하는 코드가 궁금.
- 다른 컴포넌트 혹은 같은 컴포넌트가 동일한 데이터를 요구할 경우 In-Memory-Cache를 재사용합니다.
- 많은 API 호출을 걱정할 필요 없이 애플리케이션 전반에서 데이터를 페칭할 수 있게 합니다.

지금까지 다룬 모든 기능은 React에만 해당되며, 반드시 Next.js에만 해당되는 것은 아닙니다. 그러나 Next.js는 이러한 모든 기능을 기본적으로 활용하며, 일부 기능을 더 향상시켜 개발자와 사용자 경험을 모두 개선합니다.

### App Router

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/73b9efbc-8c53-4dd0-b801-f108f7b3b850/10.png)

App Router를 사용할 경우 재조정 과정 최적화를 자동으로 진행한다.

- Link 태그 적극 사용.

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/19f8680d-c65a-4a78-88a7-bdce97cc1d0c/f1339131-0899-44e0-8e11-98fa01b6178f/11.png)

- 이러한 결과는 transition이기 때문에 변경 사항을 DOM에 성능 저하 없이 적용할 수 있을 때까지 메모리에 저장됩니다.

— 다음 이야기 —

### Partial Pre-Rendering과 혼합 페이지

Next.js 14에서 도입된 Partial Pre-Rendering을 통해 특정 컴포넌트의 동적 기능을 유지하면서도 외부 컴포넌트를 정적으로 미리 렌더링할 수 있습니다. 이를 통해 페이지 로딩 속도를 크게 향상시킬 수 있습니다. 동적 콘텐츠를 포함한 경로는 이제 훨씬 빠른 첫 번째 콘텐츠 페인트(FCP)와 가장 큰 콘텐츠 페인트(LCP)를 가질 수 있습니다.

React 18은 transition 기능을 활용하여 특정 경로에 고유한 부분만 업데이트하도록 합니다. 즉, `page.js`에서 내보낸 컴포넌트는 업데이트되지만, 업데이트되지 않은 부분인 `layout`에서 내보낸 컴포넌트는 리렌더링하지 않습니다. 

이러한 결과는 transition이기 때문에 변경 사항을 DOM에 성능 저하 없이 적용할 수 있을 때까지 메모리에 저장됩니다. 예를 들어, 더 중요한 작업이 대기 중이라면, 사용자 이벤트나 다른 작업이 있을 경우 탐색이 완전히 완료되지 않습니다.

React transition 기능을 활용하기 때문에 이벤트의 순서도 보존됩니다. 만약 두 번째 클릭이 첫 번째 클릭보다 빠르면, 첫 번째 클릭은 무시됩니다. 이제 모든 컴포넌트는 기본적으로 React Server Components로 처리됩니다. Next.js는 이를 한 단계 더 발전시켜, 요청 데이터가 필요하지 않은 컴포넌트를 미리 렌더링합니다. 이러한 접근 방식은 서버 사이드 렌더링(SSR)과 매우 유사합니다.
