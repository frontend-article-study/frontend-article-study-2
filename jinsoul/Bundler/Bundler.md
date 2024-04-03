# Bundler

## What is Webpack?

웹팩이란 최신 프론트엔드 프레임워크에서 가장 많이 사용되는 **모듈 번들러**중 하나입니다.

여기서 모듈 번들러란 HTML,CSS,JavaScript, 이미지 등 **웹 어플리케이션을 구성하는 자원을 조합해서 하나의 파일로 묶어주는 도구**입니다.

## 번들러가 필요한 이유

모든 도구들은 웹 서비스가 커지면서 불편함을 해결하기 위해 생겨났습니다. 모듈 번들러 또한 복잡하고 방대해진 코드를 관리하기 위해 탄생했습니다.

과거의 웹은 지금에 비해서 유지보수가 쉽고 웹을 구성하는 자원이 훨씬 작았습니다.

하지만 기술이 발전하면서 파일 하나당 코드의 양과 웹을 구성하는 파일의 개수 또한 늘어나며 아래와 같은 문제점이 발생했습니다.

1. **변수명 충돌**
    
    ```jsx
    // app.js
    var num = 10;
    function getNum() {
      console.log(num);
    }
    ```
    
    ```jsx
    // main.js
    var num = 20;
    function getNum() {
      console.log(num);
    }
    ```
    
    ```html
    <!-- index.html -->
    <html>
      <head>
        <!-- ... -->
      </head>
      <body>
        <!-- ... -->
        <script src="./app.js"></script>
        <script src="./main.js"></script>
        <script>
          getNum(); // 20
        </script>
      </body>
    </html>
    ```
    
    늦게 로드되는 `main.js` 에서 재선언이 이루어지기 때문에 콘솔에 20이 찍히는것을 볼 수 있습니다.
    
    복잡한 웹 어플리케이션을 개발할 때 여러사람이 작업한다면 변수명을 모두 기억하지 않는이상 중복 선언하거나 의도치 않은 값을 할당할 위험이 있습니다.
    
    파일단위로 변수를 관리하기 위해 `AMD` 나 `Common.js` 와 같은 라이브러리를 사용했습니다.
    
2. **파일 전송 속도 저하**
    
    일반적으로 5초 이내로 웹사이트가 표기되지 않으면 유저이탈률이 늘어난다고 합니다.
    
    그래서 초기 로딩 속도를 높이기 위해서 많은 노력이 있었는데 가장 대표적으로는 **서버에 요청하는 파일 숫자를 줄이는 것**이었습니다. 
    
    `Grunt` 나 `Gulp` 같은 웹 태스크 매니저를 이용해 **파일을 압축하고 병합**하는 작업뿐만 아니라 당장 필요하지 않은 자원들은 나중에 요청하는 **레이지 로딩**이 등장했습니다.
    
3. **웹 개발 자동화**
    
    코드를 수정하고 저장한뒤 브라우저를 새로고침해야만 변경된 화면을 확인하는 것이 가능했습니다. 뿐만 아니라
    
    - HTML,CSS,JS 압축
    - CSS 전처리기 변환
    
    과같은 작업들을 자동화 시켜주는 도구의 필요성이 커졌습니다.
    

## 4가지 번들러 살펴보기

### webpack

2012년 공개되어 차례로 버전 업을 거치고 SPA가 급부상하며 번들러의 역할이 막중해지면서 webpack의 영향력이 커졌습니다.

1. 간편한 설정

```jsx
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    home: './pages/home.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};

```

- 하나의 설정 파일에서 원하는 번들을 설정할 수 있습니다.
- `entry` (웹 자원을 변환하기 위해 필요한 최초 진입점), `output` (결과물의 파일 경로), `loader` (바스크립트 파일이 아닌 웹 자원(HTML, CSS, Images, 폰트 등)들을 변환할 수 있도록 도와주는 속성), `plugin` (기본적인 동작에 추가적인 기능을 제공하는 속성)
1. 풍부한 커뮤니티
    
    자원들을 직접 다루고 결과물을 원하는대로 바꿀 수 있는 loader와 plugin을 필요에 따라 다양하게 사용할 수있습니다.
    
