# SSG · ISR · react cache() · unstable_cache

## Next.js 캐시

| 층                  | 캐싱 대상                                | 방식                                             |
| ------------------- | ---------------------------------------- | ------------------------------------------------ |
| Request Memoization | 한 요청 안에서 같은 함수 호출            | `react cache()`                                  |
| Data Cache          | 데이터 패칭 결과 (요청·배포를 넘어 지속) | `unstable_cache(use cache)`                      |
| Full Route Cache    | 렌더된 페이지 (HTML / RSC payload)       | SSG / ISR                                        |
| Router Cache        | 클라이언트 라우터의 페이지 세그먼트      | prefetch prop, router.refresh(), staleTimes 설정 |

요약: SSG/ISR 은 페이지를, `unstable_cache` 는 데이터를, `react cache()` 는 한 요청 안의 중복을 다룹니다. 층이 다르니 셋을 한 페이지에서 동시에 쓰기도 합니다.

## 1. SSG(Static Site Generation) — 빌드 때 만들어 고정

**언제**: 콘텐츠가 빌드 시점에 전부 정해지고, 배포 전까지 안 바뀔 때
e.g) 문서 사이트, 마케팅 랜딩, 릴리즈 노트

```tsx
// 정적 파라미터를 전부 나열, revalidate X
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
```

특징: 빌드 때 한 번 정적 생성하면 끝이고 다음 배포 전까지 안 바뀐다. 가장 빠르고 고정된 페이지

## 2. ISR(Incremental Static Regeneration) — 정적인데 주기적으로 갱신

**언제**: 정적 페이지의 속도는 원하지만 콘텐츠가 바뀌고 **몇 분~몇 시간의 지연은 허용**될 때
e.g) 콘텐츠 상세 페이지

```tsx
// src/app/[lang]/spot/[id]/page.tsx
export const revalidate = 3600; // 1시간마다 백그라운드 재생성
export const dynamicParams = true; // 목록에 없는 경로도 첫 요청에 생성

export function generateStaticParams() {
  return []; // 빌드 때는 아무것도 프리렌더하지 않고, 전부 첫 요청에 생성
}
```

- `revalidate = N`: N초 지난 뒤 첫 요청에 stale 응답을 주면서 뒤에서 다시 생성(stale-while-revalidate).

- `dynamicParams`: `false` 면 목록에 없는 파라미터는 404. `true` (기본) 면 on-demand 생성

- `generateStaticParams`: 동적 세그먼트의 정적 경로 목록. 반환한 경로는 빌드 때 미리 생성됨
  <br/> 빈 배열 = "정적 라우트지만 빌드 때는 0개 생성" → 전부 첫 요청 때 생성되고 캐시됨(ISR). 함수가 아예 없으면 동적 렌더로 빠질 수 있으므로 빈 배열이라도 선언하는 게 의미 있음

## 3. `react cache()` — 한 요청 안에서 중복 제거

**언제**: 같은 요청을 처리하는 동안 **같은 데이터를 여러 군데서** 가져올 때. 전형적으로 `generateMetadata` (OG 태그·title) 와 페이지 본문이 같은 레코드를 필요로 하는 경우.

```tsx
import { cache } from "react"; // Next 가 아니라 React

const getSpot = cache(async (id: string) => {
  const { data } = await supabase
    .from("spots")
    .select(SPOT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data;
});

// generateMetadata() 에서도 getSpot(id), 페이지 컴포넌트에서도 getSpot(id)
// → 실제 DB 쿼리는 요청당 1번
```

- **범위**: 그 요청이 끝나면 폐기. TTL(Time To Live)도 태그도 없고 요청 안해서 중복 된 작업을 막는 기능
- `fetch()` 는 Next 가 한 요청 안에서 **자동으로 dedup** 하므로 `cache()` 로 감쌀 필요가 없다. `cache()` 가 필요한 건 **`fetch` 가 아닌 것** — DB 클라이언트 (supabase-js, Prisma 등), 파일 읽기, 무거운 계산.

