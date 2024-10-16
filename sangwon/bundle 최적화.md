# Bundle 최적화
## Bundling
- 여러 JS 파일과 리소스들을 1개 또는 여러 개의 번들 형태로 묶는 방식
- 번들링을 통해 네트워크 요청를 줄이고, 코드를 압축하여 로딩 시간을 최적화할 수 있음 (번들 사이즈와 로딩 시간은 비례)
- Webpack, rollup, vite, ...

![image](https://github.com/user-attachments/assets/e374c1f5-e86b-4f92-a5dd-387fbf396546)


## 최적화
### 1. 소스 코드 최소화
- minify로 압축 - 불필요한 공백, 개행, 세미콜론 등을 제거 (terser, uglify-es, html-minifier, ...)

```js
// 원본 코드
function sayHello(name) {
    console.log("Hello, " + name + "!");
}

// Minify 후 코드
function sayHello(n){console.log("Hello, "+n+"!")}
```

- uglify로 코드 최소화 및 난독화 - 변수명과 함수명 크기 감소 및 난독화(uglifyJS, terser, ...)
```js
// 원본 코드
function sayHello(name) {
    console.log("Hello, " + name + "!");
}

// Uglify 후 코드 (난독화 포함)
function a(n){console.log("Hello, "+n+"!")}
```

- webpack v4 부터는 production  mode인 경우, 자동으로 압축과 난독화를 진행
- webpack v5 에서는 terser-webpack-plugin을 내장하고 있고, 동시에 난독화까지 진행

### 2. css 압축
- css 파일에서 불필요한 공백 제거 - CssMinimizerPlugin을 활용해서 불필요한 공백 제거
- css 파일을 별도의 파일로 분리 - MiniCssExtractPlugin을 활용해서 별도 파일로 분리
  - 별도 파일로 분리하게 되면 JS와 병렬로 다운로드가 가능해서 성능에 이점 존재

### 3. Code Splitting
- 번들 사이즈가 커지면, 그 파일을 불러오고 실행하는데 많은 시간이 소요되는 문제가 있음
- Code splitting을 통해 필요한 코드만 불러오고 요청을 병렬로 처리할 수 있음
- (1) webpack splitChunks 옵션 사용
```js
output: {
// 번들에 별도의 이름 => 생성되는 파일 이름 충돌 발생 방지
  filename: '[name].bundle.js', 
  path: path.join(__dirname, '/dist'),
  clean: true
},

splitChunks: {
  chunks: 'all'
}
```

- (2) dynamic import 사용
  - React(React.lazy), Vue(import())를 사용하여 모듈이 필요한 시점이 되었을 때 로드

### 4. 외부 라이브러리 bundle size 줄이기
- ES6 모듈(ESM)을 지원하면 tree shaking을 해줌
- 지원하지 않는 라이브러리(lodash, moment, moment-timezone...) 의 경우 bundle size 줄이는 방법이 존재
- webpack-bundle-analyzer를 통해 번들 사이즈 확인 가능

#### lodash
- `lodash-es`(ESM 버전)를 사용하는 방법
- 필요한 함수만 불러오는 방법
```js
import { debounce } from 'lodash'; // 필요한 함수만 번들에 포함
```

#### moment-timezone
- 특정 시간대(timezone)를 기준으로 날짜/시간을 설정할 수 있음
- 필요한 timezone만 넣어서 번들 사이즈를 줄일 수 있음 (`matchZones: [/America\/(Los_Angeles|New_York)/, 'Asia/Seoul']`)

  - before (771.87KB)
  
  <image src="https://github.com/user-attachments/assets/54e1f234-32f7-4d1e-b413-6d4a45bbdf73" width="600" alt="1"/>
  
  - after (16.07KB)
  
  <image src="https://github.com/user-attachments/assets/36efe969-2a78-484d-a59a-4f77101abbfe" width="400" alt="1"/>

- 그러나, 빌드 시간은 늘어남(55s ➔ 69s) ➔ production 빌드에만 적용했음

### 5. 미사용 라이브러리 제거
- depcheck - https://www.npmjs.com/package/depcheck
- (주의) unused 로 나왔어도 모두 제거하면 안되고, 검증하고 제거하기

  <image src="https://github.com/user-attachments/assets/ecc42a42-c871-4baf-8951-8a4a6a2d0768" width="400" alt="1"/>


### 6. bundle 분석 도구를 통해 중복 bundling 제거
- bundle 분석 도구 종류 : webpack-bundle-analyzer, cra-bundle-analyzer, lighthouse treemap, ...

####  Ex 1) 4개의 webpack entry가 있는데, 1개에서 css 중복 bundling


  <image src="https://github.com/user-attachments/assets/7f2e0e04-3614-4e38-9156-08d2142aaba8" width="400" alt="1"/>

- before

  <image src="https://github.com/user-attachments/assets/337b0b1d-77fa-410a-ab1b-24f9cf28cc06" width="600" alt="1"/>

- after

  <image src="https://github.com/user-attachments/assets/278da02a-2114-462c-a2b8-ecd72a381cb2" width="600" alt="1"/>

- 45.12MB ➔ 40.31MB

#### Ex 2) json 파일 중복 bundling
- 다국어 같은 json 파일들이 여러 개 있을 때, 사용하는 파일마다 import를 하고 있었음 ➔ 중복 bundling 되는 문제

  <image src="https://github.com/user-attachments/assets/6619d7fb-2eea-43c4-9b12-7120eec373f1" width="600" alt="1"/>

- json 파일을 모두 합쳐도 용량이 크지 않아서, 각 파일의 다국어 import를 제거하고 초기에 모든 json 파일(다국어)을 로드
 
  <image src="https://github.com/user-attachments/assets/8dbe2422-f073-4f8e-9170-fc26c1c733ce" width="600" alt="1"/>

- 한번 더 최적화
  - 다국어 파일이 여러개로 분리되어 있어서, 각 파일에 대한 네트워크 요청 필요

  <image src="https://github.com/user-attachments/assets/100b8e2c-3212-4f5e-9192-aa1072c5cb57" width="600" alt="1"/>


  - webpack cacheGroups을 사용해서 json 파일을 1개의 chunk로 생성
    - webpack cacheGroups : 특정 조건으로 chunk를 생성할 수 있는 속성 (https://webpack.kr/plugins/split-chunks-plugin/#splitchunkscachegroups)
  
  <image src="https://github.com/user-attachments/assets/6dc0ef18-1a93-4a66-ac45-a3726da27e59" width="600" alt="1"/>

## 결론

- bundle size : 45MB(1 ~ 3 적용) ➔ 26.87MB(1 ~ 6 적용)
- 로드 용량 : 1/3 정도로 감소(6.6MB ➔ 2.4MB)
- 로드 속도 : 유의미한 측정을 위해 네트워크 속도를 1000kbit/s로 낮춤 ➔ 1/3 정도로 감소(52.75s ➔ 19.36s)

---

## 번외

#### 여러 vue 파일에 있는 다국어 <i18n> 태그들을 어떻게 지울까?
- jscodeshift? jscodeshift는 script만 제거할 수 있음
- <i18n> 태그는 script 외부에 있음 ➔ fs, glob을 사용해서 스크립트를 작성함 
