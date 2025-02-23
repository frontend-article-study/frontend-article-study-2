## 0. 들어가기 전
- vue 프로젝트에서 react로 개발된 사내 라이브러리를 import 해서 사용해야하는 경우가 생김 ➡️ 빌드 시간이 급격하게 늘어남
- 성능 좋은 번들러로 전환하기로 결정

## 1. Rspack 이란?
#### Rspack 개요 
- **Rust** 언어로 작성된 고성능 웹 애플리케이션 번들러
- **빌드 시간 단축** 및 개발자 경험 개선(콜드 스타트 개선)
- **Webpack과 호환성**을 유지하여 손쉬운 마이그레이션 가능

#### 탄생 배경
- 기존 Webpack 기반 프로젝트들의 **빌드 속도가 점점 느려짐** ➡️ 성능 개선 요구
- **JS기반 Webpack은 단일 스레드 방식**으로 빌드 시간이 길어지는 문제가 존재 ➡️ **Rust의 병렬 처리** 및 메모리 안전성을 활용한 Rspack 등장

#### 특징
- **Rust 기반 고속 처리**
  - 병렬 처리
  - CPU 활용 극대화로 빠른 빌드 및 트랜스파일링 가능
- **Webpack과의 높은 호환성**
  - **Webpack의 설정(webpack.config.js)을 그대로 사용**할 수 있도록 설계 (조금의 수정은 필요)
  - 기존 Webpack 로더 및 플러그인과 호환성 유지
- 빠른 빌드 속도
  - Tree shaking, Code splitting 속도 빠름
  - Incremental 빌드 및 캐싱 최적화
    - Incremental 빌드 : 변경된 파일만 감지하여 부분적으로 다시 컴파일하는 방식, **불필요한 재컴파일 방지하여 빌드 속도 향상**, 파일 내용을 hash 값으로 저장 후 비교 (webpack도 지원하지만 성능이 더 좋음)
    - 캐싱 최적화 : 초기 빌드 속도는 유지하면서 **후속 빌드는 더욱 빠르게 실행**
- 빠른 HMR (Hot module Replacement)

## 2. 번들러란?
#### 역할
- 여러 개의 JS, CSS, 이미지, 폰트 등 웹 애플리케이션에서 필요한 파일들을 하나의 패키지로 묶어주는 도구
- 브라우저에서 효율적으로 리소스들을 효율적으로 로드할 수 있음

#### 필요성
- JS ES6+ 의 import/export 구문을 사용하여 모듈화된 코드 통합
- 여러 소스 파일을 하나의 번들로 결합하여 **네트워크 요청 수를 줄임**
- 최신 JS 기능을 구형 브라우저에서도 실행할 수 있도록 변환 (Babel 사용)
- 파일 크기 최적화 및 로드 속도 향상
- HMR 기능 등 개발 생산성 향상

#### 해결하는 문제
- **Code splitting**
  - 여러 chunk로 나누어 로드
  - **필요한 부분만 로드**하도록 구성 가능
- **Tree Shaking**
  - **사용되지 않는 코드를 제거**하여 번들 크기를 줄임
- Minification & Compression
  - 불필요한 공백, 주석 제거, 변수명 단축하여 번들 크기 최소화
- 이미지 및 CSS 최적화
- 개발 및 프로덕션 **환경 분리**
  - 개발 중에는 디버깅을 위한 소스맵 포함하고, 프로덕션에서는 최적화된 코드 제공

## 3. 번들러들의 비교

번들러 | 초기 빌드 속도 | 핫 리로딩 속도 (HMR) | 캐싱 최적화 | 성능 요약
-- | -- | -- | -- | --
Rspack | ★★★★☆ (빠름) | ★★★★★ (매우 빠름) | 고급 디스크 및 메모리 캐싱 | 대규모 프로젝트에 적합
Webpack | ★★☆☆☆ (느림) | ★★☆☆☆ (느림) | 파일 시스템 캐싱 지원 | 복잡한 프로젝트 관리에 적합
Vite | ★★★★★ (매우 빠름) | ★★★★★ (매우 빠름) | 모듈 캐싱, 네이티브 ESM | 개발 환경 속도 최적화
ESBuild | ★★★★★ (매우 빠름) | ★★★★☆ (빠름) | 최소한의 캐싱 기능 제공 | 초고속 번들링, 간단한 프로젝트
Parcel | ★★★★☆ (빠름) | ★★★☆☆ (보통) | 자동 캐싱 및 코드 최적화 | 자동화가 필요한 프로젝트

- **기존 Webpack 설정을 활용하기 위해 Rspack을 선택**
- Vite를 선택하지 않은 이유
  - 프로젝트가 4개의 entry를 가지고 있어 설정이 복잡함. **Vite는 단일 entry에 최적화** 되어 있는 것으로 보였음 (지원은 함)
  - Vite는 개발환경에서 쓰고 production 환경에서는 **Rollup config를 새로 작성해주어야 했음.**
    - Rollup은 라이브러리 패키징에 집중된 번들러 (빠르고 간단한 설정으로 모듈 크기를 최소화하며, 다양한 포맷 지원)

## 4. 단점
- 2024/8/28 1.0v release 하였고, **초기 단계이기 때문에 일부 기능(webpack 플러그인 등) 미지원 가능성**이 있음
- 커뮤니티가 webpack에 비해 작음

## 5. 실제 적용 후 비교
- vue 프로젝트에서 react로 개발된 사내 라이브러리를 import 해서 사용해야하는 경우가 생김  ➡️  빌드 시간이 급격하게 늘어남

#### BEFORE

|작업|시간|
|------|---|
|dev build|540.05s|
|k8s dev deploy workflow|12m|

#### AFTER

|작업|시간|
|------|---|
|dev build|20.39s|
|k8s dev deploy workflow|5m|

## 6. Rspack 도입 시 고려 사항
- Webpack v5 버전으로 migration 한 후, 적용하는 것이 좋음. **Rspack 문서가 webpack v5 기반**.
- 기존 사용하던 플러그인 및 로더 호환성 테스트 필요
