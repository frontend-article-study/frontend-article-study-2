# Next v16

Next.js 16 버전은 2025년 10월(21일)에 출시되었으며 성능, 캐싱, 라우팅 등 개발자 경험을 개선한 주요 기능들이 추가되었습니다.

[컨퍼런스](https://nextjs.org/conf)

# 1. Cache Components

- Partial Pre-Rendering(PPR)\* 기반의 Cache Components 기능이 도입되어 부분적으로 정적/동적 데이터를 혼합해서 사용하고, “use cache” 지시자를 통해 선언하고 컴파일러를 활용하여 캐시 키가 사용될 때마다 자동으로 생성됩니다.
- 이전 버전의 App Router에서 사용되던 암묵적 캐싱과 달리 Cache Components를 사용한 캐싱은 완전히 옵트인 방식입니다. 모든 페이지, 레이아웃 또는 API 경로의 모든 동적 코드는 기본적으로 요청 시점에 실행됩니다.
- `updateTag()` , `revalidateTag()` API로 캐시 라이프사이클 관리가 정교해졌습니다.
- 여기서 캐시는 React Query처럼 브라우저 메모리 안에 있는 캐시가 아니라 CDN / Edge / Server File System 상에 있는App Router 전역 캐시 레이어에 저장된 데이터입니다.

\*Partial Pre-Rendering(PPR)란?

PPR은 하나의 페이지에서 static한 부분은 사용자에게 바로 보여주고, dynamic한 부분은 fallback을 보여주다가 컴포넌트의 준비가 끝나면 해당 컴포넌트를 보여주게 됩니다.

```jsx
// next.config.ts 캐시 구성 요소를 활성화할 수 있습니다
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

Next.js 16에서는 캐시 동작을 보다 명확하게 제어할 수 있는 정교한 캐싱 API가 도입되었습니다.

## 캐싱 API

### `revalidateTag()` (업데이트됨)

```jsx
import { revalidateTag } from "next/cache";

// 가능한 한 오래 유지 (수동 revalidate 전까지 캐시 유지) 유효시간이 무제한
revalidateTag("blog-posts", "max");

// 매시간 갱신
revalidateTag("news-feed", "hours");
// 매일 갱신
revalidateTag("analytics", "days");

// 1시간(3600초)
revalidateTag("products", { revalidate: 3600 });

// ⚠️ Deprecated 무조건 cacheLife 지정
revalidateTag("blog-posts");
```

함수는 특정 캐시 태그에 대해 필요에 따라 캐시된 데이터를 무효화할 수 있게 해줍니다. 이벤트적 일관성을 허용하는 정적 콘텐츠에 적합합니다.

### `updateTag()`(신규 출시)

기존 `tag`에 연결된 캐시 데이터를 직접 갱신합니다.

```jsx
"use server";

import { updateTag } from "next/cache";

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);

  // Expire cache and refresh immediately - user sees their changes right away
  updateTag(`user-${userId}`);
}
```

| 항목                  | `revalidateTag()`                               | `updateTag()`                  |
| --------------------- | ----------------------------------------------- | ------------------------------ |
| 동작                  | 캐시를 stale 상태로 표시                        | 캐시를 새 데이터로 교체        |
| 네트워크 요청         | 다음 fetch 때 발생                              | 발생하지 않음                  |
| 반영 시점             | 다음 요청 시                                    | 즉시                           |
| 유스케이스            | 데이터 변경 후 새로 fetch 유도, (리프레시 버튼) | 낙관적 업데이트 / 즉시 UI 반영 |
| 유사 React Query 함수 | `invalidateQueries()`                           | `setQueryData()`               |

### `refresh()`(신규 출시)

- 데이터가 너무 많아서 어떤게 stale상태인지 모를때 사용
- 서버 캐시 전체 스캔이 필요하므로 프로젝트 규모가 크면 부하가 생길수도 있음.

```jsx
"use server";

import { refresh } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId);

  refresh();
}
```

# 2. Devtools MCP 및 AI 기반 디버깅

Next.js Devtools MCP가 내장되어 AI 또는 Agent 기반 디버깅을 지원합니다.

- **Next.js 지식**: 라우팅, 캐싱 및 렌더링 동작
- **통합 로그:** 컨텍스트 전환 없이 브라우저 및 서버 로그
- **자동 오류 액세스:** 수동 복사 없이 자세한 스택 추적
- **페이지 인식:** 활성 경로에 대한 상황적 이해

이를 통해 AI 에이전트는 개발 워크플로 내에서 직접 문제를 진단하고 동작을 설명하고 수정 사항을 제안할 수 있습니다.

# 3. middleware.ts → proxy.ts 변경

기존 `middleware.ts`는 `proxy.ts`로 대체되어 네트워크 경계 관리가 더 명확해졌습니다.

`proxy.ts`: Node.js 런타임에서 실행

```jsx
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/home", request.url));
}
```

# 4. 빌드 및 개발 경험 개선

### 빌드/개발 로그 및 에러 메시지 가시성 개선

```jsx
//기존
info  - Compiled /app/page.tsx in 2.3s
warn  - [Fast Refresh] Something went wrong
error - /app/page.tsx: Unexpected token

