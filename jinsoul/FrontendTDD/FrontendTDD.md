이 포스트는 카카오 테크밋에서 TDD로 앞서가는 프론트엔드: 디자인, API 없이도 개발을 시작하는 방법 by 김선호(cayde.abdo) 를 듣고 정리한 내용입니다.

## 프론트엔드 팀의 고질적인 문제

- 디자인이 아직 안나왔어요
- API가 아직 안나왔어요

즉 디자인이 완료되어야 마크업을 하고 마크업을 완료해도 API연결까지 기다려야하는 병목현상이 일어난다.

## view = f(state)

- **컴포넌트란 상태라는 인자를 받아서 VIEW를 렌더링해주는 함수**
- 단위 테스트 할 때 마크업 성공 여부는 중요하지 않다.
- **필요한 요소**를 선택해서 **필요한 값이 노출** 되고 있는지가 중요

## 프론트엔드 개발 플로우

- 기능요구 사항 확인 → 코드 작성 ↔ 작성결과 확인(화면) → 개발완료
- 기획서 확인 → 코드 작성 ↔ 테스트 결과 확인 → 개발완료

## 컴포넌트 테스트 구성

1. 초기 상태 주입
2. 테스트 필요한 요소 선택
3. 해당 요소 기능 실행
4. 확인할 요소 선택
5. 확인

## 1. 디자인 없이 개발하기

- 요구사항 정의
  1. 클릭 가능
  2. 버튼 내 문구 기입 가능

```jsx
function Parent() {
  const [title, setTitle] = useState('');

  const handleClick = (e) => {
    console.log(e);
  };

  return (
    <>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Child title={title} onClick={handleClick} />
    </>
  );
}

function Child({ title, onClick }) {
  return (
    <button onClick={onClick} data-testid="button">
      <span data-testid="title">{title}</span>
    </button>
  );
}
```

```jsx
describe('Child 컴포넌트', () => {
  const testTitle = '테스트 제목';

  it('title prop이 올바르게 전달되어야 한다', () => {
    render(<Child title={testTitle} />);

    const titleElement = screen.getByTestId('title');
    expect(titleElement).toHaveTextContent(testTitle);
  });

  it('버튼 클릭 시 onClick 이벤트가 호출되어야 함', () => {
    const mockOnClick = vi.fn();

    render(<Child title={testTitle} onClick={mockOnClick} />);
    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

```jsx
export function Child({ title, onClick }) {
  return (
    <div>
      <h2>Button With Title</h2>
      <button style={{ backgroundColor: 'red' }} onClick={onClick} data-testid="button" />
      <span style={{ color: 'blue' }} data-testid="title">
        {title}
      </span>
    </div>
  );
}
```

- 마크업이 바뀌더라도 testid는 동일하므로 테스트가 통과한다.

## 2. API 없이 개발하기

- 서버로 응답을 받아 화면을 그린다. **!==** API구조에 프론트의 VIEW가 종속
- 프론트에서 필요한 view model은 프론트에서 정의할 수 있다.

### API에 의존적인 구조 변경

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/49ba5954-2cfc-48fc-8ccc-1702dd703bf5/ce3dfbc8-3086-4d2a-b2ae-d29704fb1eb7/image.png)

- API 레이어 : 요청과 응답을 관리하며 인터페이스는 서버에서 정의한테로 작성한다.
- View Model 레이어: View에 직접적으로 사용되는 값을 프론트에서 정의한다.
- View 레이어: View Model에서만 받은 값으로 화면을 그려낸다.

- 요구사항 정의
  1. App 컴포넌트는 API호출하여 응답값을 채워야 한다.
  2. 해당 페이지에서 post의 제목을 볼 수 있다.
  3. 해당 페이지에서 post의 내용을 볼 수 있다.

```jsx
export const useViewModel = () => {
  const [post, setPost] = useState({ title: '', body: '' });

  const fetchPost = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  return {
    title: post.title,
    body: post.body,
  };
};
```

```jsx
function App() {
  const { title, body } = useViewModel();

  return (
    <div>
      <div data-testid="title">{title}</div>
      <div data-testid="body">{body}</div>
    </div>
  );
}
```

- 기대한 응답 구조

```jsx
{
	title:"",
	body:""
}
```

- 실제 API 응답 구조

```jsx
{
	title:{
		userId:"",
	  title:"",
	},
	body:""
}
```

- API Layer

```jsx
export const fetchPosts = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

