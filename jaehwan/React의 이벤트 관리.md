# React의 이벤트 관리

## 서론
리액트 개발을 하며 onClick이벤트의 에러는 왜 에러바운더리에 안잡히지? 에서 리액트 이벤트에 대한 이해도가 없다는 것을 깨달았습니다. 사실 프레임워크, 라이브러리 공부에 대해서 회의적이어서 이긴 했는데 사용 중 이해가 안되는 부분은 너무 찝찝하여 다시 리액트를 바라보게 되었습니다.

주제는 리액트의 이벤트입니다.

## 리액트의 이벤트 관리 개념
React는 모든 이벤트를 root 엘리먼트 레벨에서 단일 리스너로 처리하는 이벤트 위임 패턴을 사용합니다.
React 17부터는 document가 아닌 root 컨테이너에 이벤트를 연결하여 React의 호환성을 향상 시켰고, SyntheticEvent 시스템을 통해 브라우저 간 일관된 동작을 보장하면서도, React 17에서 이벤트 풀링을 제거하여 개발자 경험을 향상시켰습니다.

## 이벤트 위임의 개념과 React의 채택 이유

이벤트 위임(Event Delegation)은 DOM의 이벤트 전파 메커니즘을 활용하는 JavaScript의 기본 패턴으로 여러 자식 요소에 개별 리스너를 붙이는 대신, 부모 요소에 단일 리스너를 연결하여 모든 자식 이벤트를 처리하는 방법입니다.

이벤트가 발생하면 캡쳐, 타겟, 버블링 3가지 단계로 전파됩니다.
캡처 단계 : document => target
타겟 단계 : target
버블링 단계 : target => document

React가 이벤트 위임을 채택한 이유
React 애플리케이션은 종종 수천 개의 인터랙티브 요소를 포함하는데, 각 요소에 개별 리스너를 연결하면 메모리 소비가 급격히 증가합니다.
이벤트 위임을 통해 이벤트 타입당 단 하나의 리스너만 사용하므로 O(n)의 메모리 복잡도를 O(1)로 줄입니다. 또한 동적으로 추가되는 컴포넌트도 자동으로 이벤트 처리가 가능하며, 크로스 브라우저 호환성과 일관된 이벤트 동작을 보장할 수 있습니다.

React의 이벤트 위임을 구현한다면.

```javascript
// 위임 없이 - 여러 개의 리스너
document.getElementById('button1').addEventListener('click', handler);
document.getElementById('button2').addEventListener('click', handler);

// 위임 사용 - 단일 리스너
document.getElementById('parent').addEventListener('click', function(event) {
  if (event.target.matches('button')) {
    handler(event);
  }
});
```

## React의 이벤트 위임 구현 메커니즘

React의 이벤트 시스템은 네이티브 DOM 이벤트를 사용하며, React 16까지는 모든 이벤트 리스너를 document 레벨에 연결했지만, React 17부터는 root 컨테이너에 연결하는 방식으로 변경되었습니다.

이벤트 흐름
이벤트 흐름은 사용자가 버튼을 클릭하면 네이티브 DOM 이벤트가 발생하고, 이 이벤트는 버블링을 통해 React의 root 리스너에 도달합니다.
React는 event.target을 통해 어떤 React 컴포넌트가 이벤트를 처리해야 하는지 결정하고, 네이티브 이벤트를 SyntheticEvent 객체로 래핑하여 크로스 브라우저 호환성을 보장합니다. 마지막으로 해당 컴포넌트의 이벤트 핸들러를 실행합니다.

```jsx
function Button() {
  const handleClick = (syntheticEvent) => {
    console.log('React 핸들러 호출됨');
    console.log(syntheticEvent.nativeEvent); // 원본 DOM 이벤트 접근
  };

  return <button onClick={handleClick}>클릭하세요</button>;
}
```

1. 버튼 클릭
2. JS 이벤트 발생
3. JS 이벤트 버블링 진행 -> root 도달
4. root에서 React가 이벤트를 인터셉트
5. React가 SyntheticEvent 생성
6. handleClick이 SyntheticEvent와 함께 호출됨

