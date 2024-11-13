# fireEvent vs. userEvent

## fireEvent

- DOM 이벤트를 실행하기 위한 메서드

```tsx
fireEvent(node: HTMLElement, event: Event)
```

```tsx
// <button>Submit</button>
fireEvent(
  getByText(container, 'Submit'),
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })
);
```

### 내부 구현

```tsx
function fireEvent(element, event) {
  return getConfig().eventWrapper(() => {
    if (!event) {
      throw new Error(`Unable to fire an event - please provide an event object.`);
    }
    if (!element) {
      throw new Error(`Unable to fire a "${event.type}" event - please provide a DOM element.`);
    }
    return element.dispatchEvent(event);
  });
}
```

### dispatchEvent?

- EventTarget 객체로 Event를 보내어, 해당 이벤트에 등록된 이벤트 리스너들을 순서대로 호출하는 함수
- 브라우저의 네이티브 이벤트는 이벤트 핸들러를 비동기적으로 호출하지만, dispatchEvent로 발송된 이벤트는 핸들러를 동기적으로 호출
  - 즉, 모든 핸들러의 호출과 반환이 끝나야 dispatchEvent 결과가 return됨

## userEvent

- 브라우저에서 인터랙션이 일어날 때 발생하는 이벤트를 전송하여 **유저 인터랙션을 시뮬레이션**하는 라이브러리
- testing-library의 companion library
  - companion library: 특정 프로그래밍 언어나 프레임워크, 또는 주요 라이브러리와 함께 사용하기 위해 개발된 보조적인 라이브러리. 주된 기능을 보완하고 확장하여 더 편리한 작업을 도움

```tsx
// <button>Submit</button>
await userEvent.click(getByText('Submit'));
```

### 내부 구현

```tsx
behavior.click = (event, target, instance) => {
  const context = target.closest('button,input,label,select,textarea');
  const control = context && isElementType(context, 'label') && context.control;
  if (control) {
    return () => {
      if (isFocusable(control)) {
        focusElement(control);
      }
      instance.dispatchEvent(control, cloneEvent(event));
    };
  } else if (isElementType(target, 'input', { type: 'file' })) {
    return () => {
      // blur fires when the file selector pops up
      blurElement(target);

      target.dispatchEvent(new (getWindow(target).Event)('fileDialog'));

      // focus fires after the file selector has been closed
      focusElement(target);
    };
  }
};
```

### userEvent.foo() 앞에 await를 붙이는 이유?

- userEvent의 메서드는 Promise를 반환함
- 이벤트 핸들러가 비동기적으로 처리되기 때문
- 즉, 이벤트 핸들러의 실행이 완료된 다음에 테스트하기 위해 await 사용 필요

## 정리

- userEvent는 사용자가 브라우저에서 상호작용하는 것처럼 동작함
  - e.g. click시, 버튼에 focus/hover 발생하는 것까지 테스트 가능
- fireEvent는 특정한 한 개의 이벤트를 트리거함
  - e.g. click 시, hover는 모르는 일. 오직 click 이벤트 자체만 생각
