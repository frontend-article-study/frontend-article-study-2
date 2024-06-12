# WebRTC

## webRTC란?

**WebRTC(Web Real-Time Communication)**

- 웹 애플리케이션과 사이트가 중간자 없이 브라우저 간에 오디오나 영상 미디어를 포착하고 마음대로 스트림 할 뿐 아니라, 임의의 데이터도 교환할 수 있도록 하는 기술입니다.
- **드라이버나 플러그인 설치 없이 웹 브라우저 간 P2P 연결을 통해 데이터 교환을 가능하게 하는 기술**
- WebRTC는 기존의 웹 2.0에서 한층 더 나아가, 서버와 같은 중간자를 거치지 않고 브라우저 간을 P2P로 연결하는 기술입니다.
- 사실 우리에게 낯설지 않은 기술들인 화상 통화와 실시간 스트리밍, 파일 공유, 스크린 공유 등이 WebRTC를 기반으로 하고 있습니다. P2P 연결은 중개 서버를 거치지 않기 때문에 빠른 속도가 보장되며, HTTPS가 강제되기 때문에 중간자 공격에 대한 보안이 보장됩니다.

**UDP**

메시지 전달 보장 없음 : 승인, 재전송 또는 시간 초과가 없습니다.

배송 순서에 대한 보장 없음 : 패킷 시퀀스 번호, 재순서화, 헤드오브라인 차단이 없습니다.

연결 상태 추적 없음 : 연결 설정 또는 해체 상태 머신이 없습니다.

혼잡 제어 없음 : 내장된 클라이언트 또는 네트워크 피드백 메커니즘이 없습니다.

**UDP 패킷이 극복해야하는 것.**

- 여러 계층의 NAT와 방화벽을 통과 - tcp는 주소변환 테이블을 가지고 있어서 NAT 통과가능.
- 각 스트림의 매개변수를 협상하고
- 사용자 데이터의 암호화를 제공하고
- 혼잡 및 흐름 제어를 구현하는 등의 메커니즘도 필요

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled.png)

ICE: 대화형 연결 설정(RFC 5245)

STUN: NAT용 세션 트래버스 유틸리티(RFC 5389)

TURN: NAT 주변 릴레이를 사용한 트래버스(RFC 5766)

SDP: 세션 설명 프로토콜(RFC 4566)

DTLS: 데이터그램 전송 계층 보안(RFC 6347)

SCTP: 스트림 제어 전송 프로토콜(RFC 4960)

SRTP: 보안 실시간 전송 프로토콜(RFC 3711)

1. UDP Peer to Peer 연결 설정을 하려면 ICE, STUN, TURN이 필요
2. DTLS : Peer간의 모든 데이터 전송을 보호
3. SCTP, SRTP로 스트림을 멀티플렉싱, 혼잡 및 흐름 제어를 제공.

**UDP를 통해 피어 투 피어 연결을 설정하고 유지하려면 ICE, STUN, TURN이 필요합니다. DTLS는 피어 간의 모든 데이터 전송을 보호하는 데 사용되며 암호화는 WebRTC의 필수 기능입니다. 마지막으로 SCTP와 SRTP는 다양한 스트림을 멀티플렉싱하고, 혼잡 및 흐름 제어를 제공하며, 부분적으로 안정적인 전송 및 기타 추가 서비스를 제공하는 데 사용되는 애플리케이션 프로토콜로, UDP를 기반으로 합니다.**

## P2P 통신

### 통신 절차

1. 각 브라우저가 P2P 커뮤니케이션에 동의
2. 서로의 주소를 공유
3. 보안 사항 및 방화벽 우회
4. 멀티미디어 데이터를 실시간으로 교환

### 방화벽과 NAT 트래버셜

