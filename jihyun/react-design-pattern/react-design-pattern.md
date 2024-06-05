# React 디자인 패턴

## Compound Pattern

여러 컴포넌트들이 모여 하나의 동작을 수행하는 패턴을 의미합니다.

앱을 개발하다보면 종종 서로를 참조하는 컴포넌트를 만들게 됩니다. 이때 컴포넌트들은 서로 상태를 공유하거나 특정 로직을 함께 사용하기도 하는데요. 이러한 상황에서 컴파운드 패턴을 적용할 수 있습니다.

컴파운드 패턴이 적용된 대표적인 컴포넌트는 Dropdown이 있습니다.

### Context API 활용하기

Context API로 여러 컴포넌트가 공유하는 상태를 다룸으로써 컴파운드 패턴을 적용할 수 있습니다.

다음은 버튼을 누르면 삭제, 수정 메뉴가 나타나고 다시 버튼을 누르면(토글) 메뉴가 사라지는 버튼을 구현한 코드입니다.

```tsx
const FlyOutContext = createContext();

function FlyOut(props) {
  const [open, toggle] = useState(false);

  return <FlyOutContext.Provider value={{ open, toggle }}>{props.children}</FlyOutContext.Provider>;
}

function Toggle() {
  const { open, toggle } = useContext(FlyOutContext);

  return (
    <div onClick={() => toggle(!open)}>
      <Icon />
    </div>
  );
}

function List({ children }) {
  const { open } = useContext(FlyOutContext);
  return open && <ul>{children}</ul>;
}

function Item({ children }) {
  return <li>{children}</li>;
}

FlyOut.Toggle = Toggle;
FlyOut.List = List;
FlyOut.Item = Item;
```

`Toggle`과 `List` 컴포넌트는 `FlyOut` 컴포넌트가 제공하는 상태(`open`)와 상태 업데이트 함수(`toggle`)를 참조하여 기능을 수행합니다.

```tsx
import React from 'react';
import { FlyOut } from './FlyOut';

export default function FlyoutMenu() {
  return (
    <FlyOut>
      <FlyOut.Toggle />
      <FlyOut.List>
        <FlyOut.Item>Edit</FlyOut.Item>
        <FlyOut.Item>Delete</FlyOut.Item>
      </FlyOut.List>
    </FlyOut>
  );
}
```

컨텍스트 프로바이더를 리턴하는 `FlyOut` 컴포넌트로 `Toggle`과 `List`를 감싸주면, 각각의 독립적인 컴포넌트가 내부적으로 필요한 상태와 로직을 Context를 통해 공유하게 됩니다.

### React.Children.map

자식 컴포넌트들을 순회 처리하는 데에도 컴파운드 패턴을 적용할 수 있습니다.

`React.cloneElement`를 사용해서 children 컴포넌트들을 각각 복제한 다음 `open`과 `toggle`을 넘겨줍니다.

```tsx
export function FlyOut(props) {
  const [open, toggle] = React.useState(false);

  return (
    <div>
      {React.Children.map(
        props.children,
        (
          child // children 컴포넌트들을 순회
        ) => React.cloneElement(child, { open, toggle })
      )}
    </div>
  );
}
```

Context를 참조해야했던 첫 번째 예시와는 다르게, props를 통해 전달받기 때문에 props를 바로 사용하여 구현하면 됩니다.

```tsx
function Toggle({ open, toggle }) {
  return (
    <div className="flyout-btn" onClick={() => toggle(!open)}>
      <Icon />
    </div>
  );
}

function List({ children, open }) {
  return open && <ul className="flyout-list">{children}</ul>;
}
```

---

이처럼 컴파운드 패턴을 사용하면 동작 구현에 필요한 상태를 내부적으로 가짐으로써 사용하는 쪽에는 드러나지 않아 추상화된 코드를 작성할 수 있게 됩니다.

또한, 위처럼 하나의 컴포넌트에 하위 컴포넌트를 프로퍼티로 엮어주면 자식 컴포넌트들을 일일이 import하지 않아도 사용할 수 있게 됩니다.

```tsx
// 프로퍼티로 엮기
FlyOut.Toggle = Toggle
FlyOut.List = List
FlyOut.Item = Item

// 사용부
<Flyout.Toggle>토글</Flyout.Toggle>
```

단, `React.Children.map`을 사용하는 경우 사용부에서 자식 컴포넌트를 약속된 형식으로 넘겨줘야 합니다.

```tsx
export default function FlyoutMenu() {
  return (
    <FlyOut>
	    <div> {/* 모르는 컴포넌트다! */}
	      <FlyOut.Toggle />
	      <FlyOut.List>
	        <FlyOut.Item>Edit</FlyOut.Item>
	        <FlyOut.Item>Delete</FlyOut.Item>
	      </FlyOut.List>
		    </FlyOut>
	    </div>
  )
}
```

