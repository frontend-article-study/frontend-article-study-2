<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/227bc328-4395-414a-b175-6b9bba8d43e4" />

애플이 새롭게 내놓은 디자인 컨셉인 [Liquid Glass](https://youtu.be/jGztGfRujSE).

이런 Liquid Glass를 웹에서 구현하고자 하는 시도들을 많이 봤는데, 하나같이 svg filter라는 기능을 사용하고 있었다.

svg가 단순 이미지 포맷이라고 생각했던 나에게 생소한 개념이라 정리해 보았다.

# Liquid Glass에 SVG filter가 필요한 이유

CSS에는 [backdrop-filter](https://developer.mozilla.org/ko/docs/Web/CSS/backdrop-filter) 라는 속성이 존재한다. 이는 요소 뒤 영역에 흐림이나 색상 등 그래픽 효과를 적용할 수 있는 속성이다.

단순하게 봤을 때, 리퀴드 글래스를 만들기 위해 `backdrop-filter: blur(2px)` 같은 블러효과를 먹여서 구현하는 접근법을 생각해볼 수 있다.

그러나 이렇게 구현할 시 리퀴드 글래스가 갖고 있는 유리 위에 비친 배경이 굴절되어 보이는 효과를 표현할 수 없으며, 이 효과는 기본 CSS backdrop-filter 값만으로는 구현할 수 없다.

이 굴절효과를 비슷하게 구현하기 위해 SVG filter를 사용한다.

# SVG filter란?

도형 및 심볼에 복잡한 시각 효과를 생성할 수 있게 하는 기능으로, 픽셀 단위로 이미지를 가공할 수 있게 하는 SVG 내 사양이다.

SVG는 벡터 기반이지만, 필터는 이 벡터 그래픽을 픽셀 기반 이미지로 래스터화한 후 효과를 적용한다.

- 벡터 : 수학적인 선 및 도형으로 그림을 표현, 확대/축소해도 선명함
- 래스터 : 픽셀 격자에 색을 채워서 그림 표현, 확대하면 깨짐(픽셀이 보임)

filter는 [필터 프리미티브](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element#filter_primitive_elements)라고 하는 빌딩 블록들의 조합이며, 이 블록들은 크게 세 가지 범주로 나눌 수 있다.

- 수정자(Modifiers) : 기존 그래픽을 변환함 (ex: feGaussianBlur)
- 소스(Sources) : 새로운 그래픽을 생성함 (ex: feImage)
- 결합자(Combiners) : 여러 그래픽을 병합하여 새로운 출력을 생성함 (ex: feDisplacementMap)

# SVG filter를 코드에 적용하는 법

## 1단계 : 필터 정의

먼저 SVG 요소 안의 <defs>에서 필터를 정의한다.

```jsx
<svg width="0" height="0"> <defs> <filter id="myBlur"> <feGaussianBlur stdDeviation="4"/> </filter> </defs> </svg>
```

이때 필터 정의용 svg는 렌더링되지 않으므로, `display: none;` 스타일을 주거나 width, height를 0으로 설정해도 정상 작동한다.

## 2단계 : CSS에서 필터 참조

필터를 적용하고자 하는 엘리먼트의 CSS 속성에서 생성한 필터를 참조하여 사용 가능하다.

적용 가능한 속성으론 `filter`, `backdrop-filter` 등이 있으며, 참조하는 방법으론 다음과 같은 것들이 있다.

### **방법 1: Element id로 필터 참조**

```jsx
filter: 'url(#myBlur)'
```

### **방법 2: 외부 SVG 파일을 가져와서 참조**

```jsx
filter: 'url(./filters.svg#myBlur)'
```

### **방법 3: Data URL로 인라인 SVG**

- Data URL : URL 명세 중 하나. 파일 내용을 URL 자체에 인라인으로 포함시키는 방식. `data:[<mediatype>][;base64],<data>` 형식임

```jsx
filter: 'url("data:image/svg+xml;utf8,<svg>...</svg>")'
```

# 리퀴드 글래스를 구현하기 위한 SVG 필터 프리미티브

리퀴드 글래스 예시에서는 굴절을 표현하기 위해 `feDisplacementMap` , `feImage`  프리미티브를 사용했다.

## feDisplacementMap

픽셀을 다른 위치로 밀어내서 그림을 왜곡(굴절)시키는 필터 프리미티브. 다음과 같은 어트리뷰트를 받는다.

- in : 왜곡하려는 원본 시각 요소(SourceGraphic)
- in2 : 원본 이미지의 픽셀 변환 계산을 위해 사용하는 이미지. 변위 맵(displacement map)이라고 부른다.
- scale : 왜곡 강도(얼마나 많이 픽셀을 옮길지. 픽셀 변환 계산에 적용되는 값)
- xChannelSelector / yChannelSelector : 변위 맵의 어떤 색상 채널(RGBA)을 읽어서 X축, Y축 이동 값으로 쓸지 지정.

왜곡에 사용하는 공식은 다음과 같다.

`P'(x,y) ← P(x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))`

### 픽셀 이동 위치 계산과정

원본 이미지(`in`)에 왜곡 효과를 줄 때, 특정 위치 (10,15)에 위치한 픽셀의 이동 위치를 계산하는 과정은 다음과 같다.

1. `in2`  변위 맵의 동일한 좌표(10,15)의 색상값을 읽는다. → 예: (R=100, G=50, B=30)
2. X, Y 이동에 사용할 값을 색상 채널을 통해 가져온다.
    - `xChannelSelector="R"` → displacement map의 빨간색(R) 채널 값(100)을 X축 변위로 사용한다.
    - `yChannelSelector="G"` → displacement map의 초록색(G) 채널 값(50)을 Y축 변위로 사용한다.
3. 0~255 범위의 색상 값을 `-1 ~ 1` 범위로 정규화한다. (공식 : `(C / 255) - 0.5`)
    - X축 정규화 값 : (100/255) - 0.5 ≈ -0.108
    - Y축 정규화 값 : (50/255) - 0.5 ≈ -0.304
4. 정규화된 값을 `scale`만큼 곱해 실제 이동 거리를 만든다.
    
    ex) scale=10이라고 가정했을 때,
    
    dx : -0.108 * 10 = -1.08
    
    dy : -0.304 * 10 = -3.04
    
5. 원본의 픽셀을 (x + dx, y + dy)로 이동시킨다.

이 과정을 모든 픽셀에 반복하여 최종 이미지를 만든다.

## feImage

- 외부 그래픽을 받아서 픽셀화된 데이터를 결과로 내보내는 필터 프리미티브.
- Svg를 줄 경우 래스터화해서 내보낸다.
- 리퀴드 글래스의 사례에서는 정교한 경계 왜곡을 위해 전용 변위 맵을 생성하였고, 이 생성을 위해 feImage를 활용했다.

# 리퀴드 글래스를 위한 전용 변위 맵 만들기

앞선 `feDisplacementMap`의 RGB 정규화 공식에서, RGB 값(0~255)은

- 0 → -1(음의 오프셋)
- 128 → 0(변위 없음)
- 255 → 1(양의 오프셋)

에 매핑된다.

따라서 아래 이미지의 왼쪽처럼 변위 맵을 주면,

<img width="1100" height="631" alt="image" src="https://github.com/user-attachments/assets/02f973e2-9004-4d4d-85db-fc6295fb1af6" />


가운데의 회색 영역은 RGB(128, 128, 128)로 왜곡을 만들지 않으며, 가장자리의 그라디언트 영역은 불규칙한 왜곡을 생성한다.

따라서 Liquid Glass에 맞는 자연스러운 굴절을 생성할 수 있다.

# 결과

[Liquid Glass in CSS (and SVG) (forked)](https://codesandbox.io/p/sandbox/liquid-glass-in-css-and-svg-forked-htz98y)

# 한계

- SVG displacement 필터는 픽셀 단위로 왜곡하므로 고급 그래픽 엔진(ex: GPU 셰이더, 포토샵 필터)처럼 매끄러운 왜곡을 만들어내지 못한다.
- 현재의 접근 방식은 고정 크기의 둥근 직사각형과 원만 지원한다.
- SVG displacement 효과와 backdrop-filter를 결합하는 효과는 현재 Chromium 기반 브라우저에서만 안정적으로 작동한다.

# 출처

[Liquid Glass in CSS (and SVG)](https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d)
