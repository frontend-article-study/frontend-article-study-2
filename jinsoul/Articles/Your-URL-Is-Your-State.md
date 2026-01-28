- 과제에서 URL을 상태로 관리하는 분이 있었음
    - 상품을 추천하는 서비스를 담고 있으므로 공유상태를 생각했을 때 적절하다고는 생각
    - 리뷰에 프론트엔드 개발자가 url을 잘 활용하지 못하는것에 대한 아쉬움 언급
    - URL로 상태를 관리하면 뭐가 좋지..? 생각해봄
    - 복잡한 전역 상태 관리 라이브러리 안써도 되고? 상태 공유가 가능하고,,, 또 뭐있지..?
    - 공유가 가능하면 뭐가 좋지? 필터 말고 뭐가 있지?
- 이 아티클은 아래와 같은 내용을 담고있음
    - URL을 상태로 사용하지 않을 경우 일어날 수 있는 문제
    - URL을 상태로 사용했을 때의 장점
    - 구현하는 방법
    - 실제 서비스에서 사용되고 있는 사례의 좋고 나쁜 예
    - 피해야 할 패턴

---

### 상황: 흔한 쇼핑몰 검색

```jsx
// 우리가 자주 작성하는 코드
const [filters, setFilters] = useState({
  category: 'laptop',
  brand: 'dell',
  price: '500-1000'
});
```

### 문제 발생

**사용자 A:**

1. 필터 10개 설정
2. 마음에 드는 노트북 찾음
3. URL 복사해서 친구에게 전송

**사용자 B (친구):**

1. 링크 클릭
2. 필터 없는 기본 화면만 보임
3. "뭘 보라는 거야?"

**사용자 A (다시):**

1. 좋은 필터 조합 발견
2. 북마크 저장
3. 다음 날 북마크 클릭
4. 처음부터 다시

### 왜 이런 일이?

```
URL: https://store.com/search

실제 상태: {
  category: 'laptop',
  brand: 'dell',
  price: '500-1000',
  sort: 'price',
  page: 2
}
```

**URL과 상태가 분리되어 있음**

### 사용자는 이렇게 생각한다

사용자에게 URL은:

- **위치**: "내가 지금 여기 있어"
- **상태**: "이 화면을 보고 있어"
- **링크**: "이걸 복사하면 너도 같은 걸 볼 거야"
- **저장**: "이걸 나중에 다시 열 수 있어"

**URL에 상태가 없으면 이 모든 게 깨진다.**

> **URL은 UI다!**
> 

---

### URL을 상태로 쓰면 얻는 것

### 1. 공유 가능성

**Before:**

```
"사이트 들어가서, 왼쪽 메뉴에서 노트북 선택하고,
브랜드는 델 체크하고, 가격은 50만원에서 100만원,
정렬은 가격순으로 바꿔봐"
```

**After:**

```
https://store.com/laptops?brand=dell&price=500-1000&sort=price
```

### 2. 북마크 = 상태 저장

```
월요일: 좋은 필터 조합 발견 → 북마크
화요일: 북마크 클릭 → 그대로 복원
```

**다른 상태 관리는?**

- Redux: 북마크 불가
- useState: 북마크 불가
- localStorage: 다른 기기에서 접근 불가

### 3. 브라우저 기능이 공짜

```
뒤로가기 → 이전 필터로
앞으로가기 → 다음 필터로
새로고침 → 그대로 유지
```

**별도 구현 필요 없음**

### 4. SEO

```
https://blog.com/react?tag=hooks&level=advanced
```

- 구글: "리액트 훅 고급 콘텐츠구나"
- 이 URL만 봐도 검색엔진은:
    - react 관련 글
    - hooks 태그
    - advanced 레벨
    
    이라는 **문맥 정보**를 얻는다.
    
- 검색 결과에 정확하게 노출
- 트래픽 증가

### 5. 분석 추적

```
/products → /products?category=laptop → /products?category=laptop&brand=dell
```

- URL이 잘 설계되면 “사용자가 어떤 상태로 이동했는지”
    - 분석 도구가 자동으로 이해할 수 있다.
- 사용자 여정이 URL에 기록됨
    - 아 사용자가 노트북 → Dell까지 좁혔구나
- 별도 트래킹 코드 불필요
    - 만약 URL이 항상 `/products` 하나뿐이라면?
    - 필터를 적용해도 URL 변화가 없음
    
    ```jsx
    /products
    /products
    /products
    ```
    
    - “계속 같은 페이지인데? 변화가 없네?”
    - 이 경우 개발자가 따로 이벤트를 심어야 함
- 각 파라미터 = 분석 차원

---

## 구현: 어떻게 하는가

### URL 구조 이해

```
https://example.com/products/laptop?brand=dell&price=500-1000&sort=price#reviews
         ↓           ↓                     ↓                             ↓
      도메인       경로(Path)         쿼리(Query)                  해시(Hash)

```

### 경로 (Path): 리소스의 계층

```
좋음:
/products/laptop        → 명확한 계층
/users/123/posts        → RESTful한 구조

나쁨:
/page?type=laptop       → 계층이 불명확
/view?id=123           → 의미 파악 어려움
```

**원칙:**

- 명사 사용
- 복수형 선호
- 3단계 이내

### 쿼리 (Query): 필터와 옵션

```
좋음:
?brand=dell&hp          → 필터
?sort=price&order=asc   → 정렬
?page=2                 → 페이지네이션
?from=2024-01-01        → 날짜

나쁨:
?foo=bar                → 의미 불명
?data=eyJhbGc...        → 읽을 수 없음

```

**원칙:**

- 명확한 키 이름
- 기본값은 생략
- 짧고 간결하게

### 해시 (Hash): 페이지 내 위치

```
좋음:
#comments               → 섹션 이동
#L20-L30               → 라인 강조

주의:
- 서버로 전송 안 됨
- SEO 거의 효과 없음
- 현대 앱에서는 경로나 쿼리 권장
```

### 판단 기준

**어떤 상태를 URL에 넣어야 할까?**

**YES인 경우:**

- 다른 사람도 같은 화면을 봐야 함
- 북마크 가능해야 함
- 뒤로가기로 돌아갈 수 있어야 함

```
검색어, 필터, 정렬, 페이지, 탭, 날짜 범위
```

**NO인 경우:**

- 개인 정보 (비밀번호, 토큰)
- 임시 UI (모달 열림/닫힘)
- 입력 중인 데이터
- 고빈도 변경 (마우스 위치)

---

## 기본 구현 (JavaScript)

```jsx
// 1. 읽기
const params = new URLSearchParams(window.location.search);
const brand = params.get('brand') || 'all';
const page = params.get('page') || '1';

// 2. 쓰기
function updateFilters(newBrand) {
  const params = new URLSearchParams(window.location.search);
  params.set('brand', newBrand);

  // 기본값이면 제거 (URL 깔끔하게)
  if (newBrand === 'all') {
    params.delete('brand');
  }

  // URL 변경 (새로고침 없이)
  window.history.pushState({}, '', `?${params.toString()}`);

  // UI 업데이트
  renderProducts();
}

// 3. 뒤로/앞으로 가기 대응
window.addEventListener('popstate', () => {
  renderProducts();  // URL 변경에 맞춰 다시 그리기
});
```

### pushState vs replaceState

```jsx
// pushState: 뒤로가기 가능한 "새 페이지"
// 사용: 필터 변경, 페이지 이동
function changePage(page) {
  params.set('page', page);
  history.pushState({}, '', `?${params}`);
}

// replaceState: 뒤로가기 불필요한 "정제"
// 사용: 검색어 타이핑, 슬라이더 조정 중
function updateSearch(query) {
  params.set('q', query);
  history.replaceState({}, '', `?${params}`);
}
```

**팁: 디바운싱과 함께 사용**

```jsx
import { debounce } from 'lodash';

// 타이핑할 때마다 URL 업데이트하면 히스토리가 넘침
// 해결: 300ms 대기 후 한 번만
// 타이핑마다 URL을 바꾸면 replaceState라도 렌더/라우팅 비용이 커짐
// debounce로 최종 상태만 반영
const updateSearchURL = debounce((query) => {
  params.set('q', query);
  history.replaceState({}, '', `?${params}`);
}, 300);

searchInput.addEventListener('input', (e) => {
  // 검색은 즉시 (UX)
  searchProducts(e.target.value);
  // URL은 디바운스 (히스토리 관리)
  updateSearchURL(e.target.value);
});

```

