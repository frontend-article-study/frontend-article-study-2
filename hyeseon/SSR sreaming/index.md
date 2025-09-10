# 개념

Streaming SSR은 가장 빠르게 그릴 수 있는 부분을 먼저 랜더링을 진행하고 이후는 점진적으로 렌더링 하는 방식

# **장점**

- 기존 SSR (renderToString)의 한계 보완
  - 서버에서 모든 HTML 생성 완료 후 응답 → TTFB & FCP 느림
- HTML 일부라도 먼저 보여주면 사용자가 체감하는 속도(FCP, LCP)가 빨라짐
- Suspense + Streaming으로 점진적으로 UI 조립 가능
- 모바일/느린 네트워크 환경에서 효과가 더 큼

# SSR 흐름

```yaml

┌────────────────────────────────────────────────────────────┐
│ 2016     │ React v15: renderToString                       │
│          │ Next.js v1~v2: SSR + pages router               |
├──────────┼─────────────────────────────────────────────────┤
│ 2017     │ React v16: renderToNodeStream (Streaming SSR)   │
├──────────┼─────────────────────────────────────────────────┤
│ 2022.03  │ React v18: Concurrent + Suspense +              │
│          │ renderToPipeableStream / renderToReadableStream │
├──────────┼─────────────────────────────────────────────────┤
│ 2022.10  │ Next.js 13: App Router 도입 (React 18 기반)       │
├──────────┼─────────────────────────────────────────────────┤
│ 2024~    │ Next.js 14+: App Router 안정화 및 실전 적용 확대      │
└──────────┴─────────────────────────────────────────────────┘
```

## 1. 초창기 SSR (React v15, Next.js v1~v2)

### renderToString

- 컴포넌트를 HTML 문자열로 변환
- 서버에서 전체 HTML을 생성한 뒤 클라이언트에 한 번에 전송
- 스트리밍 불가, 로딩 속도가 느릴 수 있음

```jsx
import { renderToString } from "react-dom/server";

const html = renderToString(<App />);
res.send(html);
```

## 2. Streaming SSR 도입 (React v16, Next.js v3~v12)

### renderToNodeStream

- Node.js의 stream API와 호환
  - Node.js 스트림: 데이터를 한꺼번에 모두 받거나 보내는게 아니라 chunk 단위로 점진적으로 처리하는 방식
- 스트리밍 가능: HTML을 점진적으로 전송
- 초기 로딩이 빨라짐 (FCP 개선)
- Next.js는 내부적으로 이 스트리밍 방식으로 최적화하기도 했음

```jsx
import { renderToNodeStream } from "react-dom/server";

const stream = renderToNodeStream(<App />);
stream.pipe(res);
```

\*`pipe`: pipe는 읽기 스트림에서 흘러나오는 데이터를 자동으로 쓰기 스트림으로 전달해 주는 메서드

-readableStream에서 데이터 청크가 준비되면 pipe가 이를 writableStream에 자동으로 전송<br/>
-writableStream은 받은 데이터를 처리하거나 저장

## 3. Streaming API 도입 (React v18~, Next.js v13~ app router)

Concurrent SSR + Server Component

### renderToPipeableStream (Node.js 환경)

### renderToReadableStream (Web Streams)

⇒ react 18이상부터 사용할 수 있고 Nextjs App Router를 사용하고 있다면 해당 API를 따로 설정할 필요가 없습니다. Next.js는 React 18의 Streaming SSR API를 내부적으로 사용해서 페이지를 스트리밍 처리

- Concurrent rendering 지원
- Suspense 기반의 점진적 렌더링
- React Server Component와 호환
- Next.js 13+의 app 디렉토리 구조는 이것을 내부적으로 사용함

```jsx
import { renderToPipeableStream } from "react-dom/server";

const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() {
    pipe(res);
  },
});
```

# Nextjs 내부처리

- App Router (app/ 디렉토리 사용) → 자동으로 React 18의 Server Components + Streaming SSR 기능 사용
- Next.js가 React 18의 스트리밍 렌더링을 내부적으로 구성하고 onShellReady 사용
- Next.js에서 직접 Suspense, Lazy loading 등을 사용하여 Streaming SSR을 활용

\*`onShellReady`: React가 최소한의 스트리밍 HTML(쉘)을 준비했을 때 호출됨

# React에서 직접 구현하는 방법

## 1: Node.js 환경 (예: Express) + `renderToPipeableStream`

```jsx
npm install react react-dom express
```

```jsx
project/
├── App.jsx
├── server.js
├── package.json
```

```jsx
// App.jsx
import React from "react";

export default function App() {
  return (
    <div>
      <h1>Streaming SSR Example</h1>
      <p>This part is streamed!</p>
    </div>
  );
}
```

```jsx
// server.js
import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App.jsx";
import { PassThrough } from "stream";

const app = express();
const PORT = 3000;

app.get("*", (req, res) => {
  let didError = false;

  const { pipe } = ReactDOMServer.renderToPipeableStream(
    <html>
      <head>
        <title>React Streaming</title>
      </head>
      <body>
        <div id='root'>
          <App />
        </div>
      </body>
    </html>,
    {
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-Type", "text/html");
        const body = new PassThrough();
        pipe(body); // stream을 response로 연결, 스트리밍할 HTML을 PassThrough 스트림으로 처리
        body.pipe(res);
      },
      onError(err) {
        didError = true;
        console.error("Render error:", err);
      },
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

- 페이지를 열면 React가 렌더링한 HTML이 조각 단위로 브라우저에 전송
- onShellReady는 첫 HTML "껍데기"가 준비됐을 때 호출
- 지연된 컴포넌트가 있다면 Suspense를 사용해서 점진적 렌더링도 가능

\*`PassThrough`: 스트림을 Express 응답과 연결하기 위한 Node.js stream 유틸리티

## Web 환경 (예: Edge, Workers) + `renderToReadableStream`

이건 Node.js 환경이 아닌 Web Streams 기반 플랫폼에서 사용

React + Deno, Cloudflare Workers

```jsx
// Cloudflare Workers 예시
export default {
  async fetch(request: Request) {
    const stream = await renderToReadableStream(<App />);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
```
