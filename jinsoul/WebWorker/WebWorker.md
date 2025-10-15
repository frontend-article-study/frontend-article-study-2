- JavaScript엔진은 싱글 스레드
    - **메인 스레드에서 모든 작업 수행**
        - 렌더링
        - 이벤트 처리
        - 로직 실행
    - 무거운 연산 → **UI 블로킹** 발생
    - http://localhost:8000/blocking-test.html
        
        ```jsx
        function blockingCalculation() {
            const beforeCount = count;  // 시작 전 카운터
            const beforeFrame = frameNum;  // 시작 전 프레임
            
            const start = Date.now();
            
            // 5초간 CPU 100% 사용 - 메인 스레드 완전 점유!
            while (Date.now() - start < 5000) {
                Math.sqrt(Math.random() * 999999);
            }
            
            // 차이 계산
            const countDiff = count - beforeCount;  // → 0
            const frameDiff = frameNum - beforeFrame;  // → 0
        }
        ```
        
- Web Worker란?
    - 메인 스레드와 **분리된** 별도의 스레드
    - 무거운 연산을 맡겨도 **UI는 부드럽게** 동작
    - DOM 직접 접근 불가
    - **postMessage**로만 데이터 송수신
- Web Worker 기본 구조
    - **메인 스레드**와 **Worker 스레드** 두 개의 독립된 실행 환경으로 구성
        - **메인 스레드: Worker를 생성하고 관리하는 주체**
            
            ```jsx
            // Worker 생성
            const worker = new Worker('worker.js');
            
            // Worker로 데이터 전송
            worker.postMessage({
              type: 'calculate',
              data: [1, 2, 3]
            });
            
            // Worker로부터 응답 받기
            worker.onmessage = (e) => {
              console.log('결과:', e.data);
            };
            
            ```
            
        - Worker 스레드 (worker.js): 실제 작업을 수행하는 독립된 스레드
            
            ```jsx
            self.onmessage = (e) => {
              const { type, data } = e.data;
            
              // 무거운 연산 수행
              const result = heavyCalculation(data);
            
              // 메인 스레드로 결과 전송
              self.postMessage(result);
            };
            ```
            
    - 통신 구조
        - 메인 스레드와 Worker 스레드는 **메시지 기반 통신**
            
            ```
            메인 스레드  ─────postMessage────→  Worker 스레드
                          (데이터 전송)
                          
            메인 스레드  ←────postMessage────  Worker 스레드
                          (결과 전송)
            ```
            
            - **메인 → Worker**: worker.postMessage()
            - **Worker → 메인**: self.postMessage()
            - 서로 **직접 접근 불가**, 오직 메시지로만 통신
            
            | 종류 | 설명 | 생성 방식 | 주요 특징 |
            | --- | --- | --- | --- |
            | **Dedicated Worker (전용 워커)** | 하나의 메인 스크립트(페이지)와 1:1로 연결된 워커 | `new Worker('worker.js')` | 특정 페이지 전용. 다른 스크립트에서 공유 불가 |
            | **Shared Worker (공유 워커)** | 여러 스크립트나 여러 탭이 같은 워커를 공유 | `new SharedWorker('worker.js')` | 동일 출처(origin) 내 여러 문서가 동일 워커 접근 가능 |
            | **Service Worker (서비스 워커)** | 네트워크 요청을 가로채고 캐시를 제어하는 워커 | `navigator.serviceWorker.register('sw.js')` | PWA, 오프라인 캐시, 푸시 알림 등에 사용 |
            | **Worklet (워클릿)** | 매우 가벼운 미니 워커. CSS나 오디오, 캔버스 렌더링에 사용 | `CSS.paintWorklet.addModule('paint.js')` 등 | 렌더링 파이프라인에 직접 참여 (ex. PaintWorklet, AudioWorklet 등) |
- Worker가 도움이 되지 않을 때
    
    ### 1.  **DOM 접근이 필요한 경우**
    
    **문제**: Worker는 DOM에 접근할 수 없음
    
    ```jsx
    // Worker에서 불가능
    self.onmessage = () => {
      document.getElementById('result').textContent = '완료';
      window.alert('완료');  // 에러!
    };
    
    // 메인 스레드에서만 가능
    document.getElementById('result').textContent = '완료';
    ```
    
    **Worker에서 사용 불가**:
    
    - `document`, `window` 객체
    - DOM 조작
    - `alert()`, `confirm()`, `prompt()`
    - localStorage, sessionStorage
    
    ---
    
    ### **2. 메모리 제약이 있을 때**
    
    **문제**: 데이터 복사로 메모리 2배 사용
    
    - http://localhost:8000/transferable-objects.html
    - postMessage**기본 동작**: 구조화된 복제 (Structured Clone)
        
        ```jsx
        // 데이터가 복사됨
        worker.postMessage(largeData);
        ```
        
        - **10MB 데이터 전송 시**
            - 메인 스레드: 10MB
            - Worker 스레드: 10MB (복사본)
            - **총 20MB 메모리 사용**
    - Transferable Objects
        
        ```jsx
        const buffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
        
        // 소유권 이전 (메모리 복사 X)
        worker.postMessage(
          { type: 'data', buffer },
          [buffer]  // Transferable Objects
        );
        
        // 이제 메인 스레드에서는 buffer 사용 불가
        console.log(buffer.byteLength); // 0
        ```
        
    
    ---
    
    ### **3. 실시간 상호작용이 중요한 경우**
    
    ```jsx
    // 게임 프레임마다 계산 필요 (60fps = 16ms)
    function gameLoop() {
      // Worker 사용 - 통신 지연으로 프레임 드랍
      worker.postMessage({ playerPos, enemies });
      worker.onmessage = (e) => {
        render(e.data);
      };
    
      // 메인 스레드 - 즉시 처리
      const collision = checkCollision(playerPos, enemies);
      render(collision);
    
      requestAnimationFrame(gameLoop);
    }
    ```
    
    ---
    
    ### **4. 외부 라이브러리 사용**
    
    ```jsx
    // Worker에서 라이브러리 사용
    // worker.js
    importScripts('<https://cdn.com/lodash.js>');  // 추가 로딩 필요
    importScripts('<https://cdn.com/moment.js>');
    
    // 메인 스레드 - 이미 로드됨
    import _ from 'lodash';
    import moment from 'moment';
    ```
    
- 참고 하면 좋을 실무 아티클
    
    https://oliveyoung.tech/2025-04-25/web-worker-for-image-processing/
    
    https://tech.kakao.com/posts/442