# React Suspense

## Suspense 개념

suspense를 사용하여 컴포넌트의 랜더링을 어떤 작업이 끝날 때까지 잠시 중단시키고 다른 컴포넌트를 먼저 랜더링 할 수 있습니다.
<br/>
React.lazy, TanStack Query에서 Suspense를 사용할 수 있습니다. 뿐만 아니라 컴포넌트가 throw new Promise()를 하게 되면 Suspense가 동작하기 때문에 이 원리로 다양하게 활용할 수 있습니다.
<br/>
\*(React v18.0 부터 정식 기능으로 추가)

### props

- <b>children</b>: 궁극적으로 렌더링하려는 실제 UI입니다. children의 렌더링이 지연되면, Suspense는 fallback을 대신 렌더링합니다.
- <b>fallback</b>: 실제 UI가 로드되기 전까지 대신 렌더링 되는 대체 UI입니다. 올바른 React node 형식은 무엇이든 대체 UI로 활용할 수 있지만, 실제로는 보통 로딩 스피너나 스켈레톤처럼 간단한 placeholder를 활용합니다. Suspense는 children의 렌더링이 지연되면 자동으로 fallback으로 전환하고, 데이터가 준비되면 children으로 다시 전환합니다. 만약 fallback의 렌더링이 지연되면, 가장 가까운 부모 Suspense가 활성화됩니다.

```
import { Suspense } from 'react';
import Albums from './Albums.js';

export default function ArtistPage({ artist }) {
return (
  <>
    <h1>{artist.name}</h1>
    <Suspense fallback={<Loading />}>
      <Albums artistId={artist.id} />
    </Suspense>
  </>
);
}

function Loading() {
return <h2>🌀 Loading...</h2>;
}
```

## Fetch-on-Render

기존에 Suspense 없이 로딩을 처리하던 방식을 Fetch-on-Render 라고 합니다.

```
function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(u => setUser(u));
  }, []);

  if (user === null) {
    return <p>Loading profile...</p>;
  }
  return (
    <>
      <h1>{user.name}</h1>
      <ProfileTimeline />
    </>
  );
}
```

user 데이터가 없을 때는 조건문을 통해 일단 로딩 컴포넌트를 반환합니다. 데이터 요청은 렌더링 과정의 마지막에 수행되는 useEffect에서 이루어집니다. 요청이 완료 되면 setState을 실행함으로써 재렌더링을 유발하고 기존에 목적으로 하던 컴포넌트를 반환시킵니다.
<br/>
해당 방식은 waterfall문제를 발생시킵니다. ProfileTimeline 컴포넌트는 상위 컴포넌트의 데이터 요청과 재렌더링이 완료된 이후에야 렌더링을 시도 할 수 있습니다. 만약 하위 컴포넌트도 데이터 요청을 수행해야 한다면 화면에 모든 정보가 완전하게 표시되는 시간은 두배로 지연됩니다.
<br/>
개발적 측면에서도 단점이 있는데 구현 방식이 명력적입니다. 컴포넌트 내부에서 데이터가 로딩 중인지, 받아왔는지, 오류가 났는지 모두 확인하는 로직을 작성해야 하고 모든 조건에 맞는 반환값도 따로 설정해 주어야 합니다.

## Render-as-You-Fetch

Suspense를 사용하면 데이터 로딩 완료 후 본 렌더링을 시작하는게 아니라 데이터 로딩과 함께 렌더링을 시작 할 수 있습니다.

```
const resource = fetchProfileData();

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails() {
  // Try to read user info, although it might not have loaded yet
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline() {
  // Try to read posts, although they might not have loaded yet
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
```

위 코드에 나온 resource 는 Suspense를 적용할 수 있도록 만들어진 데이터 Fetching 구현체를 개념적으로 나타낸 것입니다.

이런 식으로 Suspense를 사용하면 데이터가 없거나 로딩 중일 때는 해당 컴포넌트의 렌더링을 건너뛰고 다른 컴포넌트를 먼저 렌더링합니다. 그리고 가장 가까운 부모 Suspense의 fallback으로 지정된 컴포넌트를 화면에 대신 보여줍니다. fallback은 보이는 것을 대신할 뿐 백그라운드에서 suspense된 컴포넌트들의 렌더링은 시도됩니다. 예제에서 ProfileDetail이 로딩 중이더라도 ProfileTimeline에게 렌더링 순서가 올 수 있으므로 두 데이터 요청은 병렬적으로 수행될 수 있습니다.