React는 렌더링 중에 JSX 이벤트 핸들러를 만나면 해당 이벤트 타입에 대한 리스너를 root에 등록하고, 컴포넌트의 이벤트 핸들러를 내부 데이터 구조에 저장합니다. 실제 DOM 요소에는 어떤 리스너도 연결되지 않으며, 모든 이벤트는 root에서 중앙 집중식으로 처리됩니다.
- 포인트 : 실제 DOM의 캡쳐,버블링을 사용하지 않음.

## SyntheticEvent 시스템의 역할과 구조

SyntheticEvent는 네이티브 브라우저 이벤트를 감싸는 크로스 브라우저 래퍼입니다. W3C 명세를 따르는 일관된 API를 제공하여 브라우저 간 차이를 추상화합니다. 
모든 SyntheticEvent 객체는 bubbles, cancelable, currentTarget, target, preventDefault(), stopPropagation() 등의 표준화된 속성과 메서드를 포함합니다.

SyntheticEvent는 다음과 같은 정규화를 수행합니다. onMouseLeave는 네이티브 mouseout 이벤트로 매핑되고, onFocus/onBlur는 focusin/focusout을 사용하여 일관된 동작을 보장합니다. 키보드 이벤트의 경우 keyCode, which, charCode를 정규화하며, Internet Explorer의 srcElement를 target으로 매핑하는 등 브라우저별 특수 처리를 수행합니다.

```javascript
// SyntheticEvent의 표준 속성
{
  bubbles: boolean,
  cancelable: boolean,
  currentTarget: DOMEventTarget,  // 핸들러가 등록된 요소
  defaultPrevented: boolean,
  eventPhase: number,
  isTrusted: boolean,
  nativeEvent: DOMEvent,          // 원본 브라우저 이벤트
  preventDefault: Function,
  stopPropagation: Function,
  target: DOMEventTarget,         // 이벤트를 트리거한 요소
  timeStamp: number,
  type: string
}
```

이러한 정규화 레이어는 최소한의 오버헤드만 추가하면서도 크로스 브라우저 이벤트 처리를 위한 커스텀 코드 작성 필요성을 완전히 제거합니다. 번들 크기 영향은 약 0.7%에 불과하며, 런타임 성능 영향은 현대 브라우저에서 무시할 수 있는 수준입니다.

## React 17 Root 사용

React 17은 이벤트 리스너를 document가 아닌 React root 컨테이너에 연결하였습니다.

```javascript
// React 16 이하
document.addEventListener('click', reactEventHandler);

// React 17+
const rootNode = document.getElementById('root');
rootNode.addEventListener('click', reactEventHandler);
```

이 변경이 해결한 문제들.
1. 한 페이지에서 여러 React 버전을 실행할 때 발생하던 이벤트 충돌이 사라졌습니다.
2. jQuery나 바닐라 JavaScript와 같은 다른 라이브러리와의 통합 문제가 개선되었습니다.
3. stopPropagation()의 문제가 해결되었습니다.
	- stopPropagation이 docuemnt에 도달하여 실행된다면 JS이벤트가 이미 동작하고 있게 되는 경우가 생기기 때문에 문제.
4. , 레거시 애플리케이션에서 React를 점진적으로 도입하기가 훨씬 쉬워졌습니다.


## 이벤트 버블링과 캡처링의 실제 동작

React의 이벤트 시스템은 네이티브 DOM의 이벤트 전파 모델을 따르면서도 자체적인 합성 레이어를 통해 처리됩니다. 이벤트는 캡처 단계, 타겟 단계, 버블링 단계를 거치며, React는 이를 onClickCapture와 onClick으로 구분하여 처리합니다.

```jsx
function EventPropagationDemo() {
  const handleParentCapture = () => {
    console.log('부모 캡처 (첫 번째 실행)');
  };

  const handleChildClick = () => {
    console.log('자식 클릭 (두 번째 실행)');
  };

  const handleParentBubble = () => {
    console.log('부모 버블 (세 번째 실행)');
  };

  return (
    <div 
      onClickCapture={handleParentCapture}
      onClick={handleParentBubble}
    >
      <button onClick={handleChildClick}>
        클릭하세요
      </button>
    </div>
  );
}
```

stopPropagation()은 React의 합성 이벤트 시스템 내에서 작동하며, 이벤트가 부모 컴포넌트로 전파되는 것을 막습니다, 모달이나 드롭다운 메뉴 구현 시 특히 유용합니다:

```jsx
function Modal({ isOpen, onClose, children }) {
  const handleOverlayClick = (event) => {
    // 오버레이 클릭 시에만 닫기
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (event) => {
    // 컨텐츠 클릭 시 모달이 닫히지 않도록 방지
    event.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
}
```

중요한 점은 **네이티브 이벤트가 React의 합성 이벤트보다 먼저 실행된다는 것**입니다. 실행 순서는 네이티브 캡처 → 네이티브 타겟 → 네이티브 버블링 → React 합성 이벤트 처리 순입니다.

## 이벤트와 Fiver Tree의 연관 관계

React의 렌더링 단계와 이벤트 시스템은 Fiber 트리를 공유합니다:

```javascript
// Fiber 노드 구조 (간소화)
class FiberNode {
  constructor() {
    this.type = 'button';           // 컴포넌트 타입
    this.props = { onClick: ... };  // 이벤트 핸들러 포함
    this.return = parentFiber;      // 부모 Fiber
    this.child = childFiber;        // 첫 자식
    this.sibling = nextSibling;     // 형제
    this.stateNode = domElement;    // 실제 DOM 참조
  }
}
```

### 렌더링과 이벤트의 연결점
Render Phase: Fiber 트리 구성
Commit Phase: DOM 업데이트 및 이벤트 리스너 등록

```jsx
function CompleteExample() {
  const [count, setCount] = useState(0);
  
  return (
    <div onClick={() => console.log('Div clicked')}>
      <span>Count: {count}</span>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}


```

**React 내부 처리 과정:**
1. Render Phase (Top-Down)
  - 새로운 Fiber 트리 생성
  - props.onClick 확인

 1. Commit Phase(Bottom-Up) - 3단계:
	1. Before Mutation: 스냅샷 저장
	2. Mutation: DOM 업데이트
	3. Layout: 이벤트 리스너 연결
       - root에 필요한 이벤트 타입 등록
       - Fiber 노드에 이벤트 핸들러 매핑

### Complete Work와 이벤트 전파

React의 Complete Work는 렌더링 중 **bottom-up으로 진행**되는데, 이는 이벤트 버블링과 유사합니다:

```jsx
function ComprehensiveDemo() {
  const [phase, setPhase] = useState('');
  
  // 모든 단계를 추적
  const trackEvent = (name, e) => {
    console.log(`${name} - isPropagationStopped: ${e.isPropagationStopped?.()}`);
    setPhase(name);
  };
  
  return (
    <div 
      onClickCapture={(e) => trackEvent('1. Div Capture', e)}
      onClick={(e) => trackEvent('4. Div Bubble', e)}
    >
      <div 
        onClickCapture={(e) => trackEvent('2. Inner Div Capture', e)}
        onClick={(e) => trackEvent('3. Inner Div Bubble', e)}
      >
        <button 
          onClick={(e) => {
            console.log('=== 버튼 클릭 시작 ===');
            console.log('네이티브 타겟:', e.nativeEvent.target);
            console.log('React 타겟:', e.target);
            
            // Fiber 트리 정보 (React DevTools에서 확인 가능)
            console.log('현재 Fiber:', e._targetInst);
            
            // stopPropagation 테스트
            // e.stopPropagation();
          }}
        >
          클릭하여 전파 확인
        </button>
      </div>
      
      <div>현재 단계: {phase}</div>
    </div>
  );
}
```
클릭 시 순서:
 1. 네이티브 이벤트 발생 (button)
 2. 버블링으로 root 도달
 3. React가 가로채서 Fiber 트리 탐색
 4. 캡처 시뮬레이션 (위 → 아래)
 5. 타겟 실행
 6. 버블링 시뮬레이션 (아래 → 위)

