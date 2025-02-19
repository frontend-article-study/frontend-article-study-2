# document fragment

## document fragment

- DOM 노드를 저장하는 가벼운 컨테이너
- 기본 DOM에 영향을 주지 않고 여러 가지 업데이트를 수행할 수 있는 임시 저장소처럼 동작함
- 업데이트 작업이 완료되면 문서 조각을 DOM에 추가하는 방식
  - 즉, Reflow/Repaint가 한 번 발생함
  - 가상 DOM과 유사

### example code

- 일반적인 방법
  ```jsx
  const Container = document.querySelector('.container');

  for (let i = 0; i < 100; i++) {
    const Div = document.createElement('div');
    Div.textContent = i;
    Container.append(Div); // DOM 업데이트
  }
  ```
- 루트 노드 하나 만들어서 자식 추가 후 루트 append
  ```jsx
  const Container = document.querySelector('.container');
  const tmp = document.createElement('div');

  for (let i = 0; i < 100; i++) {
    const Div = document.createElement('div');
    Div.textContent = i;
    tmp.append(Div);
  }

  Container.appendChild(tmp); // DOM 업데이트
  ```
- document framgent 사용
  ```jsx
  const Container = document.querySelector('.container');
  const Fragment = document.createDocumentFragment();

  for (let i = 0; i < 100; i++) {
    const Div = document.createElement('div');
    Div.textContent = i;
    Fragment.appendChild(Div);
  }
  Container.appendChild(Fragment); // DOM 업데이트
  ```

### Virtual DOM과 비교

- Document Fragment는
  - 변경 사항을 DOM에 일괄 반영하여 Reflow/Repaint 1번만 수행
  - Document Fragment의 조작은 DOM을 직접 조작하는 것이 아니기 때문에 성능 영향 x
  - Document Fragment는 DOM에 렌더링 되지 않음
    - createElement div > div의 자식으로 엘리먼트 여러 개 > div를 문서에 붙임 -> div는 DOM에 렌더링됨
    - create DF > DF 자식으로 엘리먼트 여러 개 > DF를 문서에 붙임 > DF는 DOM에 렌더링되지 않음
    - 즉, DOM에 속하기 때문에 발생하는 부수 효과가 없음 (스타일 재계산 등)
- Virtual DOM는
  - 마찬가지로 변경 사항을 DOM에 일괄 반영
  - 현재 DOM과 VDom을 비교하는 diffing 작업 수행
  - DF를 사용할 때와 다르게, 개발자가 이를 신경쓰지 않아도 됨