[**NAT 트래버셜(NAT traversal)](https://en.wikipedia.org/wiki/NAT_traversal)이 무엇인가?**

- **방화벽이 있다면 있는 대로 없다면 없는 대로  라우터의 공인 IP주소와 포트를 찾아내는 것을 말한다.**

NAT(network address translation)

- 네트워크 주소 변환 사용이유
    - [사설 네트워크](https://ko.wikipedia.org/wiki/%EC%82%AC%EC%84%A4_%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC)에 속한 여러 개의 호스트가 하나의 공인 IP 주소를 사용하여 [인터넷](https://ko.wikipedia.org/wiki/%EC%9D%B8%ED%84%B0%EB%84%B7) 에 접속하기 위함이다.
    
    ![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%201.png)
    

DHCP (**Dynamic Host Configuration Protocol)**

- 동적 호스트 구성 프로토콜

일반적인 컴퓨터에는 공인 IP가 할당되어 있지 않다. 그 이유로는

1. 방화벽
2. [NAT](https://ko.wikipedia.org/wiki/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC_%EC%A3%BC%EC%86%8C_%EB%B3%80%ED%99%98) : 여러 대의 컴퓨터가 하나의 공인 IP를 공유
3. [DHCP](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol) :  IP 주소 및 기타 통신 매개변수를 네트워크에 연결된 장치에 자동으로 할당한다. 대부분의 가정용 네트워크에서는 라우터가 IP 주소를 장치에 할당하는 DHCP 서버의 역할을 합니다.
- 이러한 이유들 때문에 단순히 공인 IP만을 알아낸다고 해서, 특정한 사용자를 가리킬 수는 없다.
- 공인 IP뿐만 아니라 해당 네트워크에 연결된 사설 IP 주소까지 알아내야 특정한 사용자를 지정할 수 있게 된다.

### STUN, TURN

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%202.png)

**STUN(Session Traversal Utilities for NAT) - 상대편 주소찾기**

- 역할 : STUN 서버는 NAT 뒤에 있는 피어(Peer)들이 서로 연결할 수 있도록 공인 IP와 포트를 찾아줍니다.
- 설명 : **단말이 자신의 공인 IP 주소와 포트를 확인하는 과정에 대한 프로토콜**

**TURN(Traversal Using Relay NAT) - STUN의 대안, 최후의 방법.**

- 역할 : STUN 서버를 통해 자기 자신의 주소를 찾아내지 못했을 경우, **TURN(Traversal Using Relay NAT)**
 서버를 대안으로 이용하게 됩니다.
- 설명 : TURN 방식은 네트워크 미디어를 중개하는 서버를 이용하는 방식이다. 서버를 하나 거치기 때문에 P2P통신이 아니게 되며 그로인해 지연이 발생한다. 하지만 보안 정책이 엄격한 개인 NAT 내부에 위치한 브라우저와 P2P 통신을 할 수 있는 유일한 방법이다.

### ICE, Candidate

**Candidate 란?**

- STUN, TURN 서버를 이용해서 획득했던 IP 주소와 프로토콜, 포트의 조합으로 구성된 연결 가능한 네트워크 주소
들을 후보(Candidate)라고 부른다.

Candidate를 수집하면 일반적으로 3개의 주소를 얻게 된다.

- 자신의 사설 IP와 포트 넘버
- 자신의 공인 IP와 포트 넘버 (STUN, TURN 서버로부터 획득 가능)
- TURN 서버의 IP와 포트 넘버 (TURN 서버로부터 획득 가능)

**ICE(Interactive Connectivity Establishment)**

- ICE는 **두 개의 단말이 P2P 연결을 가능하게 하도록 최적의 경로를 찾아주는 프레임워크이다.**

### SDP**(Session Description Protocol)**

- WebRTC에서 **스트리밍 미디어의 해상도나 형식, 코덱 등의 멀티미디어 컨텐츠의 초기 인수를 설명하기 위해 채택한 프로토콜**
- **(Offer/Answer) 모델.**
    - peer1이 어떤 미디어 스트림을 peer2에게 제안하고 peer2의 응답이 오기까지 기다리는 모델.
- 비슷한 예 : moth에서 mime을 JSON으로 교환하는 것과 비슷하다.
- Answer를 받은 후 각자의 피어가 수집한 ICE 후보(candidate) 중에서 최적의 경로를 결정하고 협상하는 프로세스가 발생합니다.
- 수집한 ICE 후보들로 패킷을 보내 가장 지연 시간이 적고 안정적인 경로를 찾는다.
- 이렇게 최적의 ICE 후보가 선택되면, 기본적으로 필요한 모든 메타 데이터와 IP 주소 및 포트, 미디어 정보가 피어 간 합의가 완료된다.

## 시그널링, 세션 협상

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%203.png)

- webRTC는 시그널링을 일부러 제공하지 않는다. 그 이유는 다른 시그널링 프로토콜과 상호 운영이 가능하기 때문이다.

세션 개시 프로토콜(SIP)

- 애플리케이션 수준 시그널링 프로토콜로, IP 네트워크를 통한 VoIP(Voice over IP) 및 화상 회의에 널리 사용됩니다.

Jingle

- IP 네트워크를 통한 음성 및 화상회의의 세션 제어에 사용되는 XMPP 프로토콜용 확장자를 시그널링합니다.

ISDN 사용자 파트(ISUP)

- 시그널링 프로토콜은 전 세계의 많은 공중 교환 전화 네트워크에서 전화 통화 설정에 사용됩니다.

- 결론은 시그널링 채널을 직접 제작해야하는 것이다.

- 코드설명
    
    ### SDP(Session Description Protocol)
    
    - 시그널 채널을 구현했다는 가정하에 첫번째 단계를 수행할 수 있습니다.
    
    ```jsx
    var signalingChannel = new SignalingChannel(); // 시그널링채널 초기화
    var pc = new RTCPeerConnection({}); //PeerConnection 초기화
    
    navigator.getUserMedia({ "audio": true }, gotStream, logError);// 오디오 스트림 요청
    
    function gotStream(stream) {
      pc.addStream(stream); //오디오 스트림을 RTCPeerConnection 객체에 등록
    
      pc.createOffer(function(offer) { //피어 연결에 대한 SDP(오퍼) description 작성
        pc.setLocalDescription(offer); // 생성된 SDP를 피어 연결에 대한 로컬 description으로 적용하기
        signalingChannel.send(offer.sdp); //시그널링 채널을 통해 원격 피어에게 생성된 SDP 오퍼 보내기
      });
    }
    
    function logError() { ... }
    ```
    
    - SDP는 미디어 자체를 전달하지 않고 대신 교환할 미디어 유형(오디오, 비디오 및 애플리케이션 데이터), 네트워크 전송, 사용된 코덱 및 설정, 대역폭 정보 및 기타 메타데이터 등 연결의 속성 목록을 나타내는 '세션 프로필'을 설명하는 데 사용됩니다.
    - addStream을 통해 오디오 스트림을 등록하고 createOffer를 통해 세션의 description을 생성합니다.
    
    **session description**
    
    ```jsx
    (... snip ...)
    m=audio 1 RTP/SAVPF 111 //RTP/SAVPF 프로토콜
    a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
    a=candidate:1862263974 1 udp 2113937151 192.168.1.73 60834 typ host //Candidate IP, port, and protocol for the media stream
    a=mid:audio
    a=rtpmap:111 opus/48000/2 //opus codec
    a=fmtp:111 minptime=10
    (... snip ...)
    ```
    
    - m= 은 미디어 라인을 의미.
    - a= 는 미디어의 방향
    
    ![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%204.png)
    
    - p2p 연결을 하려면 오디오 비디오마다 sdp교환을 해야한다.
    - offer = localDescription
    - Answer = remoteDescription
    - SDP 교환은 완료되었다.
    
    ### **Interactive Connectivity Establishment (ICE)**
    
    ICE 수집 : 후보(IP, 포트 튜블)를 여러개 수집하여 빠르고 연결가능한 IP를 연결
    
    ```jsx
    var ice = {"iceServers": [
      {"url": "stun:stun.l.google.com:19302"}, 1
      {"url": "turn:turnserver.com", "username": "user", "credential": "pass"} 2
    ]};
    
    var signalingChannel = new SignalingChannel();
    var pc = new RTCPeerConnection(ice);
    
    navigator.getUserMedia({ "audio": true }, gotStream, logError);
    
    function gotStream(stream) {
      pc.addStream(stream);
    
      pc.createOffer(function(offer) {
        pc.setLocalDescription(offer); 3
      });
    }
    
    pc.onicecandidate = function(evt) {
      if (evt.target.iceGatheringState == "complete") {//ice 수립 완료
          local.createOffer(function(offer) {
            console.log("Offer with ICE candidates: " + offer.sdp);
            signalingChannel.send(offer.sdp); //SDP offer 재생성
          });
      }
    }
    
    ...
    
    // Offer with ICE candidates:
    // a=candidate:1862263974 1 udp 2113937151 192.168.1.73 60834 typ host ... 6
    // a=candidate:2565840242 1 udp 1845501695 50.76.44.100 60834 typ srflx ... 7
    ```
    
    ### **Incremental Provisioning (Trickle ICE)**
    
    - 피어 간의 점진적인 수집 및 연결 확인을 허용하는 ICE 프로토콜의 확장
    - 간단히 말해, ICE 수집 프로세스가 완료될 때까지 기다리는 대신 시그널링 채널을 통해 상대방 피어에게 점진적인 업데이트를 전달하여 프로세스를 가속화하는 데 도움이 됩니다.
    
    ```jsx
    var ice = {"iceServers": [
      {"url": "stun:stun.l.google.com:19302"},
      {"url": "turn:turnserver.com", "username": "user", "credential": "pass"}
    ]};
    
    var pc = new RTCPeerConnection(ice);
    navigator.getUserMedia({ "audio": true }, gotStream, logError);
    
    function gotStream(stream) {
      pc.addStream(stream);
    
      pc.createOffer(function(offer) {
        pc.setLocalDescription(offer);
        signalingChannel.send(offer.sdp); 1
      });
    }
    
    pc.onicecandidate = function(evt) {
      if (evt.candidate) {
        signalingChannel.send(evt.candidate); 2
      }
    }
    
    signalingChannel.onmessage = function(msg) {
      if (msg.candidate) {
        pc.addIceCandidate(msg.candidate); 3
      }
    }
    ```
    

## 전체 시나리오

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%205.png)

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%206.png)

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%207.png)

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%208.png)