### React 구현

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [params, setParams] = useSearchParams();

  // 읽기
  const brand = params.get('brand') || 'all';
  const sort = params.get('sort') || 'popular';

  // 쓰기
  const updateFilter = (key, value) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);

      // 기본값이면 삭제
      const defaults = { brand: 'all', sort: 'popular' };
      if (value === defaults[key]) {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      return next;
    });
  };

  return (
    <div>
      <select
        value={brand}
        onChange={e => updateFilter('brand', e.target.value)}
      >
        <option value="all">전체</option>
        <option value="dell">Dell</option>
        <option value="hp">HP</option>
      </select>
    </div>
  );
}

```

### 여러 값 다루기

```jsx
// 방법 1: 구분자 (추천)
?tags=react,hooks,typescript
// 파싱: tags.split(',')

// 방법 2: 같은 키 반복
?tags=react&tags=hooks
// 파싱: params.getAll('tags')

// 방법 3: 범위
?price=500-1000
// 파싱: const [min, max] = price.split('-')
```

---

## 사례: 잘 된 예와 안 된 예

### 좋은 예 1. Stack Overflow - SEO

```
/questions/123/old-title     → 301 → /questions/123/new-title
/questions/123               → 301 → /questions/123/new-title
/questions/123/random-text   → 301 → /questions/123/new-title
```

- 301 → 이 주소는 공식적으로 바뀌었어. 앞으로는 이쪽이 정답이야.
    - 제목 바뀌어도 OK
    - slug 없어도 OK
    - 잘못된 slug도 OK
- SEO: canonical URL 지정
    - URL을 여러 개 허용하면서도
    - 검색엔진에는 **하나만 정답이라고 알려주는 장치**
    - 중복 컨텐츠 판단을 피할 수 있음

```jsx
// 라우팅
app.get('/questions/:id/:slug?', async (req, res) => {
  const question = await getQuestion(req.params.id);
  const correctSlug = slugify(question.title);

  // slug가 없거나 틀렸으면 리다이렉트
  if (!req.params.slug || req.params.slug !== correctSlug) {
    return res.redirect(301,
      `/questions/${req.params.id}/${correctSlug}`
    );
  }

  res.render('question', { question });
});
```

- 본질은 ID이고 나머지는 장식이다.
- **Stack Overflow는 URL에서 “사람이 읽는 부분(slug)”을 신뢰하지 않고, “ID”만 신뢰한다.**

### 좋은 예 2. GitHub - 라인 강조

```
https://github.com/facebook/react/blob/main/src/React.js#L20-L35
```

**저장하는 것:**

- 저장소, 파일, 브랜치
- 라인 번호 (20-35)

**효과:**

- "20줄 봐봐" 대신 링크 하나
- 코드 리뷰 효율
- 정확한 컨텍스트 공유

---

### 좋은 예 3. Google Maps - 뷰 상태

```
https://www.google.com/maps/@37.5665,126.9780,15z
                              ↓       ↓      ↓
                            위도    경도   줌

