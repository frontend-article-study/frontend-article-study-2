# DNS란?
DNS(Domain Name System)는 인터넷의 전화번호부 역할을 하는 시스템으로, **사용자가 기억하기 쉬운 도메인 이름을 컴퓨터가 이해할 수 있는 IP 주소로 변환**해주는 서비스

## DNS 조회 과정
![](https://velog.velcdn.com/images/kingminjoo/post/e82290b5-3c2c-4d06-85c2-194274342cf2/image.png)
1. **도메인 이름 입력**: 사용자가 웹 브라우저의 주소창에 도메인 이름(www.example.com)을 입력한다.
2. **로컬 캐시 확인**: 브라우저는 먼저 로컬 캐시에 해당 도메인 이름의 IP 주소가 저장되어 있는지 확인 후, 캐시에 해당 도메인 이름의 IP 주소가 존재하면 이를 사용하여 웹사이트에 바로 접속한다.
3. **호스트 파일 확인**: 로컬 캐시에 도메인 이름이 없으면, 운영 체제의 호스트 파일을 확인한다. 
> ❓ **호스트 파일** <br/>
수동으로 설정된 도메인 이름과 IP 주소의 매핑을 저장하는 파일

4. **재귀적 조회 시작**: 호스트 파일에도 도메인 이름이 없으면, 브라우저는 설정된 재귀 DNS 서버(일반적으로 ISP 제공)에 도메인 이름의 IP 주소를 요청한다. 
이 재귀 DNS 서버는 도메인 이름을 IP 주소로 변환하는 과정을 시작한다.
5. **루트 네임서버 조회**: 재귀 DNS 서버는 먼저 루트 네임서버에 도메인 이름의 최상위 도메인(TLD, 예: .com)에 대한 정보를 요청한다.
그리고 루트 네임서버는 해당 TLD를 관리하는 TLD 네임서버의 주소를 반환한다.
> ❓**루트 네임서버** <br/>
DNS 계층 구조의 최상위에 위치하며, 전 세계에 13개의 루트 네임서버가 있다. <br/>
최상위 도메인(TLD)에 대한 정보를 가지고 있다.

6. **TLD 네임서버 조회**: 재귀 DNS 서버는 반환된 TLD 네임서버에 요청을 보내고, 특정 도메인(예: example.com)에 대한 권한이 있는 네임서버의 주소를 받는다.
>❓**TLD 네임서버** <br/>
각 TLD(.com, .org, .net 등)에 대한 정보를 관리하는 서버
7. **권한 네임서버 조회**: 재귀 DNS 서버는 최종적으로 권한 네임서버에 도메인 이름의 IP 주소를 요청하고, 권한 네임서버는 해당 도메인 이름에 대한 IP 주소를 반환한다.
8. **IP 주소 반환**: 재귀 DNS 서버는 권한 네임서버로부터 받은 IP 주소를 브라우저에 반환한다. 
이 IP 주소는 로컬 캐시에 저장되며, 브라우저는 이를 사용하여 웹사이트에 접속한다.
9. **웹사이트 접속**: 브라우저는 반환된 IP 주소를 사용하여 웹 서버와 연결을 설정하고, 사용자가 입력한 도메인 이름에 해당하는 웹사이트를 로드한다.


## DNS 조회를 위한 도구
-  **nslookup**: 사용하기 쉬운 도구로, 기본적인 DNS 조회에 적합
![](https://velog.velcdn.com/images/kingminjoo/post/317ecb95-b3fa-489b-9f88-9c65d79997a0/image.png)
- **dig**: 강력하고 유연한 DNS 조회 도구로, 복잡한 쿼리와 다양한 옵션을 지원
![](https://velog.velcdn.com/images/kingminjoo/post/11aadc7b-e1e4-4479-ab0d-f549191d939b/image.png)

### ❗ 내가 사용하고 있는 ISP의 DNS 성능과 공용 DNS 서버 성능 비교해 보기 
~~(그냥 궁금해서 해봄)~~ 

먼저 공용 DNS 서버로는 Google Public DNS(8.8.8.8, 8.8.4.4), Cloudflare DNS(1.1.1.1, 1.0.0.1), OpenDNS(208.67.222.222, 208.67.220.220)가 있다.
그리고 그 중, Google Public DNS(8.8.8.8)를 사용해 보았다.
![](https://velog.velcdn.com/images/kingminjoo/post/c228601f-2a28-47f1-a8f8-4069b895fded/image.png)
그 결과, 
1. **Google Public DNS의 응답 시간은 42ms이고 ISP의 DNS 서버 응답 시간은 5ms로 
예상대로 ISP의 DNS 서버 응답 시간이 더 짧았다.** <br/>
왜 그런지 궁금했는데 로컬 ISP의 DNS 서버가 지리적으로 더 가깝고 최적화되어 있기 때문일 수 있다는 답변을 찾았다.
2. 두 결과 모두 www.naver.com이 www.naver.com.nheos.com으로 **CNAME 레코드로 변환되었음을 보여주지만, 이후 CNAME 체인이 다르다.** <br/>
그 이유는 ISP DNS 서버는 지역 내의 최적화된 IP 주소를 직접 반환하여 빠른 응답 시간을 제공하고, 캐시 서버를 운영할 수 있어 CNAME 체인 없이 직접적인 IP 주소를 반환한다.
반면, Google public DNS는 여러 단계의 CNAME 레코드를 통해 www.naver.com 사용자를 최적의 엣지 서버로 라우팅한다. 이는 글로벌 트래픽 분산과 성능 최적화를 구현하는 Akamai CDN을 사용하기 때문이다. ~~(라고 이해함.......)~~
3. **TTL (Time to Live) 값**을 보면, Google Public DNS 결과의 TTL은 비교적 짧아서 5초인 반면, ISP의 DNS 서버 결과의 TTL은 51초로 더 길다. 
> ❓**TTL(Time to Live)** <br/>
TTL은 DNS 레코드가 캐시에 유지되는 시간을 초 단위로 나타내는 값을 뜻한다. <br/>
캐시된 데이터가 얼마나 오래 유효한지를 나타내며, 짧은 TTL은 더 자주 DNS 조회를 하게 만든다.

#### 요약
- 응답 시간: ISP의 DNS 서버가 Google public DNS 서버보다 더 빠른 응답 시간을 보였다.
- 캐시 TTL: ISP의 DNS 서버는 더 긴 TTL 값을 사용한다.
- CNAME 체인: Google Public DNS는 더 많은 CNAME 체인을 거쳐 최종 IP 주소를 반환한다.
- 최종 IP 주소: Google public DNS는 akamai CDN의 IP 주소를 반환했으며, ISP의 DNS 서버는 네이버의 직접적인 IP 주소를 반환했다.

>**참고 자료**
- 조한열 "커맨드라인 도구로 이해하는 네트워크(HTTP, TCP/IP)"
- 미즈구치 카츠야 <모두의 네트워크: 10일 만에 배우는 네트워크(Network) 기초>
- DNS란 무엇입니까? | DNS 작동 원리 
https://www.cloudflare.com/ko-kr/learning/dns/what-is-dns/
- DNS 서버 유형
https://www.cloudflare.com/ko-kr/learning/dns/dns-server-types/
- CDN(콘텐츠 전송 네트워크)이란 무엇일까요?
https://www.akamai.com/ko/glossary/what-is-a-cdn