## HOC Pattern

같은 로직을 여러 컴포넌트에서 재사용하는 방법으로, 고차 컴포넌트(컴포넌트가 다른 컴포넌트를 받는 것)를 활용하는 방법입니다.

HOC는 인자로 넘긴 컴포넌트에게 추가되길 원하는 로직을 가지고 있으며, 해당 로직이 적용된 컴포넌트를 반환합니다.

### 동일한 스타일 적용하기

예를 들어, 여러 컴포넌트에게 동일한 스타일을 적용하고 싶다면 로컬 스코프에 style 객체를 직접 만드는 대신, HOC가 style 객체를 만들어 컴포넌트에게 전달하도록 할 수 있습니다.

```tsx
function withStyles(Component) {
  return props => {
    const style = { padding: '0.2rem', margin: '1rem' } // 재사용할 style 객체
    return <Component style={style} {...props} /> // 인자로 받은 컴포넌트에게 style 적용해서 반환하기
  }
}

const Button = () = <button>Click me!</button>
const Text = () => <p>Hello World!</p>

const StyledButton = withStyles(Button)
const StyledText = withStyles(Text)
```

### 로딩 로직 재사용하기

재사용할 로직을 담은 HOC를 만들어 줍니다.

이 HOC는 단순 JSX 대신, 컴포넌트를 리턴하고 있습니다. 리턴하는 컴포넌트를 살펴보면, data를 호출하는 동안에는 Loading…을 노출시키고, 호출이 완료되면 인자로 받은 Element에 data를 전달하여 렌더링합니다.

```tsx
import React, { useEffect, useState } from 'react';

export default function withLoader(Element, url) {
  return (props) => {
    const [data, setData] = useState(null);

    useEffect(() => {
      async function getData() {
        const res = await fetch(url);
        const data = await res.json();
        setData(data);
      }

      getData();
    }, []);

    if (!data) {
      return <div>Loading...</div>;
    }

    return <Element {...props} data={data} />;
  };
}
```

위 HOC를 사용하려면 다음과 같이 withLoader를 **호출한 것**을 컴포넌트로 사용하면 됩니다.

```tsx
// DogImages.js
import withLoader from './withLoader';

function DogImages(props) {
  return props.data.message.map((dog, index) => <img src={dog} alt="Dog" key={index} />);
}
export default withLoader(DogImages, 'https://dog.ceo/api/breed/labrador/images/random/6');

// 사용부
import DogImages from './DogImages.js';

//...
return <DogImages />; // => withLoader(DogImages, 'http://...') => (props) => { .... return <Element {...props} data={data} />}
```

`withLoader` HOC는 컴포넌트와 url에서 받아오는 데이터에는 관여하지 않고, 그저 데이터를 로딩하는 동안 로딩을 보여주고, 데이터 페칭이 완료되면 데이터를 넘기는 로직을 가질 뿐입니다.

### 여러 고차 컴포넌트 조합하기

공통된 로직을 추가하기 위해 HOC에 또 다른 HOC를 전달할 수 있습니다.

```tsx
import React, { useState } from 'react';

export default function withHover(Element) {
  return (props) => {
    const [hovering, setHover] = useState(false);

    return (
      <Element
        {...props}
        hovering={hovering}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
    );
  };
}
```

```tsx
// DogImages.js
import withLoader from './withLoader';

function DogImages(props) {
  return props.data.message.map((dog, index) => <img src={dog} alt="Dog" key={index} />);
}
export default withHover(withLoader(DogImages, 'https://dog.ceo/api/breed/labrador/images/random/6'));

// 사용부
import DogImages from './DogImages.js';

//...
return <DogImages />; // => DogImages에 로딩 로직도 추가되고 호버 로직도 추가됨
```

---

이렇게 앱 전반적으로 동일하며 커스터마이징 불가한 동작이 여러 컴포넌트에 필요한 경우에 HOC 패턴을 적용할 수 있습니다. 동일한 구현을 직접 여러군데 구현하는 것보다 버그 발생 확률을 줄여주고, 로직을 분리했기 때문에 관심사의 분리가 가능합니다.

그러나 HOC 패턴을 많이 사용하면 컴포넌트의 트리가 깊어질 수 있습니다. 또한, HOC를 여러 번 래핑하는 과정에서 props의 이름이 겹칠 수도 있고 어떤 HOC가 어떤 props에 관련있는지 파악하기 어렵다는 단점이 있습니다.

### Hooks

함수형 컴포넌트가 도입되고 hook을 통해 뷰가 없는 로직을 추출해낼 수 있게 되었습니다. 따라서 hook을 사용하는 것이 여러 계층을 만들게 되는 것을 피할 수 있고 컴포넌트들을 더 일관되도록 구현할 수 있습니다.

Hook을 사용하는 것은 디자인 패턴이 아닐 수 있으나, 여러 전통적인 디자인 패턴들은 hook으로 변경할 수 있습니다.

