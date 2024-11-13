# requestIdleCallback란?

브라우저가 **유휴 상태(idle)일 때 실행할 콜백**을 예약할 수 있는 메서드입니다.

이 메서드를 사용하면 브라우저 메인 스레드가 바쁠 때는 해당 작업을 연기하고, 한가할 때 수행할 수 있습니다. 따라서 우선순위가 낮은 백그라운드 작업을 수행할 때 유용합니다.

## Usage

```jsx
var handle = window.requestIdleCallback(callback[, options])
```

- `callback`: 유휴 상태에 호출할 함수. `IdleDeadline` 객체를 인수로 받음
- `options`: 옵셔널 매개변수. 콜백이 반드시 호출되어야 하는 최대 시간을 나타내는 `timeout` 속성을 가짐

### IdleDeadline 객체

callback 함수에게 전달되는 객체로, 다음과 같이 구성됩니다.

- `timeRemaining()`: 브라우저가 다음 작업을 실행하기 전까지 얼만큼의 시간이 남았는지를 밀리초 단위로 반환
- `didTimeout`: 브라우저가 아직 유휴 상태가 되지 않았지만, 설정한 timeout 시간이 지나 콜백이 호출되었음을 나타내는 boolean 값

# 언제 사용할까?

기존에는 필수적이지 않은 작업을 추후에 실행되도록 개발자가 직접 예약하는 것이 매우 번거로웠지만, 브라우저는 언제 유휴 상태가 되는지 알고 있기 때문에 `requestIdleCallback`라는 API가 등장하게 되었습니다.

요즘 웹사이트에서는 실행해야 할 스크립트가 매우 많습니다. 그래서 스크립트를 최대한 빨리 실행해야 하지만, 동시에 메인 스레드를 오래 점유하여 사용자에게 방해가 되지 않도록 하는 것이 중요합니다. 따라서 자바스크립트의 실행에 있어서 최적화가 필요한 경우 `requestIdleCallback`을 사용하면 좋습니다.

# 사용 예시

유휴 상태에 실행할 콜백 함수를 `requestIdleCallback`에게 넘겨주면 됩니다.

```jsx
function myNonEssentialWork(deadline) {
  // 유휴 시간 동안 실행하기
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    doWorkIfNeeded();
  }

  if (tasks.length > 0) {
    // 해야 할 일이 남았다면
    requestIdleCallback(myNonEssentialWork); // 다음 유휴 때 마저 실행하기
  }
}

requestIdleCallback(myNonEssentialWork);
```

단, 브라우저가 **매우 바쁜 상황**이라면 콜백이 호출되기 까지 오랜 시간이 걸릴 수 있습니다.

나중에 실행되어도 괜찮지만, 특정 시간 안에는 실행됐으면 하는 상황이라면 `timeout` 옵션을 주어 해결할 수 있습니다.

```jsx
requestIdleCallback(processPendingAnalyticsEvents, { timeout: 2000 });
```

2초라는 시간이 지나서 콜백이 실행되면, `deadline` 객체는 다음과 같이 구성됩니다.

- `timeRemaining()`은 `0`을 반환함
- `didTimeout`은 `true`가 됨

단, timeout 옵션을 주는 것은 사용자에게 중단이 발생(버벅거림)할 수 있어 주의가 필요합니다. 가능하다면 브라우저가 콜백을 호출할 시점을 결정하도록 냅두는 것이 좋습니다.

# 호환성 문제

이 메서드는 실험적 기능으로, **현재 대부분의 브라우저에서 지원하지만 Safari(iOS)에서는 지원되지 않습니다.**

따라서 메서드의 사용 가능 여부를 확인한 다음, 지원하지 않는다면 환경이라면 setTimeout으로 직접 구현하거나 [폴리필](https://www.npmjs.com/package/requestidlecallback-polyfill)을 사용해야 합니다.

```jsx
if ('requestIdleCallback' in window) {
  // Use requestIdleCallback to schedule work.
} else {
  // Do what you’d do today.
}
```

# 참고

[https://developer.mozilla.org/ko/docs/Web/API/Window/requestIdleCallback](https://developer.mozilla.org/ko/docs/Web/API/Window/requestIdleCallback)

[https://developer.chrome.com/blog/using-requestidlecallback?hl=ko](https://developer.chrome.com/blog/using-requestidlecallback?hl=ko)
