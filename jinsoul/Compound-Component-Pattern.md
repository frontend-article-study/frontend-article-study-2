# 🧩Compound Component Pattern

### Compound는 무슨 뜻인가요?

`Compound`는 사전적으로 `복합체`, `합성물`이란 뜻의 명사입니다.

그렇다면 **Compound Component Pattern**(이하 **CCP**)은 자연스럽게 `합성 컴포넌트 패턴`라는 뜻으로 해석할 수 있겠네요.

### CCP?

**CCP**란 관심사가 분리된 **자식 컴포넌트들이**

**부모 컴포넌트의 상태를 공유**하면서 **조합**되고

**하나의 컴포넌트를 생성하는 패턴**입니다.

**CCP**를 적용하면 하나의 작업을 위해 여러 컴포넌트를 만들어 **역할을 분담**하게 할 수 있습니다.

일반적으로 컴포넌트들이 부모-자식 관계를 맺고 있죠.

우리는 이러한 패턴을 분명히 본적이 있습니다.

바로 `html`에서 `select` 요소 인데요!

각 옵션을 독립적으로 관리하면서 전체적인 드롭다운 메뉴를 구성할 수 있습니다.

```jsx
<select name="pets">
  <option value="dog">Dog</option>
	<option value="cat">Cat</option>
  <option value="hamster">Hamster</option>
</select>
```

만약 둘 중 하나의 요소만 사용한다면 어떻게 될까요?

```jsx
<select options="dog:Dog;cat:Cat;hamster:Hamster"></select>
```

지금도 충분히 어지럽지만

여기서 `select` 요소의 속성들을 추가하다보면 더 복잡한 코드가 될것입니다.

**CCP**는 `select`와 `option`처럼 여러 컴포넌트 사이의 복잡한 관계를 단순하게 만들 수 있습니다.

### React Code Example

```jsx
import DropDown from './DropDown'

function App() {
	const buttonLabel = "Click Me!"
  const options = ["Edit", "Delete"]
  // 여러가지 추가 요구사항

  return (
    <div>
      <h1>Component</h1>
      <DropDown
					buttonLabel={buttonLabel}
					options={options}
					//추가 요구사항에 따른 props들 추가
			/>
    </div>
  )
}

export default App
```

```jsx
export default function DropDown(props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>{props.buttonLabel}</button>
      {isOpen && (
        <ul>
          {props.options.map((option, index) => {
            return <li key={index}>{option}</li>
          })}
        </ul>
      )}
    </>
  );
}
```

- `DropDown` 컴포넌트가 가지는 props가 많아 **유지보수가 어렵**습니다.
- 개발자는 어디까지 구현사항이 늘어날지 예측할 수 없으므로
컴포넌트 관계를 고려한 **구현 난이도가 상승**합니다.
- 컴포넌트를 사용하는 개발자는 어떤 props를 사용할지에 대한 **어려움**을 겪게됩니다.

```jsx
function App() {
  const buttonLabel = 'Click Me!';
  const options = ['Edit', 'Delete'];

  return (
    <div>
      <h1>Compound Component</h1>
      <DropDown>
        <DropDown.Button>{buttonLabel}</DropDown.Button>
        <DropDown.List>
          {options.map((option, index) => {
            return <DropDown.Item key={index}>{option}</DropDown.Item>;
          })}
        </DropDown.List>
      </DropDown>
    </div>
  );
}
```

```jsx
import { createContext, useState,useContext } from 'react'
import { styled } from 'styled-components';

const DropDownContext = createContext();

function DropDown(props){
    const [isOpen, setIsOpen] = useState(false)

    return(
        <div>
            <DropDownContext.Provider value = {{isOpen,setIsOpen}}>
                {props.children}
            </DropDownContext.Provider>
        </div>
    )
}

function Button({children}){
    const {isOpen, setIsOpen} = useContext(DropDownContext)

    return(
        <button onClick = {() => setIsOpen(!isOpen)}>
            {children}
        </button>
    )
}

function List({children}){
    const {isOpen} = useContext(DropDownContext)
    return isOpen && <ul>{children}</ul>
}

function Item({children}){
    return <li>{children}</li>
}

DropDown.Toggle = Toggle;
DropDown.List = List;
DropDown.Item = Item;
```

- props drilling을 하지 않으면서 부모 컴포넌트에 모든 props를 넘기지 않아도 됩니다.
필요한 props만 해당 자식 컴포넌트에게 넘길 수 있어 **복잡도가 감소**합니다.
- UI가 관심사에 따라 분리되어 **자식 컴포넌트를 유연하게 이동**시킬 수 있습니다.
- 일일히 **import 할 필요없이** 자식 컴포넌트를 사용할 수 있습니다.
- 동작 구현에 필요한 상태를 내부적으로 가지고 있기 때문에 사용부에서는 **상태를 걱정할 필요가 없습니다.**

### CCP의 단점

- 하나의 역할을 하는 컴포넌트들을 분리하므로 사용부에서 많은 JSX코드를 작성해야합니다.

### Radix Library

```jsx
import * as Dialog from '@radix-ui/react-dialog';

const MyDialog = () => (
  <Dialog.Root>
    <Dialog.Trigger />
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title />
        <Dialog.Description />
        <Dialog.Close />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

// 내부 소스코드
const DialogTitle = React.forwardRef<DialogTitleElement, DialogTitleProps>(
  (props, forwardedRef) => (
    <DialogPrimitive.Title asChild>
      <Heading size="5" mb="3" trim="start" {...props} ref={forwardedRef} />
    </DialogPrimitive.Title>
  )
);

const Dialog = Object.assign(
  {},
  {
    Root: DialogRoot,
    Trigger: DialogTrigger,
    Content: DialogContent,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
  }
);

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
```

### Reference

**[[10분 테코톡] 네이브의 컴포넌트 IoC패턴](https://youtu.be/RNH1KN2pD2Y?si=MIzyFAMNKkkWRrFW)**

**[Compound 패턴](https://patterns-dev-kr.github.io/design-patterns/compound-pattern/)**

**[React Hooks: Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)**