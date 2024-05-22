프로젝트 진행 중, dangerouslySetInnerHTML을 사용하여 <br/>
마크다운 형태로 데이터에 저장되어 있는 게시글을 보여줘야 되는 일이 있었다. 

>❓ dangerouslySetInnerHTML란? <br/>
dangerouslySetInnerHTML는 React에서 HTML을 직접 삽입하는 방법으로, innerHTML 속성과 동일하게 작동한다. <br/>
dangerouslySetInnerHTML는 주의해서 사용해야 한다. ~~이름부터 무섭다,,,,,~~


# innerHTML
- innerHTML은 JavaScript와 HTML DOM(Document Object Model)에서 요소의 HTML 또는 XML 마크업을 설정하거나 반환하는 속성
- 이를 통해 개발자는 웹 페이지의 콘텐츠를 동적으로 변경할 수 있다.

**<innerHTML 사용방법>**
```js
innerHTML 속성을 사용하여 특정 요소의 HTML 콘텐츠를 설정이 가능하다.
<div id="myDiv"></div>

<script>
  document.getElementById("myDiv").innerHTML = "<p>Hello, World!</p>";
</script>
```
### innerHTML의 장점과 단점
**직관성이 뛰어나고 HTML 마크업을 동적으로 삽입하거나 업데이트할 때 유용**하다는 장점이 있지만, <br/>
innerHTML을 사용할 때 외부로부터 입력된 데이터를 그대로 삽입하면 **크로스 사이트 스크립팅(XSS) 공격에 취약하다는 치명적인 단점**이 있다.

```js
예시 코드  
<div id="myDiv"></div>

<script>
   // 사용자로부터 입력된 악성 스크립트
  var userContent = "<script>alert('XSS');</script>";
  document.getElementById("myDiv").innerHTML = userContent; // XSS 공격 발생
</script>

```

# XSS
### XSS란?
XSS는 크로스 사이트 스크립팅(Cross-Site Scripting)의 약자로 ~~(CSS는 스타일 시트 언어이기 때문에 XSS가 약자로 되었다고...)~~ <br/>
**공격자가 악의적인 스크립트를 웹 페이지에 삽입**하여 다른 사용자의 브라우저에서 실행되도록 하는 공격 기법이다.<br/>
이를 통해 공격자는 사용자의 세션을 가로채거나, 웹 페이지의 내용을 변경하거나, 악성 소프트웨어를 배포할 수 있다.
``` js
이벤트 속성으로 악성 스크립트를 실행
현재 이 방법은 많이 막혀있다.
<img src="3" onerror="alert('XSS')">
```

### XSS 공격의 종류
- 저장형 XSS: 악성 스크립트가 서버에 저장되어 여러 사용자가 이를 로드할 때 실행된다. <br/>
저장형 XSS는 데이터베이스에 등록된 데이터가 반영되는 페이지를 보는 모든 사용자에게 영향을 미친다.
- 반사형 XSS: 악성 스크립트가 URL이나 요청 매개변수에 포함되어 반사되며, 공격자가 이를 통해 사용자를 속인다.
- DOM 기반 XSS: 악성 스크립트가 클라이언트 측 자바스크립트를 통해 DOM에 직접 삽입되어 실행된다.<br/>
 서버를 통하지 않으므로 공격을 감지하기 어려운 특징도 있다.

### DOM 기반 XSS 발생 사례

```js
https://site.example/#hello

const message = decodeURIComponent(location.hash.slice(1));
document.getElementById("message").innerHTML = message;

<div id="message">hello</div>

DOM 기반 XSS
https://site.example/#<img src=x onerror="location.href='https://attacker.example'" />

<div id="message">
  <img src=x onerror="location.href='https://attacker.example'" />
</div>
```

삽입된 문자열은 이미지 태그 요소로 브라우저에서 해석되며 onerror 속성에 지정된 'location.href='https://attacker.example' 의 자바스크립트 코드가 실행된다. <br/>
위 코드에서는 innerHTML을 사용해 DOM을 조작한 것이 DOM 기반 XSS의 원인이다.

### XSS 대책
#### 1. 문자열 이스케이프 처리
XSS를 방지하려면 문자열에 이스케이프를 처리하여 HTML로 해석하지 않도록 해야 한다.<br/>
이스케이프 처리는 프로그램에 특별한 의미를 갖는 문자나 기호를 특별하지 않은 의미로 변환 처리하는 작업이다.
```js
const escapeHTML = (str) => {
	return str
  		.replace(/&/g, "&amp;")
  		.replace(/</g, "&lt;")
  		.replace(/>/g, "&gt;")
  		.replace(/"/g, "&quot;")
  		.replace(/'/g, "&#x27;")
}
```
#### 2. DOM 조작을 위한 메서드와 프로퍼티 사용하기
DOM 기반 XSS는 문자열을 HTML로 해석하는 innerHTML 등의 기능을 사용할 때 발생한다.<br/>
따라서 사용자가 입력한 문자열을 innerHTML을 사용하지 않고 처리하는 것도 방법이 될 수 있다.
```js
const txt = document.querySelector("#txt").value;
const list = txt.split(",");

// <ul>요소 생성
const ul = document.createElement("ul");
for (const name of list) {
	// 콤마로 구분한 문자열 배열에 루프를 사용해 li 요소 생성
  	const li = document.createElement("li");
  	// <li> 요소에 텍스트 노드로 데이터 삽입
  	li.textContent = name;
  	// <ul>의 자식 요소에 li 요소 추가
  	ul.appendChild(li);
}
// 여러 개의 <li> 요소를 갖는 <ul> 요소를 id=list의 요소에 추가
document.querySelector("#list").appendChild(ul);
```
#### 3. 프레임워크의 기능을 사용하는 방법
자동으로 XSS를 예방해 주는 프레임워크들이 있다. React도 그중 하나이다.<br/>
XSS 공격을 발생시키는 문자열이 포함되어 있어도 React가 자동으로 이스케이프 처리를 하므로 XSS 공격은 발생하지 않는다.<br/>
 하지만 앞에서 나온 dangerouslySetInnerHTML라고 하는 innerHTML에 해당하는 기능을 사용하면 XSS의 취약성이 발생할 수 있다.

#### 4. DOMPurify 라이브러리
- HTML에 삽입하는 문자열부터 자바스크립트를 실행시키는 일부 HTML 문자열만 제거해 주는 라이브러리
- DOMPurify라는 전역 변수에서 sanitize 함수를 호출하면 XSS로 작성된 문자열도 무효화 가능하다.<br/>
sanitize 함수는 인수 문자열에서 XSS 공격의 위험이 있는 문자열을 제거한다.
```js
sanitize 함수 사용하기
const clean = DOMPurify.sanitize(dirty);

const imgElement = "<img src=x onerror=alert('xss')>";
targetElement.innerHTML = imgElement;

// DOMPurify.sanitize를 통해 XSS를 유발하는 위험한 문자열이 제거되고
// imgElemnt에는 "<img src=x>"가 대입
const imgElement = DOMPurify.sanitize("<img src=x onerror=alert('xss')>");
targetElement.innerHTML = imgElement;
```
<br/>

> **참고할 만한 사이트** <br/>
실제 xss 해킹 예제블로그 <br/>
https://blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=is_king&logNo=221602193148

<br/>

> **참고 자료** <br/>
히라노 마사시 <프런트엔드 개발을 위한 보안 입문>
