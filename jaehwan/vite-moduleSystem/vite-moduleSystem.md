
# 배경

프로젝트를 진행하며 개발 기간이 길어질수록 코드의 양이 늘어나는 것은 물론이고 여러 라이브러리를 사용하며 node_modules의 용량도 기하급수적으로 커졌습니다. 제 프로젝트를 몇 개 찾아보니 node_modules의 용량이 300mb, 600mb 정도인데 둘 다 길어봤자 1년 정도의 프로젝트입니다. 아마 대부분 제 프로젝트보다 용량이 높다면 높지 낮지는 않을 것이라 생각이 듭니다.

제 마지막 webpack 프로젝트가 node_modules의 용량이 360mb 정도였고 dev server 부팅 시간이 약 8초가 걸렸습니다. 코드를 수정하면 HMR(Hot Module Replacement)이 1초 정도 걸렸던 것 같습니다. 아무래도 8초의 부팅 시간은 매우 답답하였고 1초의 화면 렌더링 시간도 화면이 잠깐 보이지 않아서 답답했던 기억이 있습니다. webpack에서는 HMR을 지원하여 변경사항이 수정되면 변경된 것을 업데이트하여 보여주는 기능을 지원하지만 그렇게 빠르다고는 못 느낍니다. 그래서 해결책을 찾았고 그것이 vite입니다.

### vite

**간단한 설명**

1. 애플리케이션의 모듈을 **dependencies**와 **source code** 두 가지로 나누어 **source code**만 감시할 수 있습니다.
2. pre-bundling이라는 기술을 사용하여 빠릅니다.
3. Esbuild, Rollup을 사용하여 번들링과 빌드가 빠릅니다.
4. Native ESM을 사용하여 브라우저가 번들러의 작업을 일부 담당하여 더더더 빠릅니다.

제가 궁금한 부분인 DevServer, HMR와 연관 지어본다면 다음과 같습니다.

### vite의 DevServer

DevServer 부팅과 관련하여 vite는 dependencies 즉 node_modules를 정적인 파일로 인식하고 HMR에서 제외합니다. 즉 dependencies를 추적하지 않겠다는 의미로 압축이 가능하다는 의미이기도 합니다. 그리고 dev server 부팅 속도를 높이기 위해 사전 번들링을 통해 dependencies를 미리 하나의 파일로 압축시킵니다. 그리고 Esbuild를 통해 사전 번들링의 속도도 향상됩니다. ES6에서 추가된 Native ESM을 통해 번들이 아닌 파일을 직접 불러들입니다.

