AI로 코드를 무제한으로 생성하는 시대에, 코드 품질을 유지하기 위한 수단으로 린트나 타입 같은 정적분석기의 필요성이 점점 높아지는 것 같다.

현 프로젝트나 앞으로 만들 프로젝트에서의 린트 설정을 위해 린터에 대해 알고 싶은 것들을 조사해봤다.

# ESLint vs Biome?

ESLint는 아주 유명한 JavaScript/TypeScript 린터다. 본래 JavaScript 린터지만, 플러그인과 파서를 통해 TypeScript, GraphQL, YAML, JSON, Markdown 등 다양한 파일 형식까지 검사할 수 있다. 오랜 기간 사실상의 표준처럼 쓰였고 풍부한 생태계와 플러그인, 커스텀 룰을 지원한다.

Biome은 린터, 포맷터, import 정리 기능을 함께 갖고 있는 툴이다. Rust 기반으로 작성되어 eslint나 prettier 대비 빠른 속도를 자랑하며, 공식 문서 기준 JavaScript, TypeScript, JSX, TSX, JSON, HTML, CSS, GraphQL 포맷팅을 지원한다.

새 프로젝트를 진행한다면 어떤 걸 택하는 게 좋을까?

## **ESLint 특징**

ESLint의 가장 큰 장점은 **생태계와 확장성**이다.

기본 JavaScript 린트뿐 아니라 TypeScript, React, React Hooks, JSX 접근성, import 규칙, promise 관련 규칙, 테스트 코드 규칙 등 프로젝트 성격에 맞는 플러그인을 조합해서 사용할 수 있다. TypeScript 프로젝트에서는 보통 `typescript-eslint`를 함께 사용하며, 공식 문서에서도 ESLint flat config와 `typescript-eslint` 권장 설정을 조합하는 방식을 안내하고 있다.

또한 ESLint는 AST를 통해 각 프로젝트에서 커스텀 룰을 만들어 적용할 수 있으며, 풍부한 예시와 커뮤니티를 가지고 있다.

ex)

https://toss.tech/article/improving-code-quality-via-eslint-and-ast

https://medium.com/wantedjobs/eslint-%EC%BB%A4%EC%8A%A4%ED%85%80-%EB%A3%B0-%EC%A0%81%EC%9A%A9%EA%B8%B0-27d81168d918

https://tech.kakao.com/posts/375

따라서 ESLint의 장점은 다음과 같다.

- 오래된 표준 도구라 레퍼런스가 많다.
- 플러그인 생태계가 매우 풍부하다.
- 프로젝트나 팀 컨벤션에 맞는 커스텀 룰을 만들기 쉽다.
- TypeScript 타입 정보를 활용하는 정교한 룰을 적용하기 좋다.
- React, Next.js, Node.js, 테스트 환경 등 프레임워크별 설정 사례가 많다.

반대로 단점도 있다.

- 설정이 복잡해지기 쉽다.
- ESLint, Prettier, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks 등 여러 패키지의 조합을 관리해야 한다.
- 플러그인 간 룰 충돌이나 포매터와의 충돌을 신경 써야 한다.
- 대규모 프로젝트에서는 실행 속도가 부담이 될 수 있다.

특히 기존 프론트엔드 프로젝트에서는 보통 ESLint와 Prettier를 함께 사용한다. ESLint는 코드 품질과 잠재 버그를 잡고, Prettier는 코드 스타일 포맷팅을 담당한다. 이 조합은 강력하지만, 설정 파일과 의존성이 늘어나면서 관리 부담도 생긴다.

따라서 ESLint는 **세밀한 룰 제어가 필요하거나, 특정 플러그인/커스텀 룰에 의존하는 프로젝트**에 잘 맞는다.

## **Biome 특징**

Biome의 가장 큰 장점은 **속도와 단순함**이다.