## 4. `unstable_cache` — 결과를 저장

**언제**: 여러 요청·여러 유저가 공유해도 되는 결과 조회 데이터를 N초 동안 재사용하고 싶을 때. (Next data cache에 저장)

```tsx
import { unstable_cache } from "next/cache";

const getSpots = unstable_cache(
  async (locationKey: string, categoryId: string) => {
    /* Supabase 쿼리 */
  },
  ["spots-filtered"], // 캐시 키
  { revalidate: 3600, tags: ["spots"] }, // TTL + 무효화 태그
);
```

- **범위**: Next Data Cache. 함수 **인자 조합마다 별도** -> `getSpots('', '')` 와 `getSpots('seoul', '')` 는 다른 캐시
- **무효화**: `revalidate` TTL이 지나거나, `revalidateTag('spots')` 를 부르거나
- 사이드프로젝트에선 목록 페이지가 `searchParams` 를 읽어서 **동적 라우트** 다. 페이지 자체는 매 요청 렌더되지만, 그 안의 `getSpots()` 결과가 Data Cache에서 나와서 DB는 1시간에 한 번만 호출한다. → **동적 라우트여도 데이터는 캐시할 수 있다.**
- Next 16에선 `"use cache"` 지시어로 대체되는 중이지만, `unstable_cache` 도 아직 통용된다.
- fetch는 fetch(url, { next: { revalidate: 3600 } })처럼 캐시 옵션을 직접 줄 수 있어서 fetch 보단 supabase 같은 DB 클라이언트 사용시 유용하다.

## 무효화: `revalidatePath` vs `revalidateTag`

(데이터가 바뀌는 시점에 사용)

|      | `revalidatePath`                            | `revalidateTag`              |
| ---- | ------------------------------------------- | ---------------------------- |
| 대상 | Full Route Cache (페이지)                   | Data Cache (태그)            |
| 기준 | 라우트 파일 경로 (브라우저 URL 아님)        | 태그 문자열                  |
| 범위 | 그 경로 하나 (동적 라우트면 인자 조합 하나) | 태그를 쓰는 모든 페이지·조합 |

두가지 같이 쓸때

```tsx
for (const lang of locales) {
  revalidatePath(`/${lang}/spot/${spotId}`); // 상세 페이지
  revalidatePath(`/${lang}/spot`); // 목록 페이지
}
revalidateTag("spots", "max"); // 모든 필터 조합의 목록 데이터
```

## 의사결정 필요한 부분

```markdown
콘텐츠가 빌드 시점에 전부 고정? → SSG (generateStaticParams, revalidate 없음)
정적인데 가끔 갱신 + 지연 허용? → ISR (export const revalidate = N)
요청마다 최신 필요 (개인화 / 실시간)? → 동적 렌더, 캐시 안 함
──────────────────────────────────────────────────────────
한 요청 안에서 같은 조회가 여러 번? → react cache() (fetch 면 불필요)
여러 요청이 공유 가능한 비싼 조회? → unstable_cache (+ tags)
```

사이드프로젝트 상세 페이지는

- **ISR** 로 페이지 전체를 1시간 캐시 (Full Route Cache)
- 그 안에서 **`react cache()`** 로 `generateMetadata` ↔ 본문 DB 조회 dedup (Request Memoization)

두 층에서 동시에 캐싱된다.

## 사이드프로젝트에서 실제로 쓴 조합

| 대상                          | 도구                                                       | 이유                                                  |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| 스팟 상세 `/[lang]/spot/[id]` | ISR (`revalidate=3600`, `dynamicParams`) + `react cache()` | 정적 성능 + 콘텐츠 갱신, 요청 내 DB 왕복 2→1          |
| 스팟 목록 `/[lang]/spot`      | `unstable_cache` (`tags: ['spots']`)                       | 동적 라우트 (searchParams) 지만 쿼리 결과는 공유 가능 |
| 발행 시 무효화                | `revalidatePath` (상세) + `revalidateTag` (목록)           | 페이지 캐시와 데이터 캐시는 층이 달라 각각            |
