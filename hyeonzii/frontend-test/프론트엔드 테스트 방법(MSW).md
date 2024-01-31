이번 포스팅은 이 [영상](https://www.youtube.com/watch?v=MN7Pw4mK6lU)을 참고로 작성되었습니다!

# 테스트..?

프로그램을 실행하여 오류와 결함을 검출하고 애플리케이션이 요구사항에 맞게 동작하는지 검증하는 절차


# 프론트엔드 테스트

### UI가 존재하는 경우

- 자동화 테스트
	
    - 반복적인 테스트를 코드로 작성
    
- 수동 테스트

	
    - 브라우저에서 직접 접근
    - 눈으로 직접 보는 것
    
## 테스트 피라미드
    
![](https://velog.velcdn.com/images/hyeonzii/post/43d4cd24-2df5-401b-9e03-d09dd32f464c/image.png)
(_출처:https://www.testingjavascript.com/_)

# 테스트의 여러 종류

## 정적 테스트 (Static Test)

구문오류와 타입오류를 감지해 알려줘 런타임 에러를 방지

- Typescript
- eslint

## 단위 테스트 (Unit Test)

하나의 함수, 메소드, 클래스, 모듈 등이 의도한 대로 작동하는지 테스트

Input에 대한 올바른 Output을 반환하는지 테스트

- jest
- mocha
- react-testing-libray
...

## 통합 테스트 (Intergration Test)

여러개의 모듈, 컴포넌트 등이 상호작용하며 잘 동작하는지 테스트

비즈니스 로직과 연관된 테스트

- react-testing-libray
- Enzym
...

## E2E(End to End) 테스트 

사용자가 어플리케이션에서 경험할 것으로 예상되는 행동을 코드로 작성해 검증하는 테스트

- cypress
- puppeteer
...

## UI 테스트 

컴포넌트가 예상한 대로 화면에 그려지는 지 테스트

- storybook
- Bit
- stylegudist
...

## 웹 접근성 테스트

장애인, 고령자 ... 다양한 사용자 그룹이 웹사이트를 접근하고 이용할 수 있는지 테스트

- storybook accessibility addons
- 스크린 리더
- Wave
...

## MSW를 활용하는 Front-end 통합테스트

### MSW...?

MSW(Mock Service Worker)는 서비스 워커를 사용하여 네크워크 호출을 가로채는 API 모킹(mocking) 라이브러리 입니다.

백엔드의 API 개발을 기다리지 않고도! 프론트엔드를 테스트 해볼 수 있도록 해주는 녀석입니다.

**vite 프로젝트 기반 입니다!**

1. 설치

```bash
npm install -D msw
```

2. API 응답을 해줄 테스트 도구 만들기

```bash
npx msw init public/ --sav
``` 

![](https://velog.velcdn.com/images/hyeonzii/post/f974b874-0473-4fdc-894e-a855246ce6d0/image.png)

mockServiceWorker.js 가 생성됩니다.

3. mocks 폴더 생성

해당 폴더 안에

**browser.ts**
```typescript
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

**handlers.ts**
```typescript
import { http, HttpResponse } from "msw";
export const handlers = [
  http.get("/resource", () => {
    return HttpResponse.text("Hello world!");
  }),
];

```

> 🚨 msw 가 업데이트 되면서 기존의 "rest" 가 아니라 "http" 를 사용해야 합니다!

4. App.tsx 변경

```tsx
import Layout from "./components/Layout";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/resource", {
          method: "GET",
        });
        if (response.ok) {
          const result = await response.text();
          console.log("Result: ", result);
          setData(result);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div>MSW로 받아온 데이터</div>
      <div>
        <pre>{data}</pre>
      </div>
    </Layout>
  );
}

export default App;

```

![](https://velog.velcdn.com/images/hyeonzii/post/a03793de-d3e8-4eda-86fd-2c1a5f26f03e/image.png)

와 같이 결과가 뜹니다!

## 추가적으로 참고할 예시

[MSW 모킹 코드 재사용하기 feat. Storybook, Jest](https://fe-developers.kakaoent.com/2022/220317-integrate-msw-storybook-jest/)

### 참고 블로그

[MSW를 활용하는 Front-End 통합테스트](https://fe-developers.kakaoent.com/2022/220825-msw-integration-testing/)
[MSW로 백엔드 API 모킹하기](https://www.daleseo.com/mock-service-worker/)
[TIL230316📑React) VITE에서 .env 환경변수 사용](https://velog.io/@tmdgp0212/TIL230316-using-.env-on-vite)
[[MSW] 가짜 API와 통신하기](https://velog.io/@gojaeng/MSW)