![](https://velog.velcdn.com/images/jaehwan/post/33749da6-addf-4f01-8ba5-44336cc5f138/image.png)

![](https://velog.velcdn.com/images/jaehwan/post/242ed379-3449-48d0-b72e-c97fb111003b/image.png)

참고 : https://ko.vitejs.dev/guide/why.html

그냥 보는 것보다 실행 결과를 보는 것이 좋을 것 같아서 main.js, App.jsx, Depth1.jsx, Depth2.jsx의 파일로 이루어져 있는 webpack과 vite를 보겠습니다.
<br>

### webpack

**webpack html**

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web site created using create-react-app" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>React App</title>
    <script defer="defer" src="/static/js/main.2ac57550.js"></script>
    <link href="/static/css/main.f855e6bc.css" rel="stylesheet">
</head>

<body><noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>

</html>
```

- script 태그에 type이 없는 것을 알 수 있습니다.

**webpack Dev Server**

![](https://velog.velcdn.com/images/jaehwan/post/ea9f9bfa-efd4-4b54-a7ee-0b9621a2f9d9/image.png)

![](https://velog.velcdn.com/images/jaehwan/post/aa72fbe3-0aad-41ad-9e63-5db00df774b5/image.png)


- bundle.js로 js를 모두 묶어서 devServer로 실행하는 것을 볼 수 있습니다.
<br>

## vite

**vite html**

```jsx
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script type="module" crossorigin src="/assets/index-BPgokE0a.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DiwrgTda.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

```

- script type=”module”을 볼 수 있습니다.

**vite Dev Server**

![vite 네트워크 상태](https://velog.velcdn.com/images/jaehwan/post/237e2ec6-428c-40fb-b4db-fa5f6a95b9d1/image.png)

![vite 네트워크 요청](https://velog.velcdn.com/images/jaehwan/post/51208510-b276-4915-bff9-6caff050591b/image.png)

![depth1 네트워크 요청](https://velog.velcdn.com/images/jaehwan/post/930b11e6-ffc1-485c-b552-86ce6e00456d/image.png)

![depth2 네트워크 요청](blob:https://velog.io/9ede7253-974b-4eba-a29d-3bebcb155d47)


- 묶는 과정을 하지 않고 개별적으로 내보내고 있습니다.

**webpack은 왜 이렇게 동작할지 간단한 추측.**

1. 여러 개의 JS 파일을 하나로 묶으면 트리셰이킹을 하는 등 여러모로 용량을 최대한 줄여서 속도를 빠르게 할  수 있다.
2.  JSX, Vue와 같은 파일을 그대로 사용할 수 없으니 babel 같은 컴파일러를 통해 JS로 변환하기 위함도 있고 겸사겸사 브라우저 호환성도 챙길 수 있다.
3. TCP 통신의 같은 url 동시 사용이 6개 제한 일 것이다.(이전에는 더욱 적었기 때문에) Css, Js, Html만 하여도 3개이니 최대한 줄이는 목적도 있지 않을까?

webpack과 vite는 번들러라고 불리지만 서로가 전혀 다르게 작동하고 있습니다. 왜 이렇게 달라졌는 지 근본적인 원인부터 찾아보겠습니다.
<br>

# 모듈 시스템

모듈시스템이 없던 시절 어떻게 JS를 모듈화 시켰을까요?

### script

```jsx
<script src="a.js" />
<script src="b.js" />
<script>
// html 생성되기전에 접근가능
let c = "c";

console.log(c)
</script>
```

- script는 전역 스코프를 공유합니다. 예를 들면
    - a.js에서 c=”a”라고 입력하면 console의 결과는 a가 된다는 것입니다.
- 이러한 결과 변수명이 겹치는 네임스페이스나 의존성 등에 문제가 생길 수 있습니다. 그래서 등장한 것이 IIFE입니다.

>💡 **Script에 대한 추가 설명**
ES6부터는 module type으로 설정하여 스코프 분리가 가능합니다.(native ESM)
```jsx
<script src="a.js"/>
<script type="module" src="b.js" />
```
- 위의 두 스크립트는 실행 속도가 다릅니다.
- a : html이 완전히 생성되기 전에 접근하여 window.onload를 사용하지 않고 DOM에 접근할 경우 에러가 생길 수 있습니다.
- b: 무조건 html이 생성된 후 접근합니다.
왜 이렇게 다른 실행 속도를 가지게 됐을까요? ESM 모듈 설명에서 해당 부분을 알 수 있습니다.

</aside>

### IIFE(**Immediately-Invoked Function Expression)**

자바스크립트에서 모든 함수는 호출될 때 새로운 실행 컨텍스트를 생성합니다. 함수 내에서 정의된 변수와 함수는 해당 컨텍스트 내부에서만 접근할 수 있고 외부에서는 접근할 수 없으므로 함수를 호출하면 매우 쉽게 개인정보를 보호할 수 있습니다.

- 이러한 특징을 활용하여 함수를 바로 실행시키고 버린다면? 전역 스코프가 아닌 변수나 함수를 획득할 수 있습니다.
- 같이 잘 활용한 것 : 모듈 패턴
    - 클로저 개념을 활용하여 만들어진 패턴으로 return으로 외부에 함수를 공유하고 return 하지 않은 것을 접근하지 못하게 만들어(클로저) 모듈과 같이 동작하는 패턴이다.
        - return이 모듈의 export와 똑같이 동작한다

IIFE의 가장 큰 장점 중 하나는 식별자를 사용하지 않고 이름 없는 또는 익명 함수 표현식이 즉시 호출되기 때문에 현재 스코프를 오염시키지 않고 클로저를 사용할 수 있다는 점입니다.

>💡 "iffy"라고 발음한다고 합니다.(Ben Alman)

<br>

 **모듈 패턴**

```jsx
var counter = (function(){
  var i = 0;

  return {
    get: function(){
      return i;
    },
    set: function( val ){
      i = val;
    },
    increment: function() {
      return ++i;
    }
  };
}());

counter.get(); // 0
counter.set( 3 );
counter.increment(); // 4
counter.increment(); // 5

counter.i; // undefined
i; // ReferenceError
```

```html
<script>
	let c = "c" // 전역변수
</script>
<script src="a.js" /> // 모듈 패턴
<script src="b.js" /> // 모듈 패턴
```

모듈 패턴에도 한계가 있습니다. 만약 a.js, b.js 파일을 모두 모듈 패턴을 사용한다고 하면 이들 간의 변수의 공유는 어떻게 할까요? 바로 전역 변수를 사용하여 공유하는 것입니다.

어떤 부분이 한계점일까요?

1. 여전히 전역의 변수는 어떻게 변할지 모르니 조심히 사용해야 합니다.

2. 전역의 변수 혹은 함수가 어떤 script와 종속적인지 알 수 없습니다.

*모듈시스템의 경우 export, import와 같은 문법을 통해 어디에 있는 어떤 함수 혹은 변수가 종속되었는지 알려주는 역할까지 합니다.*
<br>

## CommonJS와 ES Module

여러 모듈시스템이 있지만 현재 가장 많이 쓰이고 webpack과 vite가 사용하는 CJS, ESM을 알아보겠습니다.

### ESM

esm은 모듈을 3단계로 단계가 나누어져 있습니다.

### **1. construction**

**Loader**
먼저 파일을 가져와야 합니다. 그러기 위해서는 엔트리 포인트 파일을 먼저 찾고 import 문을 보고 종속성을 찾아갑니다.

```jsx
import {count} from "./counter.js"
```

- import from의 문자열을 모듈 지정자라고 합니다.
- 로더에게 모듈 지정자를 통해 다음 모듈을 찾을 수 있는 위치를 알려줍니다.

![](https://velog.velcdn.com/images/jaehwan/post/66aefd95-a5d9-4473-8202-44a9eff86628/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

파일을 가져오는 것은 로더의 역할입니다.

로더는 브라우저의 경우 HTML spec에 해당합니다. 하지만 html spec임에도 불구하고 ES 모듈 메서드인 ParseModule, Module.Instantiate, Module.Evaluate를 적절히 호출합니다. 
<br>

**ParseModule**
파일을 가져오고 ParseModule을 통해 파싱 하여 종속성에 대한 정보를 가져옵니다.

![](https://velog.velcdn.com/images/jaehwan/post/a79c223d-f9ab-446a-8b58-5e6723f4655e/image.png)

참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

위 이미지를 간단하게 정리하면

1. JS 파일을 읽고 파싱 합니다.

2. JS 파일의 module record가 생성됩니다.

3. module record는 브라우저가 읽을 수 있기 때문에 종속성에 대해 찾을 수 있게 되었습니다.

4. 종속성을 찾고 해당 JS 파일을 파싱 합니다.
<br>

**Import, Require**

- 둘의 방식은 어떻게 다를까요?

![](https://velog.velcdn.com/images/jaehwan/post/2bc06d8c-4076-49f1-b57a-853c2cb9f30f/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
<br>

**CJS Require의 문제**

- 위의 그림은 CJS가 사용하는 require의 단점을 보여줍니다. require 즉 종속성을 읽자마자 더 아래의 파일을 보지 않고 먼저 종속성 파일을 읽으러 갑니다. 이 방식은 마지막 단계에서 문제가 생기는 원인이 되기도 하는데 바로 변수를 읽는 순간 변수는 메모리에 입력됩니다. 하지만 읽는 순간에는 변수에 값이 없으므로 undefined가 입력되고 잔존하게 됩니다.(호이스팅과 비슷하다) 더 자세한 것은 **Evaluation 단계에 설명이 있습니다.**

**ES6의 import는?**
- ES 모듈은 이와 달리 미리 모듈 그래프를 작성합니다. 해당 방식은 한 번에 처리하기 위한 과정으로 require과 달리 변숫값을 가지고 있지 않습니다.(TDZ와 비슷하다) 그래서 import는 require처럼 변수를 사용한 주소를 사용하지 못합니다.

![static import](https://velog.velcdn.com/images/jaehwan/post/c75b81e8-4a17-4a77-98b2-929db743cbf4/image.png)

참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

- 물론 대체 방법이 존재합니다. 가끔은 모듈의 경로에 변수를 사용해야 할 수 있기 때문에 다이나믹 import를 지원합니다.

<br>

**Dynamic Import**

![dynamic import](https://velog.velcdn.com/images/jaehwan/post/31bdd12f-a55d-4e00-b946-5fdb490a0ebc/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

```jsx
const {func} = await import(path); // 다이나믹 import는 promise를 반환합니다.
```

동적으로 import 한 모듈은 새로운 그래프를 생성하게 됩니다.

- 이 두 그래프에 동시에 존재하는 모듈은 모듈 인스턴스를 공유하게 됩니다. - 라이브 바인딩을 통해 같은 메모리를 바라봐서 그런듯하다.
- 특정 전역 스코프의 각 모듈에는 하나의 모듈 인스턴스만 존재합니다.

로더는 모듈맵을 이용해서 캐시를 관리합니다. 
<br>
**module map**
각 글로벌은 별도의 모듈 맵에서 해당 모듈을 추적합니다.

![](https://velog.velcdn.com/images/jaehwan/post/b1e4a523-f35e-467b-bb9f-ae3afd5a304e/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

로더가 URL을 보고 바로 파일을 가져오지 않습니다.

- 먼저 로더가 URL을 모듈 맵에 넣습니다.
- 파일을 가져오고 있다는 메모를 남깁니다.(fetching)
- 요청을 전송하고 파일 가져오기를 시작합니다.

이러한 모듈 맵은 파일 추적의 목적도 있지만 캐싱 하는 데에도 사용됩니다.
<br>

**Parsing**
![parsing](https://velog.velcdn.com/images/jaehwan/post/22194ce4-a7de-45c3-8222-b5c7b5d7fa84/image.png)

![parsing record in moduleMap](https://velog.velcdn.com/images/jaehwan/post/5955f62a-8dae-442d-825d-0ffa5abadf76/image.png)



참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
<br>

module record가 생성되면 module map에 배치됩니다.

여러 요청이 있을 때마다 로더가 모듈 맵에서 해당 레코드를 가져옵니다.(캐싱)
<br>

**parse goal**
파싱 구간에서는 “use strict”가 있는 것처럼 파싱 합니다. 이것을 “parse goal”이라고 합니다.

같은 파일을 파싱 하지만 모드(use strict or sloppy mode) 가 다르면 다른 결과가 생길 수 있기 때문에 파싱을 시작하기 전에 어떤 종류의 파일(모듈인지 아닌지)을 파싱 할지 알아야 합니다.

브라우저에서는 간단하게 type=”module”을 입력하기만 하면 됩니다. 브라우저는 모듈로 파싱함을 자동으로 알게 됩니다. 모듈만 가져올 수 있으므로 모든 imports 파일도 모듈로 인식하게 됩니다.

### **2. Instantiation**

![Instantiation](https://velog.velcdn.com/images/jaehwan/post/b9ca4306-b6c4-4e1b-92b7-85e5cb5a63bd/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
<br>

**export 연결**
인스턴스는 코드와 상태를 결합합니다.
_상태는 메모리에 존재하므로 메모리에 코드를 연결합니다_

1. JS 엔진이 모듈 환경 레코드를 생성합니다.
    1. 모듈 환경 레코드 : 모듈 레코드의 변수를 관리합니다.
2. 모든 export에 대한 메모리를 찾습니다.
3. 모듈 환경 레코드는 메모리의 값과 연관되어 있는지 추적합니다.
4. 실제 값은 **Evaluation 단계에서** 채워지기 때문에 ****아직 메모리의 값을 가져오지 않습니다. 
5. Export로 선언된 함수는 이 단계에서 초기화됩니다.
6. 모듈 그래프를 인스턴스화하기 위해 엔진은  first post-order traversal 작업을 수행합니다. 즉, 다른 것에 의존하지 않는 그래프의 가장 아래에 있는 종속성까지 내려가서 해당 export를 설정합니다.

![export](https://velog.velcdn.com/images/jaehwan/post/f12348c0-fc3d-4499-b3d7-3d903e688967/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
<br>

**import 연결**
export 연결이 완료된다면 다시 한 단계 위로 올라와 해당 모듈에서 import를 연결합니다.

export와 import 모두 메모리에서 같은 위치를 가리킵니다. 이것을 라이브 바인딩이라고 합니다.
<br>

**라이브 바인딩**
두 모듈 모두 메모리에서 동일한 위치를 가리킵니다

- export 모듈에서 값을 변경하면 import 모듈에 해당 변경 사항이 표시됩니다.
- 값을 내보내는 모듈은 언제든지 해당 값을 변경할 수 있지만, 값을 가져오는 모듈은 가져오는 모듈의 값을 변경할 수 없습니다. 즉, 모듈이 객체를 가져오면 해당 객체에 있는 속성 값을 변경할 수 있습니다.
<br>

**라이브 바인딩 사용 이유**
코드를 실행하지 않고 모든 모듈을 연결할 수 있기 때문입니다.
- 주기적 종속성 : 변경사항에 대하여 export와 import가 항상 같습니다.

이 단계가 끝나면 모든 인스턴스와 export/import 변수의 메모리 위치가 연결됩니다.
<br>


> 💡 **CommonJS는 라이브 바인딩을 사용하지 않습니다.**
  CommonJS에서는 내보낼 때 전체 Export 개체가 복사됩니다. 즉, 내보내는 모든 값은 복사본입니다.
Export 모듈이 나중에 해당 값을 변경하면 import 모듈은 해당 변경 사항을 볼 수 없습니다.
![](https://velog.velcdn.com/images/jaehwan/post/aa7ab108-0670-420b-a8ea-28e377c685aa/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
<br>

### **3. Evaluation**

마지막 단계로 메모리 값을 채우는 것입니다.

JS 엔진은 최상위 코드, 즉 함수 외부에 있는 코드를 실행하여 이 작업을 수행합니다.

이러한 과정에서 부작용이 발생할 수 있습니다. 예를 들면 모듈이 서버를 호출한다던가?

![top level Server code](https://velog.velcdn.com/images/jaehwan/post/fddc134a-ac9e-4495-b876-83749b32ed7f/image.png)


부작용이 발생할 가능성이 있으므로 모듈 평가는 한 번만 진행합니다.

모듈 맵을 사용하는 이유 중 하나가 바로 이러한 부분입니다. 모듈 맵은 각 모듈에 대해 하나의 모듈 레코드만 존재하도록 표준 URL로 모듈을 캐시 합니다.

따라서 각 모듈은 한 번만 실행됩니다. 인스턴스화와 마찬가지로 이 작업은 depth first post-order 방식으로 수행됩니다.

**CommonJS에서 먼저 어떻게 실행되는지 확인해 보겠습니다.**

![](https://velog.velcdn.com/images/jaehwan/post/dbb63f8f-f7f3-4be5-b41f-029287386256/image.png)

![](https://velog.velcdn.com/images/jaehwan/post/d72d7eef-571a-45f8-afb4-921bc59a066e/image.png)


참고 : https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/

CommonJS의 require은 변수에 할당하게 됩니다. 코드를 읽어 내려갈 때 변수 할당, 값 할당 두 가지의 단계가 있는데 ESM은 **Instantiation 단계에서** 라이브 바인딩으로 두 가지 단계를 한 번에 적용합니다.

CommonJS는 두 가지 단계를 JS 엔진이 코드를 읽어 내려갈 때 진행됩니다. 즉 최상위 코드에서 순차적으로 읽어 내려가기 때문에 위의 message 변수는 main.js에서 가져오지만 undefined인 상태로 가져오게 됩니다.

이후에 counter.js를 전부 읽고 다시 main.js로 돌아가게 되면
<br>

## ESM을 사용하는 Vite

![](https://velog.velcdn.com/images/jaehwan/post/764458cd-3c43-49b9-ac83-265bd121dd56/image.png)

참고: https://ko.vitejs.dev/guide/why.html

vite는 따로 번들로 압축시키지 않고 import를 통해 모듈을 전부 불러옵니다. 서버의 역할은 html 파일을 송출시키는 것이고 html에 포함되어 있는 import 문이 동작하면서 http 통신을 하게 됩니다. 그럼 DevServer가 켜지며 동시에 소스코드에 해당하는 파일들을 다운로드하게 되어 유저에게 빠르게 화면을 보여줍니다.

## CommonJS를 사용하는 webpack

이전에 이러한 방식을 사용하지 못한 이유는 JS가 자체적으로 import를 지원해 주지 않았기 때문에 CommonJS 같은 외부의 모듈시스템을 통해 import를 해야 했습니다.

외부 모듈시스템을 사용하여 개발한 코드는 따로 파싱을 해야 브라우저가 읽을 수 있기 때문에 번들링하고 그 결과물을 devServer로 보여주었습니다.

# 결론

모듈시스템을 알고 나니 webpack과 vite가 서로 왜 그렇게 다르게 만들어졌는지 이해가 됩니다. JS, 브라우저가 발전하고 익스플로러의 시대가 끝나면서 크로스 브라우징 문제도 어느 정도 잡혔습니다. 이제 DevServer는 번들링 하지 않은 파일을 송출해도 된다는 의미로 여겨지며 여러모로 vite는 자연스러운 결과물이 아닌가 생각이 듭니다.(대단하지 않다는 뜻은 아닙니다!)

### 그래서 무엇을 사용해야할까?

- 새로 시작하는 프로젝트라면 vite를 사용하는 것이 좋을 것 같습니다. 하지만 모듈을 native ESM으로 변경하여 사용하는 만큼 기존에 사용하는 라이브러리가 vite에서 문제없이 동작하는지는 검증이 필요할 듯합니다.

## 더 알아봐야할 문제, 다음 포스팅

### Non-plain JavaScript Code

하지만 아직 해결되지 않은 의문이 남아있습니다. vite는 JSX, Vue 같은 Non-plain JS 소스 코드를 번들링 하지 않고 http 요청으로 불러온다는 점입니다.

![](https://velog.velcdn.com/images/jaehwan/post/27552aab-4606-4b92-b675-12ad7a5d90c0/image.png)

![](https://velog.velcdn.com/images/jaehwan/post/f2335598-d3b0-499a-b11a-96bdb9505446/image.png)


### HMR 속도의 차이

vite가 HMR 속도가 더 빠르게 느껴집니다. vite로 더 큰 사이즈의 프로젝트를 경험해 봤습니다. 하지만 HMR 속도는 처음과 비교하여 크게 다르지 않았습니다. webpack은 프로젝트의 사이즈가 HMR에 영향을 미칩니다.

### 출처 :

**JavaScript 표준을 위한 움직임: CommonJS와 AMD**

https://d2.naver.com/helloworld/12864

**CommonJS and the History of Javascript Modularity**

https://medium.com/@lisa.berteau.smith/commonjs-and-the-history-of-javascript-modularity-63d8518f103e

**JS 모듈소개**

https://ko.javascript.info/modules-intro

Ben Alman : **Immediately-Invoked Function Expression (IIFE)**

https://web.archive.org/web/20171201033208/http://benalman.com/news/2010/11/immediately-invoked-function-expression/#iife

**RequireJS - AMD의 이해와 개발**

https://d2.naver.com/helloworld/591319

**Vite를 사용해야 하는 이유**

https://ko.vitejs.dev/guide/why.html

**ES modules: A cartoon deep-dive**

https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
