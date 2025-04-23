## 타입정의

```jsx
interface IUser {
  name: string;
  // ...
}

interface UserType {
  name: string;
  // ...
}

interface User {
  name: string;
  // ...
}

interface UserData {
  name: string;
  // ...
}
```

## Boolean

```jsx
const isActivate = true;

const activated = true;

const isActivate = () => true;
```

## 핸들러함수

```jsx
// 동사 + 명사
const handleAddItem = () => ~

// 명사 + 동사
const handleItemAdd = () => ~
```

## 이벤트 핸들러 함수

```jsx
const onSubmit = () => ~

const handleSubmit = () => ~
```

## 함수 표현식 vs 선언식

```jsx
// 함수 선언식
function sayHello() {
  console.log('안녕하세요');
}

// 함수 표현식
const sayHello = () => {
  console.log('안녕하세요');
};

const sayHello = function () {
  console.log('안녕하세요');
};
```

## export

```jsx
export default function Component

function Component
export const Component
```

## 복수형

```jsx
// 데이터 변수에는 복수형(s) 사용

예: `products`, `users`;

//컴포넌트에는 `List`를 붙여 구분

예: `ProductList`, `UserList`;

// 단수형 ~Item
```

## 조건부 체이닝 vs &&

```jsx
// 방식 1
const name = user?.profile?.name;

// 방식 2
const name = user && user.profile && user.profile.name;
```

## 컴포넌트 프롭스 순서

```jsx
<Button
  // 1. 핵심 props
  variant="primary"
  size="large"
  // 2. 이벤트 핸들러
  onClick={handleClick}
  // 3. 조건부 props
  disabled={isLoading}
  // 4. 기타 props
  aria-label="Submit"
  data-testid="submit-button"
/>
// 변수 (보통 짧음) → 함수 (보통 김) 순서
```

## 파일/폴더 네이밍 규칙

- **파일명은 카멜케이스(camelCase)**
  예: `utilFunction.ts`
- **폴더명은 케밥케이스(kebab-case) → 폴더명도 카멜**
  예: `product-detail/`

## 컴포넌트명

- 동일한 UI를 지닌 컴포넌트명의 suffix를 UI 역할에 따라 통일한다.

```jsx
const UserProfileCard
const OrderSummaryCard
```

## wrapper vs container
