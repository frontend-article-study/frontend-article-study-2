# OAuth 2.0

## OAuth 등장 배경
사용자로부터 구글, 카카오, 네이버 등의 ID, Password 를 직접 제공받아 우리의 서비스에 저장하고 활용하면 어떨까?
<br/>
그러나, 이런 방법이 안전할까? 우리의 서비스를 저러한 빅테크 기업들이 어떻게 신뢰할까?

이런 문제를 해결하기 위해 OAuth 가 등장하기 이전에는 구글은 AuthSub, 야후는 BBAuth 등 각자 회사가 개발한 방법을 사용하였다.
하지만 이 방식은 표준화 되어있지 않기 때문에 구글과 연동하는 서비스를 만들기 위해서는 각각 맞춰 개별적으로 개발하고 유지보수 해야한다.
이를 위해 등장한 것이 바로 OAuth 이다. 최초 1.0 버전은 2006년 트위터와 Ma.gnolia 가 주도적으로 개발하였다.
이후 1.0버전이 개선된 1.0a 버전이 출시되었으나 모바일 어플리케이션 등에서 안전하게 사용될 수 없는 사례가 존재했다.
이런 사례를 보완하고 기존 버전보다 조금 더 단순화한 OAuth 2.0 버전이 2012년에 등장하게 되었다.

## OAuth 란?
구글, 카카오, 네이버와 같은 다양한 플랫폼의 특정한 사용자 데이터에 접근하기 위해 제3자 클라이언트(우리의 서비스)가 
사용자의 접근 권한을 위임 받을 수 있는 표준 프로토콜.

쉽게 말하자면, 우리의 서비스가 우리 서비스를 이용하는 유저의 타사 플랫폼 정보에 접근하기 위해서 권한을 타사 플랫폼으로부터 위임 받는 것. 

## OAuth 2.0 Overview
![](https://velog.velcdn.com/images/kyuuu_ul/post/d12d984c-f5a0-4ec7-a7e4-ebac2036490e/image.png)
- Resource Owner:
해당 플랫폼에서 리소스를 소유하고 있는 사용자( 이용 유저 )
- Authorization Server:
외부 플랫폼 리소스에 접근할 수 있는지 인증을 하는 서버
- Resource Server:
구글, 카카오, 네이버와 같이 보호되는 리소스를 가지는 서버
- Client:
우리가 개발하려는 서비스

### 1. 로그인 요청
- Resource Owner가 클라이언트 서비스의 "구글로 로그인하기" 등의 버튼을 클릭
- 클라이언트는 Authorization Server가 제공하는 Authorization URL로 사용자 리디렉션
- URL에 response_type, client_id, redirect_uri, scope 등의 매개변수를 쿼리 스트링으로 포함
  
### 2. 로그인 페이지 제공, ID/PW 제공
- Resource Owner는 제공된 로그인 페이지에서 ID/PW를 입력하여 인증

###  3. Authorization Code 발급, Redirect URI로 리디렉트
- 인증 성공 시, Authorization Server는 지정된 Redirect URI로 사용자 리디렉션
- Redirect URI에 Authorization Code 포함 (일반적으로 쿼리 스트링으로)
- Authorization Code의 수명은 매우 짧음 (보통 1~10분)

###  4. Authorization Code와 Access Token 
- 교환클라이언트는 Authorization Server의 token 엔드포인트에 Authorization Code를 전달
- Authorization Server는 Access Token을 응답
- 이 과정은 반드시 HTTPS를 통해 안전하게 이루어져야 함
- 클라이언트는 발급받은 Access Token을 안전하게 저장

### 5. 로그인 성공
- 클라이언트는 Resource Owner에게 로그인 성공을 알림

###  6. Access Token으로 리소스 접근
- Resource Owner가 보호된 리소스에 접근이 필요한 기능 요청 시
- 클라이언트는 저장해둔 Access Token을 사용하여 Resource Server의 제한된 리소스에 접근 
- 클라이언트는 획득한 리소스를 사용하여 Resource Owner에게 서비스 제공

## OAuth 2.0 Scope
scope란 Client가 사용 가능한 Resource 접근 범위를 제한하는 것.

예를 들어 구글 플렛폼을 Resource Server로 사용할 때, 사용자의 연락처를 받아오고 싶다면,
scope에 연락처 scope 문자열을 포함하여 서버에 요청하면 됩니다.
이러한 방식으로 발급된 Access Token은 Scope 정보를 가지고 있어 권한을 제한합니다.

## Authorization Code
Redirect URI를 통해 Authorization Code를 발급하는 과정이 생략된다면, Authorization Server가 Access Token을 Client에 전달하기 위해 Redirect URI를 통해야 한다. 이때, Redirect URI를 통해 데이터를 전달할 방법은 URL 자체에 데이터를 실어 전달하는 방법밖에 존재하지 않는다. 브라우저를 통해 데이터가 곧바로 노출되는 것 이다.
하지만, Access Token은 민감한 데이터이다. 이렇게 쉽게 노출되어서는 안된다. 이런 보안 사고를 방지 Authorization Code를 사용하는 것.

Redirect URI를 프론트엔드 주소로 설정하여, Authorization Code를 프론트엔드로 전달한다. 그리고 이 Authorization Code는 프론트엔드에서 백엔드로 전달된다. 코드를 전달받은 백엔드는 비로소 Authorization Server의 token 엔드포인트로 요청하여 Access Token을 발급한다.
이런 과정을 거치면 Access Token이 항상 우리의 어플리케이션과 OAuth 서비스의 백채널을 통해서만 전송되기 때문에 공격자가 Access Token을 가로챌 수 없게된다.