### 부가적인

- adapter.js - 브라우저 호환성

## 스트리밍 프로토콜 비교

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%209.png)

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%2010.png)

## WebRTC 이전 http 스트리밍 통신 프로토콜

### HLS(HTTP Live Streaming)

- 애플이 개발하여 2009년 출시한 HTTP 기반 적응 비트레이트 스트리밍 통신 프로토콜로 현재 가장 대중적으로 사용되며 비디오 파일을, 다운로드할 수 있는 HTTP 파일 조각으로 나누고 HTTP 프로토콜을 이용하여 전송하는 방식입니다.
- HLS가 긴 Latency 가질 수밖에 없는 이유를 다음과 같이 정리할 수 있다.

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%2011.png)

- . 영상(Playlist)은 3개의 segment로 구성됩니다.
- . 각 segment 당 기본적으로 10초의 듀레이션을 가지고 있지만, 우리는 최적화 작업을 통해 4초의 듀레이션을 보유하도록 했습니다.
- . 사용자는 Playlist를 호출하고 3개의 segment를 순서대로 수신받아(SEQUENCE), 첫 번째 segment부터 재생합니다.
- . segment당 4초의 듀레이션을 가지고 있기 때문에, 결론적으로 12초의 Latency와 추가 app buffering이 발생하여 약 15초의 Latency가 발생하게 됩니다.

