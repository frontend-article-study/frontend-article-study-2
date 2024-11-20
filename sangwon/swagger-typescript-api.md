### `swagger-typescript-api` 용도
- Swagger(OpenAPI) 명세 파일을 사용하여 TypeScript로 API 클라이언트 코드를 자동으로 생성해 주는 라이브러리
- https://github.com/acacode/swagger-typescript-api


#### swagger
- RESTful API의 명세를 작성
- Swagger는 현재 OpenAPI라는 이름으로 발전했으며, OpenAPI Specification(OAS)으로도 불림
- API 명세 작성, 자동 문서화, API 테스트, ...
- API 설계 및 개발 단계에서 발생할 수 있는 의사소통 문제를 줄여줌 -> **클라이언트 api 호출 코드까지 자동 생성해준다면?**

<img width="600" alt="1" src="https://github.com/user-attachments/assets/ffd64a27-7efb-47ed-b4aa-8070b2d8befb">


### `swagger-typescript-api` 주요 기능
- Type Safety : Swagger 명세에서 제공하는 타입 정보를 기반으로 자동으로 TypeScript 타입을 생성하여 타입 안정성 보장
- 자동 생성 코드 : API 호출 코드와 필요한 인터페이스를 자동으로 생성하여 일일이 수동 작성할 필요 X
- 자동화 : CI/CD 과정에서 API 명세 변경할 때마다 최신 API 클라이언트 코드를 자동으로 갱신 가능
  -> API 응답 구조나 필수 param이 변경되면 기존 코드와 호환되지 않아 오류가 발생할 수 있으므로 주의 (테스트 코드로 해결 가능)
- Customizing : 생성된 코드 구조를 커스터마이징할 수 있으며, API 호출 메서드에 추가 옵션이나 인증 헤더 등을 쉽게 추가할 수 있음

### 사용 예시
#### 설치
`swagger-typescript-api` 패키지를 프로젝트에 설치

```bash
npm install swagger-typescript-api --save-dev
```

Swagger 명세 파일(`swagger.json`)을 기반으로 API 클라이언트 코드를 생성하는 방법

```bash
swagger-typescript-api -p ./swagger.json -o ./src/api --name api.ts
```

- `-p` 옵션은 OpenAPI 명세 파일 경로를 지정 (`swagger.json`)
- `-o` 옵션은 생성된 코드가 저장될 경로를 지정(`./src/api`)
- `--name` 옵션은 생성할 파일의 이름을 지정 (`api.ts`)

이렇게 하면 `./src/api/api.ts` 파일이 생성됨
이 파일에는 명세서의 엔드포인트와 타입을 기반으로 한 TypeScript API 클라이언트가 포함됨

### 코드 사용 예시

`api.ts`가 생성되면, 이를 import하여 사용할 수 있, 생성된 코드에서는 각 엔드포인트에 대한 함수가 준비되어 있음

```json
{
  "paths": {
    "/users": {
      "get": {
        "summary": "Get list of users",
        "operationId": "getUsers",
        "responses": {
          "200": {
            "description": "A list of users",
            "schema": {
              "type": "array",
              "items": { "$ref": "#/definitions/User" }
            }
          }
        }
      }
    }
  }
}
```

이 경우, `api.ts`에서 `getUsers` 메서드를 사용 가능

```typescript
import { getUsers } from './src/api/api';

// 사용 예시
async function fetchUsers() {
  try {
    const users = await getUsers();
    console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
```

`swagger-typescript-api`는 API 호출 시 사용하는 HTTP 메서드, 경로, 요청/응답 타입을 자동으로 생성해 주기 때문에 개발자가 직접 API 호출 코드와 타입을 작성할 필요가 없어, 생산성과 코드 안정성을 높이는 데 매우 유용함


### 원격 Swagger 스키마 가져오기
- swagger 불러오는 script 작성

```ts
const { generateApi } = require('swagger-typescript-api');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// OpenAPI 명세 URL
const swaggerUrl = 'https://example.com/path/to/openapi.json'; // 실제 URL로 변경하세요.
const swaggerFilePath = path.resolve(__dirname, 'swagger-temp.json'); // 임시로 저장할 파일 경로
const outputDir = path.resolve(__dirname, 'src/api');

async function generateApiFromUrl() {
  try {
    // OpenAPI 명세 다운로드
    const response = await axios.get(swaggerUrl);
    fs.writeFileSync(swaggerFilePath, JSON.stringify(response.data));

    // 다운로드한 명세로 API 코드 생성
    await generateApi({
      name: 'api.ts',
      output: outputDir,
      input: swaggerFilePath,
      httpClientType: 'axios',
    });
    
    // 임시 파일 삭제
    fs.unlinkSync(swaggerFilePath);
    console.log('API 파일이 성공적으로 업데이트되었습니다.');
  } catch (error) {
    console.error('API 파일 업데이트 중 오류가 발생했습니다:', error);
  }
}

generateApiFromUrl();
```

### [응용] 필요한 엔드포인트들만 api 호출 코드 생성하고 싶다면?
1. swagger 정보 로드
2. 모든 api 정보 주석 처리
3. 주석 해제한 api 로만 code generate
