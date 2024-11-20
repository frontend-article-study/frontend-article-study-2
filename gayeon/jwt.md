# JWT (JSON Web Token)

JSON 형식으로 인코딩된 토큰을 사용해 사용자 인증 및 정보 전달에 사용하는 토큰 기반 인증 방식

<br>

## 인가 (Authorization)

- 어떤 기능을 사용자가 사용할 수 있는 권한이 있는지 확인하는 절차
- 사용자가 로그인하는 것은 인증(Authentication)이고, 로그인한 사용자가 어떤 권한을 가졌는지 확인하는 과정이 인가(Authorization)
- 어떤 서비스에서 게시글을 등록한다던지, 댓글을 남기던지 등의 기능에 접근할 수 있는지 권한에 대해 매번 확인해야 함 ⇒ 로그인 유지
- 로그인 유지 방식
  - 세션 (Session)
  - 토큰

<br>

## Session과 JWT 비교

### Session

- 세션 ID를 클라이언트에 전달하고 이후 클라이언트는 요청마다 세션 ID를 보낸다. 서버는 저장된 세션 정보를 통해 사용자를 확인하는 방식
- 서버가 세션에 대한 정보를 가지고 있기 때문에 Stateful(상태유지)한 방식
- 많은 사용자가 접속하면 메모리가 부족해질 수 있다.
- 여러 대의 서버를 이용할 땐 사용자가 어떤 서버에 접속했는지에 따라 세션 정보를 일관되게 유지해야하므로 서버 간의 세션 동기화가 필요하다.

### JWT

- 사용자가 로그인을 하면 서버가 토큰(JWT)을 생성해 클라이언트에게 전달한다. 클라이언트는 토큰을 저장해 서버에 요청 시마다 토큰을 함께 전송한다.
- 상태를 서버에 저장하지 않고 토큰에 정보가 포함되어 있기 때문에 Stateless(상태비유지) 방식
- Stateful 방식의 단점을 해결
- 그러나 사용자가 로그아웃하거나 토큰을 무효화해야 할 경우 이미 발급된 JWT를 강제로 무효화하기 어렵다는 단점이 있음

<br>

## JWT 동작 원리

1. 사용자가 id, password로 로그인 요청
2. 서버는 사용자 정보를 확인한 후 사용자의 정보와 토큰의 만료 시간 등이 포함된 JWT를 발급
3. 이 토큰을 클라이언트에게 전달
4. 클라이언트는 이 JWT를 쿠키나 로컬스토리지에 저장
5. 클라이언트는 서버에 요청할 때마다 Authorization 헤더에 JWT를 포함하여 요청
6. 서버에서 JWT를 검증 후에 요청을 처리

<br>

## JWT 구조

[JWT.IO](https://jwt.io/)

<br>

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

<br>

```
// header
{
  "alg": "HS256",
  "typ": "JWT"
}

// payload
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}

// signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
	secret

) secret base64 encoded
```

<img src="./assets/jwtImg.jpg" />

- Header (헤더)

  - type: “JWT” ← 고정값
  - alg: 서명 값을 만드는 데 사용되는 알고리즘 (HS256…)

- Payload (정보)

  - iss (issuer): 토큰 발급자
  - aud (audience): 토큰 대상자 (client id)
  - exp (expiration): 토큰 만료 시간
  - iat (issued at): 토큰 발급 시간
  - sub (subject): 토큰 제목
  - 그 외 사용자 데이터

- Verify Signature (서명)
  - 인코딩된 헤더와 페이로드 그리고 비밀키와 함께 사용되는 서명 알고리즘을 통해 생성된 값
