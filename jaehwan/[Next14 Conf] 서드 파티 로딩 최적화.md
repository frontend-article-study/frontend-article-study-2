## **Next.js의 성능 메트릭(LCP 및 INP)에 대한 서드 파티 리소스의 영향과 최적화 방법**
[블로그 링크](https://velog.io/@jaehwan/NextJS-Conf-%EC%84%9C%EB%93%9C-%ED%8C%8C%ED%8B%B0-%EB%A1%9C%EB%94%A9-%EC%B5%9C%EC%A0%81%ED%99%94)

**요약**

- NextJS에서는 성능 문제를 해결하기 위해 부분 pre-rendering, streaming 과 같은 기능을 개발하였습니다.
- 하지만 아직 해결하지 못한 문제가 서드 파티 리소스입니다. 인기 있는 서드파티 리소스는 용량이 크며 성능 저하로 이어집니다.
- 서드 파티 리소스는 성능 뿐만 아니라 사용하며 많은 고민도 해야합니다.
    
    **고민해야할 것들**
    
    1. Google 태그 매니저 문서를 살펴보면 큰 인라인 스크립트를 포함해야 합니다.
    2. 인라인 스크립트가 크다면 어떻게 구현해야할지 고민하게 됩니다.
    3. 레이아웃 컴포넌트에 스크립트를 포함해야할지?
    4. 특정 페이지에 포함해야 하는지?
    
    ……
    
- 이러한 고민을 없애고자 가장 인기있는 서드 파티 리소스를 Next에서 직접 지원하기로 했습니다.

## 서드 파티 리소스가 성능 매트릭에 미치는 영향

### Next.js 팀의 설명 및 기능 개발 계기

Next.js 팀은 성능을 향상시키기 위해 부분적인 프리 렌더링과 스트리밍 같은 기능을 개발했습니다. 그러나 서드 파티 리소스의 문제는 해결하지 못했습니다. 

Next.js 팀은 성능 메트릭(LCP와 INP)을 통해 이러한 리소스가 성능에 미치는 영향을 검증하고 이를 개선하기 위해 어떻게 할지 고민하게  됩니다.

**성능 메트릭 및 서드 파티 리소스**

- **LCP (Largest Contentful Paint) : 사용자가 페이지에서 가장 큰 컨텐츠 요소가 로드되는 시간**
    
    사용자에게 중요한 지표로, 서드 파티 리소스가 이를 지연시킬 수 있습니다.
    
- **INP (Interaction to Next Paint):사용자 상호작용 후 화면이 업데이트되는 시간을 측정**
    
    상호작용(클릭, 탭, 키보드 입력),
    
    좋은 INP 점수는 200밀리초 이하로, 서드 파티 리소스가 이를 저해할 수 있습니다.
    
- INP 사이트에서 더 많은 서드 파티 리소스를 로드하면 응답성 측면에서 성능이 저하되는 경향이 있습니다.
- **FCP(First Contentful Paint) : 첫 번째 컨텐츠 페인트**
- **TBT(Total Blocking Time) - 총 차단 시간 :**
    
    첫 번째 컨텐츠 페인트(FCP)부터 사이트가 상호작용 가능해질 때까지 메인 스레드가 차단된 시간을 측정합니다.
    

*무조건 서드파티 리소스의 문제라고 볼 수는 없지만 과거의 연구 데이터를 보면 서드 파티 리소스가 성능 저하에 어느 정도 기여한다고 합니다.*

### 서드 파티 리소스의 문제라는 것을 검증(성능 저하)

Next팀은 서드파티 리소스가 없는 오픈 소스 웹사이트에 몇 가지 인기 있는 서드 파티 스크립트를 추가하였습니다.

그 결과, 사이트의 총 차단 시간이 65배 증가하는 것을 발견했습니다. 

![](https://velog.velcdn.com/images/jaehwan/post/d35b430b-0074-4284-b6af-c42f11c72f43/image.png)
출처 : https://www.youtube.com/watch?v=zZPNwx0m07U&t=659s

 https://pagespeed.web.dev/?hl=ko

- pageSpeed Insights를 사용하면 평가 가능합니다.

인기 있는 서드 파티 스크립트를 사용하면 성능 문제를 어떻게 처리해야 하는지, 새로운 기능을 추가하는 방법을 모르는 경우가 많습니다. 이에 대한 몇 가지 사례를 보여드리겠습니다.

### 서드 파티 리소스의 문제 사례

**Stack Overflow**

한 사용자는 Next.js 사이트에 Google 태그 매니저(GTM)를 포함했더니 Lighthouse 점수가 38로 떨어졌다고 합니다.

![](https://velog.velcdn.com/images/jaehwan/post/637f8040-6f5e-4636-8848-b30c796bdda6/image.png)
출처 : https://www.youtube.com/watch?v=zZPNwx0m07U&t=659s

**GitHub**

한 사용자는 "Google 태그 매니저가 Lighthouse 점수를 낮추고 있으며, 이를 개선할 방법을 모르겠다"고 말하고 있습니다.

![](https://velog.velcdn.com/images/jaehwan/post/7107b21d-4785-4fc5-9135-378b948797e1/image.png)

출처 : https://www.youtube.com/watch?v=zZPNwx0m07U&t=659s

### 서드 파티 리소스의 개발자 경험 측면

- 최근에 Next.js 앱에 Google 태그 매니저를 로드하려 했지만 잘 되지 않는 이슈가 있었습니다.
- 이러한 사례들은 서드 파티 스크립트가 사용자 경험과 개발자 경험 모두에 얼마나 큰 영향을 미칠 수 있는지 보여줍니다.
- 서드 파티 스크립트를 효과적으로 관리하는 방법을 배우는 것도 중요합니다
    - 효과적으로 관리하는 방법은 성능 최적화, 로딩 전략 개선, 불필요한 스크립트 제거 등이 있습니다.

**서드 파티 리소스의 문제 검증 결과.**

1. 개발자의 생산성을 저하시킵니다.
2. LCP & INP 측정을 통해 유저 경험 저하도 증명되었습니다.

## Third Party 리소스의 문제를 해결하는 방법은 무엇일까?

1. **서드 파티 소스에서 성능을 개선하는 것.**
    
    일부 서드 파티의 경우는 가능할 수 있습니다.(일부입니다.)
    
    소스에서 성능 개선이 가능하더라도 많은 시간이 걸립니다.
    
2. **프레임워크 유틸리티를 도입하는 것.**
    
    서드 파티 제공자들이 프레임워크 유틸리티를 제공해 주는 것입니다.
    

1번의 경우 가능한 경우도 드물고 가능하더라도 많은 시간이 걸리기 때문에 2번의 경우가 가장 적합할 것입니다. 

그렇다면 왜 서드 파티 제공자들이 프레임워크 유틸리티를 직접 구축하지 않을까요?

 Google 태그 매니저(GTM)와 같은 서드 파티 제공자들은 왜 React, Angular, Next.js 유틸리티를 구축하지 않을까요?

**서드 파티 유틸리티를 구축하지 않는 이유**

사실 이 부분은 현실적이지 않습니다. 프레임워크 생태계는 매우 자주 변화하기 때문에 GTM과 같은 서드 파티 제공자들에게는 일관된 솔루션을 구축하는 것이 쉬운일이죠.

### **NextJS팀의 노력과 결과**

**Next13**

- NextJS팀은 서드 파티 스크립트를 빠르고 효율적으로 로드하기 쉽게 만들고자하였고  <Script>를 만들었습니다.
- 기본적으로 애플리케이션의 일부 또는 전체가 하이드레이션된 후에 로드되도록

```jsx
import Script from "next/script"

export default function Layout({children}) {
	return (
		<>
			<section>{children}</section>
			<Script
				src="https://../script.js"
			/>
		</>
	)
}
```

그러나 개발자들에게 서드 파티 리소스를 언제 로드할지에 대한 세밀한 제어를 제공하기 위해 `strategy` 속성을 추가했습니다. 

이 속성을 사용하여

- 하이드레이션이 발생하기 전에
- 하이드레이션이 발생한 후
- 브라우저 유휴 시간 동안 `lazy` 값을 사용하여 로드하도록 결정할 수 있습니다.

```jsx
<Script
		src="https://../script.js"
		strategy="lazyOnload"
	/>
```

**하지만 문제가 생깁니다.**

 Google 태그 매니저를 사용한다고 예를 들면 상황이 복잡해집니다. 

1. Google 태그 매니저 문서를 살펴보면 큰 인라인 스크립트를 포함해야 합니다.
2. 인라인 스크립트가 크다면 어떻게 구현해야할지 고민하게 됩니다.
3. 구현 방법을 알아낸다면? 가장 좋은 로딩 전략은 무엇인지, 기본 접근 방식을 유지할지 아니면 다른 방식을 시도할지 등의 문제에 직면하게 됩니다
4. 레이아웃 컴포넌트에 스크립트를 포함해야할지?
5. 특정 페이지에 포함해야 하는지?
6. 맞춤 이벤트를 전송하는 방법은 무엇인지?

등등 여러 고민에 빠지게됩니다.

```jsx
import Script from 'next/script';

const MyPage = () => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=YOUR_GTM_ID`}
      strategy="afterInteractive"
    />
    <Script id="gtm-inline-script" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'YOUR_GTM_ID');
      `}
    </Script>
    {/* 페이지 콘텐츠 */}
  </>
);

export default MyPage;

```

- 이러한 문제를 해결하기 위해 스크립트 컴포넌트를 기반으로 별도의 표준 라이브러리를 도입하면 이 과정이 훨씬 더 쉬워질 수 있습니다.

### 문제 해결 1 : Google 서드 파티 지원

만약 Google 태그 매니저 컴포넌트를 import하면 자동으로 가장 성능 좋은 방식으로 로드된다는 것을 알게 된다면 어떨까요?

- 스크립트 컴포넌트를 사용하지만, 언제 로드할지에 대한 연구는 NextJS에서 고민합니다.
- 개발자는 여러 고민을 할 필요가 없게 되었습니다.

```jsx
import { GoogleTagManager } from '@next/third-parties/google'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-XYZ" />
      <body>{children}</body>
    </html>
  )
}
```

### 문제 해결2 : 지원하는 서드 파티의 이벤트 전송 지원

"Google 태그 매니저로 이벤트를 전송하고 싶다"라고 생각할 경우, 이벤트를 전송하기 위한 작은 유틸리티 함수도 있습니다.

```jsx
'use client'
 
import { sendGAEvent } from '@next/third-parties/google'
 
export function EventButton() {
  return (
    <div>
      <button
        onClick={() => sendGAEvent({ event: 'buttonClicked', value: 'xyz' })}
      >
        Send Event
      </button>
    </div>
  )
}
```

### 문제 해결3 : 서드 파티에 대한 개발자의 고민

YouTube 임베드 컴포넌트, Google Maps 임베드 컴포넌트도 존재합니다. 하지만 아직 풀리지 않은 문제가 있습니다. 그럼 성능은?  Google Maps의 경우 필요하지 않을 때에도 자동 로드 됩니다.

NextJS팀은 이러한 성능 문제를 어느정도 해결해주어 개발자의 고민을 덜어줍니다.

Google Maps를 디바이스 뷰포트 아래에서 lazy load하도록 설정해놓았습니다. lazy load일 경우 페이지의 다른 리소스를 차단하지 않게됩니다.

Youtube의 경우에도 Light YouTube Embed를 사용하여 더 빠르게 로드 되도록 하였습니다.

## 후기

개발자들이 제시하는 문제를 NextJS팀에서 유심히 보고 개선하여 개발자 경험을 증가 시키는 것이 놀라웠습니다. 과연 NextJS만큼 개발자 경험을 중요하게 생각하는 팀이 있을 지 궁금할 지경입니다. NextJS를 사용하는 개발자 로서는 굉장히 신뢰가 가는 행동이라고 생각이 듭니다.

NextJS 14를 도입하기 위해 공부하는 만큼 해당 프레임워크 혹은 개발팀에 대한 신뢰도도 굉장히 중요한 요소라고 생각합니다. 개발자 경험을 중시하고 빠른 피드백 수용과 빠른 업데이트에 대해 생각하니 신뢰도의 걱정은 덜게 되었습니다.

출처 : 

https://www.youtube.com/watch?v=zZPNwx0m07U&t=659s

https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries
