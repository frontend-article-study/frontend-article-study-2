# (건너뛰어도 되는) 프롤로그

서버와의 통신이 완료되기를 기다리지 않고 UI 업데이트를 우선적으로 처리하고 싶을 때 optimistic update 방식을 사용할 수 있습니다. 예시로는 좋아요 기능이 있죠.

optimistic update를 구현하기 위해서는 현재 UI에 그려진 데이터를 서버와의 통신이 성공적으로 이루어졌을 때의 데이터로 임의 교체하는 작업이 필요합니다.

최근 react-query를 사용하여 공식 문서에서 제공하는 방법을 따라 optimistic update를 구현했었는데요. 공식 문서에서는 위 작업을 `queryClient.setQueryData` 함수를 통해 수행합니다.

이 함수는 현재 UI에 그려진 데이터의 쿼리 키와, 쿼리 키에 해당하는 데이터를 대체할 새로운 데이터를 인수로 받습니다. 즉, newData에 통신이 성공적으로 이루어졌을 때의 데이터를 넣어주면 바로 UI를 업데이트(optimistic update)할 수 있게 됩니다.

```jsx
setQueryData(queryKey, newData);
```

그런데, 현재 데이터에서 특정 부분만 변경한 데이터를 새로운 데이터로 사용하고 싶은 경우 많지 않나요?

이러한 경우를 위해 `newData` 대신 `updater function`을 작성할 수 있습니다.

```jsx
setQueryData(queryKey, (oldData) => newData);
```

`updater function`은 `oldData`를 받기 때문에 `oldData`를 조작해서 리턴함으로써 새로운 데이터를 만들 수도 있겠지요.

이때 주의할 점은 불변성을 지키는 업데이트가 필요하다는 점입니다. 즉, `oldData`를 **직접 수정하면 안 됩니다.**

> **Immutability**
>
> Updates via **`setQueryData`** must be performed in an *immutable* way. **DO NOT** attempt to write directly to the cache by mutating **`oldData`** or data that you retrieved via **`getQueryData`** in place.

그래서 `oldData`를 직접 변경하지 않고 `oldData`에 기반한 새로운 데이터를 만들기 위한 방법으로

1. 객체를 복사하여, 복사본을 수정하는 방법 → lodash.cloneDeep
2. 불변성 관리 라이브러리 사용 → immer

두 가지를 생각했고 어떤 방법이 더 효율적인지 알아보기 위해 두 라이브러리를 비교해보려 합니다.

(이상 긴 프롤로그였습니다…)

# clonedeep

다들 아시겠지만, 참조자료형인 객체는 중첩되어 있을 때 직접 복사하기가 아주 까다롭습니다. (무한 재귀)

그래서 객체의 복사본을 만들 때에는 이미 잘 만들어져있는 라이브러리를 사용하는 것이 편한데요…ㅎㅎ lodash의 `cloneDeep` 함수가 바로 객체의 깊은 복사를 도와주는 역할을 합니다.

```jsx
const oldData = 아주많이중첩된객체;
const copyOfOldData = cloneDeep(oldData);

// key3이 객체 value를 가질 경우
oldData.key1.key2.key3 === copyOfOldData.key1.key2.key3; // false
```

`cloneDeep` 함수로 `oldData`의 복사본을 만들어 변경한다면, `oldData`와는 완전히 다른 객체를 변경하는 것(=직접 수정하지 않는 것)이기 때문에 불변성을 지키는 업데이트를 할 수 있겠습니다.

# immer

불변성을 지키며 상태 업데이트를 도와주는 너무나 유명한 라이브러리입니다. 제가 지금 확인했을 때 위클리 다운로드가 천만 정도 되네요..

`immer`를 사용하면 데이터를 직접 수정하는 것이 아니지만 직접 수정하는 것처럼 데이터를 수정할 수 있습니다.

```jsx
const copyOfObj1 = produce(oldData, (draft) => {
  draft.key1.key2.key3 = 새로운무언가
  draft.key1.push('새로운거');
  draft.key1.key2.pop();
}
```

이렇게 `produce` 함수로 기존 데이터를 어떻게 업데이트할 것인지만 작성해 주면 불변성을 지키는 업데이트가 가능합니다.

# 그래서 어떤 게 더 좋을까?

두 가지 모두 제가 원하는 목적(=불변성을 지키는 업데이트) 달성에 충분하기 때문에, 어떤걸 선택할지 고민이 되어 무심코 clonedeep vs immer 검색해봤는데 역시나 바로 나옵니다.

![issue](./1.png)

그래서 얻은 결론은 `produce`를 사용하는 것이 성능에 더 좋다는 것이었습니다. 그 이유는 다음과 같이 크게 2가지가 있었습니다.

1. 깊은 복사 자체가 매우 비싼 연산이다.
   - 리렌더링 때마다 비싼 복사 연산을 재수행할 경우 성능과 가비지 컬렉터에 부정적인 영향을 준다.
2. 깊은 복사는 매번 다른 참조를 만들기 때문에 메모이제이션이 불가능하다.
   - 참조가 변경되어 매번 컴포넌트를 리렌더링해야해서 결국 불변성이 주는 이점을 없앤다.

### (여담) immer는 다른 참조를 만들지 않는 것인가?

`cloneDeep`의 경우 모든 참조를 변경하지만, `immer`의 경우 변경되지 않은 참조는 재사용하는 **structural sharing 방식**을 사용한다고 합니다..오호..

(또한 Proxy 객체를 사용한다고 하는데, 아직 이 부분은 어렵게 느껴집니다..)

# 읽을 거리

[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

[https://medium.com/hackernoon/introducing-immer-immutability-the-easy-way-9d73d8f71cb3#3bff](https://medium.com/hackernoon/introducing-immer-immutability-the-easy-way-9d73d8f71cb3#3bff)

[https://hmos.dev/deep-dive-to-immer](https://hmos.dev/deep-dive-to-immer)