## Container/Presentational Pattern

비즈니스 로직에서 뷰를 분리하여 관심사를 분리하는 방법입니다. 다음과 같이 2가지 개념이 있습니다.

- `Presentational Components`: 데이터가 어떻게 사용자에게 보여질지에 대해서만 다루는 컴포넌트
- `Container Components`: 어떤 데이터가 보여질지에 대해 다루는 컴포넌트

### Presentational Components

Presentational 컴포넌트는 props를 통해 데이터를 받고 화면에 그리기 위한 스타일 시트를 포함합니다.

```tsx
export default function DogImages({ dogs }) {
  return dogs.map((dog, i) => <img src={dog} key={i} alt="Dog" />);
}
```

여기서 `DogImages` 컴포넌트는 Presentational 컴포넌트로, UI 변경을 위한 상태(`dogs`) 이외의 상태는 갖지 않습니다. 또한, 단순 화면 렌더링을 위한 컴포넌트기 때문에 props를 통해 받은 데이터를 수정하지 않습니다.

### Container Components

Container 컴포넌트는 Presentational 컴포넌트에게 데이터를 전달하는 역할을 하는 컴포넌트입니다.

Presentational 컴포넌트와 달리 외부 API로부터 이미지를 다운로드하는 로직을 포함하고 있습니다. (비즈니스 로직)

```tsx
import React from 'react';
import DogImages from './DogImages';

export default class DogImagesContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      dogs: [],
    };
  }

  componentDidMount() {
    fetch('https://dog.ceo/api/breed/labrador/images/random/6')
      .then((res) => res.json())
      .then(({ message }) => this.setState({ dogs: message }));
  }

  render() {
    return <DogImages dogs={this.state.dogs} />;
  }
}
```

---

이 패턴을 활용하면 자연스럽게 관심사의 분리를 구현할 수 있습니다. Presentational 컴포넌트는 UI를 담당하는 순수함수로 작성되고, Container는 상태와 기타 데이터를 책임지게 됩니다. 또한, Presentational 컴포넌트는 데이터를 변경하지 않고 UI만을 리턴하기 때문에 쉽게 수정이 가능하고 필요한 곳에 재사용할 수도 있습니다.

다만, 훅을 활용한다면 이 패턴을 사용하지 않고도 같은 효과를 볼 수 있으며, 너무 작은 규모의 앱이라면 오버엔지니어링일 수도 있습니다.

## Render props Pattern

props로 JSX를 리턴하는 함수를 전달하는 방법입니다.

```tsx
import React from 'react';
import { render } from 'react-dom';

import './styles.css';

const Title = (props) => props.render();

render(
  <div className="App">
    <Title
      render={() => (
        <h1>
          <span role="img" aria-label="emoji">
            ✨
          </span>
          I am a render prop! <span role="img" aria-label="emoji">
            ✨
          </span>
        </h1>
      )}
    />
  </div>,
  document.getElementById('root')
);
```

여기서 Title 컴포넌트는 props로 받은 render 함수의 리턴값을 리턴합니다. 즉, 컴포넌트 자체에는 JSX를 작성하지 않았지만 JSX를 리턴하는 함수를 호출함으로써 렌더링을 수행합니다.

props를 받는 컴포넌트는 props를 변경하면 다른 UI를 그릴 수 있기 때문에 재사용하기 좋습니다. 이때 props의 이름을 반드시 render로 해야하는 것은 아니며, JSX를 렌더링하는 props이면 됩니다.

```tsx
import React from 'react';
import { render } from 'react-dom';
import './styles.css';

const Title = (props) => (
  <>
    {props.renderFirstComponent()}
    {props.renderSecondComponent()}
    {props.renderThirdComponent()}
  </>
);

render(
  <div className="App">
    <Title
      renderFirstComponent={() => <h1>✨ First render prop! ✨</h1>}
      renderSecondComponent={() => <h2>🔥 Second render prop! 🔥</h2>}
      renderThirdComponent={() => <h3>🚀 Third render prop! 🚀</h3>}
    />
  </div>,
  document.getElementById('root')
);
```

위처럼 단순히 render를 호출하는 것 말고도, 컴포넌트에서 prop을 전달하는 역할도 할 수 있습니다.

```tsx
function Component(props) {
  const data = { ... }

  return props.render(data)
}
<Component render={data => <ChildComponent data={data} />} />
```

---

Render props 패턴을 사용하면 컴포넌트 간 데이터 공유가 가능하고, children prop을 활용하여 해당 컴포넌트를 재사용할 수 있습니다. 또한, 명시적으로 props를 전달하기 때문에 이 props가 어디에서 온 것인지 명시적으로 알 수 있습니다.

그러나 이 패턴도 훅으로 대체가 가능합니다.

## 출처

[https://www.patterns.dev/react](https://www.patterns.dev/react)
