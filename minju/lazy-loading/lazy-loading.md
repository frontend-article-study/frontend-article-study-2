# 이미지 최적화: Lazy Loading

## 이미지 최적화란?

웹 페이지의 로딩 시간을 단축하고, 성능을 개선하여 최종적으로 사용자 만족도를 높이는 과정

## 이미지 최적화가 중요한 이유

Google의 연구에 따르면, 로딩 시간이 1초에서 3초로 증가할 때마다 이탈률이 급격히 증가한다고 한다. <br/>
이와 같이 웹 페이지의 로딩 속도는 사용자 경험에 직접적인 영향을 미치는데, 웹 사이트의 느린 속도의 주범은 주로 비효율적으로 처리된 이미지이다. <br/>
따라서 이미지 파일의 크기를 줄이고 최적화하는 것은 웹 사이트의 성능을 개선하는 데 있어 필수적인 작업이다.

## 이미지 최적화 기법

1. 적절한 이미지 포맷 선택 <br/>
   JPEG, PNG 등 다양한 이미지 포맷 중에서 콘텐츠의 성격에 맞는 포맷을 선택하는 것이 중요 <br/>
   예를 들어, 사진 같은 복잡한 이미지에는 JPEG를, 투명도가 필요한 그래픽에는 PNG를 사용하는 것을 추천 <br/>
   최근에는 용량 대비 품질이 우수한 WebP 포맷이 널리 사용되고 있다.

2. 이미지 크기 조정 <br/>
   사용자에게 표시되는 이미지 크기에 맞게 이미지의 해상도를 조정 <br/>
   예를 들어, 800x600 픽셀 크기로 표시되는 이미지를 위해 4000x3000 픽셀 크기의 이미지를 사용하는 것은 리소스 낭비이다.

3. 압축 사용 <br/>
   이미지를 압축하여 파일 크기를 줄이는 것도 중요하다. 최소한의 품질 손실로 최대한의 파일 크기 감소를 목표로 한다.

4. 지연 로딩(Lazy Loading) 구현 <br/>
   페이지에 보이는 이미지만을 우선적으로 로딩하고, 사용자가 스크롤을 내릴 때 추가 이미지를 로딩하는 기법 <br/>
   이는 초기 페이지 로딩 시간을 단축하는 효과적인 방법다다.

### 지연 로딩(Lazy Loading)

1. img 태그의 loading 속성

```html
<img src="image.jpg" alt="description" loading="lazy" />
```

- 이미지의 지연 로딩을 쉽게 구현할 수 있는 방법을 제공
- 속성에 "lazy" 값을 설정함으로써, 해당 이미지가 사용자의 뷰포트에 들어올 때까지 로딩을 지연시킬 수 있음 <br/>


  > 💡 **_loading에 사용할 수 있는 또다른 값들_** <br/>  
  > **lazy** - 뷰포트에서 일정한 거리에 닿을 때까지 로딩을 지연 <br/> 
  > **eager** - 현재 페이지 위치가 위, 아래 어디에 위치하든 페이지가 로딩되자마자 해당 요소를 로딩한다. <br/> 
  > **auto** - 디폴트로 로딩을 지연하는 것을 트리거하는 역할. loading을 사용하지 않는 것과 같다. <br/>

2. 스크롤 이벤트

```js
const lazyLoadImages = () => {
  // querySelectorAll로 모든 img 태그 선택
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    // pageYOffset: 현재 화면의 Y축의 상단값
    const scrollTop = window.pageYOffset; // 현재 스크롤된 양
    // img.offsetTop: 페이지 최상단부터 이미지까지의 거리
    // 이미지가 화면에 나타나면 실행
    if (img.offsetTop < window.innerHeight + scrollTop) {
      const src = img.getAttribute('data-lazy');
      if (src) {
        img.setAttribute('src', src); // 실제 이미지 경로를 src 속성에 설정
        img.removeAttribute('data-lazy'); // 로딩 후 data-lazy 속성 제거
      }
    }
  });
};

window.addEventListener('scroll', lazyLoadImages);

// 페이지 로드 시 이미지 로딩을 위해 한 번 실행
document.addEventListener('DOMContentLoaded', lazyLoadImages);
```

3. Intersection Observer API <br/>
   복잡한 스크롤 이벤트 리스너와 요소의 가시성을 수동으로 계산하는 작업을 간소화하기 위해 개발 <br/>
   주로 이미지나 콘텐츠의 지연 로딩, 무한 스크롤 구현 등에 사용

```js
import React, { useEffect, useRef } from 'react';

const LazyImage = ({ src, alt }) => {
  // img 요소에 대한 참조를 생성
  const imgRef = useRef();

  useEffect(() => {
    // IntersectionObserver를 생성하고 콜백 함수를 정의
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      // 엔트리가 뷰포트와 교차하는 경우 (화면에 보이는 경우)
      if (entry.isIntersecting) {
        imgRef.current.src = src; // 참조된 img 요소의 src 속성을 설정
        observer.unobserve(imgRef.current); // 이미지가 로드되었으니 더 이상 관찰할 필요가 없으므로 관찰을 취소
      }
    });

    observer.observe(imgRef.current); // img 요소를 관찰
    return () => observer.disconnect(); // 컴포넌트가 언마운트 되면 옵저버 연결을 해제
  }, [src]);

  return <img ref={imgRef} alt={alt} />;
};
```

## 주의할 점

1. 플레이스 홀더 사용: 이미지나 객체가 로드되기 전에 표시될 플레이스 홀더를 사용하는 것이 좋다.
   <br/>이는 사용자 경험을 개선하고, 레이아웃 이동을 방지할 수 있다.
2. 접근성 고려: 이미지에 대체 텍스트를 제공하여 시각 장애가 있는 사용자도 콘텐츠를 이해할 수 있도록 해야 한다. 
3. 크로스 브라우저 호환성: 모든 사용자가 원활하게 접근할 수 있도록 다양한 브라우저에서도 잘 동작하도록 구현해야 한다. 
4. 성능 테스트: Lazy loading이 페이지 로딩 성능에 미치는 영향을 모니터링하고, 필요에 따라 최적화해야 한다. 

> 💡 **성능 테스트 하는 방법** <br/>
> Chrome의 개발자 도구 <br/>
>
> 1. Network 탭: 각 리소스의 로딩 시간을 확인 가능 <br/>
> 2. Performance 탭: 페이지 로딩 전체에 걸쳐 다양한 성능 지표를 시각화하여 볼 수 있다.