컴포넌트는 Suspense를 통해 로딩에 관한 책임도 위임할 수 있습니다. Suspense와 비슷하게 에러를 처리하는 ErrorBoundary도 있는데, 둘을 같이 사용하면 컴포넌트는 오직 데이터가 성공적으로 받아와진 상황만을 고려해서 구현될 수 있습니다. 즉, 컴포넌트를 **선언적**으로 나타낼 수 있습니다.

Suspense는 아무 상황에서나 적용할 수 있는 것은 아니고 위 예제에서 데이터 Fetching 역할로 resource라는 구현체를 사용한 것처럼 데이터 요청이 Suspense에 맞는 방식 으로 구현되어 있어야 합니다. 그 방식은 바로 Promise를 throw하는 것입니다.

## Suspense 장점

- 데이터 로딩 처리가 가능합니다.
- 선언형 UI의 간결함을 가질 수 있습니다.
- 데이터가 없을 경우와 같은 예외 처리에 대한 고민 없이 본연의 역할에만 충실 할 수 있습니다.

## Suspense 사용 방식

### 동시 여러 컴포넌트에 사용

```
const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SearchSummary />
      <SearchResults query={query} />
    </Suspense>
  )
}
```

Suspense 컴포넌트는 아래 코드와 같이 여러 개의 자식 컴포넌트를 전달 받을 수 있습니다.

### 중첩해서 사용

```
const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SearchSummary />
      <Suspense fallback={<Loading />}>
        <SearchResults query={query} />
      </Suspense>
    </Suspense>
  )
}
```

SearchSummary 컴포넌트가 먼저 데이터를 가져온다면, SearchResults 컴포넌트가 데이터를 가져오는 것을 기다리지 않고 화면에 먼저 노출 됩니다.

### 데이터를 가져오는 동안 이전 데이터 보여주기

```
const deferredQuery = useDeferredValue(query);
<Suspense fallback={<h2>Loading...</h2>}>
  <SearchResults query={deferredQuery} />
</Suspense>
```

다음 페이지를 클릭할 때마다 로딩 컴포넌트를 노출시킨다면 사용자들이 어색하게 느낄 수 있습니다. 다음 페이지의 데이터를 가져오는 동안 이전 페이지의 데이터를 유지한다면 이런 어색함을 해결할 수 있습니다.
<br/>
useTransition나 useDeferredValue를 사용하면 이전 데이터를 유지할 수 있습니다.
<br/>
데이터를 가져오는 데 사용된 값이 useTransition이나 useDeferredValue으로 만들어진 값이라면 Suspense의 fallback은 실행되지 않습니다.

## Suspense 사용 예시

### React.lazy

React.lazy 함수를 사용하면 컴포넌트가 필요할 때 코드를 가져오고 실행하게 됩니다. 컴포넌트 코드를 가져오고 실행하는 딜레이가 발생하기 때문에 이 시간 동안 Suspense를 사용한다면 사용자에게 좀 더 자연스러운 UI를 제공할 수 있습니다.

```
const LazyComponent = React.lazy(() => import('./LazyComponent'));

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  )
}
```

### TanStack Query V5 (React Query)

TanStack Query는 React Query로 더 잘 알려져 있는 라이브러리입니다. TanStack Query은 비동기 작업을 돕는 라이브러리로 API를 호출하여 서버에서 데이터를 가져오는 작업을 할 때 많이 사용됩니다. TanStack Query에서 Suspense를 사용하려면 useSuspenseQuery 훅을 사용하면 됩니다. useSuspenseQuery는 여러 쿼리를 병렬로 수행 할 수 있는 장점이 있습니다. (TanStack Query V4에서는 useQuery 훅의 suspense 옵션을 true로 설정하면 됩니다.)

### Toss Suspensive open source

React Suspense를 쉽게 사용하기 위한 패키지들을 제공하는 오픈소스
https://suspensive.org/ko/docs/react/motivation
