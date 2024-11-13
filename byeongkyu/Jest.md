# Jest
JavaScript와 TypeScript 코드를 위한 테스팅 프레임워크
스냅샷 테스팅, mock 함수 생성, 코드 커버리지 측정 등의 기능을 제공합니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/80e34505-bf4f-41cd-90aa-75112694f81e/image.png">

## 테스트 파일 Naming
- __tests __ 폴더에 example.js
- example.test.js
- example.spec.js

## describe
연관된 테스트 함수들끼리 그룹화하기 위해 사용

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/c2f8c3a5-b86c-42b8-a611-1841249efa19/image.png">

## Test Matcher
### toBe()
단순한 값 비교

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/cfaeba1c-e0f8-4f61-8408-ef165e4d0748/image.png">

### toEqual()
객체가 일치한지 테스트 할떄 실제 대부분은 객체를 검증하기에 toBe()보다 toEqual()을 많이 사용합니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/07949c34-484a-4217-850c-0f8ce703f096/image.png">

### toBeTruthy(), toBeFalsy()
toBeTruthy()는 테스트 대상이 true로 취급되는 지, toBeFalsy()는 반대로 false로 취급되는 경우 테스트가 통과됩니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/71332329-698b-4e8d-84b0-a1a245fcdfb9/image.png">

### toHaveLength(), toContain()
toHaveLength()는 배열의 길이를 체크할 때 쓰이고, toContain()은 특정 원소가 배열에 들어있는지를 테스트할 때 사용합니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/b944528d-06b6-4fea-be4e-ab83449530ca/image.png">

### toMatch(), toThrow()
toMatch()는 정규식 기반의 테스트를 사용할때 사용하고, 예외 발생 여부를 테스트해야 할 때는 toThrow() 함수를 사용하면 됩니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/1ba42f3b-bc96-4aae-842c-2e5fa3518ff5/image.png">

## Mocking
jest.fn(): 임의의 mock 함수를 생성합니다.

jest.mock(moduleName, factory, options): 모듈 전체를 mock으로 대체합니다.

jest.spyOn(object, methodName): 해당 함수의 호출 여부와 어떻게 호출되었는지만을 알아내야 할 때 사용합니다.

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/f1ce99d8-ca72-42f9-a107-f71348880d12/image.png">

이러한 mock 객체는 .mockImplementation(), .mockReturnValue(), .mockClear() 등의 메서드를 통해 다양한 방식으로 조작할 수 있습니다.

Jest mock을 활용하면 의존성이 높은 코드에 대해서도 효과적으로 테스트를 수행할 수 있습니다.

이를 통해 코드의 품질을 높이고, 리팩토링 및 유지보수를 용이하게 할 수 있습니다.

## Coverage
pacakge.json에 "coverage": "jest --coverage"를 추가한 후 npm run coverage명령어를 이용한 실행

<img src="https://velog.velcdn.com/images/kyuuu_ul/post/381f8728-c4cb-4046-817a-c8e0e7b9fb42/image.png">
