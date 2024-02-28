# 검색 엔진 최적화를 위한 sitemap과 robots 알아보기

tags: SEO
date: 2024/02/28
slug: sitemap-and-robots
subtitle: sitemap과 robots 파일이 SEO에 좋은 이유?

# 검색 엔진의 동작 방식

Google 검색은 **크롤러**라는 웹을 탐색 프로그램을 사용하는 자동화된 검색 엔진입니다. 웹 크롤러는 정기적으로 웹을 탐색하며 색인에 추가할 페이지를 찾고, 찾은 페이지는 검색 결과로 이어집니다.

## Google 검색의 3단계

Google 검색은 3단계로 동작합니다. (이때, 각 단계가 모든 페이지에 적용되는 것은 아닙니다.)

### 1. 크롤링

웹에 어떤 페이지가 존재하는지 파악하는 단계입니다. 모든 웹페이지가 등록되는 곳이 있는게 아니기 때문에, 계속해서 새 페이지와 업데이트된 페이지를 검색하고 파악된 페이지 목록에 추가합니다.

### 2. 색인 생성

페이지가 크롤링된 다음, 페이지의 내용을 파악하는 단계입니다. <title> 요소나 alt 속성, 이미지나 동영상, 텍스트 컨텐츠 등 핵심 컨텐츠 태그와 속성을 처리하고 분석합니다.

### 3. 검색 결과 게재

검색창에 검색어를 입력하면, 색인에서 일치하는 페이지를 검색한 다음 품질이 가장 높고 사용자와의 검색어와 관련성이 큰 결과를 반환합니다.

---

기본적으로 크롤러가 웹을 탐색하면서 파일을 읽고 사이트를 크롤링하지만 사이트가 워낙 많기 때문에 항상 크롤링이 잘 될 것이라는 보장이 없고, 반면 크롤링을 원치 않는데도 크롤링될 가능성도 있습니다.

이렇게 내가 원하는 사이트를 좀 더 검색이 잘 되게 또는 검색이 되지 않게 즉 크롤러에게 친화적이게 하기 위하여 검색 엔진 최적화를 할 수 있는데요.

검색 엔진 최적화 방법 중 하나인 sitemap과 robots에 대해 알아보겠습니다.

# Sitemap

`sitemap`은 **사이트에 있는 페이지, 동영상 및 기타 파일과 각 관계에 관한 정보를 제공하는 파일**입니다.

이 파일을 통해 검색 엔진에게 사이트에서 중요하다고 생각하는 페이지와 파일을 알려줄 수 있어 검색 엔진은 사이트를 더 효율적으로 크롤링할 수 있게 됩니다.

사이트 페이지가 제대로 링크되었다면, 검색 엔진에서 대부분의 사이트를 찾을 수 있지만 그렇다 하더라도 사이트맵을 사용하면 크고 복잡한 사이트나 전문화된 파일의 크롤링을 개선할 수 있습니다.

즉, 사이트가 크고 복잡할 수록 sitemap 파일을 두는 것이 검색 엔진 최적화에 도움이 된다고 합니다.

### 종류

1. XML 사이트맵
    - 가장 다양한 용도로 사용할 수 있는 사이트맵 형식
    - URL에 관해 가장 많은 정보를 제공할 수 있음
    - 용량이 큰 사이트이거나 URL이 자주 변경된다면 번거로울 수 있음
2. RSS, mRSS, Atom 1.0
    - XML과 유사하지만, CMS에서 자동으로 생성되어 가장 간편함
    - 색인을 생성할 수 있는 파일 형식에 제한이 있음 (가능한 형식 [링크](https://developers.google.com/search/docs/crawling-indexing/indexable-file-types?hl=ko))
3. 텍스트 사이트맵
    - 가장 간단한 형식으로 색인 생성이 가능한 페이지의 URL만 표시할 수 있음

### 예시 (xml)

제 블로그의 sitemap.xml 입니다.

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sungjihyun.vercel.app</loc>
    <lastmod>2024-02-28T05:16:45.615Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://sungjihyun.vercel.app/blog</loc>
    <lastmod>2024-02-28T05:16:45.615Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://sungjihyun.vercel.app/projects</loc>
    <lastmod>2024-02-28T05:16:45.615Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>

```

- `loc`: 사이트 주소
- `lastmod`: 마지막 수정 시간
- `changefreq`: 이 페이지가 얼마나 자주 변경되는지
- `priority`: 이 페이지의 중요도

# Robots.txt

robots.txt 파일은 접근할 수 있는 url을 검색 엔진 크롤러에게 알려주기 위한 파일입니다.

사이트의 크롤러 트래픽을 관리하는 역할을 하고, 일반적으로 파일 형식에 따라 검색 엔진에 특정 파일을 노출시키지 않기 위해 사용하기도 합니다.

단, robots.txt 규칙은 일부 검색엔진에서만 지원될 수 있어 robots.txt에서 허용되지 않은 페이지더라도 색인이 생성될 수 있습니다. 따라서 특정 파일을 노출시키지 않기 위해서는 비밀번호로 보호하는 것이 효과적입니다.

### 예시

```
User-agent: Googlebot
Disallow: /nogooglebot/

User-agent: *
Allow: /

Sitemap: https://www.example.com/sitemap.xml
```

- `User-agent`: 사용자 에이전트 이름
- `Disallow`: 크롤링을 비허용할 url (https://www.example.com/nogooglebot 경로는 크롤링할 수 없음)
- `Allow`: 크롤링을 허용할 url
- `Sitemap`: 사이트맵 파일의 위치

# 마치며

SEO 작업에 함께 따라오는 토픽들이라 각 파일을 작성했을 때의 이점이 무엇인지 궁금했었는데, 다른 SEO 작업과 마찬가지로 크롤러가 내 사이트를 효율적으로 읽을 수 있게 여러 정보들을 던져준다라는 느낌이 드네요.

구글의 검색 문서를 읽어보니 (제 블로그 사이트에서) 두 파일을 작성하는 게 SEO에 엄청난 도움이 되진 않는 듯 하지만, SEO를 향상시키는 제 1의 방법은 없기 때문에 일단 작성해 두는 것도 나쁘지 않다는 생각이 들었습니다.

읽어주셔서 감사합니다.