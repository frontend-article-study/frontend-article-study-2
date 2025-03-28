## **Evan King: 신입에서 Meta 스태프 엔지니어(IC6)까지 3년 만에 성장한 비결**

Evan King은 Meta에서 신입 엔지니어(IC3)로 시작해 단 3년 만에 스태프 엔지니어(IC6)까지 빠르게 승진했습니다. 이는 보통 6~8년이 걸리는 과정을 단축한 것으로, 운도 따랐지만 **전략적 사고**, **관계 구축**, **긍정적인 마인드**가 주요 성공 요인이었습니다. 

다음은 Evan이 꼽은 **6가지 핵심 원칙**입니다. 

---

## 1. **속도(Speed)가 곧 성장의 배수효과다**
### **핵심 내용**
- **속도는 곧 경쟁력**입니다. 본인의 기본 업무를 남들보다 빠르게 마스터하면 **30% 이상의 추가 시간**이 생기고, 이를 통해 더 큰 임팩트를 만들 수 있습니다.
- **'속도'는 단순한 빠름이 아닙니다.** 정확성을 유지하면서 업무 효율을 높이는 것이 중요합니다.

### **사례**
- Meta 입사 후 첫 프로젝트는 **IS와 알카에다의 선전 콘텐츠를 감지하고 해시 처리**하여 복제본이 플랫폼에 올라오지 않도록 하는 시스템을 개선하는 것이었습니다.
- 예상 기간은 **한 달 이상**이었지만, Evan은 이를 **1주일 만에** 완성했습니다.
- 남은 시간 동안 전체 시스템을 재설계하여 **콘텐츠 수집 시간을 수일에서 몇 초**로 단축했습니다.
- 이로 인해 테러 조직의 콘텐츠가 **확산되기 전에 차단**할 수 있었고, **유해 콘텐츠 감지율이 10배 이상** 증가했습니다.

### **적용 방법**
- **기본 업무를 완벽히 마스터**하세요. 현재 맡은 일에 대해 **반복적으로 최적화**하고, 빠르게 해결할 수 있는 루틴을 만드세요.
- **자동화 도구**나 **스크립트**를 적극 활용해 시간을 단축하세요.
- 시간을 절약한 후에는 **30% 이상의 추가 시간을 전략적으로 사용**해 새로운 프로젝트, 기술 학습, 조직의 문제 해결에 집중하세요.

### 노력했던 사례
1. k8s 배포 환경으로 전환 후, label 붙이면 배포 (ex. dev1~8, stg 등)
2. PR에서 push 하면 자동 배포
3. Tag 생성하면 리얼 배포 시작(빌드 후 배포를 위한 확인 버튼 존재)
4. npm 패키지 개발시, master 머지하면 자동 버전 up 해서 배포
5. swagger 기반으로 API 호출 코드 생성
6. 반복 작업 시, 폴더/파일 자동 생성 script
7. 주기적으로 빌드/배포/성능 개선 (webpack-bundle-analyzer -> rsdoctor, webpack -> rspack)
8. 테스트로 QA 감소


---

## 2. **한 단계 위의 시야로 일하기 (Operating Above Your Level)**
### **핵심 내용**
- **30%의 추가 시간**을 활용하여 **자신보다 한 단계 위의 역할**을 생각하고 행동하세요.
- 주어진 업무만 하는 것이 아니라 **팀과 조직 전체의 문제**를 보고 연결고리를 생각해야 합니다.
- 이는 자연스럽게 승진의 기반이 됩니다. **승진은 더 많은 일을 하는 것이 아니라, 더 큰 가치를 만들어내는 것**입니다.

### **사례**
- Evan은 신입 시절부터 **시니어 엔지니어의 문제 해결 방식을 연구**했습니다.
  - 코드 작성 방식, 문제 분석 방법, 트레이드오프 고려 등 **고수들의 사고방식**을 배웠습니다.
- 시니어 단계에서는 **팀 간의 연결고리와 협업**에 집중했고, 스태프 단계에서는 **조직 전체의 기술 전략과 아키텍처**를 고민했습니다.
- 이러한 사고방식을 통해 **자연스럽게 리더십을 발휘**할 수 있었고, 스태프 엔지니어로의 승진이 **단순한 타이틀이 아닌 실제 역할**이 되었습니다.

### **적용 방법**
- **멘토나 롤모델**을 찾으세요. 그들의 사고방식과 문제 해결 방식을 관찰하고 배우세요.
- **1:1 미팅**이나 **코드 리뷰**를 통해 상위 직급자의 **사고방식과 우선순위**를 이해하세요.
- 자신의 작업뿐만 아니라 **팀과 조직 전체의 관점에서 문제를 바라보는 연습**을 하세요.
- 문제를 해결할 때 '이 결정이 전체 시스템에 어떤 영향을 미칠까?'를 항상 생각하며 더 넓은 시야를 가지세요.


### 노력했던 사례
- 팀에서 가장 일 잘하는 분의 개발, 이슈 정리, 코드 리뷰, 코멘트 남기는 방식까지 따라하려고 노력
- 개발하는 프로젝트가 어떻게 조직 내에서 활용 되는지 파악 (광고주 센터 개발 -> 광고가 어떤 식으로 노출되는지)
- 현재 프로젝트를 개선한 부분이 타 프로젝트에도 적용될 수 있는지 파악 후 공용 패키지로 개발(ex. swagger to API, 공용 github action)