## 성능상 이점과 실제 측정 결과

React의 이벤트 위임이 제공하는 성능 이점은 이론적으로는 명확하지만, 실제 측정 결과는 더 미묘한 그림을 보여줍니다. **3000개 이상의 요소를 테스트한 결과, React의 내부 최적화로 인해 커스텀 이벤트 위임을 구현할 필요가 없다는 것이 확인되었습니다**.

```jsx
// 성능 테스트: 3000개 버튼에 대한 직접 핸들러
function DirectHandlers() {
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  return (
    <div>
      {Array.from({length: 3000}, (_, i) => (
        <button 
          key={i}
          onClick={() => setSelectedItems(prev => new Set([...prev, i]))}
          style={{
            backgroundColor: selectedItems.has(i) ? 'blue' : 'gray'
          }}
        >
          버튼 {i}
        </button>
      ))}
    </div>
  );
}
```

성능 측정 결과는 다음과 같습니다. 메모리 사용량에서는 React가 이미 내부적으로 위임을 처리하므로 유의미한 차이가 없었습니다. 초기 렌더링 시간은 3000개 요소 기준 50ms 미만의 차이로 미미했습니다. 이벤트 처리 속도는 DOM 탐색이 적은 직접 핸들러가 약간 더 빨랐지만 실사용에서는 체감되지 않는 수준이었습니다.

**React의 이벤트 위임이 제공하는 실질적 이점**은 메모리 효율성(이벤트 타입당 단일 리스너), 동적 컨텐츠 처리(새로 추가된 요소 자동 처리), 일관된 이벤트 동작(크로스 브라우저 호환성), 그리고 컴포넌트 격리(이벤트 처리가 컴포넌트 경계 내에 캡슐화)입니다.

```jsx
// 이벤트 핸들러 최적화 패턴
import { useCallback, memo } from 'react';

const OptimizedButton = memo(({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 메모이제이션된 핸들러로 불필요한 리렌더링 방지
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <p>카운트: {count}</p>
      <OptimizedButton onClick={handleClick}>
        증가
      </OptimizedButton>
    </div>
  );
}
```

## 이벤트 풀링과 최신 버전의 변화

### 🏊 이벤트 풀링이란?

**이벤트 풀링**은 React 16까지 사용된 메모리 최적화 기법으로, SyntheticEvent 객체를 재사용하여 가비지 컬렉션 부담을 줄이는 방식이었습니다.

```jsx
// React 16 내부 구현 (간소화)
class SyntheticEventPool {
    constructor() {
        this.pool = [];
        this.maxPoolSize = 10;
    }
    
    getPooledEvent(nativeEvent) {
        // 풀에서 이벤트 객체 꺼내기
        if (this.pool.length > 0) {
            const event = this.pool.pop();
            event.nativeEvent = nativeEvent;
            event.target = nativeEvent.target;
            // ... 다른 속성들 설정
            return event;
        }
        // 풀이 비어있으면 새로 생성
        return new SyntheticEvent(nativeEvent);
    }
    
    releaseEvent(event) {
        // 이벤트 핸들러 실행 후 즉시 호출됨
        event.target = null;
        event.nativeEvent = null;
        event.currentTarget = null;
        // 모든 속성을 null로 초기화!
        
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(event);  // 풀에 반환
        }
    }
}
```

### 이벤트 풀링이 일으킨 문제들

#### 대표적인 문제 : 비동기 작업에서 이벤트 접근 불가

```javascript
// React 16에서 자주 발생한 버그
function BadComponent() {
    const handleClick = (e) => {
        console.log(e.target);  // <button> ✅ 정상 동작
        
        setTimeout(() => {
            console.log(e.target);  // null ❌ 에러!
            // Warning: This synthetic event is reused for performance reasons
        }, 100);
    };
    
    return <button onClick={handleClick}>클릭</button>;
}

// 왜 null이 되나?
// 1. 클릭 이벤트 발생
// 2. handleClick 실행
// 3. 함수 실행 끝나면 React가 즉시 이벤트 객체 초기화
// 4. 100ms 후 setTimeout 실행될 때는 이미 초기화됨
```

