## CORS를 알아보기 전에!

### Origin

Origin 이란 URI 스키마(프로토콜), 호스트 이름(도메인), 포트 번호의 조합

>Origin = Protocol + host (hostname + port)

예시)
- Protocol : https:
- hostname : site.com
- port: 8080

-> https://site.com:8080

### SOP

**Same-origin-policy**

SOP에 의해 웹 브라우저는 하나의 웹 페이지에서 다른 웹 페이지의 데이터에 접근하기 위한 스크립트가 있을 때, 두 웹 페이지가 같은 origin일 때만 이를 허가합니다.

### CORS

**Cross-origin resource sharing**

- 도메인에서 다른 도메인의 웹 페이지 속 제한된 리소스에 요청할 수 있도록 하는 메커니즘
- **SOP를 완화**하는 테크닉 중 하나!
- HTTP를 상속받아 새로운 origin 요청 헤더와 새로운 Access-Control-Allow-Origin 응답 헤더를 추가
- Access-Control-Allow-Origin 헤더는 서버가 요청을 허락할 origin에 대한 리스트 명시

![](https://velog.velcdn.com/images/hyeonzii/post/f0447655-2f56-4dfa-be29-754a7306f774/image.png)

_(사진출처:https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)_

위 플로우 차트를 보면 서버 응답에서 Access-Control을 확인합니다!
클라이언트 요청이 Bad Request가 아니어도, 서버가 허락한 origin에 클라이언트 origin이 없다면 에러가 발생하는 것이다!

> **Access-Control-Allow-Origin** 과 관련한 에러 발생 시!
> 서버 쪽에 클라이언트에 origin 을 허락하도록 처리해주면 된다.
> 서버 코드가 Spring Boot로 작성되었다면 해당 Controller에 
> @CrossOrigin(origins="허용하고자 하는 origin")
> 추가하기!

![](https://velog.velcdn.com/images/hyeonzii/post/266c0e29-e4d8-4bed-8512-ee4b361d0f1e/image.png)

개발자 모드를 켜서 확인해보면 이런 오류가 난다!!

그래서 내 경우에도
백엔드 개발자 분이

**application.yml**
```
client:
  origins:
#    dev: ${CLIENT_ORIGIN_DEV}
#    prod: ${CLIENT_ORIGIN_PROD}
```

origins에 dev와 prod 둘 다 배포용 주소로 넣어주셨다고 하셨다.
따라서 로컬로 돌리려고 하니까 내 origin은 허용하지 않아서 오류가 난 것 이었다!
그래서 배포용은 prod이므로 dev는 내 로컬로 변경시켜주면 된다!

## 다른 해결 방법들!

### Client

#### 프록시 서버 사용하기

> 프록시 서버?
> 인터넷에서 유저를 대신해 데이터를 가져오는 서버,
> 클라이언트가 자신을 통해서 다른 네트워크 서비스에 간접적으로 접속할 수 있게 해줌

**package.json에 proxy 값을 설정**

CRA로 생서한 프로젝트에서는, package.json에 proxy 값을 설정하여 proxy 기능을 활성화 하는 방법이 있다.

```js
{
    //...
    "proxy": "http://localhost:4000"
}
```

저 주소에는 제가 접근하고자 하는 주소를 넣어주어야 합니다!

#### 라이브러리 사용하기

http-proxy-middleware 라이브러리를 사용하면 로컬 환경에 한해 CORS 에러를 해결할 수 있다.

**setupProxy.js**
```js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
    })
  );
};
```

#### 🚨 주의할 점

클라이언트 단에서 proxy를 설정하는 경우!!!!!!

**서버에서 이미 Origin을 설정한 경우라면 소용없다...**

_제 경험담...^^_

CORS 정책은 보안을 위해 브라우저에서 직접 적용되는 정책이기 때문에, 서버에서 특정 origin에서의 요청을 허용하도록 설정해두었다면 그 설정에 따라 브라우저가 동작하게 됩니다!

따라서 이 경우에는 서버 측 설정을 수정하여 문제를 해결해야 합니다.... 요점 명심하시길! ㅠ^ㅠ

## 걍 추가로...

**프록시 서버 종류!**

- 포워드 프록시
![](https://velog.velcdn.com/images/hyeonzii/post/561ac0ad-33a0-4e9f-a729-aa5b33eacfde/image.png)

포워드 프록시 서버가 앞단에서 먼저 요청을 받은 후, 인터넷에 연결하여 그 결과를 클라이언트에게 전달(forward) 해준다.

- 리버스 프록시
![](https://velog.velcdn.com/images/hyeonzii/post/260d2208-c126-403e-98eb-833efef84cc1/image.png)

클라이언트가 example.com 웹 서비스에 데이터를 요청하면 Reverse Proxy는 이 요청을 받아서 내부 서버에서 먼저 데이터를 받은 후에, 이 데이터를 클라이언트에게 전달.

#### 참고블로그

[[웹 개발]Origin(출처)란 무엇인가?](https://etloveguitar.tistory.com/83)
[Origin, SOP 그리고 CORS](https://live-everyday.tistory.com/239)
[[CORS] CORS란? CORS 에러 해결하기](https://velog.io/@gygy/ExpressNode.js-CORS-%EC%9D%B4%EC%8A%88-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0)
[CORS 에러를 해결하는 방법, proxy 기능](https://velog.io/@growingdeveloper/CORS-%EC%97%90%EB%9F%AC%EB%A5%BC-%ED%95%B4%EA%B2%B0%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95proxy-%EA%B8%B0%EB%8A%A5)
[[React + Node.js + Mongo DB Atlas] Netlify(프론트엔드 배포) + Elastic Beanstalk(백엔드 배포) 배포하고 연결하기](https://make-somthing.tistory.com/80)