---

## 3. **모두가 완벽한 답을 알고 있는 것은 아니다 (No One Has All The Answers)**
### **핵심 내용**
- **임원, VP, 심지어 CEO도 완벽한 답을 알고 있지 않습니다.** 이 사실을 깨달으면 **두려움 없이 아이디어를 제시**할 수 있습니다.
- **잘못된 답을 두려워하지 않는 것**이 **혁신의 시작**입니다.

### **사례**
- Meta에서는 **Workplace**라는 내부 커뮤니케이션 도구를 사용해 누구나 아이디어를 공유할 수 있었습니다.
- Evan은 자신의 아이디어를 **과감하게 공유**했고, 일부는 **부정적인 반응**을 얻기도 했지만 그중 몇 개는 **VP 및 디렉터와의 1:1 미팅**으로 연결되는 등 큰 기회를 얻었습니다.
- 중요한 것은 **잘못된 아이디어는 빨리 잊혀지지만, 좋은 아이디어는 큰 기회를 가져다준다**는 점입니다.

### **적용 방법**
- **완벽한 답을 찾기보다는, 아이디어를 빨리 공유하고 피드백을 받아 발전**시키세요.
- 아이디어에 대한 **부정적인 피드백을 두려워하지 말고, 오히려 학습의 기회**로 삼으세요.
- **팀 미팅**이나 **공개 채널**에서 자신의 생각을 적극적으로 공유하고, **상위 직급자와의 소통** 기회를 늘리세요.

### 노력했던 사례
- 신입때 혼자서 3~4일 고민한 경우가 많았으나, 물어보면 바로 풀리는 경우가 많았음 -> 하루 고민하고 안되면 바로 조언을 구함
- 기획+개발 회의가 있기 전, 기획서를 자세히 읽고 틀림 여부 상관없이 궁금한 점을 모두 질문 (하지만 아직도 부정적인 피드백이 두려움.)
 
---

## 4. **복잡한 문제일수록 단순한 해결책이 있다 (Simple Solutions to Complex Problems)**
### **핵심 내용**
- 복잡한 기술적 해결책보다 **문제의 본질에 집중**해 가장 간단한 방법을 찾는 것이 중요합니다.
- **기술적 우아함**에 집착하기보다는 **문제를 해결하는 데 가장 효과적인 방법**을 찾아야 합니다.

### **사례**
- **실시간 자살 예방 시스템** 개발 중, 복잡한 ML 모델 대신 **댓글 분석**을 추가해 인식률을 **9%에서 50% 이상**으로 끌어올렸습니다.
- 고도화된 모델보다 **단순한 사용자의 댓글 데이터**가 훨씬 더 좋은 결과를 가져왔습니다.
- **문제의 본질**에 집중한 덕분에 가장 **효율적인 해결책**을 찾을 수 있었습니다.

### **적용 방법**
- 문제를 해결할 때 **가장 단순한 해결책부터 고민**하세요.
- **기술적 우아함이나 최신 기술**에 집착하지 말고, **문제 해결 자체**에 집중하세요.
- **기본으로 돌아가서 문제의 본질**을 다시 한번 생각하고, **고정관념을 버리세요**.

### 노력했던 사례
- FE 프레임워크, 라이브러리를 사용시 원리를 파악하고 사용하려고 노력 (Next app router 나왔을 시, 문서 정리 후 팀 내 공유)

---

## 5. **호의 은행에 투자하기 (Favor Economy)**
### **핵심 내용**
- **초반에 도움을 주고 관계를 쌓으면** 장기적으로 더 큰 기회를 얻을 수 있습니다.
- 이러한 **호의는 복리처럼 불어나** 나중에 커다란 기회로 돌아옵니다.

### 노력했던 사례
- 기획자들이 수시로 질문을 하고, CS 해결을 요청함. 바로 해결해주고 최선을 다해서 알려드림 -> 장애를 일으켜도 함께 잘 커버해주고, 동료평가도 잘 해줌...

---

## 6. **긍정의 힘 (The Power of Positive Motion)**
### **핵심 내용**
- **긍정적인 태도**는 단순한 성격 문제가 아닌 **경력 성장의 가속기**입니다.
- 문제를 인식하되 **부정적인 태도**를 버리고, **건설적인 해결책**을 찾는 것이 중요합니다.
### 노력했던 사례
- 더 노력해야 됨

---

## **결론: 운도 실력이다, 그러나 실력은 준비된 자에게 온다**
- **운이 작용**했지만, 이를 **잡을 준비가 되어 있었기 때문에** 성공할 수 있었습니다.
- **타임라인에 집착하지 말고**, 기본 업무를 마스터하며 **지속 가능한 습관**을 만드세요.
- **속도**, **넓은 시야**, **긍정적인 태도**를 유지하면 성장의 기회는 자연스럽게 찾아옵니다.


Ref. https://www.developing.dev/p/new-grad-to-staff-at-meta-in-3-years
