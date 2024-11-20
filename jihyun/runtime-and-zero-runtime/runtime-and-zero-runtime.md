# 런타임 그리고 제로 런타임 CSS

## Runtime에 실행되는 CSS

자바스크립트 런타임에 필요한 CSS를 만들어 적용하는 방법입니다. (css-in-js)

- 장점
  - 자바스크립트를 활용해 동적으로 변경되는 스타일을 정의할 수 있음
  - 스타일을 지역 스코프로 지정하여 클래스 중복 문제를 해결함 (like css-module)
  - 단일 컴포넌트에 관련된 스타일을 같은 위치에 둘 수 있어 유지보수가 편리할 수 있음 (co-location)
- 단점
  - 런타임 오버헤드가 증가할 수 있음
  - css-in-js 라이브러리용 자바스크립트를 다운로드해야 하기에 번들 크기가 늘어남

### 어떻게 스타일이 적용되는걸까?

자바스크립트 파일이 브라우저에서 실행되어 스타일이 적용되며 크게 2가지 방법이 있습니다.

- `<style>` 태그에 style을 추가하는 방식
- CSSStyleSheet.insertRule() 함수로 CSSOM에 style을 추가하는 방식

#### `<style>` 태그에 style을 추가하는 방식

- 예시 코드

  ```jsx
  const css = 'body { border: 20px solid red; }';
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');

  head.appendChild(style);

  style.type = 'text/css';
  style.styleSheet.cssText = css;
  ```

- 디버깅에 용이함
- 브라우저가 style 태그를 만나면 해당 스타일을 파싱하고 적용해야하기 때문에 초기 렌더링에 영향을 미침

#### CSSStyleSheet.insertRule() 함수로 CSSOM에 style을 추가하는 방식

- 예시 코드
  ```jsx
  const sheet = document.styleSheets[0];
  sheet.insertRule('body{ border-bottom: 1px solid #CCC; color: #FF0000; }', 0);
  ```
- CSSOM이 만들어진 다음에 실행되기 때문에 렌더링 속도에 영향을 미치지 않아 성능 상의 이점이 있음

## Runtime에 실행되지 않는 CSS - Zero Runtime

제로 런타임은 css-in-js 방식이 런타임 오버헤드를 발생시켜 성능이 좋지 않다는 문제점을 보완하기 위해 등장한 용어이며, 말 그대로 런타임에서 동작하지 않는 CSS를 말합니다. 즉, 동적으로 스타일을 생성하지 않습니다.

- 장점
  - 런타임에 css를 생성하지 않으므로 페이지를 더 빠르게 로드할 수 있음
  - 자바스크립트 번들 사이즈를 줄일 수 있음
  - 복잡한 인터랙션이 포함된 경우 런타임 성능을 최적화하기 좋음
- 단점
  - props 기반의 동적인 스타일링이 어려움
  - 빌드 관련 설정이 필요함

### 어떻게 스타일이 적용되는걸까?

전통적인 CSS 적용 방식과 동일합니다. 빌드할 때 미리 CSS를 생성해 두고 이 파일을 `<link>` 태그로 제공합니다.

CSS가 빌드 시점에 만들어지기 때문에 동적인 스타일링이 어렵지만, 미리 CSS Variable로 변수를 만들어두면 어느 정도 보완할 수 있습니다. (단, 미리 만들어두지 않은 변수는 사용할 수 없죠!)

## Near Zero Runtime?

런타임 오버헤드를 최소화하여 거의 없는 수준으로 유지하는 CSS를 말합니다. 기존 css-in-js가 가지는 런타임 오버헤드 문제점을 보완하여 성능을 높이는 것이 핵심 아이디어입니다. 예시로는 stitches.js가 있습니다.

stitches.js는 css-in-js지만, 다음과 같은 성능 최적화를 통해 런타임 오버헤드를 줄입니다.

- 불필요한 prop interploation 줄이기
  - 기존 css-in-js의 경우 prop을 기반으로 완전히 동적인 스타일링이 가능하지만, stitches의 경우 미리 정의해 둔 variants를 활용해 동적 스타일링을 적용함
- atomic css 사용
  - 반복되는 코드는 atomic css로 추출하여 재사용함으로써 css 코드를 최소화 (스타일시트 크기 감소)

## 참고

[https://junghan92.medium.com/번역-우리가-css-in-js와-헤어지는-이유-a2e726d6ace6](https://junghan92.medium.com/%EB%B2%88%EC%97%AD-%EC%9A%B0%EB%A6%AC%EA%B0%80-css-in-js%EC%99%80-%ED%97%A4%EC%96%B4%EC%A7%80%EB%8A%94-%EC%9D%B4%EC%9C%A0-a2e726d6ace6)

[https://bepyan.github.io/blog/2022/css-in-js](https://bepyan.github.io/blog/2022/css-in-js)

[https://pozafly.github.io/css/explore-how-to-apply-modern-css/](https://pozafly.github.io/css/explore-how-to-apply-modern-css/)

[https://so-so.dev/web/css-in-js-whats-the-defference/](https://so-so.dev/web/css-in-js-whats-the-defference/)
