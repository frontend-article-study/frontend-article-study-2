## GPGPU

- GPU(Graphics Processing Unit)를 이용한 일반적인 계산(General-Purpose computing on Graphics Processing Unit)
- **GPU의 역할**: 원래는 화면에 무언가를 그려주기 위해 존재하지만, 화면에 그리지 않거나 위치/색깔 연산을 GPU로 하는 것도 범용적으로 GPGPU라고 부름
    - 데이터 분석, 머신러닝

## GPU 연산도구

- NVIDIA의 CUDA와 같은 도구가 있으나, 브라우저에서 바로 사용할 수는 없음
    - 브라우저의 GPU접근은 보안상 위험
    - Windows, Linux, macOS에서 네이티브 앱이나 서버 앱에서만 사용
- 브라우저에서 공식적으로 GPU에 접근할 수 있는 두 가지 라이브러리는 **WebGL**과 **WebGPU**임
    - **WebGL**: 공식적으로 GPGPU를 지원하지 않음
        
        ```jsx
        const gl = canvas.getContext('webgl2'); // GPU 컨텍스트 얻기
        ```
        
        - 전 세계 브라우저의 95% 이상에서 사용 가능함
    - **WebGPU**: GPGPU를 지원함
        
        ```jsx
        const device = await (await navigator.gpu.requestAdapter()).requestDevice(); // GPU 디바이스 얻기
        ```
        
        - 70%가 채 되지 않으며, Safari에서는 아직 지원하지 않음

## 쉐이더

- GPU에서 연산을 위해 실행되는 작은 프로그램(코드)
    - **버텍스 쉐이더 (Vertex Shader)**: 화면의 **어떤 부분에 그림을 그릴지**를 정하는 연산을 수행
    - **프레그먼트 쉐이더 (Fragment Shader)**: 버텍스 쉐이더에서 받은 결과를 바탕으로 **화면에 어떤 색깔로 그릴지**를 정확하게 결정
- WebGL은 쉐이더를 GPU에 넘겨 연산 실행

## 브라우저 GPU 연산의 기본 흐름

1. **데이터 준비**
    - 연산할 데이터를 배열(Array) 형태로 준비함 (CPU가 처리)
2. **GPU로 데이터 전송**:
    - 브라우저가 WebGL/WebGPU API 호출하여 GPU에게 명령 전달
    - GPU 버퍼(메모리)를 생성함
    - 준비된 데이터를 이 버퍼로 넘겨줌
3. **GPU 연산**: **버텍스 쉐이더**와 **프레그먼트 쉐이더** 두 가지 쉐이더를 통해 GPU에서 연산이 이루어짐
    - 셰이더 코드가 수천 개 코어에서 동시에 돌고
    - 결과를 GPU 메모리에 저장.
4. **결과 수신:**
    - canvas와 연결된 GPU 버퍼가 브라우저에 의해 화면에 나타난다.

## 필터링 연산

- 소량 데이터
    - **CPU** : 필터링 시 약 **2.5ms** 정도 소요
    - **GPU** : 필터링 시 약 3.2**ms 정도 소요**
        - **CPU 연산보다 느리다?**
- 1천만개 데이터
    - **CPU 연산 :** 필터링 시 약 **2.6초 ~ 2.8초** 소요
    - **GPU 연산** : 필터링 시 약 **700ms** 정도 소요
- **3천만 개 데이터**
    - **CPU**: 약 **6초** 소요
    - **GPU**: 약 **1.4초 ~ 3.9초** 소요

## 연산 속도 차이의 원인: 코어 수의 차이

![image.png](./image.png)

- GPU는 **병렬 처리**에 강함
- **CPU vs GPU 코어 비교**:
    - CPU: 똑똑한 코어 하나가 그림을 한 땀 한 땀 그리는 방식이며, 코어 수가 많아야 10~20개 수준 → 박사 8명
    - GPU: 여러 개의 코어가 그림을 한 방에 그리는 방식이며, 코어 수가 1**만 개 ~ 1만 5천 개** 수준 → 손빠른 알바 1만 명
- 단순한 연산의 경우, 한 번에 처리할 때 GPU가 훨씬 빠름

## 성능 병목 해소 기법: 핑퐁(Ping-Pong) 기법