// API 레이어는 인터페이스를 변형하지 않고 서버와 약속한대로 그대로 전달하는것이 핵심
```

- View Model Layer

```jsx
export const useViewModel = () => {
  const [posts, setPosts] = useState({ title: '', body: '' });

  const loadPosts = async () => {
    try {
      const { title, body } = await fetchPosts();
      const { userId, title } = title;

      setPosts({
        title: `${userId} ${title}`,
        body: `${body}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return posts;
};

// viewMoel의 큰 코드 변경없이 실제 API 구조를 view에 반영할 수 있다.
```

- View Layer

```jsx
function App() {
  const { title, body } = useViewModel();

  return (
    <div>
      <div data-testid="title">{title}</div>
      <div data-testid="body">{body}</div>
    </div>
  );
}
```

```
const MOCK_POST_DATA = {
  userId: '1',
  title: '테스트 제목입니다',
  body: '테스트 본문입니다',
};

vi.mock('./apiLayer', () => ({
  fetchPosts: vi.fn(() => Promise.resolve(MOCK_POST_DATA)),
}));

describe('App 컴포넌트', () => {
  it('post의 title과 body가 올바르게 출력되어야 한다.', async () => {
    render(<App />);

    const titleElement = screen.getByTestId('title');
    const bodyElement = screen.getByTestId('body');

    await waitFor(() => {
      expect(titleElement).toHaveTextContent(
        `${MOCK_POST_DATA.userId} ${MOCK_POST_DATA.title}`,
      );
      expect(bodyElement).toHaveTextContent(MOCK_POST_DATA.body);
    });
  });
});

```

## TDD를 적용한 결과

- 개발 기간 3.5개월 단축
- 웹과 앱이 별개 레포로 되어있는데 vue2에서 vue3로 마이그레이션시 테스트 커버리지 95%인 웹은 이슈생성 0건발생

## Q&A

- API 하나당 뷰모델을 작성하였나요?
  - 그렇지 않다. 컴포넌트의 복잡도가 다양하다. 굳이 뷰모델을 만드는 기준을 어느정도 주자면 서버가 자신의 필요에 의해서 API를 제공했을 때 즉 API를 여러가지를 짜깁기 했을 경우이다. 나는 그런것을 섹션단위로 둬서 구성하였다.
- 개발 기간을 25%나 단축하였는데 주위 평가는 어땠는지?
  - 일정산정에 대한 부분은 모두 엄격하게 지키고 있다. 그럼에도 불구하고 개발 기간을 단축시켰다는 것에 대해서 좋은 어필이 되었다.
- 기능요구사항이 중요한것 같은데 기획서를 어떤 형태로 커뮤니케이션 하는지 궁금하다. 디자인이 나오기 전이면 기능이 명확하지 않을것 같은데 이런 기능사항 정의는 개발자의 몫인가?
  - 일단은 개발자가 하고있다. 개발자가 기획서를 보고 유저 스토리를 뽑고 그리고 유저 스토리를 피처로 변환한다. 기획서에 작성되는 부분의 피처는 유저 스토리와 일치할 때도 있고 아닐 때도 있다.
  - 보통 리뷰하는 시간을 가진다. 이슈가 많은 경우 기획자한테 리뷰 요청을 하거나 요청해준다. 질문을 많이 준비해간다. 유저스토리 안에서 이렇게 동작할것 같은데 API는 어떻게 받아야 할 것 같은데 라는 부분들을 생각하고 리뷰를 진행한다. 이렇게 요구사항을 작성한다.
- BFF 패턴을 이용하여 개발하는 경우 뷰 모델 레이어를 프론트에서 구현할지 백엔드에서 구현할지 궁금합니다.
  - 역할 수행만 된다면 어디 있든 상관없다. 중요한것은 일관성이 있어야 한다. 이 부분이 예외가 생기게 되면 어떤 문제가 생겼을 때에 논의를 자주하는 편이다. 왜냐하면 예외가 생기는 순간 통일이 안된다. 코드 한줄 뿐만 아니라 파일 구조나 모델 정도 수준의 구조 계층이라면 드릴링이 된다. 이런식으로 개발을 시작하게 되면 점점 사이드 이펙트를 제어할 수 없게 되고 이슈가 생긴다. 어느쪽이든 좋다. 다만 한가지 방법을 정해서 그것을 그대로 끌고 가면 좋겠다.

# Ref

https://www.youtube.com/watch?v=P9ItzDrPlso&t=1296s