```

**저장하는 것:**

- 지도 중심점
- 줌 레벨
- 지도 타입

**효과:**

```
Before: "강남역에서 만나!" → 지도 캡처 보내고, 설명하고...
After: "이 링크 봐" → 클릭 한 번
```

---

### 좋은 예 4. 쇼핑몰 - 복잡한 필터

```
https://store.com/laptop?brand=dell,hp&price=500-1500&ram=16&sort=price-asc
```

**저장하는 것:**

- 카테고리
- 브랜드 (여러 개)
- 가격 범위
- 스펙
- 정렬

**효과:**

```
Before: "필터 10개 설정해줘"
After: 링크 하나
```

**구현:**

```jsx
function FilterPanel() {
  const [params, setParams] = useSearchParams();
  const brands = params.get('brand')?.split(',') || [];

  const toggleBrand = (brand) => {
    const newBrands = brands.includes(brand)
      ? brands.filter(b => b !== brand)
      : [...brands, brand];

    setParams(prev => {
      const next = new URLSearchParams(prev);
      newBrands.length
        ? next.set('brand', newBrands.join(','))
        : next.delete('brand');
      return next;
    });
  };

  return brands.map(/* ... */);
}
```

---

### 좋은 예 5. PrismJS - 전체 설정

```
https://prismjs.com/download.html#themes=prism&languages=markup+css+javascript&plugins=line-numbers
```

**저장하는 것:**

- 테마 선택
- 언어 10개
- 플러그인 5개
- = 체크박스 50개 상태

**왜 이렇게?**

- 사용자가 설정 재사용 가능
- 팀원에게 설정 공유
- 파일에 주석으로 넣어두면 추적 가능

**실제 사용:**

```jsx
// 파일 상단에
/* https://prismjs.com/download.html#themes=prism&languages=... */

// 나중에 이 URL 클릭 → 모든 설정 복원
```

---

### 좋은 예 6. Figma - 협업의 혁명

```
https://figma.com/file/abc?node-id=123:456&viewport=100,200,0.5
```

**저장하는 것:**

- 파일
- 선택된 컴포넌트
- 뷰포트 (위치, 줌)

**혁명적인 이유:**

**Before (URL 없을 때):**

```
디자이너: "2페이지 가서요..."
개발자: "어디...?"
디자이너: "왼쪽 Components 펼치고..."
개발자: "음..."
디자이너: "Header 들어가서..."
개발자: "아 이거?"
디자이너: "아니 그 안에 Button..."
```

5분 소요

**After (URL로):**

```
디자이너: "이거요" (링크 전송)
개발자: (클릭)
```

3초 소요

**실제 업무 영향:**

- 디자인 리뷰 50% 시간 단축
- "어디 있어?" 질문 90% 감소
- 이슈 트래커에 정확한 참조

---

### 나쁜 예 1: OneDrive

```
https://onedrive.live.com/?id=CD0633A7367371152C%21172&cid=CD06A73371152C
```

**문제:**

- 사람이 읽을 수 없음
- 어떤 폴더인지 짐작 불가
- 수정 불가능 (ID만 의미 있음)

**비교: Dropbox**

```
https://www.dropbox.com/home/Projects/2024/Website
```

- 폴더 구조 명확
- URL만 봐도 위치 파악
- 일부 지워도 작동 (상위 폴더)

---

### 나쁜 예 2: VSTS (Visual Studio Team Services)

```
https://dev.azure.com/org/_git/repo?path=%2Fsrc%2Ffile.js&version=GBmain&_a=contents
```

**문제:**

- `_git`, `_a`: 내부 구현 노출
- `%2F`: URL 인코딩
- `GBmain`: 불필요한 프리픽스

---

### 좋은 URL의 4가지 특징

1. **읽을 수 있다** (Readable)
    - 사람이 이해 가능
    - 기술 용어 최소화
2. **예측 가능하다** (Predictable)
    - 패턴이 일관적
    - 일부 수정 가능
3. **공유 가능하다** (Shareable)
    - 설명 불필요
    - 맥락 완전히 전달
4. **지속 가능하다** (Durable)
    - 제목 바뀌어도 작동
    - 시간이 지나도 유효

---

## 주의: 피해야 할 실수

### 실수 1: 메모리만 쓰기

```jsx
// 나쁨
const [filters, setFilters] = useState({});

// 결과
새로고침 → 모든 것 사라짐
URL 공유 → 기본 페이지만
뒤로가기 → 상태 날아감
```

**실제 사례:** Reddit 쇼핑몰 불만 영상

- 필터 10개 설정
- 제품 클릭 후 뒤로가기
- 모든 필터 초기화
- 바이럴 영상화됨

---

### 실수 2: 민감 정보

```jsx
// 절대 안 됨
?password=secret
?token=eyJhbGc...
?creditCard=1234-5678
```

**위험한 이유:**

- 브라우저 히스토리 저장
- 서버 로그 기록
- 분석 도구 전송
- Referrer 헤더 노출
- 영구 기록

---

### 실수 3: 불명확한 이름

```jsx
// 나쁨
?foo=true&bar=2&x=dark