- **CPU로의 데이터 전송 병목**: `readPixels`와 같은 함수를 호출하여 GPU에서 CPU로 데이터를 옮겨올 때 병목이 발생함
    - 데이터가 적을 때 CPU 연산이 더 빨랐던 이유
- **연속 연산 시 문제**: 연산을 여러 번 해야 할 경우, 매번 데이터를 CPU로 가져왔다가 다시 GPU로 보내는 과정에서 병목이 계속 추가됨
- **핑퐁 기법:** 두 개의 버퍼를 번갈아 가면서 읽고 쓰기
    - 결과를 CPU로 바로 가져오는 대신, **다시 인풋 버퍼로 넘겨버림**
    - 연산을 계속 진행하고, 최종적으로 값을 가져올 때만 병목을 한 번만 견디면 되므로 시간이 단축됨

## JavaScript 코드와 WebGL2 코드의 비교

- **JavaScript 예시**: `[1, 2, 3, 4, 5]` 배열에 상수 `2`를 곱하는 간단한 연산 (결과: `[2, 4, 6, 8, 10]`)
    - 자바스크립트 코드
        
        ```jsx
        // 배열 [1, 2, 3, 4, 5]에 2를 곱하는 연산
        function multiplyByTwo(inputArray) {
          const result = []
          for (let i = 0; i < inputArray.length; i++) {
            result[i] = inputArray[i] * 2
          }
          return result
        }
        
        // 사용
        const input = [1, 2, 3, 4, 5]
        const output = multiplyByTwo(input)
        console.log(output) // [2, 4, 6, 8, 10]
        ```
        
- **WebGL2 (GPU 연산) 코드**: 동일한 연산을 WebGL2로 작성하면 코드가 **약 30배**로 양이 많아짐
    - 코드가 길지만 여러 데이터를 처리할 때 **같은 코드와 쉐이더를 재사용**하므로 실제 프로덕션 레벨에서는 코드 길이 차이가 크지 않음
    - GPU로 데이터를 실어 나를 **버퍼**를 생성함
    - 인풋 데이터를 버퍼에 담음
    - 이 버퍼를 **Attribute**로 사용하겠다고 명시함
        - 반복문을 돌지 않고 병렬계산
    - WebGL2 코드
        
        ```jsx
        function multiplyByTwoWebGL2(inputArray) {
          // 1. Canvas와 WebGL2 컨텍스트 생성
          const canvas = document.createElement('canvas')
          canvas.width = 1
          canvas.height = inputArray.length
          const gl = canvas.getContext('webgl2')
          
          if (!gl) throw new Error('WebGL2를 지원하지 않습니다')
        
          // 2. 버텍스 셰이더 (화면 위치 결정)
          const vertexShaderSource = `#version 300 es
            layout (location = 0) in vec2 position;
            out vec2 vUv;
            void main() {
              vUv = position * 0.5 + 0.5;
              gl_Position = vec4(position, 0.0, 1.0);
            }
          `
        
          // 3. 프래그먼트 셰이더 (실제 연산이 일어나는 부분)
          const fragmentShaderSource = `#version 300 es
            precision highp float;
            precision highp sampler2D;
            
            in vec2 vUv;
            uniform sampler2D uInput;      // 입력 데이터 (텍스처)
            uniform float uMultiplier;     // 곱할 상수 (2.0) - Uniform
            uniform vec2 uTextureSize;
            out vec4 outColor;
            
            void main() {
              ivec2 coord = ivec2(gl_FragCoord.xy - vec2(0.5));
              vec4 raw = texelFetch(uInput, coord, 0);
              float result = raw.r * uMultiplier; // 실제 곱셈 연산
              outColor = vec4(result, 0.0, 0.0, 1.0);
            }
          `
        
          // 4. 셰이더 컴파일
          function compileShader(gl, type, source) {
            const shader = gl.createShader(type)
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              throw new Error('셰이더 컴파일 실패')
            }
            return shader
          }
        
          // 5. 프로그램 생성 및 링크
          const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
          const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
          const program = gl.createProgram()
          gl.attachShader(program, vertexShader)
          gl.attachShader(program, fragmentShader)
          gl.linkProgram(program)
        
          // 6. 풀스크린 사각형 버퍼 생성 (Attribute로 사용)
          const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
          const vao = gl.createVertexArray()
          gl.bindVertexArray(vao)
          const quadBuffer = gl.createBuffer()
          gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
          gl.enableVertexAttribArray(0)
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0) // Attribute 설정
        
          // 7. 입력 데이터를 텍스처로 변환
          const textureWidth = 1
          const textureHeight = inputArray.length
          const inputTexture = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, inputTexture)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
          
          // 입력 배열을 Float32Array로 변환
          const inputData = new Float32Array(textureWidth * textureHeight * 4)
          for (let i = 0; i < inputArray.length; i++) {
            inputData[i * 4] = inputArray[i] // R 채널에 데이터 저장
          }
          
          gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA32F,
            textureWidth, textureHeight, 0,
            gl.RGBA, gl.FLOAT, inputData
          )
        
          // 8. 출력 텍스처 생성
          const framebuffer = gl.createFramebuffer()
          const outputTexture = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, outputTexture)
          gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA32F,
            textureWidth, textureHeight, 0,
            gl.RGBA, gl.FLOAT, null
          )
          gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, outputTexture, 0
          )
        
          // 9. Uniform 설정 (전역 상수)
          gl.useProgram(program)
          gl.uniform1i(gl.getUniformLocation(program, 'uInput'), 0)
          gl.uniform1f(gl.getUniformLocation(program, 'uMultiplier'), 2.0) // Uniform
          gl.uniform2f(gl.getUniformLocation(program, 'uTextureSize'), textureWidth, textureHeight)
        
          // 10. 텍스처 바인딩 및 렌더링
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, inputTexture)
          gl.viewport(0, 0, textureWidth, textureHeight)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) // GPU 연산 실행
        
          // 11. 결과를 CPU로 읽어오기
          const resultBuffer = new Float32Array(textureWidth * textureHeight * 4)
          gl.readPixels(0, 0, textureWidth, textureHeight, gl.RGBA, gl.FLOAT, resultBuffer)
        
          // 12. 결과 배열로 변환
          const result = []
          for (let i = 0; i < inputArray.length; i++) {
            result[i] = resultBuffer[i * 4] // R 채널에서 결과 읽기
          }
        
          // 13. 메모리 정리
          gl.deleteTexture(inputTexture)
          gl.deleteTexture(outputTexture)
          gl.deleteFramebuffer(framebuffer)
          gl.deleteProgram(program)
          gl.deleteShader(vertexShader)
          gl.deleteShader(fragmentShader)
          gl.deleteBuffer(quadBuffer)
          gl.deleteVertexArray(vao)
        
          return result
        }
        ```
        

