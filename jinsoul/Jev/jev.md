## Jev란?

- TypeSafe AI가 공개한 **의사결정 특화 AI 모델**
- 글을 생성하기보다 애플리케이션에 필요한 **판단**을 반환
    - 입력된 상황을 정해진 기준에 따라 평가
    - 결과를 선택지, 점수, 확률 형태로 제공
- AI의 결과를 서비스 로직에 직접 연결하는 용도로 설계
- Diogo Almeida는 ChatGPT가 언어 생성에는 뛰어나지만, 소프트웨어 자동화에 사용하기에는 출력이 너무 자유롭다고 봄
    - “사람은 자연어로 소통하지만, 소프트웨어에는 정해진 타입과 값이 필요하다.”

## 어떤 문제를 해결할까?

- 이 이메일은 긴급한가?
- 이 문의는 환불·기술·결제 중 어디에 해당하는가?
- 이 게시물은 정책을 위반했는가?
    - 이 작업을 자동 실행해도 되는가?
    - 사람의 검토가 필요한가?

일반적인 챗봇:

```
이 이메일은 내용상 비교적 긴급해 보입니다.
가능하면 담당자에게 빠르게 알려주는 것이 좋겠습니다.
```

- 사람이 읽기에는 자연스럽지만, 애플리케이션이 다음 행동을 결정하기에는 애매함
- Jev는 정해진 형식으로 판단 결과를 반환

```json
{
  "urgent": 0.95,
  "action": "notify",
  "confidence": 0.91
}
```

- 서비스는 이 값을 이용해 바로 분기할 수 있음

```jsx
if (result.urgent > 0.8) {
  notifyManager();
}

if (result.confidence < 0.6) {
  requestHumanReview();
}
```

## Jev의 입력 구조

1. `state`
    - 판단할 대상 또는 현재 상황
    - 이메일, 고객 문의, 상품 정보, 사용자 행동 등
2. `questions`
    - `state`에 관해 판단할 질문
    - 원하는 응답 타입과 판단 기준을 함께 지정

```json
{
  "state": "환불을 요청했는데 3일째 답변을 받지 못했습니다.",
  "questions": {
    "category": {
      "type": "choice",
      "instructions": "문의 유형을 분류하세요.",
      "criteria": {
        "refund": "환불 요청",
        "technical": "기술 문제",
        "general": "일반 문의"
      }
    }
  }
}
```

## Jev의 3가지 판단 방식(선택, 점수, 확률)

### Choice

- 미리 정의된 선택지 중 하나를 선택
- 문의 분류나 담당 부서 배정에 적합
- 각 선택지의 확률과 confidence 제공

```json
{
  "category": {
    "type": "choice",
    "choice": "refund",
    "probabilities": {
      "refund": 0.91,
      "technical": 0.06,
      "general": 0.03
    },
    "confidence": 0.91
  }
}
```

활용 예시:

- 고객 문의 분류
- 담당 부서 배정
- 상품 카테고리 분류
- 여러 도구 중 사용할 도구 선택

### Score

- 사용자가 정의한 단계에 따라 대상을 평가
- 단순한 숫자가 아니라 각 단계에 대한 확률도 반환
- 품질·명확성·위험도·긴급도 평가에 적합

```json
{
  "urgency": {
    "type": "score",
    "score": 2.8,
    "legend": {
      "0": "긴급하지 않음",
      "1": "보통",
      "2": "긴급",
      "3": "매우 긴급"
    },
    "probabilities": {
      "0": 0,
      "1": 0.02,
      "2": 0.16,
      "3": 0.82
    },
    "confidence": 0.82
  }
}
```

활용 예시:

- 이메일 긴급도
- 자소서 명확성
- 콘텐츠 품질
- 거래 위험도

### Noul

- 질문에 대한 `Yes`의 가능성을 0~1 사이의 값으로 반환
- 자동 처리 여부를 결정하는 조건에 적합

```json
{
  "requires_review": {
    "type": "noul",
    "noul": 0.87
  }
}
```

활용 예시:

- 사람이 검토해야 하는가?
- 정책을 위반했는가?
- 근거가 충분한가?
- 자동으로 실행해도 안전한가?

