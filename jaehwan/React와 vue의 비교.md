블로그 링크 : https://velog.io/@jaehwan/React-%EC%99%9C-%EC%9D%B4%EB%A0%87%EA%B2%8C-%EC%96%B4%EB%A0%A4%EC%9A%B8%EA%B9%8C..-by-Vue-%EA%B0%9C%EB%B0%9C%EC%9E%90#vue-%EC%A0%95%EB%A6%AC

저는 React 개발을 1년 Vue 개발을 2년을 했습니다. 처음 접한 React의 렌더링은 제가 생각했던 것과는 다르게 움직이며 불편하다는 생각을 하며 사용했습니다. 그리고 1년이 지나고 어쩌다 Vue를 사용하게 되며 한 가지 의문이 들었습니다. "Vue는 왜 안 불편하지? React를 사용했던 것과는 다른 데?"라는 생각이 문득 들었고 이 글을 쓰게 되었습니다.

# Vue가 쉬운 이유, React가 어려운 이유
---
### vue의 실제 동작

[CODE 직접 보기](https://codesandbox.io/p/devbox/vu-3jdjk8?embed=1&file=%2Fsrc%2FApp.vue&showConsole=true&layout=%257B%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522rootPanelGroup%2522%253A%257B%2522direction%2522%253A%2522horizontal%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522id%2522%253A%2522ROOT_LAYOUT%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522UNKNOWN%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522clp9d4onp00083b6i52ygjv02%2522%252C%2522sizes%2522%253A%255B70%252C30%255D%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522EDITOR%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522EDITOR%2522%252C%2522id%2522%253A%2522clp9d4onp00033b6iz8eqaxrg%2522%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522direction%2522%253A%2522horizontal%2522%252C%2522id%2522%253A%2522SHELLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522SHELLS%2522%252C%2522id%2522%253A%2522clp9d4onp00053b6i405orxhf%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%257D%252C%257B%2522type%2522%253A%2522PANEL_GROUP%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522direction%2522%253A%2522vertical%2522%252C%2522id%2522%253A%2522DEVTOOLS%2522%252C%2522panels%2522%253A%255B%257B%2522type%2522%253A%2522PANEL%2522%252C%2522contentType%2522%253A%2522DEVTOOLS%2522%252C%2522id%2522%253A%2522clp9d4onp00073b6il1066u6d%2522%257D%255D%252C%2522sizes%2522%253A%255B100%255D%257D%255D%252C%2522sizes%2522%253A%255B50%252C50%255D%257D%252C%2522tabbedPanels%2522%253A%257B%2522clp9d4onp00033b6iz8eqaxrg%2522%253A%257B%2522id%2522%253A%2522clp9d4onp00033b6iz8eqaxrg%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clp9d8u8z00033b6inz1uupww%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522FILE%2522%252C%2522initialSelections%2522%253A%255B%257B%2522startLineNumber%2522%253A17%252C%2522startColumn%2522%253A21%252C%2522endLineNumber%2522%253A17%252C%2522endColumn%2522%253A21%257D%255D%252C%2522filepath%2522%253A%2522%252Fsrc%252FApp.vue%2522%252C%2522state%2522%253A%2522IDLE%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clp9d8u8z00033b6inz1uupww%2522%257D%252C%2522clp9d4onp00073b6il1066u6d%2522%253A%257B%2522id%2522%253A%2522clp9d4onp00073b6il1066u6d%2522%252C%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clp9d4onp00063b6ie5uwszwu%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_PORT%2522%252C%2522taskId%2522%253A%2522npm%2520run%2520dev%2522%252C%2522port%2522%253A5174%252C%2522path%2522%253A%2522%2522%257D%255D%252C%2522activeTabId%2522%253A%2522clp9d4onp00063b6ie5uwszwu%2522%257D%252C%2522clp9d4onp00053b6i405orxhf%2522%253A%257B%2522tabs%2522%253A%255B%257B%2522id%2522%253A%2522clp9d4onp00043b6ioaa91ld4%2522%252C%2522mode%2522%253A%2522permanent%2522%252C%2522type%2522%253A%2522TASK_LOG%2522%252C%2522taskId%2522%253A%2522npm%2520run%2520dev%2522%257D%255D%252C%2522id%2522%253A%2522clp9d4onp00053b6i405orxhf%2522%252C%2522activeTabId%2522%253A%2522clp9d4onp00043b6ioaa91ld4%2522%257D%257D%252C%2522showDevtools%2522%253Atrue%252C%2522showShells%2522%253Atrue%252C%2522showSidebar%2522%253Atrue%252C%2522sidebarPanelSize%2522%253A15%257D)
 
<img src="https://velog.velcdn.com/images/jaehwan/post/e6855f8e-ad83-46ab-882c-c9faa0bd457b/image.png" />
  
  <strong>
    작성한 테스트를 설명하자면 간단하게 4단계로 설명할 수 있습니다.</strong>

<p>
1. APP 컴포넌트는 Parent 컴포넌트에게 동적프롭스인 count를 보냅니다.
  </p>
  <p>
2. Parent 컴포넌트는 두개의 Child 컴포넌트가 있습니다.
  </p>
  <p>
3. Child 컴포넌트는 아무 프롭스도 받지 않습니다.
  </p>
  <p>
4. StaticChild 컴포넌트는 정적인 text를 프롭스로 받습니다.
  </p>
  
<h3>랜더링 순서</h3>

**Create**

App → Parent → Child → StaticChild

**onMounted**

Child → StaticChild → Parent → App

**onUpdated (count가 증가할 경우)**

Parent → App

<h4>특징</h4>

- onMounted은 create과정 이후 재귀하며 root로 다시 돌아오는 과정입니다.
- **onUpdated : 렌더링을 감지할 수 있습니다. (count 증가)**
    - 반대로 onUpdated 외부는 렌더링의 영향을 받지 않습니다.

**Vue 확장프로그램을 통해 렌더링을 감지해본다면?**

<img src="https://velog.velcdn.com/images/jaehwan/post/f913535b-824e-4cdf-b72a-e84dddc3cfda/image.png" />
<br/>

count 증가 시 발생하는 렌더링

- APP과 Parent 이외에는 렌더링이 발생하지 않습니다.
- 즉 변경되는 컴포넌트를 감지하여 해당 컴포넌트만 렌더링하고 변경되는 컴포넌트의 자식 컴포넌트라도 변경되지 않는다면 렌더링 하지 않습니다.

<br/>


**결론**

<img src="https://velog.velcdn.com/images/jaehwan/post/08b68bab-6f57-4536-a8d7-a9f8ae1ca1b5/image.png" />

- vue는 직접 렌더링을 조작할 필요가 없습니다. VDOM이 조작될 경우에만 렌더링이 발생하고 자식 컴포넌트에게 영향을 주지 않습니다.
	- 마치 컴포넌트들이 서로 대등한 위치에 있는 느낌을 줍니다.

- 렌더링이 코드에 영향을 주는 공간을 onUpdate hook 메소드에 제한해 놓음으로서 기본적인 코드들이 렌더링에 영향을 받고 여러번 호출될 일이 없습니다.
	- <U>개발자는 렌더링이 코드에 영향을 주지 않아 마치 기존의 이벤트 기반의 JS를 개발을 하는 것과 동일한 느낌을 줍니다.</U>
- 그리고 <U>상위 컴포넌트의 렌더링을 신경쓰지 않아도 되기 때문에 Vue가 쉽게 느껴집니다.</U>

### react의 실제 동작

[CODE 직접 보기](https://codesandbox.io/p/sandbox/smoosh-river-4y9kjt?layout=%7B%22sidebarPanel%22%3A%22EXPLORER%22%2C%22rootPanelGroup%22%3A%7B%22direction%22%3A%22horizontal%22%2C%22contentType%22%3A%22UNKNOWN%22%2C%22type%22%3A%22PANEL_GROUP%22%2C%22id%22%3A%22ROOT_LAYOUT%22%2C%22panels%22%3A%5B%7B%22type%22%3A%22PANEL_GROUP%22%2C%22contentType%22%3A%22UNKNOWN%22%2C%22direction%22%3A%22vertical%22%2C%22id%22%3A%22clpatakdo00073b6i8331gaji%22%2C%22sizes%22%3A%5B70%2C30%5D%2C%22panels%22%3A%5B%7B%22type%22%3A%22PANEL_GROUP%22%2C%22contentType%22%3A%22EDITOR%22%2C%22direction%22%3A%22horizontal%22%2C%22id%22%3A%22EDITOR%22%2C%22panels%22%3A%5B%7B%22type%22%3A%22PANEL%22%2C%22contentType%22%3A%22EDITOR%22%2C%22id%22%3A%22clpatakdo00033b6ir8rcivur%22%7D%5D%7D%2C%7B%22type%22%3A%22PANEL_GROUP%22%2C%22contentType%22%3A%22SHELLS%22%2C%22direction%22%3A%22horizontal%22%2C%22id%22%3A%22SHELLS%22%2C%22panels%22%3A%5B%7B%22type%22%3A%22PANEL%22%2C%22contentType%22%3A%22SHELLS%22%2C%22id%22%3A%22clpatakdo00043b6i63vs7s4l%22%7D%5D%2C%22sizes%22%3A%5B100%5D%7D%5D%7D%2C%7B%22type%22%3A%22PANEL_GROUP%22%2C%22contentType%22%3A%22DEVTOOLS%22%2C%22direction%22%3A%22vertical%22%2C%22id%22%3A%22DEVTOOLS%22%2C%22panels%22%3A%5B%7B%22type%22%3A%22PANEL%22%2C%22contentType%22%3A%22DEVTOOLS%22%2C%22id%22%3A%22clpatakdo00063b6ixz0wah8w%22%7D%5D%2C%22sizes%22%3A%5B100%5D%7D%5D%2C%22sizes%22%3A%5B50%2C50%5D%7D%2C%22tabbedPanels%22%3A%7B%22clpatakdo00033b6ir8rcivur%22%3A%7B%22id%22%3A%22clpatakdo00033b6ir8rcivur%22%2C%22tabs%22%3A%5B%5D%7D%2C%22clpatakdo00063b6ixz0wah8w%22%3A%7B%22id%22%3A%22clpatakdo00063b6ixz0wah8w%22%2C%22activeTabId%22%3A%22clpatthw500ak3b6iat3632fv%22%2C%22tabs%22%3A%5B%7B%22type%22%3A%22UNASSIGNED_PORT%22%2C%22port%22%3A0%2C%22id%22%3A%22clpatthw500ak3b6iat3632fv%22%2C%22mode%22%3A%22permanent%22%2C%22path%22%3A%22%22%7D%5D%7D%2C%22clpatakdo00043b6i63vs7s4l%22%3A%7B%22tabs%22%3A%5B%5D%2C%22id%22%3A%22clpatakdo00043b6i63vs7s4l%22%7D%7D%2C%22showDevtools%22%3Atrue%2C%22showShells%22%3Atrue%2C%22showSidebar%22%3Atrue%2C%22sidebarPanelSize%22%3A15%7D)

<img src="https://velog.velcdn.com/images/jaehwan/post/c751d270-17f5-4719-82ab-df115477711f/image.png" />


**Parent의 Props의 변경에 따른 변화를 알아보자**



Child - 값도 받지 않지만 Parent에 포함되어있어 같이 렌더링합니다.

StaticChild : 정적인 text를 받습니다. 여전히 Parent에 포함되어있기 때문에 함께 렌더링합니다.

MemorizeComponent : 이러한 문제를 해결하기 위해 React.memo문법을 사용하여 같이 렌더링하지 않도록 변경한 컴포넌트입니다.
<br/>
<U>리액트는 자식 컴포넌트는 무조건 랜더합니다.</U>

- 변화하지 않는 컴포넌트의 랜더를 막기 위해서는 여러가지 방법을 사용해야 합니다.
    - useRef : 랜더하지 않는 변수를 만들 수 있다.
    - useMemo : 변수를 메모이제이션한다.
    - useCallback : 함수를 메모이제이션한다.
    - React.memo : 컴포넌트를 메모이제이션한다.
- useEffect를 사용한다면  랜더에 영향을 받지 않을 수 있습니다.
    - 단점 : 변화하는 값을 추적할 수 없습니다.
    - 단점을 보완하기 위해 useEffect에 추적하고싶은 변수를 넣어주어 그 변수만 추적가능한 기능이 있다.
    

**App 컴포넌트에서 Count가 증가할 경우를 React 확장 프로그램을 사용하여 렌더링을 감지해 보았습니다.**

React.memo를 사용하지 않을 경우
![](https://velog.velcdn.com/images/jaehwan/post/f95e7f4a-62f1-4839-a4bd-54ebb65f7e41/image.png)

React.memo를 사용할 경우
![](https://velog.velcdn.com/images/jaehwan/post/d42da238-888c-4ab9-abf1-0f7bdb8af51c/image.png)

확실히 React.memo를 사용할 경우 불필요한 렌더링을 하지 않는 것을 볼 수 있습니다. count가 아무리 늘어나도 MemorizeComponent는 변화가 없기 때문에 렌더링하지 않습니다.

**결론**

- React는 <U>직접 렌더링을 조작</U>해야 하기 때문에 어렵습니다.
    - 자식컴포넌트는 무조건 부모컴포넌트의 렌더에 영향을 받기 때문에 페이지 구조 혹은 컴포넌트 구조를 미리 어느정도 생각하고 만들게 됩니다.
- 렌더를 막기 위해 여러가지 방법이 존재하고 잘 활용한다면 필요할 때에만 렌더하도록 만들 수 있습니다. 하지만 그만큼 러닝커브가 존재합니다.
- JSX,TSX <U>파일 전체가 렌더의 영향을 받습니다.</U> 이러한 영향은 기존의 JS를 개발했던 이벤트 기반과는 다르게 작동하기 때문에 더 어렵게 느껴집니다.

### 왜? 어떻게? 이렇게 동작이 되는 걸까?
이러한 동작을 하는 이유는 공통 컨셉인 Virtual DOM과 연관이 있습니다.

# Concepts

## Virtual DOM(공통)
---
간단한 DOM Tree의 모습입니다.

```html
<html>
	<head></head>
	<body>
		<h1></h1>
		<div></div>
	</body>
</html>
```
<img src="https://velog.velcdn.com/images/jaehwan/post/8c308fa4-fe30-4a72-9880-f0065ffdf8eb/image.png"/>


DOM Tree가 만들어지는 순서 즉 브라우저 렌더링은 간단하게 5단계로 진행됩니다.

1. DOM Tree 생성 : code를 해석하여 html을 파싱 후 만듭니다.
2. CSSOM(css object model) 생성 : css를 파싱하여 CSSOM 생성
3. Render Tree : DOM Tree, CSSOM 결합.
4. Reflow : Viewport에 맞게 위치 조정
5. Repaint : 실제 픽셀로 그리기

우리는 getElementById, querySelector를 사용하여 DOM의 Element를 수정할 수 있습니다.

하지만 DOM Element를 수정할 경우 매번 브라우저 랜더링이 진행됩니다. 이는 웹이 복잡해 질 수록 성능저하에 큰 원인이 되었습니다. 그래서 등장한 것이 Virtual DOM 입니다.

## Virtual DOM이란?
---

- Object형태로 메모리에 저장한 DOM의 복사본입니다.
- 실제 DOM을 복사한 것이기 때문에 같은 정보를 가지고 있습니다.

### Virtual DOM을 사용하는 이유?

우리는 getElementById, querySelector를 사용하여 DOM을 매번 직접 수정하여 매번 브라우저 렌더링을 발생시켰습니다. 그래서 Virtual DOM을 수정하고 일정 수준의 작업이 쌓이면 그때 Virtual DOM을 DOM으로 교체하여 브라우저 렌더링의 횟수를 줄이고자 하는 것입니다.

**VDOM => newVDOM => DOM **
![](https://velog.velcdn.com/images/jaehwan/post/9d842223-40d5-4597-8e66-3276d4ee2810/image.png)

![](https://velog.velcdn.com/images/jaehwan/post/c64dd381-e3e2-4117-98dd-090e2cfeb79f/image.png)

위의 그림으로 간단히 설명해 보겠습니다.

1. props or state가 변경될 경우 Dirty List(대기열)에 추가합니다.
2. 새로운 변경 사항이 Dirty List에 추가될 수 있도록 조금 기다립니다.(debounce time)
3. debounce time이 끝나면 **새로운 VDOM Tree를 만듭니다.**
4. VDOM과 DOM을 비교하는 조정(Reconciliation 혹은 Diffing) 알고리즘이 작동합니다.
    1. Dom Tree와 VDOM Tree를 비교하여 최소한의 변경횟수와 변경사항을 찾아냅니다. 이 과정에서 DFS알고리즘을 통해 순회하게 됩니다. 
5. Dirty List의 모든 변경 사항을 일괄로 처리되고 실제 DOM의 렌더링은 1번 진행됩니다. 이러한 과정을 조정 프로세스라고 합니다.

Virtual DOM으로 인해 4가지의 변경사항에도 한번의 렌더링을 하여 렌더링 횟수를 크게 줄일 수 있었습니다. 

React와 Vue에서 Virtual DOM 매커니즘을 사용하고 있고 각자 사용하는 방식은 어떨지 비교해 보겠습니다.

### Vue 와React의 VDOM

Vue는 어떻게 독립적인 컴포넌트를 가질 수 있을까요? React는 왜 부모 컴포넌트가 모든 자식 컴포넌트에게 영향을 줄까요? 서로의 동작 방식이 다름은 VDOM을 사용하는 방식이 다르기 때문입니다. 구체적으로 이들이 어떻게 VDOM을 사용하는 지 알아보겠습니다.

## Vue의 VDOM

---

Vue의 구조에 대해 알아야 Vue의 VDOM을 이해하기 쉽기 때문에 SFC를 소개하고 넘어가겠습니다.

### SFC란?

SFC는 HTML, CSS 및 JavaScript 3가지를 하나로 자연스럽게 합친 것입니다. 

Vue는 프론트엔드의 웹이 점점 복잡해짐에 따라서 파일유형(html,js,css)로 분리할 경우 코드베이스 유지 관리가 더욱 어려울 것으로 판단하여 “동일한 사용 목적”으로 하나의 파일로 결합한 SFC를 개발했고 컴포넌트의 응집력과 유지 관리가 용이해졌다고 합니다.

**Single File Component인 *.vue의 구조**

```jsx
<script setup>
	import { ref } from 'vue'
	const greeting = ref('Hello World!')
</script>

<template>
  <p class="greeting">{{ greeting }}</p>
</template>

<style>
.greeting {
  color: red;
  font-weight: bold;
}
</style>
```

- template
    - 용도 : html코드를 입력할 수 있습니다. vue 문법을 이용할 수 있습니다.
    - 실행 : `@vue/compiler-dom`으로 전달되고, JavaScript 렌더 함수로 사전 컴파일됩니다.
- script
    - 용도 : js코드를 입력할 수 있습니다.
    - 실행 : ES 모듈로 실행됩니다.
- style : css 코드입니다.

SFC의 template은 렌더함수로 사전 컴파일 되어 DOM 렌더링에 합류하게 됩니다. 이러한 과정을 **Compiler-Informed Virtual DOM** 이라 부릅니다.

### **VUE는 컴파일러와 런타임을 모두 제어합니다.**

**(Compiler-Informed Virtual DOM)**

Vue는 Element의 정보들이 모여있는 template를 컴파일합니다.

컴파일 시에 정보를 추론하여 변경할 요소를 미리알고 그 요소만 추적할 수 있기 때문에 부분 렌더링이 가능합니다. 심지어 변경되지 않을 요소도 미리 알기 때문에 필요없는 렌더링을 하지 않습니다.

**vnode**

```jsx
const vnode = {
  type: 'div',
  props: {
    id: 'hello'
  },
  children: [
    /* 더 많은 가상 노드(vnode)*/
  ]
}
```

- VDOM은 하나의 엘리먼트의 정보를 vnode(virtual node)하나에 저장하여 여러노드가 되고 그 노드들이 하나의 트리를 만들고 그 트리가 VDOM이 됩니다.

**Vue의 컴파일 단계**

1. **Static Hoisting**

```jsx
<div>
  <div>foo</div> <!-- 호이스트(hoist) 됨 -->
  <div>bar</div> <!-- 호이스트 됨 -->
  <div>{{ dynamic }}</div>
</div>
```

```jsx
const _hoisted_1 = /*#__PURE__*/_createElementVNode("div", null, "foo", -1 /* HOISTED */)
const _hoisted_2 = /*#__PURE__*/_createElementVNode("div", null, "bar", -1 /* HOISTED */)
```

- 정적인 노드는 비교하는 것이 불필요하기 때문에 Vue 컴파일러가 호이스트하여 모든 렌더에서 동일한 vnode를 재사용하도록 합니다.

**[템플릿 탐색기에서 확인하기](https://vue-next-template-explorer.netlify.app/#eyJzcmMiOiI8ZGl2PlxuICA8ZGl2PmZvbzwvZGl2PlxuICA8ZGl2PmJhcjwvZGl2PlxuICA8ZGl2Pnt7IGR5bmFtaWMgfX08L2Rpdj5cbjwvZGl2PiIsInNzciI6ZmFsc2UsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==)**

1. **Patch Plag**

```jsx
<!-- class만 바인딩 -->
<div :class="{ active }"></div>

<!-- id와 value만 바인딩 -->
<input :id="id" :value="value">

<!-- text만 only -->
<div>{{ dynamic }}</div>
```

```jsx
createElementVNode("div", {
	  class: _normalizeClass({ active: _ctx.active })
	}, null, 2 /* CLASS */),
	
	_createElementVNode("input", {
	      id: _ctx.id,
	      value: _ctx.value
	    }, null, 8 /* PROPS */, ["id", "value"]),
	
	_createElementVNode("div", null, _toDisplayString(_ctx.dynamic), 1 /* TEXT *
```

- 동적 바인딩이 있는 단일 엘리먼트의 정보를 추론할 수 있습니다.
- Class : 2, Props : 8 등 마지막 숫자에 따라 추론합니다. 이것이 패치플래그 인자입니다.

**[템플릿 탐색기에서 확인하기](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2IDpjbGFzcz1cInsgYWN0aXZlIH1cIj48L2Rpdj5cblxuPGlucHV0IDppZD1cImlkXCIgOnZhbHVlPVwidmFsdWVcIj5cblxuPGRpdj57eyBkeW5hbWljIH19PC9kaXY+Iiwib3B0aW9ucyI6e319)**

1. **Tree Flattening (트리 병합)**

```jsx
<div> <!-- 루트 블록 -->
	  <div>...</div>         <!-- 추적하지 않음 -->
	  <div :id="id"></div>   <!-- 추적함 -->
	  <div>                  <!-- 추적하지 않음 -->
	    <div>{{ bar }}</div> <!-- 추적함 -->
	  </div>
	</div>
```

- root 블록 내부의 동적인 하위 노드만 포함하는 flattened Array를 생성합니다.

```jsx
div (block root)
- div with :id binding
- div with {{ bar }} binding
```

- 트리 병합 : 패치 플래그가 있는 모든 하위 노드를 추적합니다. 다시 렌더링 할 경우 병합된 트리만 탐색합니다.

**CI-VDOM 랜더 과정**

![](https://velog.velcdn.com/images/jaehwan/post/766a8e90-379e-4e35-acc3-32151f0e2dad/image.png)


1. SFC의 template구간 내부 코드가 빌드 시 컴파일 되어 렌더 함수 코드로 변환됩니다.
    - ex) 템플릿 코드 ⇒ 렌더 함수 코드 (템플릿 탐색기로 확인 가능합니다.)
        
        ```jsx
        <template>
        	<div> <!-- 루트 블록 -->
        	  <div>...</div>         <!-- 추적하지 않음 -->
        	  <div :id="id"></div>   <!-- 추적함 -->
        	  <div>                  <!-- 추적하지 않음 -->
        	    <div>{{ bar }}</div> <!-- 추적함 -->
        	  </div>
        	</div>
        </template>
        ```
        
        ```jsx
        import { createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
        
        export function render(_ctx, _cache, $props, $setup, $data, $options) {
          return (_openBlock(), _createElementBlock("div", null, [
            _createElementVNode("div", null, "..."),
            _createElementVNode("div", { id: _ctx.id }, null, 8 /* PROPS */, ["id"]),
            _createElementVNode("div", null, [
            _createElementVNode("div", null, _toDisplayString(_ctx.bar), 1 /* TEXT */),
            ])
          ]))
        }
        ```
        
2. 렌더 함수 코드는 런타임에서 **Patch Plag 와 Tree Flattening을 통해 바인딩 해놓은 노드를** 추적하고 변경될 경우 다시 렌더하여 실행합니다.
3. 변경된 렌더 함수는 VDOM Tree에 반환되고 마운트 혹은 패치되어 DOM에 적용됩니다.

### Vue 정리

**일반적인 Virtual DOM은 런타임 성능을 저하시킨다.**

- 일반적인 VDOM은 런타임 과정에서 조정 프로세스를 통해 변경사항을 추적합니다. 그 방법은 DFS 알고리즘을 사용하여 VDOM Tree를 순회하고 변경사항을 찾아내는 것입니다.
- Vue는 이러한 런타임의 조정 프로세스가 비효율적이라고 생각했습니다. 런타임 과정에서 매번 VDOM Tree를 순회하는 것은 런타임 성능을 저하시키기 때문입니다.

**Vue가 선택한 방법**

![](https://velog.velcdn.com/images/jaehwan/post/cd59f3d0-263a-4221-9405-baece4afb80b/image.png)


- 변경이 예정된 vnode와 변경되지 않을 vnode를 <U>컴파일단계에서 미리 추적</U>하여 VDOM Tree를 굳이 전부 순회하지 않고 <U>추적중인 vnode만 감시하면 되도록 설계하였습니다.</U>
- 이는 런타임에서 최소한의 루트로 변경될 컴포넌트에 빠르게 접근할 수 있으며 vue의 실제 동작을 보았던 것 처럼 부모컴포넌트가 렌더링 되더라도 자식 컴포넌트가 정적인 컴포넌트라면 변경되지 않는 이유가 성립됩니다.
- 해당 설계방식으로 인해 컴포넌트간에 독립적인 형태를 갖추게 되었습니다.


## React의 VDOM

---

### Reconciliation(재조정)


#### Stack Reconciliation

React의 조정 프로세스는 16버전 이전과 이후로 나뉩니다. 16버전 이전에는 Stack기반 Reconciliation 방식으로 위에서 설명한 VDOM과 같습니다.
<img width="400px" src="https://velog.velcdn.com/images/jaehwan/post/5fb62707-bf97-434c-9898-d815a89b5d18/image.png" />

**동작 과정**

1. 업데이트
2. vdom변경사항으로 new vdom생성
3. new vdom ⇒ 재조정 ⇒dom 적용

Stack Reconciliation의 두가지 특징이 있습니다.

- 조정 알고리즘 : DFS 알고리즘을 사용하여 VDOM Tree를 순회하고 변경사항을 찾아내어 DOM을 업데이트합니다.
- 유저 인터렉션의 우선순위 : 조정 알고리즘이 끝난 후 (DFS 트리 순회) 유저 인터렉션을 받습니다.

이 특징은 여러가지 문제점을 만들어냅니다.

- 거의 모든 트리 순회합니다.
- 동기적 실행 : 메인 스레드를 사용하여 UI가 끊기는 현상이 있을 수 있습니다. 특히 디바이스가 느리거나 대규모 가상 트리를 처리할 경우 심해질 수 있습니다.
- 우선순위 없음 : 중요한 업데이트를 먼저 할 수 없습니다.
- 무중단성 : 업데이트가 실행 중에는 다른 업데이트가 실행될 수 없습니다.
    - 유저 인터렉션이 두번 생긴다면 인터렉션 - 조정 - 인터렉션 - 조정 순으로 중단없이 작동됩니다. 첫번째 이벤트가 꼭 동작해야한다는 것은 UX에 좋지 않을 수 있습니다.


이러한 단점들로 인해 React v16부터는 Fiber Architecture가 등장하였습니다.

## Fiber Architecture (v16)
---
Stack Reconciliation의 문제점을 돌아보며 React는 해결해야할 부분들을 정리합니다.

1. 작업을 일시 중지하고 나중에 다시 돌아 올수 있어야 합니다.
2. 다양한 유형의 작업에 우선순위를 할당할 수 있어야 합니다.
3. 이전에 완료한 작업을 재사용합니다.
4. 더 이상 필요하지 않은 작업은 중단합니다.

이러한 문제를 해결하기 위해서 FIber는  두가지 개념을 도입합니다.

**Double Buffering : 두개의 청사진을 비교하는 기법**

VDOM 두개를 사용하여 VDOM을 바로 DOM에 적용하는 기존의 방식과는 달리 업데이트 전 VDOM과 업데이트 후 VDOM을 비교하는 기법입니다.

바로 DOM에 적용하지 않음으로서 생기는 이득은 무엇일까요?

- DOM 적용 전에  VDOM을 적용해도 될지 확인이 가능합니다. 만약 우선순위가 더 높은 인터랙션이 들어왔을 때  더블 버퍼링 개념은 가상 렌더링 중이므로 새로운 업데이트를 받아들이거나 그러지 않는 선택을 할 수 있습니다.

**Fiber Data Structure :** 

- Fiver 데이터 구조는 메인 스레드에서 작동하지만 비동기적으로 작동이 가능합니다.

**Fiber Node**

```jsx
{
  tag: 3, // 3 = ClassComponent
  type: App,
  key: null,
  ref: null,
  props: {
    name: "Tejas",
    age: 30
  },
  stateNode: AppInstance,
  return: FiberParent,
  child: FiberChild,
  sibling: FiberSibling,
  index: 0,
  ...
}
```

**Fiber node**
- props, state, 자식 컴포넌트
- 컴포넌트 트리에서의 위치에 대한 정보
- 업데이트에서 우선순위를 정하고 실행하는 데 사용하는 메타데이터

**Fiber Trees**

- Work in Progress Tree
    - 가장 최신화된 DOM의 복사본입니다.
    - 불필요한 업데이트를 막기위해 일단 Work in Progress Tree에 먼저 업데이트를 진행합니다.
- Current Tree
    - 업데이트 전의 즉 현재 트리 입니다.
    - Work in Progress Tree의 업데이트 사항을 받고 Current Tree를 DOM에 입력합니다.
    
Double Buffering 과 Fiber Data Structure를 도입하여 만들어진 프로세스는 다음과 같습니다.
![](https://velog.velcdn.com/images/jaehwan/post/b64b72e4-4e40-4cba-94f2-f4a4e2f8edce/image.png)

재조정 프로세스가 두개로 나뉘고 두개의 재조정 프로세스 중간에 우선순위가 맞는 업데이트인지 확인하는 것을 볼 수 있습니다. 아마 이 기능으로 인해 우선순위가 없고 무중단이었던 이전의 단점을 보완한 것 같습니다. 그러면 이러한 동작은 어떻게 작동하는 걸까요?

## Fiber Reconciliation
---
파이버 재조정은 workLoop 내부에서 이루어지며 workLoop에는 두가지 단계가 존재합니다.

1. Render Phase
2. Commit Phase

### **Render Phase**
![](https://velog.velcdn.com/images/jaehwan/post/30fed103-3fe2-4ee9-ae5d-9468e58dcda8/image.png)

**beginWork**

workInProgress Tree에서 파이버 노드의 업데이트 여부에 대한 변경사항을 표시하는 역할을 합니다.

```jsx
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null;
```

current

- 현재 파이버 노드입니다. 트리 이전 버전과 새 버전을 비교하는데 사용됩니다.

workInProgress

- `completeWork`에서 변경될 수 있는 파이버 노드입니다. 변경사항 여부를 "dirty"로 표시합니다.

renderLanes : 우선순위를 관리해줍니다.

- 우선순위가 낮은 레인에 할당된 업데이트는 나중으로 연기됩니다.
- 이는 커밋 단계 직전까지 적용되지 않을 수 있습니다.
<br/>

**completeWork** 

업데이트를 적용하고 메모리(VDOM)에 저장합니다. **우선순위가 더 높은 업데이트가 예약될 경우 버려질 수 있습니다.**

- `beginWork`에서의 “dirty”표시를 보고 업데이트를 진행합니다.

```jsx
function completeWork(
  current: Fiber | null, // 현재 파이버 노드 참조.
  workInProgress: Fiber, // work in progress 파이버 노드
  renderLanes: Lanes // 완료 중이 업데이트의 우선순위 수준
): Fiber | null;
```

`completeWork`가 root에 도달하고 업데이트 된 새로운 DOM Tree를 구성한다면 랜더링 단계는 끝나고 커밋 단계로 넘어갑니다.

커밋단계는 두 단계로 나뉩니다.

1. **Mutation Phase**
    - VDOM에 적용된 변경 사항으로 실제 DOM을 업데이트하는 역할을 합니다.
    - 이 단계에서 “dirty”로 표시된 노드를 찾습니다.
    - commitMutationEffect 특수 함수를 실행
        - 업데이트 된 노드를 실제 DOM에 적용
        - 이 과정에서 더이상 필요 없는 노드는 제거됩니다.
2. **Layout phase**
    - DOM에서 업데이트된 노드의 새로운 레이아웃을 계산하는 역할을 담당합니다.
    - 이 단계에서 "dirty”로 표시된 노드(즉, 업데이트된 노드)를 찾습니다.
    - 각 더티 노드에 대해 React는 commitLayoutEffects라는 특수 함수를 호출합니다.
        - DOM에서 업데이트된 노드의 새로운 레이아웃을 계산합니다.

Commit Phase가 끝난다면 즉 모든 랜더링 단계가 끝나게 되면 commitRoot 함수를 호출하게 됩니다.

**commitRoot**

![](https://velog.velcdn.com/images/jaehwan/post/9281952d-65d7-4e96-968c-51751c29fcc7/image.png)

- FiberRootNode는 VDOM Tree를 전부 참조하고 있는 최상위 노드입니다. 그리고 현재 노드를 포인터로 지정하여 무엇이 현재노드인지 결정하는 노드이기도 합니다.

![](https://velog.velcdn.com/images/jaehwan/post/aad50b8b-0727-4e83-a039-14844ea3258f/image.png)

- commitRoot가 실행되면 FiberRootNode와 Current Tree 포인터를 제거하고 workInProgress Tree에 포인터를 연결한 후 새로운 Current Tree로 만듭니다.

### React 정리

React의 Fiber Architecture는 두개의 VDOM을 사용합니다.

- 현재의 상태를 항상 유지할 수 있는 Current Tree
- 업데이트를 계속 진행 할 수 있는 workInProgress Tree

그리고 이 두가지 트리를 참조하는 최상위 노드인 FiberRootNode가 존재합니다.

이 두가지 트리를 이용하여 가상 렌더링을 하고 적절한 우선순위와 적절한 타이밍에 Real DOM에 적용하게 됩니다. 중간에 우선순위가 높은 유저 인터랙션이 생길 경우 workInProgress Tree를 제거하고 다시 생성하여 우선순위가 높은 업데이트에 대응합니다.

재조정 과정이 끝난다면 FiberRootNode의 포인터를 workInProgress Tree로 변경하고 이것을 새로운 Current Tree로 사용합니다.

이러한 재조정 프로세스로 인해 리액트는 부드러운 UX를 보여줄 수 있지만 미리 무언가를 알지 못하고 그렇기 때문에 모든 컴포넌트를 런타임에서 순회해야합니다.


## 결론
---
Vue는 컴파일하여 미리 어떤 컴포넌트가 렌더링 할지 알고 있기 때문에 **state, props가 변경된 컴포넌트만이 렌더링**되어 아주 쉽게 개발할 수 있었습니다.

React는 어떤 컴포넌트가 렌더링 될지 모르기 때문에 state, props가 변경된 컴포넌트 외에도 그 자식 컴포넌트들에게 props를 전달했을 수도 있으니 **렌더링 될 여지가 있는 컴포넌트 모두를** 렌더링 하는 것이었습니다. 컴포넌트의 렌더링을 직접 관리하지 않고 개발자가 관리할 수 있게 열어두기만 했다는 점에서 React가 라이브러리구나라는 것이 명확하게 느껴졌습니다.

만약 React와 Vue를 고민하고 계신분이 있으시다면 이글이 많이 도움이 될 것이라고 생각합니다.





출처 : 

**[Learning React, 2nd Edition](https://learning.oreilly.com/library/view/learning-react-2nd/9781492051718/)**

Tejas Kumar, Fluent React, O’Reilly Media, [The Virtual DOM,Inside Reconciliation]

Maya Shavin, Learning Vue**,** O’Reilly Media, 

https://vuejs.org/guide/extras/rendering-mechanism.html

https://pooney.tistory.com/87[https://velog.io/@1nthek/React-Virtual-DOM과-렌더링](https://velog.io/@1nthek/React-Virtual-DOM%EA%B3%BC-%EB%A0%8C%EB%8D%94%EB%A7%81)

https://velog.io/@bada308/Virtual-DOM-with-React

https://github.com/acdlite/react-fiber-architecture

https://happysisyphe.tistory.com/42