// next16

   ▲ Next.js 16 (Turbopack)

 ✓ Compiled successfully in 615ms
 ✓ Finished TypeScript in 1114ms
 ✓ Collecting page data in 208ms
 ✓ Generating static pages in 239ms
 ✓ Finalizing page optimization in 5ms
```

기존(Next v13~15)에 로그가 Webpack 기반이라 에러 메시지가 길고 추적이 어려웠습니다.

Next16이후부터는 각 단계(`TypeScript check`, `Page generation`, `Optimization` 등)가 명시적으로 표시됩니다

### lockfile 및 별도 output 디렉토리 도입으로 동시 작업 안정성 확보

- lockfile
  Next 16은 빌드 시 내부적으로 `next.lock` 파일을 생성합니다. 이 파일에는 Turbopack 캐시와 incremental build metadata가 저장되는데 여러 터미널에서 `next build` / `next dev` 를 동시에 돌려도 같은 캐시 자원을 엉망으로 덮어쓰지 않음을 의미합니다.
- output
  기존에는 `.next/` 디렉토리 하나에 빌드 결과물 + 캐시 + 임시 로그가 섞여 있었지만 이제 Next 16에서는 다음과 같이 분리가 되었습니다.
  ```jsx
  .next/
    ├─ build/         ← 최종 산출물 (정적 파일, 서버 번들)
    ├─ cache/         ← Turbopack 캐시
    ├─ logs/          ← 빌드 로그
    ├─ lock/          ← lock 파일
  ```

### Parallel route 슬롯에 모든 경우 `default.js` 필수 적용

```jsx
// 기존 사용하던 병렬 라우트 방식
app/
 ├─ layout.tsx
 ├─ @modal/(...)        ← 병렬 슬롯
 ├─ @feed/page.tsx
 └─ page.tsx
```

이전에는 `@modal` 이나 `@feed` 에 기본 슬롯(`default.js`)이 없어도 돌아갔지만 Next 16부터는 Parallel Slot에 명시적인 `default.js` 파일이 필요합니다.

- 새로운 Turbopack build planner가 slot tree를 완전하게 분석해야 하기 위함
- 빈 default가 없으면 build graph가 불완전해지고 incremental build가 깨질 수 있음

```jsx
// e.g)
app/@modal/default.tsx
```

# 5. Turbopack 기본 번들러 적용

- Rust 기반 Turbopack이 안정화되어 기존 Webpack 대신 모든 신규 프로젝트에 기본 적용됩니다.
- Fast Refresh가 최대 10배, 프로덕션 빌드가 2~5배 빨라졌습니다.
- 파일 시스템 캐싱이 beta로 지원되어 큰 프로젝트에서 초기 컴파일이 더욱 빨라집니다.

# 6. 라우팅과 네비게이션 개선

- 레이아웃 중복 제거: 공유 레이아웃으로 여러 URL을 프리페칭할 때, 레이아웃은 각 링크마다 따로 다운로드되는 대신 한 번만 다운로드됩니다. 예를 들어 50개의 제품 링크가 있는 페이지는 이제 레이아웃을 50번이 아닌 한 번만 다운로드하므로 네트워크 전송 용량이 크게 줄어듭니다.
- \*증분 프리페칭을 통한 최적화된 탐색

\*증분 프리페칭 : Next.js는 전체 페이지가 아닌 캐시에 없는 부분만 프리페칭합니다. 이제 프리페치 캐시는 다음과 같습니다.

1. 링크가 뷰포트를 벗어나면 요청을 취소합니다.
2. 호버 시 또는 뷰포트에 다시 들어갈 때 링크 사전 페칭을 우선시합니다.
3. 데이터가 무효화되면 링크를 다시 사전 페치합니다.
4. 캐시 구성 요소와 같은 기능과 함께 작동합니다.

# 7. React 19.2 및 Compiler 연동

### React 19.2를 기본 사용하며, View Transitions, useEffectEvent(), <Activity> 컴포넌트를 지원합니다.

- View Transitions: 전환 또는 탐색 내에서 업데이트되는 요소 애니메이션
- useEffectEvent(): Effect 내부(예: `useEffect`)에 넣던 비반응 로직을 분리해서 재사용 가능하게 만든 기능입니다. 예를들어 이벤트 핸들러를 독립된 함수로 만들어 재사용하고 안정성을 높일 수 있습니다.
- <Activity>: UI에 보이지 않아도 상태/Effect 유지해야 하는 백그라운드 로직에 사용합니다

  ```jsx
  "use client";

  import { Activity } from "react";

  export default function BackgroundPoller() {
    return (
      <Activity>
        {() => {
          useEffect(() => {
            const interval = setInterval(() => {
              console.log("백그라운드 폴링 중...");
            }, 5000);

            return () => clearInterval(interval);
          }, []);

          return null; // UI는 렌더링 안 됨
        }}
      </Activity>
    );
  }
  ```

### React Compiler(자동 메모이제이션)가 안정화 되어 실험적 기능에서 공식 지원됩니다.

```jsx
const nextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

### 이미지 최적화 옵션 변경: 이미지 캐시 TTL 기본값 증가(60초 → 4시간), 품질 옵션 변경, 별도의 제한된 리디렉트 적용 등 보안과 퍼포먼스 향상되었습니다.

https://nextjs.org/blog/next-16#enhanced-routing-and-navigation