```jsx
import React, { useState } from 'react';

export default function PostEditor() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // 1. 프론트엔드 코드 내부에 판단 기준 문장(Instructions)을 고정해 둡니다.
  const JEV_PRIMITIVES = {
    questions: {
      is_inappropriate: {
        type: "noul", // Yes/No 확률 타입
        instructions: "이 텍스트에 타인을 향한 심한 욕설, 비방, 혹은 불법 광고 유도 내용이 포함되어 있나요?"
      }
    }
  };

  const handlePostSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setWarningMessage('');

    try {
      // 2. 프론트엔드에서 사용자가 입력한 값(content)과 기준을 결합하여 API로 보냅니다.
      // (보안을 위해 실제 서비스에서는 /api/check-safety 같은 나의 백엔드 서버 주소로 보냅니다)
      const response = await fetch('https://typesafe.ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_JEV_API_KEY}` 
        },
        body: JSON.stringify({
          model: "jev-latest",
          state: content, // 사용자가 방금 입력한 글 전체
          questions: JEV_PRIMITIVES.questions
        })
      });

      const data = await response.json();
      const abuseProbability = data.answers.is_inappropriate; // 예: 0.92

      // 3. Jev가 준 확률을 바탕으로 프론트엔드 UI/UX를 즉시 제어합니다 (70~200ms 소요)
      if (abuseProbability > 0.80) {
        setWarningMessage(`⚠️ AI 분석 결과 부적절한 표현이 감지되었습니다. (위험도: ${(abuseProbability * 100).toFixed(0)}%) 수정 후 다시 시도해 주세요.`);
        setIsSubmitting(false);
        return; // 백엔드 등록 프로세스를 차단
      }

      // 4. 안전하다고 판단되면 실제 데이터베이스(DB) 저장 API를 호출합니다.
      await savePostToDatabase(content);
      alert('🎉 글이 성공적으로 등록되었습니다!');
      setContent('');
    } catch (error) {
      console.error("Jev 검사 중 오류 발생:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>커뮤니티 글쓰기</h3>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
        placeholder="타인을 존중하는 따뜻한 글을 남겨주세요."
        rows={6}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      
      {/* Jev가 감지한 경고 문구를 화면에 즉시 렌더링 */}
      {warningMessage && (
        <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
          {warningMessage}
        </div>
      )}

      <button 
        onClick={handlePostSubmit} 
        disabled={isSubmitting}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        {isSubmitting ? 'AI 안전성 검사 중...' : '등록하기'}
      </button>
    </div>
  );
}

// 가상의 DB 저장 함수
async function savePostToDatabase(text: string) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}
```

## GPT도 JSON을 반환할 수 있지 않을까?

- 일반 LLM도 정해진 JSON을 반환할 수 있음
- Jev의 차별점: **텍스트 생성 대신 타입이 지정된 판단과 확률 반환에 특화**
    - **사용자 경험**
        - 기존 LLM의 문장 생성 대기 시간(1~3초)대비 최소 15배~40배 빠른 판단 **속도로** 지연 없는 실시간 화면 전환 구현가능
    - **클라이언트 사이드 가드레일**
        - 부적절한 데이터가 서버나 DB에 도달하기 전 프론트엔드 단에서 즉시 차단하므로 **서버 리소스와 트래픽 비용을 크게 절감**
    - 비용 절감
        - JSON 글자를 생성하는 아웃풋 토큰 비용 없이 확률값만 직접 추출하여 **기존 대비 최대 100~500배의 비용을 절감**

---

## 오픈소스 대안: Laya

- Jev와 비슷하게 `선택`, `점수`, `예·아니오 확률`을 반환
- 내 컴퓨터나 서버에서 직접 실행 가능
- 무료로 공개된 모델이라 수정하거나 서비스에 활용할 수 있음
    - 대신 약 1.7GB의 모델을 내려받아야 하고, 2GB 이상의 메모리가 필요

---

## 실제 활용 사례: 글이나 업무 결과물을 검사하는 린터

- 글 37개를 반복 표현·과도한 설명 등 21개 기준으로 검사
- 총 777개의 판단을 0.7초 이내에 처리
- 예상 비용은 약 0.25센트
- 문제가 발견되면 작성 AI가 다시 검토하도록 구성 가능

```
AI가 문단 작성
→ Jev가 기준별로 검사
→ 문제가 있으면 다시 작성
→ 기준을 통과하면 다음 단계 진행
```

코드 린터가 코드의 문제를 찾는 것처럼, Jev는 글이나 업무 결과물이 미리 정한 기준을 충족하는지 검사하는 **지식 업무용 린터**로 활용할 수 있다.

- 고객 지원 답변 평가
- 위험한 AI Agent 행동 감지
- 급한 이메일 선별
- 적절한 코드 파일 찾기
- 사람의 판단이 필요한 업무 구분

---

## Jev가 유용한 경우

- 고객 문의 자동 분류
- 문의 긴급도 판단
- 게시물 정책 위반 여부 판단
- 상품이나 지원서의 반복 평가
- AI Agent가 다음에 사용할 도구 선택
- 위험한 자동 작업을 사람 승인으로 전환
- 여러 모델 중 작업에 적합한 모델 선택
- 대량의 데이터를 동일한 기준으로 점수화

## Jev가 필요하지 않은 경우

- 일반적인 CRUD 서비스
- 글 작성·요약·번역
- 사용자와 자유롭게 대화하는 챗봇
- 복잡한 이유와 설명을 생성해야 하는 기능
- 한두 번만 수행하는 개인적인 판단
- 명확한 조건문으로 해결할 수 있는 로직

```jsx
if (age >= 18) {
  allowAccess();
}
```

- 기준이 명확한 판단은 AI가 아니라 일반 코드로 처리하는 것이 적절

## 결론

- GPT는 글 생성, 설명, 대화, 복잡한 추론에 적합
- Jev는 분류, 점수화, 조건 분기 같은 반복적인 판단에 적합
- Jev의 핵심은 JSON 출력 자체가 아님
    - 타입이 지정된 판단과 불확실성을 **애플리케이션 로직에 연결**하는 것
- confidence가 낮을 때 사람에게 넘기는 안전장치가 필요

> Jev는 AI의 판단으로 **애플리케이션의 다음 행동을 결정**하기 위한 모델
> 

## 참고 자료

- Introducing System One Models & Jev
- TypeSafe AI
- Jev API 구조 및 개념