2. HMR(Hot Module Replacement)
    
    webpack은 HMR을 처음으로 제안했고 개발 생산성 향상에 크게 기여하였습니다.
    
3. 코드 스플리팅
    
    파일들을 여러 번들 파일로 분리해서 병렬로 스크립트를 로드하여 페이지 로딩속도를 개선했습니다.
    
    초기에 로드할 필요가 없는 코드들을 분리하여 lazy loading을 통해 페이지 초기 로딩 속도를 개선했습니다.
    

### Rollup

- webpack과 비슷한 설정
- vs webpack
    - webpack은 내부적으로 CommonJS를 rollup은 typescript(ES6)를 사용합니다.
    - webpack은 모듈들을 함수로 감싸 평가하는 방식이지만 rollup은 모듈들을 호이스팅해서 한번에 평가하여 좀 더 빠릅니다.
    - ES6코드에서 tree shaking이 제대로 동작합니다. 따라서 더 가벼운 번들을 생성합니다.

### ESBuild

webpack과 Rollup은 모두 내부적으로 **자바스크립트기반**으로 번들링을 합니다. 

자바스크립트 언어 특성상 **성능적 한계**가 있는데 ESBuild는 내부적으로 `Go`로 작성되어있고 기존의 자바스크립트 기반 번들러보다 **최대 100배**까지 빠른 퍼포먼스를 보여준다고 합니다.

[**왜 빠를까](https://esbuild.github.io/faq/)?**

- 네이티브 코드방식 사용
- 병렬 처리 최적화
- 메모리 사용 최적화
- 자체 타입스크립트 파서 사용

하지만 현재(24년 4월 0.20.2v) 기준 메이저 버전이 출시 되지 못하고 webpack과 rolllup에 비해 설정이 유연하지 못하며 안정성 관련 이슈가 있다고 합니다.

### Vite

[vite 공식문서](https://ko.vitejs.dev/guide/why.html)에서도 설명하듯이 대규모 프로젝트에서 **개발 서버를 가동할 때 오랜시간**을 기다려야 한다거나 **HMR을 사용할 때 변경사항이 늦게 적용**되는 등의 문제를 브라우저에서 지원하는 **ES Modules 및 네이티브 언어로 작성된 자바스크립트 도구**를 활용해 해결하고자 했습니다.

1. ESBuild 사용
    
    vite는 어플리케이션의 모듈을 개발시 바뀌지 않는코드와 바뀌는 코드로 카테고리를 나누어
    
    바뀌지 않는 코드는 ESBuild를 이용해 빠른 사전 번들링을 하고
    
    바뀌는 코드는 필요한 시점에 브라우저가 요청하는 대로 필요한 모듈만 번들링하여 제공합니다.
    
    따라서 번들러 작업의 일부를 브라우저에 위임하여 더 빠른 소스코드를 제공할 수 있게 되었습니다.
    
    ![](./assets/Screenshot%202024-04-02%20at%2010.52.40%20PM.png)
    
2. 느렸던 HMR
    
    소스 코드를 업데이트 하면 번들링 과정을 다시 거쳐야 하는데 규모가 커질수록 소스 코드 갱신 시간또한 증가 하였습니다.
    
    vite는 번들러가 아닌 ESM을 이용해서 수정된 모듈만 교체하여 전체 어플리케이션을 다시 빌드하는 대신에 해당 모듈만 다시 로드하여 빠르게 반영할 수 있습니다.
    
    또한 HTTP 헤더를 사용해서 카테고리 별로 나눈 코드들을 캐싱하여 요청 횟수를 줄여 페이지 로딩을 빠르게 만들어주었습니다.
    

## Ref

https://ko.vitejs.dev/guide/why.html
https://joshua1988.github.io/webpack-guide/
https://bepyan.github.io/blog/2023/bundlers#webpack
https://esbuild.github.io/faq/