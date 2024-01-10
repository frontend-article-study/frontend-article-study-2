# Debounce와 Throttle이란

https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/a1f114ca-ecc5-4e06-ba7d-fb7c59b21c96

- onMouseMove, onChange, scroll, resize 등의 이벤트들은 짧은 시간동안 연속해서 발생하기 때문에 성능 저하를 일으킬 수 있다.
- `Debounce`와 `Throttle`은 DOM 이벤트를 제어하는 방법으로 연속해서 호출되는 이벤트의 실행 빈도를 줄여 성능상의 이점을 얻기 위해 사용한다.
- 두 기술은 일정 시간 간격을 두고 이벤트를 호출한다는 동일한 목표를 가지지만 동작 방식이 서로 다르다.

# Debounce

- 연속적으로 발생하는 이벤트 중에서 마지막 이벤트만 처리하도록 하는 기술

<img width="722" alt="Untitled" src="https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/da4db2d7-cc9c-4d6c-999b-0de7ac4cf497">

- 일정 waiting time 동안 이벤트 호출이 없는 경우 가장 마지막 이벤트를 호출한다.

```jsx
const [text, setText] = useState<string>('')
const [debouncedText, setDebouncedText] = useState<string>('')

const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  // 일반 텍스트는 이벤트 발생할 때마다 계속 text 삽입
  setText(e.target.value)

  let debounceTimer = null

  // 이전에 설정된 타이머를 제거하여 디바운스 효과를 적용
  if (debounceTimer) clearTimeout(debounceTimer)

  // 새로운 타이머를 설정하여 2s 동안 입력이 없을 때만 text 삽입
  debounceTimer = setTimeout(() => {
    setDebouncedText(e.target.value)
  }, 2000)
}
```

https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/e9f803a0-4851-428f-8653-67bcb01efc38

## 사용 예

- 검색 기능

https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/59000506-3ca7-498d-843e-f234865cd9b1

- 윈도우 크기 변경
- 텍스트 에디터의 임시 저장 기능

# Throttle

```
💡 tmi) Throttle이란 원래 ‘누르다, 조르다’라는 의미인데, 연료의 흐름을 조절하는 밸브를 Throttle 밸브라고 부르게 되면서 출력 조절 장치라는 의미로 의미가 확장되었다.
```

- 연속적으로 발생하는 이벤트들을 일정 주기마다 최대 1번씩만 발생하도록 하는 기술

<img width="393" alt="Untitled (1)" src="https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/97650dde-db44-441e-8a73-dc9188307454">

```jsx
const [text, setText] = useState('');
const [isThrottled, setIsThrottled] = useState(false);
const [throttledText, setThrottledText] = useState('');

const handleChangeInput = (e) => {
	setText(e.target.value);

  if (!isThrottled) {
    setThrottledText(e.target.value);
    setIsThrottled(true);

    // 2초 후에 Throttle 해제
    setTimeout(() => {
      setIsThrottled(false);
    }, 2000);
  }
};
```

https://github.com/frontend-article-study/frontend-article-study-2/assets/72495712/900ba53a-be86-4323-914c-762a789dd816

## 사용 예

- 스크롤 이벤트
- 윈도우 크기 변경

# 정리

- debounce와 throttle은 모두 setTimeout이라는 Web API에 의해 실행된다.
- Debounce와 Throttle의 차이는 **이벤트를 발생시키는 시점**에 있다.
    - `Debounce` : 입력이 시작되면 입력이 끝날 때까지 무한적으로 기다리다 실행한다.
    - `Throttle` : 입력이 시작되면 일정 주기로 계속 실행한다.
- 검색창의 자동 완성 기능을 만든다면
    - **사용자 측면 :** `Throttle`
    - **성능 측면 :** `Debounce`
- 필요한 상황에 따라 적합한 기술을 사용하면 되겠다!

# 참고

- Debounce, Throttle 관련 라이브러리
    - throttle-debounce
    - lodash
    - RxJS
