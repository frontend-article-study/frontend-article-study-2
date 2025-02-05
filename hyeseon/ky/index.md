# ky

2015년부터 주요 브라우저에서는 fetch를 제공했고 ky는 fetch 기반 라이브러리 중 하나 입니다.
<br/>
[공식문서](https://github.com/sindresorhus/ky)

## fetch vs axios

모두 HTTP 요청을 보내고 응답을 처리하는 데 사용되는 자바스크립트 라이브러리입니다.

### fetch

장점

- **자바스크립트 내장 라이브러리이므로 별도의 설치가 필요없습니다.**
- **Promise API를 활용하기 때문에** 다루기 편하고, ES6 이후의 자바스크립트에서 표준으로 사용됩니다.
- **내장 라이브러리이기 때문에 업데이트에 따른 오류 예방이 가능합니다.**

단점

- **지원되지 않는 브라우저가 존재합니다. (IE11)**
- 타임아웃 설정이 없다.> `AbortController` 사용하여 직접 구현해야 합니다.
- **JSON변환, 문자열변환 과정이 별도로 필요합니다.**
- 요청 및 응답 인터셉터가 없어서 요청 전 공통 로직을 수동으로 추가해야합니다.
- `fetch`는 HTTP 오류 상태 코드(404, 500 등)를 자동으로 `throw` 하지 않습니다. 대신 `response.ok` 속성을 확인하여 요청 성공 여부를 확인해야 한다.

### axios

장점

- JSON자동변환, 자동문자열 변환, CSRF(악성 스크립트 접근 감지) 보호 기능 등 fetch에는 없는 기능들을 지원합니다.
- **Promise API**를 활용하기 때문에 다루기 편리합니다.
- **브라우저 호환성이 뛰어납니다.**
- `CancelToken`을 통한 취소 기능을 지원합니다

단점

- 별도의 라이브러리 설치가 필요합니다. → `npm install axios` `yarn add axios`
- 외부 라이브러리이므로 업데이트에 따라 불안정적일 수 있습니다.

---

## Install

```
npm install ky
or
yarn add ky
```

## Usage (ky와 fetch 비교 예시)

### Case1. ky 사용

```jsx
import ky from "ky";

const json = await ky.post("https://example.com", { json: { foo: true } }).json();

console.log(json);
//=> `{data: '🦄'}`
```

### Case2. fetch 사용

```jsx
class HTTPError extends Error {}

const response = await fetch("https://example.com", {
  method: "POST",
  body: JSON.stringify({ foo: true }),
  headers: {
    "content-type": "application/json",
  },
});

if (!response.ok) {
  throw new HTTPError(`Fetch error: ${response.statusText}`);
}

const json = await response.json();

console.log(json);
//=> `{data: '🦄'}`
```

## (fetch 보다 발전된) ky기능

### 1. 타임아웃 기능

```jsx
// ky 예시
import ky from "ky";

ky.get("https://api.example.com/data", { timeout: 5000 }) // 5초 타임아웃
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

### 2. 인터셉터 기능

```jsx
import ky from "ky";

const response = await ky("https://example.com/api/users", {
  hooks: {
    beforeRequest: [
      (request) => {
        // 요청 전에 헤더 추가
        request.headers.set("Authorization", "Bearer token");
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        console.log(response);
        // Or return a `Response` instance to overwrite the response.
        return new Response("A different response", { status: 200 });
      },

      // Or retry with a fresh token on a 403 error
      async (request, options, response) => {
        if (response.status === 403) {
          // Get a fresh token
          const token = await ky("https://example.com/token").text();

          // Retry with the token
          request.headers.set("Authorization", `token ${token}`);

          return ky(request);
        }
      },
    ],
  },
});
```

### 3. 인스턴스 확장 가능

ky.create()과는 다르게 ky.extend()는 부모로 부터 상속 받아 재설정 합니다.

```jsx
import ky from "ky";

const url = "https://sindresorhus.com";

const original = ky.create({
  headers: {
    rainbow: "rainbow",
    unicorn: "unicorn",
  },
  hooks: {
    beforeRequest: [() => console.log("before 1")],
    afterResponse: [() => console.log("after 1")],
  },
});

const extended = original.extend({
  headers: {
    rainbow: undefined,
  },
  hooks: {
    beforeRequest: undefined,
    afterResponse: [() => console.log("after 2")],
  },
});

const response = await extended(url).json();
//=> after 1
//=> after 2

console.log("rainbow" in response);
//=> false

console.log("unicorn" in response);
//=> true
```

### 4. FormData와 같은 데이터 전송 간소화

`ky`는 `FormData`와 같은 데이터를 보다 쉽게 전송할 수 있게 도와줍니다. `fetch`에서 `FormData`를 직접 전송하려면 수동으로 `body`를 설정해야 하지만, `ky`에서는 이 작업을 훨씬 간단하게 처리할 수 있습니다.
파일 업로드나 폼 데이터 전송을 다룰 때 Content-Type을 자동으로 처리해 줍니다.

```jsx
import ky from "ky";

// `multipart/form-data`
const formData = new FormData();
formData.append("food", "fries");
formData.append("drink", "icetea");

const response = await ky.post("https://api.example.com/upload", { body: formData });
```

### 5. Retry 기능

`fetch`는 재시도 기능을 제공하지 않지만, `ky`는 **실패한 요청에 대해 자동으로 재시도**할 수 있는 기능을 제공하며, 이 기능은 여러 번의 시도를 설정할 수 있도록 합니다.

```jsx
import ky from "ky";

const json = await ky("https://example.com", {
  retry: {
    limit: 10, // 최대 3번 재시도
    methods: ["get"], // GET 요청에서 재시도
    statusCodes: [413], // 특정 상태 코드(예: 서버 오류)에서만 재시도
    backoffLimit: 3000, // 재시도 간격
  },
}).json();
```
