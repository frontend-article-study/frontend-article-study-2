# Memory leak(메모리 누수)
컴퓨터 프로그램이 필요하지 않은 메모리를 계속 점유하고 있는 현상이다.

할당된 메모리를 사용한 다음 반환하지 않는 것이 누적되면 메모리가 낭비된다.

즉, 더 이상 불필요한 메모리가 해제되지 않으면서 메모리 할당을 잘못 관리할 때 발생한다.

![](https://velog.velcdn.com/images/kyuuu_ul/post/a966fdc4-ca79-4cc5-a740-1f0954566c60/image.png)

![](https://velog.velcdn.com/images/kyuuu_ul/post/ae1f8d46-99b6-42d5-aeb8-2d1644736bd4/image.png)

대표적인 메모리 누수의 원인은 전역변수 사용, setTimeout, setInterval과 같은 함수 사용 후 clear를 안하는 경우, 클로저 사용 정도가 있습니다.

## 서버환경에서의 확인

`--inspect` 옵션을 통한 디버깅

![](https://velog.velcdn.com/images/kyuuu_ul/post/44758157-89b4-4af8-99f6-93508059588a/image.png)

`chrome://inspect` 경로로 접근하면 아래와같은 디버깅 창을 통해 디버깅이 가능합니다.

![](https://velog.velcdn.com/images/kyuuu_ul/post/1311b434-0e58-4e8c-8f2e-af94f52a449b/image.png)

크롬 기준으로 메모리 프로파일링 옵션은 3가지가 있습니다.

1. Heap snapshot
현재 페이지의 힙 상태를 기록하고 분석할 수 있어요. 성능 개선 전후로 스냅샷을 비교할 때 유용해요.

2. Allocation instrumentation on timeline
메모리 누수가 의심되는 시나리오를 수행하여 메모리 상태를 기록할 수 있어요. 기록을 진행하는 동안 타임라인에 메모리 할당과 해제가 표시돼요. 이를 분석하여 메모리 누수를 디버깅할 수 있어요.

3. Allocation sampling
Allocation instrumentation on timeline과 비슷한 방식으로 기록하지만, Allocation sampling은 메모리 할당을 함수 단위로 간단하게 기록할 수 있어요.

![](https://velog.velcdn.com/images/kyuuu_ul/post/b469de24-ea41-4777-ae83-1bb07db72e0a/image.png)

아래는 요청을 보내는 동안 힙 메모리를 얼마나 사용하는지 나타내는 그래프입니다. 어느 시점에 메모리 누수가 발생했는지는 볼 수 있지만 어떤것이 문제인지는 정확히 알기 힘듭니다.

![](https://velog.velcdn.com/images/kyuuu_ul/post/a915cd4c-026c-47f0-918a-1c60c88ea51d/image.png)

파란색이 많다 - > 메모리 누수가 많다.

회색부분이 많다 -> 메모리 누수를 걱정하지 않아도 된다.

![](https://velog.velcdn.com/images/kyuuu_ul/post/649c1d43-4933-4e70-929b-22d119075070/image.png)

얕은크기(Shallow Size) - 오브젝트 자신의 크기

유지된크기(Retained Size) - 나자신 + 참조하는 오브젝트들의 크기

Shallow Size 보다 Retained Size가 큰 객체나 변수를 집중적으로 디버깅하면 좋습니다.