## 어려움 및 주의사항

- **데이터 중간 변경의 어려움**: JavaScript의 `forEach`문처럼 연산 중간에 데이터를 실시간으로 바꾸는 것이 WebGL에서는 쉽지 않아 우회방법이 필요함
    
    ```jsx
    let arr = [1,2,3,4,5];
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * 2;   // i번째 요소를 바로 변경 가능
    }
    ```
    
- **부동소수점 문제**:
    - GPU는 기본적으로 **32비트** 숫자를 지원하는 반면, JavaScript 숫자는 **64비트**임
    - 변환 시 값이 바뀌거나 소실될 수 있어 주의해야 함 (Float64에서 Float32로 변환 시 문제 발생 가능)
        
        ```
        JS Number: 0.12345678901234567 (64bit)
        GPU Float32: 0.12345679        (32bit)
        ```
        
- **디버깅의 어려움**: 에러가 발생해도 원인을 알기 어렵거나, 에러조차 보여주지 않는 경우가 많음

## GPGPU 적용 추천 분야

- **대규모 데이터 처리**: 대규모 데이터를 다룰 때
- **오프라인 퍼스트 앱**: 기본적으로 데이터를 브라우저에 저장하므로, 백엔드 통신 없이 빠르게 연산해야 할 때 유용함
- **증권 앱**: 앱 실행 시 데이터를 로컬에 미리 다운로드하는 경우, 숫자가 빠르게 변동하는 연산에 GPGPU를 활용하면 속도 개선에 큰 의미가 있을 것으로 판단 됨

# Ref

https://youtu.be/HfqDEHQn0MU?si=UcCwxlalOAGItpCH