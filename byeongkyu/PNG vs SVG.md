# PNG vs SVG in Next.js/React

## 1. PNG vs SVG: 기본 개념
### PNG (Portable Network Graphics)
- 래스터 기반 이미지 형식
- 특징: 손실 없는 압축, 투명도 지원
- 용도: 복잡한 이미지, 사진

### SVG (Scalable Vector Graphics)
- 벡터 기반 이미지 형식
- 특징: 확장 가능, 수학적 정의로 표현
- 용도: 로고, 아이콘, 간단한 일러스트레이션

![](https://velog.velcdn.com/images/kyuuu_ul/post/d510e191-b1b4-420c-9fad-7cda4f73f5c3/image.png)

## 2. Next.js/React 환경에서의 고려사항
### 2.1 성능
- PNG: 파일 크기가 클 수 있음, 다양한 해상도 대응 어려움
- SVG: 작은 파일 크기, 수학적 연산 요구되는 복잡한 이미지에서 안좋음

### 2.2 반응형 디자인
- PNG: 여러 크기의 이미지 필요(이미지가 깨질 수 있음)
- SVG: 단일 파일로 모든 크기 대응 가능

### 2.3 인터랙티비티
- PNG: 정적 이미지, JavaScript로 조작 어려움
- SVG: DOM 요소로 취급, CSS/JS로 쉽게 조작 가능

### 2.4 접근성
- PNG: 대체 텍스트 제공 필요
- SVG: 내부에 설명적 요소 포함 가능, 스크린 리더 친화적

## 3. 성능 최적화
### 3.1 PNG 최적화
- 이미지 압축 도구 사용
- lazy loading 구현

### 3.2 SVG 최적화
- SVGO(SVG파일 최적화)도구 사용

## 4. 사용 시나리오별 추천
- 로고 및 아이콘: SVG
- 데이터 시각화: SVG
- 복잡한 일러스트레이션: PNG
- 사진: PNG

### Webp
JPEG의 높은 압축률 + PNG의 다양한 컬러 팔레트

그러나 구형 브라우저에서 지원하지 않음

## 5. 결론
- 프로젝트의 요구사항에 따라 적절한 형식 선택
- 성능, 품질, 유지보수성을 모두 고려
- 혼합 접근: 상황에 따라 PNG와 SVG를 적절히 사용