## WebRTC

- WebRTC(WEB Real-Time Communication)는 웹 브라우저와 모바일 앱 간에 간단한 API(응용 프로그래밍 인터페이스)를 통해 실시간 통신(RTC)을 제공하는 무료 오픈소스 프로젝트입니다.
- 샤피라이브 서비스의 WebRTC의 구조는 다음과 같습니다.
- . WebRTC는 Edge와 사용자 간 Socket을 연결하여 영상 프레임을 직접 수신받습니다.
- . HLS처럼 Segment를 조합하는 과정이 없기 때문에 Latency는 약 1초 대 수준으로, 이름처럼 실시간에 가까운 통신이 가능해집니다.

![Untitled](WebRTC%209baf920fbae84c10817618e89f33aa72/Untitled%2012.png)

WebRTC 구현은 Opus(Audio) 및 VP89(Video) 코덱을 사용합니다:

Opus 코덱은 오디오에 사용되며 고정 및 가변 비트 전송률 인코딩을 지원하며 6~510Kbit/s의 대역폭을 필요로 합니다. 좋은 소식은 코덱이 원활하게 전환되고 가변 대역폭에 적응할 수 있다는 것입니다.동영상 인코딩에 사용되는 VP8 코덱은 100~2,000Kbit/s 이상의 대역폭이 필요하며, 비트레이트는 스트림 품질에 따라 달라집니다:
    ◦ 720p, 30 FPS: 1.0~2.0Mbps
    ◦ 30 FPS에서 360p: 0.5~1.0Mbps
    ◦ 30 FPS에서 180p: 0.1~0.5Mbps