Biome은 Rust 기반으로 만들어졌고, 린터와 포매터를 하나의 도구에서 제공한다. 즉 ESLint + Prettier + import sorter 조합으로 나누어 관리하던 기능을 Biome 하나로 상당 부분 처리할 수 있다. 공식 문서에서도 Biome을 “format, lint, and more”를 제공하는 웹 프로젝트용 툴체인으로 설명한다.

Biome의 장점은 다음과 같다.

- 설치와 설정이 비교적 단순하다.
- 포매터와 린터가 하나의 도구에 들어 있어 설정 충돌이 적다.
- Rust 기반이라 실행 속도가 빠르다.
- import 정리 기능을 내장하고 있다.
- ESLint/Prettier에서 Biome으로 옮기기 위한 migration 명령어를 제공한다.

반대로 Biome에도 한계가 있다.

- ESLint처럼 플러그인 및 커스텀 룰 생태계가 발전하지 않았으며 제한적이다. 따라서 공식에서 지원하지 않는 언어의 린트를 기대하기 어렵다. (ex: YAML)
    
    Biome는 [GritQL 기반 린터 플러그인](https://biomejs.dev/linter/plugins/)을 통해 제한적인 커스텀 룰을 등록할 수 있는데, 이는 간단한 규칙이나 금지 패턴 검사에는 사용할 수 있지만 ESLint 플러그인만큼 자유도가 높은 커스텀 룰을 만들긴 어렵다.
    
- 매우 세밀한 TypeScript 타입 기반 규칙은 ESLint + typescript-eslint 쪽이 더 강한 경우가 많다.
- 기존 프로젝트가 복잡한 ESLint 설정에 의존하고 있다면 완전 대체가 어려울 수 있다.
- ESLint와 유사한 룰이라도 진단 기준이 조금 다를 수 있다.

Biome은 ESLint의 많은 룰이나 ESLint 플러그인의 룰에서 영감을 받았거나 동일한 룰을 제공한다. 다만 룰 이름과 설정 방식은 다르다. Biome은 `camelCaseRuleName` 스타일을 쓰고, ESLint는 `kebab-case-rule-name` 스타일을 쓴다. 예를 들어 ESLint의 `react-hooks/exhaustive-deps`와 비슷한 역할을 Biome에서는 `useExhaustiveDependencies` 룰이 담당한다. Biome 공식 마이그레이션 문서도 이 차이를 설명한다.

따라서 Biome은 **새 프로젝트에서 빠르고 단순한 기본 린트/포맷팅 환경을 만들고 싶을 때** 특히 잘 맞는다. 반면 사내 커스텀 룰, 복잡한 React/TypeScript 규칙, 특정 ESLint 플러그인에 강하게 의존하는 프로젝트라면 ESLint를 유지하거나 Biome과 ESLint를 병행하는 방식이 더 현실적일 수 있다.

| **도구** | **장점** | **단점** |
| --- | --- | --- |
| **Biome** | 빠르고 설정이 단순하다.
포매터, 린터, import 정리를 하나의 도구에서 처리할 수 있다. | ESLint에 비해 플러그인과 커스텀 룰 생태계가 제한적이다.
세밀한 타입 기반 규칙은 부족할 수 있다. |
| **ESLint** | 플러그인 생태계가 넓고 React, TypeScript, 접근성, import 등 다양한 규칙을 세밀하게 구성할 수 있다. | 설정이 복잡해지기 쉽고, Prettier 등 다른 도구와 충돌 관리가 필요할 수 있다. |

# React 관련 도메인 룰을 기반으로 비교하기

단순히 툴의 특성에 따른 비교보다도, 각 린터에서 지원해주는 린트 룰이 어떤 게 있으며 어떤 린터가 더 풍부한 룰을 지원해주는지를 알고 싶었다.

그래서 내게 익숙한 React와 관련해서 두 린터가 지원해주는 룰을 살펴보고 비교해 보았다.

## Biome

Biome에서 React 관련 룰은 ESLint처럼 별도 플러그인을 설치해 확장하는 방식이 아니라, Biome이 공식적으로 제공하는 도메인 기능을 통해 관리된다.

Biome의 도메인은 특정 생태계나 사용 맥락에 맞는 룰을 묶어둔 단위다. 예를 들어 `react`, `solid`, `test` 같은 도메인이 있으며, Biome은 `package.json` 를 읽고 특정 의존성이 감지되면 관련 도메인의 룰을 자동으로 활성화할 수 있다. 예를 들어 `mocha` 의존성이 감지되면 `test` 도메인의 recommended 룰이 활성화되는 식이다. 리액트 도메인의 경우  `react: >=16.0.0` 의존성이 있으면 활성화된다.

## ESLint

ESLint에서는 `eslint-plugin-react`, `eslint-plugin-react-hooks`와 같은 외부 플러그인에서 리액트 관련 룰을 지원한다. 즉 해당 룰을 사용하고 싶으면 별도의 플러그인 패키지를 설치해야 한다.

## 룰 프리셋

Biome, ESLint의 룰에는 `recommended`, `all`과 같은 프리셋이 있다. 각 프리셋에 대한 설명은 다음과 같다.

| 프리셋 | 뜻 | 아이콘 |
| --- | --- | --- |
| recommended | 해당 도구나 플러그인에서 일반적으로 사용을 권장하는 룰 모음 | 👍 |
| all | 제공되는 룰을 가능한 한 많이 활성화하는 설정
더 엄격한 검사가 가능하지만, 프로젝트 성격에 맞지 않는 룰이 포함될 수 있음 | ✅ |
| deprecated | ESLint에만 있는 프리셋. 더 이상 사용을 권장하지 않거나, 이후 버전에서 제거될 수 있는 룰 | ❗ |
| nursery | Biome에만 있는 프리셋. 개발단계에 있는 실험적 룰로 구현이 변경되거나 버그가 있을 수 있음  | 🧪 |

## ESLint, Biome 룰 비교 테이블

| 룰 설명 | ESLint 룰 | Biome 룰 |
| --- | --- | --- |
| Hook의 dependency array에 필요한 의존성이 빠지거나 잘못 들어간 경우를 검사한다. | `react-hooks/exhaustive-deps` 👍 | `useExhaustiveDependencies` 👍 |
| Hook을 조건문, 반복문, 중첩 함수 등 잘못된 위치에서 호출하지 않도록 검사한다. | `react-hooks/rules-of-hooks` 👍 | `useHookAtTopLevel` 👍 |
| 컴포넌트가 렌더링마다 새로 생성되는 동적 컴포넌트 패턴을 검사한다. | `react-hooks/static-components` 👍 | `noNestedComponentDefinitions` ✅ |
| React Fast Refresh가 안정적으로 동작하도록 컴포넌트를 export하는 파일에서는 컴포넌트만 export하도록 제한한다. | `react-refresh/only-export-components` 👍 | `useComponentExportOnlyModules` ✅ |
| `button` 요소에 명시적인 `type` 속성이 없는 사용을 금지한다. | `react/button-has-type` ✅ | `useButtonType` 👍 |
| 반복 렌더링/컬렉션 리터럴에서 `key` prop이 누락되는 것을 금지한다. | `react/jsx-key` 👍 | `useJsxKeyInIterable` 👍 |
| JSX 안의 주석이 텍스트 노드로 삽입되는 것을 금지한다. | `react/jsx-no-comment-textnodes` 👍 | `noCommentText` 👍 |
| JSX에서 같은 prop을 중복 선언하는 것을 금지한다. | `react/jsx-no-duplicate-props` 👍 | `noDuplicateJsxProps` 👍 |
| `target="_blank"` 속성을 사용할 때 안전한 `rel` 속성이 없는 것을 금지한다. | `react/jsx-no-target-blank` 👍 | `noBlankTarget` 👍 |
| 불필요한 Fragment 사용을 금지한다. | `react/jsx-no-useless-fragment` ✅ | `noUselessFragments` 👍 |
| 배열 index를 `key`로 사용하는 것을 금지한다. | `react/no-array-index-key` ✅ | `noArrayIndexKey` 👍 |
| `children`을 prop으로 직접 전달하는 것을 금지한다. | `react/no-children-prop` 👍 | `noChildrenProp` 👍 |
| `dangerouslySetInnerHTML` 같은 위험한 HTML 주입 속성 사용을 금지한다. | `react/no-danger` ✅ | `noDangerouslySetInnerHtml` 👍 |
| DOM 요소에서 `children`과 `dangerouslySetInnerHTML`을 동시에 사용하는 것을 금지한다. | `react/no-danger-with-children` 👍 | `noDangerouslySetInnerHtmlWithChildren` 👍 |
| `ReactDOM.render()`의 반환값을 사용하는 것을 금지한다. | `react/no-render-return-value` 👍 | `noRenderReturnValue` 👍 |
| `ref="foo"`나 `this.refs.foo` 같은 legacy string ref 사용을 금지한다. | `react/no-string-refs` 👍 | `noReactStringRefs` 🧪 |
| 알 수 없는 DOM property 또는 잘못된 React attribute 사용을 금지한다. | `react/no-unknown-property` 👍 | `noUnknownAttribute` 🧪 |
| `<img />`, `<br />` 같은 void DOM element가 children을 받는 것을 금지한다. | `react/void-dom-elements-no-children` ✅ | `noVoidElementsWithChildren` 👍 |
| `use server` directive가 붙은 함수는 `async` 함수여야 한다고 요구한다. | `react/async-server-action` ✅ | `useReactAsyncServerFunction` 🧪 |
| JSX에서 boolean 속성 표기 방식을 강제한다. | `react/jsx-boolean-value` ✅ | `noImplicitBoolean` ✅ |
| 리터럴만으로 충분한 경우 불필요한 JSX 표현식을 금지하거나, JSX children/attribute의 리터럴에 표현식 사용을 강제한다. | `react/jsx-curly-brace-presence` ✅ | `useConsistentCurlyBraces` ✅ |
| React Fragment를 축약형 또는 표준형 중 하나로 쓰도록 강제한다. | `react/jsx-fragments` ✅ | `useFragmentSyntax` ✅ |
| JSX prop에서 `.bind()`, 화살표 함수, 함수 표현식을 만들어 넘기는 것을 금지한다. | `react/jsx-no-bind` ✅ | `noJsxPropsBind` 🧪 |
| 렌더링 과정에서 `0`, `NaN`, 빈 문자열 같은 값이 그대로 노출되는 것을 금지한다. | `react/jsx-no-leaked-render` ✅ | `noLeakedRender` 🧪 |
| 같은 식별자나 spread expression을 JSX prop spread로 여러 번 사용하는 것을 금지한다. | `react/jsx-props-no-spread-multi` ✅ | `noDuplicatedSpreadProps` 🧪 |
| React element에서 XML namespace 문법을 사용하는 것을 금지한다. | `react/no-namespace` ✅ | `noJsxNamespace` 🧪 |
| 컴포넌트 안에서 불안정한 nested component를 생성하는 것을 금지한다. | `react/no-unstable-nested-components` ✅ | `noNestedComponentDefinitions` ✅ |
| 함수 안에서 컴포넌트나 custom hook을 정의하는 패턴을 검사한다. ESLint 쪽 `component-hook-factories`는 현재 deprecated 룰로 남아 있다. | `react-hooks/component-hook-factories` ❗ | `noComponentHookFactories` 🧪 |
| React Compiler 설정 옵션이 올바른지 검사한다. | `react-hooks/config` 👍 |  |
| 자식 컴포넌트의 오류를 `try/catch`로 처리하려는 패턴 대신 Error Boundary를 사용해야 하는지 검사한다. | `react-hooks/error-boundaries` 👍 |  |
| React Compiler의 gating mode 설정이 올바른지 검사한다. | `react-hooks/gating` 👍 |  |
| 렌더링 중 전역 값을 할당하거나 변경하는 부작용을 검사한다. | `react-hooks/globals` 👍 |  |
| props, state, Hook 인자, Hook 반환값 등 불변이어야 하는 값을 변경하는 패턴을 검사한다. | `react-hooks/immutability` 👍 |  |
| 수동 또는 자동 메모이제이션과 호환되지 않는 라이브러리 사용을 검사한다. | `react-hooks/incompatible-library` 👍 |  |
| 기존 수동 메모이제이션이 React Compiler에 의해 보존되는지 검사한다. | `react-hooks/preserve-manual-memoization` 👍 |  |
| 컴포넌트와 Hook이 순수해야 한다는 규칙을 깨는 알려진 비순수 함수 호출을 검사한다. | `react-hooks/purity` 👍 |  |
| 렌더링 중 ref를 읽거나 쓰는 등 잘못된 ref 사용을 검사한다. | `react-hooks/refs` 👍 |  |
| Effect 본문에서 동기적으로 `setState`를 호출하는 패턴을 검사한다. | `react-hooks/set-state-in-effect` 👍 |  |
| 렌더링 중 state를 설정해 추가 렌더링이나 무한 렌더링을 유발하는 패턴을 검사한다. | `react-hooks/set-state-in-render` 👍 |  |
| React Compiler가 지원할 계획이 없는 문법 사용을 검사한다. | `react-hooks/unsupported-syntax` 👍 |  |
| `useMemo()` 사용 시 흔한 실수 패턴을 검사한다. | `react-hooks/use-memo` 👍 |  |
| React 컴포넌트 정의에서 `displayName` 누락을 금지한다. | `react/display-name` 👍 |  |
| JSX에서 선언되지 않은 변수를 사용하는 것을 금지한다. | `react/jsx-no-undef` 👍 |  |
| `React`가 JSX 때문에 사용되었는데 unused로 잘못 표시되는 것을 방지한다. | `react/jsx-uses-react` 👍 |  |
| JSX에서 사용된 변수가 unused로 잘못 표시되는 것을 방지한다. | `react/jsx-uses-vars` 👍 |  |
| deprecated된 React 메서드 사용을 금지한다. | `react/no-deprecated` 👍 |  |
| `this.state`를 직접 변경하는 것을 금지한다. | `react/no-direct-mutation-state` 👍 |  |
| `findDOMNode` 사용을 금지한다. | `react/no-find-dom-node` 👍 |  |
| `isMounted` 사용을 금지한다. | `react/no-is-mounted` 👍 |  |
| 마크업 안에 escape되지 않은 HTML entity가 등장하는 것을 금지한다. | `react/no-unescaped-entities` 👍 |  |
| React 컴포넌트 정의에서 props validation 누락을 금지한다. | `react/prop-types` 👍 |  |
| JSX 사용 시 `React`가 scope 안에 없으면 금지한다. | `react/react-in-jsx-scope` 👍 |  |
| class 컴포넌트의 `render` 함수가 값을 반환하도록 강제한다. | `react/require-render-return` 👍 |  |
| 대문자로 시작하는 함수나 메서드를 JSX가 아니라 일반 함수 호출처럼 사용하는 패턴을 검사한다. | `react-hooks/capitalized-calls` ✅ |  |
| Effect dependency가 빠짐없이 포함되고 불필요한 값은 없는지 검사한다. | `react-hooks/exhaustive-effect-dependencies` ✅ |  |
| `fbt` 사용 방식이 올바른지 검사한다. | `react-hooks/fbt` ✅ |  |
| React Compiler 기준으로 Rules of Hooks 위반을 검사한다. 다만 기존 `rules-of-hooks`와 중복되어 preset에서는 꺼져 있다. | `react-hooks/hooks` ✅ |  |
| React Compiler 내부 invariant 위반을 검사한다. | `react-hooks/invariant` ✅ |  |
| `useMemo()`와 `useCallback()`의 dependency array가 충분하고 불필요한 값을 포함하지 않는지 검사한다. | `react-hooks/memo-dependencies` ✅ |  |
| Effect dependency가 메모이즈되어 있는지 검사한다. | `react-hooks/memoized-effect-dependencies` ✅ |  |
| Effect 안에서 state로부터 값을 파생시키는 패턴을 검사한다. | `react-hooks/no-deriving-state-in-effects` ✅ |  |
| 다른 React Compiler 관련 룰을 suppression으로 무시하는 패턴을 검사한다. | `react-hooks/rule-suppression` ✅ |  |
| React Compiler가 invalid syntax로 분류하는 문법 문제를 검사한다. | `react-hooks/syntax` ✅ |  |
| React Compiler의 미구현 기능 또는 TODO성 진단을 나타낸다. | `react-hooks/todo` ✅ |  |
| boolean prop의 이름 규칙을 일관되게 강제한다. | `react/boolean-prop-naming` ✅ |  |
| `checked`를 사용할 때 `onChange` 또는 `readOnly` 속성도 함께 사용하도록 강제한다. | `react/checked-requires-onchange-or-readonly` ✅ |  |
| 모든 `defaultProps`가 대응되는 non-required `PropType`을 갖도록 강제한다. | `react/default-props-match-prop-types` ✅ |  |
| props, state, context에 대해 구조 분해 할당 사용 방식을 일관되게 강제한다. | `react/destructuring-assignment` ✅ |  |
| 컴포넌트에 특정 prop을 사용하는 것을 금지한다. | `react/forbid-component-props` ✅ |  |
| DOM 노드에 특정 prop을 사용하는 것을 금지한다. | `react/forbid-dom-props` ✅ |  |
| 특정 요소 사용을 금지한다. | `react/forbid-elements` ✅ |  |
| 다른 컴포넌트의 `propTypes`를 사용하는 것을 금지한다. | `react/forbid-foreign-prop-types` ✅ |  |
| 특정 `propTypes` 사용을 금지한다. | `react/forbid-prop-types` ✅ |  |
| 모든 `forwardRef` 컴포넌트가 `ref` 파라미터를 포함하도록 요구한다. | `react/forward-ref-uses-ref` ✅ |  |
| 함수 컴포넌트를 어떤 함수 형태로 작성할지 강제한다. | `react/function-component-definition` ✅ |  |
| `useState` 훅의 값과 setter 변수를 구조 분해하고, 이름을 대칭적으로 짓도록 보장한다. | `react/hook-use-state` ✅ |  |
| `iframe` 요소에 `sandbox` 속성을 사용하도록 강제한다. | `react/iframe-missing-sandbox` ✅ |  |
| JSX 속성 및 표현식의 중괄호 내부 공백을 강제하거나 금지한다. | `react/jsx-child-element-spacing` ✅ |  |
| JSX 닫는 괄호의 위치를 강제한다. | `react/jsx-closing-bracket-location` ✅ |  |
| 여러 줄 JSX에서 닫는 태그의 위치를 강제한다. | `react/jsx-closing-tag-location` ✅ |  |
| JSX 속성 및 표현식의 중괄호 안 줄바꿈을 일관되게 강제한다. | `react/jsx-curly-newline` ✅ |  |
| JSX 속성 및 표현식의 중괄호 안 공백을 강제하거나 금지한다. | `react/jsx-curly-spacing` ✅ |  |
| JSX 속성의 `=` 주변 공백을 강제하거나 금지한다. | `react/jsx-equals-spacing` ✅ |  |
| JSX를 포함할 수 있는 파일 확장자를 제한한다. | `react/jsx-filename-extension` ✅ |  |
| JSX 첫 번째 prop의 위치를 강제한다. | `react/jsx-first-prop-new-line` ✅ |  |
| JSX 이벤트 핸들러 이름 규칙을 강제한다. | `react/jsx-handler-names` ✅ |  |
| JSX 들여쓰기를 강제한다. | `react/jsx-indent` ✅ |  |
| JSX prop 들여쓰기를 강제한다. | `react/jsx-indent-props` ✅ |  |
| JSX 최대 중첩 깊이를 강제한다. | `react/jsx-max-depth` ✅ |  |
| JSX 한 줄에 올 수 있는 prop 개수를 제한한다. | `react/jsx-max-props-per-line` ✅ |  |
| JSX 요소와 표현식 뒤의 줄바꿈을 요구하거나 금지한다. | `react/jsx-newline` ✅ |  |
| 불필요한 rerender를 유발하는 JSX context provider value 사용을 금지한다. | `react/jsx-no-constructed-context-values` ✅ |  |
| JSX 안에서 문자열 리터럴 사용을 금지한다. | `react/jsx-no-literals` ✅ |  |
| `javascript:` URL 사용을 금지한다. | `react/jsx-no-script-url` ✅ |  |
| JSX 표현식을 한 줄에 하나씩 두도록 요구한다. | `react/jsx-one-expression-per-line` ✅ |  |
| 사용자 정의 JSX 컴포넌트 이름을 PascalCase로 쓰도록 강제한다. | `react/jsx-pascal-case` ✅ |  |
| 인라인 JSX prop 사이에 여러 공백이 들어가는 것을 금지한다. | `react/jsx-props-no-multi-spaces` ✅ |  |
| JSX prop spreading 사용을 금지한다. | `react/jsx-props-no-spreading` ✅ |  |
| JSX props를 알파벳순으로 정렬하도록 강제한다. | `react/jsx-sort-props` ✅ |  |
| JSX 여는/닫는 괄호 주변 공백을 강제한다. | `react/jsx-tag-spacing` ✅ |  |
| 여러 줄 JSX를 괄호로 감싸지 않는 것을 금지한다. | `react/jsx-wrap-multilines` ✅ |  |
| `setState` 안에서 `this.state`에 접근하는 것을 금지한다. | `react/no-access-state-in-setstate` ✅ |  |
| 공백 없이 인접한 inline element를 금지한다. | `react/no-adjacent-inline-elements` ✅ |  |
| lifecycle method를 class field arrow function이 아니라 prototype method로 작성하도록 요구한다. | `react/no-arrow-function-lifecycle` ✅ |  |
| `componentDidMount`에서 `setState`를 사용하는 것을 금지한다. | `react/no-did-mount-set-state` ✅ |  |
| `componentDidUpdate`에서 `setState`를 사용하는 것을 금지한다. | `react/no-did-update-set-state` ✅ |  |
| 유효하지 않은 HTML attribute 사용을 금지한다. | `react/no-invalid-html-attribute` ✅ |  |
| 한 파일 안에 여러 컴포넌트를 정의하는 것을 금지한다. | `react/no-multi-comp` ✅ |  |
| 함수 컴포넌트의 기본 파라미터로 참조 타입 변수를 사용하는 것을 금지한다. | `react/no-object-type-as-default-prop` ✅ |  |
| `React.PureComponent`를 상속한 컴포넌트에서 `shouldComponentUpdate`를 사용하는 것을 금지한다. | `react/no-redundant-should-component-update` ✅ |  |
| `setState` 사용을 금지한다. | `react/no-set-state` ✅ |  |
| stateless function component에서 `this`를 사용하는 것을 금지한다. | `react/no-this-in-sfc` ✅ |  |
| React API나 lifecycle 이름에서 흔한 오타를 금지한다. | `react/no-typos` ✅ |  |
| unsafe lifecycle method 사용을 금지한다. | `react/no-unsafe` ✅ |  |
| class component에서 사용되지 않는 메서드 선언을 금지한다. | `react/no-unused-class-component-methods` ✅ |  |
| 사용되지 않는 `propTypes` 정의를 금지한다. | `react/no-unused-prop-types` ✅ |  |
| 사용되지 않는 state 정의를 금지한다. | `react/no-unused-state` ✅ |  |
| `componentWillUpdate`에서 `setState`를 사용하는 것을 금지한다. | `react/no-will-update-set-state` ✅ |  |
| React 컴포넌트를 ES5 또는 ES6 class 방식 중 지정한 방식으로 작성하도록 강제한다. | `react/prefer-es6-class` ✅ |  |
| exact prop type 정의를 선호하도록 강제한다. | `react/prefer-exact-props` ✅ |  |
| props를 read-only로 정의하도록 강제한다. | `react/prefer-read-only-props` ✅ |  |
| state가 없는 컴포넌트를 pure function으로 작성하도록 강제한다. | `react/prefer-stateless-function` ✅ |  |
| required가 아닌 모든 prop에 `defaultProps` 정의를 강제한다. | `react/require-default-props` ✅ |  |
| React 컴포넌트에 `shouldComponentUpdate` 메서드가 있도록 강제한다. | `react/require-optimization` ✅ |  |
| children이 없는 컴포넌트에 불필요한 닫는 태그를 사용하는 것을 금지한다. | `react/self-closing-comp` ✅ |  |
| 컴포넌트 메서드 순서를 강제한다. | `react/sort-comp` ✅ |  |
| `defaultProps` 선언을 알파벳순으로 정렬하도록 강제한다. | `react/sort-default-props` ✅ |  |
| `propTypes` 선언을 알파벳순으로 정렬하도록 강제한다. | `react/sort-prop-types` ✅ |  |
| class component의 state 초기화 방식을 강제한다. | `react/state-in-constructor` ✅ |  |
| React 컴포넌트의 static property를 어디에 배치할지 강제한다. | `react/static-property-placement` ✅ |  |
| `style` prop 값이 객체여야 한다고 강제한다. | `react/style-prop-object` ✅ |  |
| `useMemo()`가 항상 값을 반환하는지, 그리고 그 결과가 실제로 사용되는지 검사한다. | `react-hooks/void-use-memo` 🧪 |  |
| `defaultProps` 선언을 알파벳순으로 정렬하도록 강제한다. | `react/jsx-sort-default-props` ❗ |  |
| JSX 닫는 괄호 앞 공백을 강제한다. | `react/jsx-space-before-closing` ❗ |  |
| React 19 기준으로 `forwardRef` 대신 `ref`를 prop으로 받는 방식을 권장한다. |  | `noReactForwardRef` ✅ |
| `props.foo = ...`처럼 props 객체를 직접 수정하는 것을 금지한다. |  | `noReactPropAssignments` ✅ |
| class component 대신 function component 사용을 권장한다. |  | `useReactFunctionComponents` ✅ |
| JSX에서 고정 문자열 `id` 사용을 막고 `useId()` 사용을 유도한다. |  | `useUniqueElementIds` ✅ |
| JSX text 안에서 `${value}`처럼 템플릿 리터럴에서 옮겨온 `$`가 실수로 남은 경우를 잡는다. |  | `noJsxLeakedDollar` 🧪 |
| `async`/`defer` 없는 동기 script 사용을 금지한다. |  | `noSyncScripts` 🧪 |

# 결론

ESLint는 커스텀 룰의 유연성과 기본 플러그인 생태계가 풍부하다는 장점을 갖고 있고, Biome는 빠른 속도와 린터+포매터 형태로 설정이 간편하다는 장점을 갖고 있다.

AI 생성 코드의 세밀한 제어가 목적이면 ESLint를 택하는 게 나을 것 같다.
