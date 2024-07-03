## 서론

NextJS를 공부하게 되며 다시 봐도 쉽게 이해할 수 있도록 글을 정리하였습니다.

해당 글은 getServerSideProps가 있는데 왜 굳이 ServerComponent & ServerAction을 사용해야하지?, sql을 왜 프론트에서 작성하지? , Next가 어떤 미래를 보고 있는거지? 라는 의문이 있는 사람이 읽으면 아주 유익할 것 같습니다.

# Composability

## React의 Composability

- 마치 레고와 같은 리액트의 Composability 특성이 UI 빌드를 쉽고 재밋게 만듭니다.
- 하지만 이것은 UI 측면입니다.

![](https://velog.velcdn.com/images/jaehwan/post/85fbc12d-b736-40cf-9cf8-a8e97b48dd96/image.png)


## API 호출에 대한 Composability

### React의 API 작성.

**컴포넌트에 API 데이터를 적용할 경우를 생각해봅시다. -** SWR을 예로 들어보면.

1. useSWR 훅에 엔드포인트를 입력합니다.
2. 쿼리를 기다린다면 로딩 상태로 반환합니다.
3. 그렇지 않으면 데이터를 렌더링 합니다.

```jsx
const fetcher = url => fetch(url).then(r => r.json())
 
function App () {
  const { data,loading, error } = useSWR('/end_point/data', fetcher)
  // ...
}
```

페이지를 새로고침하면 쿼리를 기다리며 로딩 스피터를 보고 그 다음 데이터를 봅니다.

평범한 패턴이지만 NextJS 14는 페이지를 서버에서 렌더링하고 싶습니다. 

서버 렌더링의 이점을 위해 SWR과 같은 것을 사용할 수 없습니다.

그렇지만 Next는 **getServerSideProps**를 가지고 있습니다.

### NextJS의 API 호출 방법의 문제.

**getServerSideProps를 사용.**

![](https://velog.velcdn.com/images/jaehwan/post/8303a6a7-fc3f-4d4a-a431-7c6e125a3530/image.png)


**getServerSideProps**는 서버에서 실행되어 데이터를 쿼리하고 반환하게 됩니다. 클라이언트에서 렌더링을 시작하기 전에 모든 것이 발생하게 됩니다.

이제 서버 렌더링이 된 컴포넌트를 제작 할 수 있습니다.

그러나 여기서 잃은 것이 존재합니다. 컴포넌트가 데이터를 props로 받아들이게 되면서 페이지 내부의 해당 api를 사용하는 컴포넌트는 getServerSideProps에 의존하게 됩니다.

**이는 더이상 레고 블록이 아닙니다.** 

리액트 프로그래밍 모델은 컴포넌트를 새로 만들거나 재사용을 자유롭게 한다는 목적이 있었는데 getServerSideProps에 대한 의존성이 생기며 불가능 해졌습니다.

### Next13에서 **getServerSideProps를 사용하여 의존성 해결**

API데이터를 받으려면 데이터베이스나 써드파티 서비스와 같은 외부 서비스와 상호작용해야 합니다.

컴포넌트를 여기저기 복사할 수 있기를 원하지만 getServerSideProps에 의존하고 있다면 불가능합니다.

![](https://velog.velcdn.com/images/jaehwan/post/5098312b-cfca-41b2-a8db-aee1ec8e7c05/image.png)


- contents를 그대로 다른 곳에서 사용하고 싶어도 props로 내려오는 api 데이터가 없다면 내용물이 없어집니다.

**그럼 API를 의존하고 있는 컴포넌트를 다른 페이지로 복사해서 사용하고 싶다면 어떻게 해야할까요?**

![](https://velog.velcdn.com/images/jaehwan/post/dec2fa5b-91a8-44ba-9aa6-90f77cd819ed/image.png)


React 서버 컴포넌트를 만드는 것입니다. 이것이 Next14의 새로운 기능입니다.

비동기 함수이며 컴포넌트 내에서 데이터베이스에 직접 접근할 수 있으며 기존의(순수 React) SWR 예제처럼 복사하고 붙여넣을 수 있습니다. getServerSideProps처럼 서버에서 렌더링할 수 있습니다.

![](https://velog.velcdn.com/images/jaehwan/post/37fbe9f7-a216-4f35-8808-e07536ca1770/image.png)


- 컴포넌트를 다른 장소에서 그대로 사용하더라도 아무 문제가 없어졌습니다.

이제 다시 Composability한 리액트 컴포넌트가 되었습니다.

서버 컴포넌트의 단점도 존재합니다. 데이터를 전부 받아오고나서 페이지를 로딩하기 때문에 렌더링이 느려질 수 있습니다. 

- **영상에서 전체 렌더링이 느려집니다.**
    
    getServerSideProps → ServerComponent → Page Render
    
    순서로 예측됩니다.
    

영상에서의 서버 컴포넌트의 경우 첫 화면에서 보이지 않습니다. 그래서 바로 렌더링할 필요가 없다는 판단하에 Suspense + ServerComponent 형태로 사용합니다.

```jsx
<Suspense fallback={<Spinner />}>
	<ServerComponent />
</Suspense>
```

- 화면에 노출될 경우에 컴포넌트를 불러오게 바뀌었습니다.
- 컴포넌트가 화면에 노출되면 그때 컴포넌트는 DB에 접근 후 렌더링합니다.

Next는 서버 컴포넌트를 서버에서 실행하고, 클라이언트 코드와 클라이언트 컴포넌트를 분할(?)하여 브라우저로 보내고 있습니다. 

두 개의 다른 앱을 실행하고 있는 것과 같지만 유저의 관점에서는 하나처럼 느껴집니다.

![](https://velog.velcdn.com/images/jaehwan/post/a749bd97-4ae9-4f0c-9380-b9e74453f7df/image.png)


새로운 기능을 추가하여 클릭을 했을 경우에 API를 호출한다면 어떻게 될까요?

### **ServerAction**

**기존**

```jsx
<button
	onClick={async () => {
		await fetch(`end_point/${slug}`)
	}}
/>
```

**ServerAction**

```jsx
<button
	formAction={async () => {
		"use server";
		await sql`INSERT INTO ... (slug) VALUES (${slug});`;
	}}
/>
```

**뭐가 다를까요?**

- ServerAction은 React와 Next에게 코드를 서버에서 실행하도록 합니다.
- API 엔드포인트 호출 대신 엔드포인트 자체를 사용합니다. DB에 직접 접근하여 코드를 실행합니다.

**어떤 이점이 있을까요?**

- ServerComponent와 같이 Composability함을 유지할 수 있습니다. 컴포넌트가 API서버에 의존하지 않기 때문에 레고블록처럼 떼어내고 앱 도메인 안에서 자유롭게 사용할 수 있습니다.

## **NextJS가 보는 미래**

- 결론 : 컴포넌트를 모든 리액트 앱에서 자유롭게 사용하여 완벽한 레고블록을 만들자.
- ServerComponent, ServerAction을 이용한 덕분에 하나의 도메인 안에서 재사용 가능합니다.
- 하지만 모든 것이 컴포넌트내에 패키지화 되어있다면..? 세상의 모든 앱에서 해당 컴포넌트를 사용할 수 있게 될 것이고 그것이 환상적이다. 라고 합니다.

## 후기

**Server Component**

1. DB에 직접 접근하는 만큼 백엔드 개발자와 협의하에 잘 사용한다면 좋을 듯합니다.
2. request & response 개념이 아닌 직접 DB에 접근하니 속도가 좀 더 빠르지 않을까? 하는 생각이 듭니다.
3. 서버 컴포넌트를 사용할 경우 모든 API 호출이 끝났을 때 렌더링되어 여러개일 경우 렌더링이 느려질 수 있으니 조심해야 할 듯 합니다.
    1. 페이지의 첫화면의 경우 사용하지 않거나 lazyLoading을 사용하는 것이 나을 듯 합니다.
    2. 이후 스크롤을 이용한 로딩 같은 경우에 서버 컴포넌트+서스펜스를 사용하면 쉽게 개발이 가능합니다.

**Server Action**

- 직접 sql로 요청을 함으로써 API에 의존하지 않는 것이 목표인듯 합니다.

**조심할 점**

- 첫 화면에서는 조심하여 사용하지 않으면 렌더링 속도저하로 이어질 수 있습니다.
- DB에 직접 접근이 보안상 문제없는지.

**확인해볼 것**

- getServerSideProps와 ServerComponent를 동시에 사용했을 경우 둘 모두 API 데이터를 받아야 렌더링이 되는지 확인.
- 프론트에서 sql을 호출하는 것이 보안상 문제가 없는지.
- Server Action, Server Component 둘다 서버에서 실행한다고 합니다. 그래서 보안 이슈가 덜할 것인가? 라는 궁금증이 생깁니다. 아니면 보안 이슈가 없는 DB 혹은 전용 DB가 따로 있어야 할지.. 이해도 부족.

출처 :

https://www.youtube.com/watch?v=9CN9RCzznZc&list=PLBnKlKpPeagl57K9bCw_IXShWQXePnXjY&index=2
