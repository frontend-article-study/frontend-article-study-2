<html><head></head><body><h1>Ant Design v5 Custom Theme</h1>
<h2>Ant Design(antd)란?</h2>
<p>알리바바에서 만든 React 기반 UI 컴포넌트 라이브러리</p>
<ul>
<li>
<p>UI를 빠르고 일관성 있게 개발 가능</p>
</li>
<li>
<p>100개 이상의 컴포넌트 제공 (Button, Table, Form 등)</p>
</li>
<li>
<p>디자인 시스템 기반으로 일관된 사용자 경험 제공</p>
</li>
<li>
<p>TypeScript, 접근성(A11y), 다국어 지원 등 포함</p>
</li>
</ul>
<blockquote>
<p><strong>요약:</strong> 빠르고 일관된 UI 구축을 위한 UI 프레임워크</p>
</blockquote>
<hr>
<h2>Custom Theme란? 왜 등장했는가</h2>
<h3>기존 방식의 한계 (v4 이하)</h3>
<ul>
<li>
<p>Less 변수를 직접 수정해야 했음 (<code inline="">@primary-color</code> 등)</p>
</li>
<li>
<p>커스터마이징 가능한 변수 수 제한적</p>
</li>
<li>
<p>디자인 시스템과 연동 어려움</p>
</li>
</ul>
<h3>v5의 변화: Design Token 시스템 도입</h3>
<p>Design Token 기반 Custom Theme 방식 도입됨</p>
<p><strong>등장 배경:</strong></p>
<ul>
<li>
<p>더 유연하고 구조화된 스타일 시스템 필요</p>
</li>
<li>
<p>디자인 툴(Figma 등)과 연동 고려 (Figma 같은 디자인 툴도 Design Token이라는 개념을 도입)</p>
</li>
<li>
<p>다크 모드 및 브랜드 테마 손쉽게 적용 가능</p>
</li>
</ul>
<blockquote>
<p><strong>요약:</strong> 기존 Less 변수 방식의 한계를 극복하기 위한 새로운 테마 시스템</p>
</blockquote>
<hr>
<h2>Design Token이란?</h2>
<p>디자인 속성(색상, 여백, 폰트 등)을 변수처럼 추상화한 개념</p>
<h3>Token 분류</h3>

<img src="https://github.com/user-attachments/assets/893a9bb7-7e8c-404f-8612-ae5ad5a7a400" width="500" alt="1"/>


### 1️⃣ **Seed Token**

- **역할**: 테마를 구성하는 가장 기본적인 디자인 값.  
- **설정 위치**: 사용자가 직접 정의 가능 (`ConfigProvider` → `theme.token`)
- **예시**:  
  ```ts
  colorPrimary: '#1677ff'
  fontSize: 14
  borderRadius: 4
  ```

---

### 2️⃣ **Map Algorithm**

- **역할**: Seed Token을 바탕으로 계산된 스타일 값을 생성하는 내부 알고리즘
- **기능**: 색상 밝기 조정, 크기 보정, 간격 계산 등
- **형태**:  
  ```ts
  (token: SeedToken) => MapToken
  ```
- **예시**:  
  ```ts
  colorPrimaryBg = lighten(colorPrimary, 40%)
  fontSizeLG = fontSize + 2
  ```

- darkAlgorithm 같은 알고리즘도 Map Algorithm을 바꾸는 것임

---

### 3️⃣ **Map Token**

- **역할**: Seed Token 기반으로 파생된 전역 스타일 값  
- **특징**: 여러 컴포넌트에서 재사용 가능, 공통 스타일 설정에 활용
- **예시**:  
  ```ts
  colorPrimaryBg
  colorText
  fontSizeLG
  ```

---

### 4️⃣ **Alias Token**

- **역할**: Map Token에 별칭을 붙인 토큰. 여러 컴포넌트에서 일관된 스타일을 공유
- **특징**: 실제 스타일링 시 가장 많이 참조되는 값
- **예시**:  
  ```ts
  controlOutline
  controlHeight
  motionDurationSlow
  ```

---

### 5️⃣ **Components**

- **역할**: 위에서 파생된 Token들을 기반으로 실제 스타일이 적용되는 컴포넌트
- **특징**: Component Token 안에서 Map Token과 Alias Token을 조합해 사용
- **예시**:  
  ```ts
  Input.colorPrimary = colorPrimary
  Input.borderColor = controlOutline
  Button.height = controlHeight
  ```


</ul>
<blockquote>
<p>Token을 활용하면 글로벌/로컬/컴포넌트 단위까지 유연하게 테마 설정 가능</p>
</blockquote>
<hr>
<h2>활용 방법</h2>
<h3>기본 테마 설정 (Global Token)</h3>

```
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#00b96b',
      fontSize: 16,
      borderRadius: 8,
    },
  }}
  <App/>
</ConfigProvider>
```

<h3>컴포넌트 단위 테마 설정 (Component Token)</h3>

```
<ConfigProvider
  theme={{
    components: {
      Button: {
        colorPrimary: '#ff4d4f',
        borderRadius: 4,
      },
    },
  }}
  <MyButtons />
</ConfigProvider>
```

<h3>다크 모드 적용</h3>

```
import { theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
  }}
  <App />
</ConfigProvider>
```



<hr>

Antd - https://ant.design/components/overview
Antd Theme Editor - https://ant.design/theme-editor/