React 17에서 이벤트 풀링이 제거된 이유는 명확합니다. 현대 브라우저에서는 객체 생성 비용이 크게 줄어들어 성능 이점이 사라졌고, event.persist() 요구사항이 개발자들에게 혼란과 버그의 원인이 되었습니다. **Facebook의 내부 데이터에 따르면 100,000개 이상의 컴포넌트 중 단 20개 미만만이 이 변경으로 인한 수정이 필요했습니다**. 이벤트 풀링 제거로 번들 크기는 약 0.7% 감소했으며, 런타임 성능 저하는 측정되지 않았습니다.

React 18과 19는 이벤트 시스템이 더욱 발전하였습니다.
React 18은 자동 배칭을 모든 이벤트로 확장하여 setTimeout, Promise, 네이티브 이벤트 핸들러 내에서도 상태 업데이트가 자동으로 배칭됩니다. 또한 이벤트 우선순위 시스템을 도입하여 사용자 입력(클릭, 키보드)은 높은 우선순위로, 스크롤이나 마우스 이동은 낮은 우선순위로 처리합니다.
배칭 ? : 여러 개의 상태 업데이트를 하나로 묶어서 단 한 번만 리렌더링하는 최적화 기법

```jsx
// React 18: 자동 배칭
function React18Features() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleClick = () => {
    // 이 업데이트들이 자동으로 배칭됨
    setCount(c => c + 1);
    setName('업데이트됨');
    // 단 한 번의 리렌더링만 발생
  };

  // setTimeout 내에서도 배칭 적용
  const handleTimeout = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setName('지연 업데이트');
      // React 17: 두 번 리렌더링
      // React 18: 한 번만 리렌더링
    }, 1000);
  };

  return (
    <div>
      <button onClick={handleClick}>배칭된 업데이트</button>
      <button onClick={handleTimeout}>타임아웃 배칭</button>
    </div>
  );
}
```

## 결론



 전체 플로우: 
1. 사용자 클릭 
2. 네이티브 이벤트 캡처/버블링 
3. React root에서 이벤트 가로챔 
   ```js
// 이벤트 전파 과정
function EventPropagation() {
    // 1. 캡처 단계 (Capture Phase) - 위에서 아래로
    Window → Document → html → body → div#root → div.parent → button
    
    // 2. 타겟 단계 (Target Phase)
    button (실제 클릭된 요소)
    
    // 3. 버블링 단계 (Bubbling Phase) - 아래에서 위로
    button → div.parent → div#root → body → html → Document → Window
}
```

1. Fiber 트리에서 타겟 찾기 (버블링과 유사한 탐색) 
2. 이벤트 핸들러 실행 → setState 
3. 재조정 시작 
4. BeginWork (캡처와 유사한 Top-Down) 
5. CompleteWork (버블링과 유사한 Bottom-Up) 
6. Commit Phase (DOM 업데이트) 
7. 브라우저 페인팅 
8. 사용자가 변경사항 확인

### 추가 : 에러 바운더리에 onClick 이벤트가 걸리지 않는 이유.

**이유**  

1. 리액트는 root에서 모든 이벤트를 핸들링합니다.
2. 컴포넌트 트리를 따라 내려가며 이벤트를 위임시킵니다.

**[React Error Boundary가 동작하지 않는 이유는?](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html#changes-to-event-delegation)**  

- 실제 에러 발생지는 root이기 때문에 에러 바운더리에서 동작하지 않습니다.

**[왜 이렇게 설계했지?](https://github.com/facebook/react/issues/11409#issuecomment-340859253)**  

- 헨들러에서 예외가 발생하면 원본 컴포넌트를 알 수가 없다.
- 비동기 오류를 React에서 포착할 방법이 없다.

출처 : [https://onlydev.tistory.com/204](https://onlydev.tistory.com/204)