// 좋음
?mobile=true&page=2&theme=dark
```

---

### 실수 4: 너무 복잡함

```jsx
// 나쁨: Base64로 거대한 JSON
?config=eyJtZXNzYWdl... (200자)

// 좋음: 단순하게
?status=active&priority=high
```

**언제 너무 복잡한가?**

- 가독성 제로
- 디버깅 불가능
- URL 길이 제한 근접 (2000자)

**해결책:**

- 서버에 저장, ID만 URL에
- 상태 단순화
- localStorage 병행

---

### 실수 5: 뒤로가기 깨뜨리기

```jsx
// 잘못된 사용
// pushState 써야 하는데 replaceState 씀
history.replaceState({}, '', url);

// 결과: 뒤로가기 버튼 무용지물
```

**원칙:**

- 사용자 액션 → `pushState`
- 연속 입력 → `replaceState`

---

### 실수 6: URL 길이 무시

**한계:**

- 브라우저: 2,000자 권장
- 서버: 2,000~8,000자
- 실무: 500자 이내 권장

**해결:**

- 기본값 제거
- 축약 가능하게 설계
- 너무 많으면 서버 저장

---

## 실천: 당장 할 수 있는 것

### 체크리스트

**내 서비스 점검:**

- 검색 결과를 공유할 수 있는가?
- 필터 설정이 새로고침 후에도 유지되는가?
- 뒤로가기 버튼이 예상대로 작동하는가?
- URL만 봐도 현재 상태를 파악할 수 있는가?

**개선할 것:**

- 기본값을 URL에서 제거

```jsx
theme=light
```

- 파라미터 이름을 명확하게
- 민감한 정보 제거
- pushState/replaceState 구분

### 시작하기: 3단계

**1단계: 한 페이지부터**

```jsx
// 가장 많이 쓰는 페이지 하나 선택
// 예: 검색 페이지, 목록 페이지

// 핵심 상태 2-3개만
const [params, setParams] = useSearchParams();
const query = params.get('q');
const sort = params.get('sort');

```

**2단계: 테스트**

```
1. 필터 설정
2. 새로고침 → 유지되나?
3. URL 복사 → 다른 탭에서 열어보기
4. 뒤로가기 → 이전 상태로?
```

**3단계: 점진적 확대**

```
검색 페이지 완료
→ 목록 페이지
→ 상세 페이지
→ 전체 적용
```

### 팀에 제안하기

**디자이너에게:**

```
"URL도 UI의 일부입니다.
와이어프레임에 URL 예시를 추가해주세요."
```

**PM에게:**

```
"검색 결과 공유 시 필터가 유지되도록 하겠습니다.
사용자 불만이 줄어들 것입니다."
```

**개발자에게:**

```
"코드 리뷰 시 URL 설계도 확인합시다.
나중에 바꾸기 어렵습니다."
```

### 마지막 질문

**여러분의 서비스에서:**

1. 사용자가 URL을 복사-붙여넣기 했을 때 작동하나요?
2. 6개월 후에도 북마크가 유효한가요?
3. 비기술적 사용자도 URL을 이해할 수 있나요?
4. URL 설계에 의도적인 결정을 내렸나요?

---

## 결론

> "URL은 웹의 가장 오래되고 강력한 상태 관리 도구다"
> 
- 1991년부터 작동
- 공유, 북마크, 히스토리 무료 제공
- 학습 곡선 없음
- 브라우저가 관리

Redux, MobX, Zustand... 모두 훌륭합니다.

하지만 **URL을 먼저 고려하세요**.

---

## 참고 자료

**원문:**

- [Your URL Is Your State](https://alfy.blog/2025/10/31/your-url-is-your-state.html) - Ahmad Alfy
- [URLs are UI](https://www.hanselman.com/blog/urls-are-ui) - Scott Hanselman

**더 읽기:**

- [URL as UI](https://www.nngroup.com/articles/url-as-ui/) - Jakob Nielsen (1999)
- [Cool URIs don't change](https://www.w3.org/Provider/Style/URI) - Tim Berners-Lee (1998)

**API:**

- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)