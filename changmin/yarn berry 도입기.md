## npm

자바스크립트 패키지 매니저이다. Node.js에서 사용할 수 있는 모듈들을 패키지화하여
모아둔 저장소 역할과 패키지 설치 및 관리를 위한 CLI(Command line interface)를 제공한다.

> Node.js 프로젝트에서는 많은 패키지를 사용하게 되고 패키지의 버전도 빈번하게 업데이트되므로 프로젝트가 의존하고 있는 패키지를 일괄 관리할 필요가 있다.
> npm은 package.json 파일을 통해서 프로젝트 정보와 패키지의 의존성(dependency)을 관리한다.
> 이미 작성된 package.json이 있다면 팀 내에 배포하여 동일한 개발 환경을 빠르게 구축할 수 있는 장점이 있다.

<br><br><br>

패키지 매니저는 yarn berry 말고 대표적으로 npm, pnpm, Yarn classic이 있다.
기존 개발자들은 npm을 주로 사용했을 텐데 **왜** Yarn classic이나 pnpm등 대안이 생겨났을까 ? 무슨 문제가 있었던 걸까?

1. 보안문제 2. 다운로드 속도 3. 무겁다는 단점 4. 비효율적인 의존성 검색

~~맞닿은 문제상황~~

** 💡 문제의 상황들**

노드 12버전으로 고정된 자사 어드민 프로젝트를 인수받았을 때, 프로젝트 세팅은 node moduels 알집으로 압축 풀고 설정하는 방식이었습니다.

이경우 노드 모듈이 고정되면서 용량 문제가 있었고, 또한 고정된 노드 버전 때문에 사용자들의 요청사항이 제한적으로 반영되는 문제가 있었습니다.

<br><br>

이에 따라 노드 버전 업데이트와 yarn berry 도입이 필요하다고 판단하였고, 이를 팀에 제안하였습니다. 제안이 승인되자 업무를 주도적으로 진행하였습니다.

기존 npm 의 단점중 프로젝트에서 주요 개선하고 싶었던 사항은

**무겁다** 였습니다

> 예를 들자면 압축되지 않은 파일로 구성된 135,000개의 node_module 폴더는 총 1.2GB의 용량을 차지하는 반면 , Yarn 캐시는 2,000개의 바이너리 아카이브로 구성되어 총 139MB의 용량을 차지 한다.

<br><br>

### yarn berry 란?

> Yarn(yet another resource negotiator)은 facebook에서 빌드하고 google, Exponent 및 Tilde에서 지원하는 Javascript 패키지 및 종속성 관리자이다.
> 2016년 npm의 대안으로 처음 만들어졌다.
> Yarn은 Yarn classic과 Yarn Berry가 있는데 Yarn classic은 v1.x 이고 Yarn Berry는 v2 이상이다. yarn 2라고 명명하는 곳도 있다.

<br><br>

** _yarn classic_ 과 yarn berry 중 yarn berry 을 선택한 이유**

1.  **지속적으로 문제되는 의존성 검색 문제**
    npm과 Yarn Classic와 달리 Yarn Berry는 TypeScript로 작성되어 완전히 타입 체크가 되어 있다.
    Plug'n'Play(Zero Install)Yarn Berry는 기존의 로컬 node_module 폴더 대신 패키지를 캐시 폴더에 저장하고, .pnp.cjs파일에 의존성을 찾을 수 있는 정보가 기록된다. .pnp.cjs를 이용하면 디스크 I/O없이 어떤 패키지가 어떤 라이브러리에 의존하는지, 각 라이브러리는 어디에 위치하는지를 바로 알 수 있다.

2.  ** deprecated**

    Yarn Classic 저장소
    에 프로젝트 설명을 보면, 1.x 버전의 유지보수를 중단하고 새로운 기능이나 버그 픽스는
    Yarn Berry
    에서 이루어 진다고 명시되어 있습니다.

 <br>

**도입의 결과**:

노드 버전 업데이트와 yarn berry 도입을 통해 빌드 속도는 30% 개선되었고, 사용자들의 의견 반영 범위도 확대되었습니다. 이를 통해 고정된 환경에서 벗어나 유연한 개발 환경을 구축하고 사용자 요구사항을 더욱 충족시키는 경험을 했습니다.

레퍼런스

https://html-jc.tistory.com/676
https://github.com/yarnpkg/berry/issues/766#issuecomment-580658470
