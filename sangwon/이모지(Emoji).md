## 이모지
- "이모지" = 일본어 絵文字(emoji) = 絵(에)는 그림을, 文字(모지)는 문자를 의미
- "이모티콘" = Emotion + Icon = 감정을 전달하기 위해 사용한 그림 문자
  - ex. :-) 
- 이모지는 감정뿐 아니라 다른 기호나 사물들을 표현하는 "그림 문자", 하지만 혼용되어 사용되고 있음

## 유니코드와 UTF
- 컴퓨터에서 데이터는 0과 1로 표현
- 문자를 0과 1로 저장하는 것 = "문자 인코딩"

### 유니코드?
- 1960년대에 전보를 보내기 위한 기계가 있었음
- 전기 신호로 변환되기 위해 숫자로(0, 1) 변환이 필요한데 **표준**이 필요해서 미국에서 **ASCII**라는 표준을 만듦
  - 표준이 필요한 이유 = 보내는 곳과 받는 곳에서 각 문자의 의미를 판단하는 기준이 필요하기 때문
- ASCII는 7개의 bit 사용 (사용 가능한 문자는 0~127)

<img width="626" alt="1" src="https://github.com/user-attachments/assets/4e0f6d54-91e6-446c-8e71-c1098ce32ed9" />

- 처음 32개 숫자는 줄바꿈 문자, 백스페이스 등을 배당
- 그 뒤로 특수문자들과 숫자를 배당
- 65부터는 알파벳
  - A(100001)는 65에 배당했기 때문에 이진수를 봤을 때 마지막 숫자 2개만 확인해서 몇 번째 알파벳인지 확인 가능
    - B(100010) : 2번째
    - C(100011) : 3번째
- 영어권 국가에서는 알파벳을 사용하기 때문에 ASCII 코드가 표준으로 정착되었으나 비영어권 국가에서는 문제가 있었음
- 그래서 해당 언어들은 각자의 인코딩 방식을 사용함 (ex. 한글은 EUC-KR 인코딩 방식)

- 이후 WWW이 등장하고, 다양한 문자가 포함된 문서들이 전세계 곳곳 전송되기 시작하여 진정한 표준이 필요하게 됨
- 이때 **유니코드**가 등장
  - 유니코드는 유니코드 컨소시엄이라는 비영리 단체에서 관리하는데 전 세계 모든 문자를 표현하기 위해 각 문자에 고유한 코드 포인트(숫자)를 할당

<img width="595" alt="2" src="https://github.com/user-attachments/assets/e3e68e18-9511-4452-b7c1-3507663a2223" />

- 접두사 `U+`는 유니코드를 의미하고 `1F415`는 16진수로 된 코드 포인트
- 문자를 0과 1로 저장하는 것 = "문자 인코딩"
- `UTF` = 유니코드를 인코딩하는 방식 = 코드 포인트를 컴퓨터 메모리에 저장하는 방식
  - UTF-8, UTF-16, UTF-32 등이 존재
  - UTF-32 를 예로 들면, 코드 포인트를 32bit로 저장하는 것
  - `U+1F415`는 `00 01  F4 15`가 되고 메모리에서 4byte를 차지한다.
  - 일반적으로 UTF-8 을 많이 사용

## 이모지가 그림으로 표현되는 이유
- 이모지와 기타 다른 문자들은 유니코드의 각 코드 포인트에 할당되어 있기 때문에 별 차이가 없어 보임 => 이모지도 하나의 문자
- 0과 1로 저장된 데이터를 사람이 읽을 수 있도록 문자 체계로 변환해 화면에 표시해 주는 것을 **글꼴**(폰트)이라 부름
- 글꼴 파일에서 문자 하나하나를 **글리프**라 하고, 각 글리프에 이미지를 넣을 수 있음

- mac에서 서체 관리자 앱을 보면 "Apple Color Emoji"라는 글꼴과 함께 3605개 글리프를 가지고 있다는 설명이 있음

<img width="590" alt="3" src="https://github.com/user-attachments/assets/6eed98c8-10ef-490c-bc79-a902a2a558c1" />

- 텍스트를 특정 글꼴로 타이핑하고 있을 때 이모지가 나오는 경우 해당 글꼴에 이모지 글리프가 없으면 운영체제는 다른 글꼴을 참조하게 됨

<img width="584" alt="4" src="https://github.com/user-attachments/assets/22220ac3-fa88-4386-b07a-437e7879d5e4" />

- 글꼴이 다르면 글자 모양이 다르듯, 기기마다 이모지의 모습도 다름

## Variation Selector
- 어떤 이모지들은 예전부터 유니코드에 존재해왔음
  - 예시로, 검은색 하트는 코드 포인트가 `U+2764`로 1993년부터 존재해왔음
- 이모지에도 ❤️가 있음. 이모지를 위한 글꼴 말고도 다른 글꼴에도 해당 코드 포인트가 존재한다는 것.
- 그럼 운영체제는 둘 중 어떤 글꼴을 렌더링 해야 하는지 결정하는 것일까?
  - 여기서 **Variation Selector**(U+FE0F)가 필요. ❤️도 코드 포인트가 `U+2764`지만 문자 뒤에 `U+FE0F`가 있고, 그래서 다르게 렌더링 됨
- Variation Selector가 없으면 텍스트 스타일로, 있으면 이모지 스타일로 렌더링 됨

## Zero Width Joiner

- ZWJ = Zero Width Joiner
- 북극곰 이모지 예시

```jsx
const polarBear = '🐻‍❄️'
```

- 이 `polarBear` 변수에 spread 문법을 적용

```
[...polarBear] // ['🐻', '', '❅', '️']
```

- 4개의 배열로 나눠지면서 첫 번째로 🐻, 두 번째로 빈 문자열, 세 번째는 ❅ , 네 번째로 빈 문자열이 나옴
- 🐻‍❄️ 는 두 가지 이모지를 조합해서 만들어지는 것 같아 보임
- 그렇다면 빈 문자열은 무엇일까? 
  - JavaScript에서 `charCodeAt`을 사용하면 주어진 index에 해당하는 유니코드 값을 얻을 수 있음

```jsx
const [bear, one, snow, two] = [...polarBear]
one.charCodeAt(0) // 8205
two.charCodeAt(0) // 65039
```

- 유니코드 `8205`는 ZWJ(zero with joiner)이고 `65039`는 앞에서 살펴봤던 Variation Selector
- 검은색 눈결정체 문자는 이미 존재하는 문자이기에 ❄️ 이모지로 표현하려면 Variation Selector가 필요
- 🐻 이모지와 ❄️ 이모지를 합치기 위해서는 ZWJ를 사용
- 이걸 따로 변수에 담아서 테스트

```jsx
const [bear, ZWJ, snow, VARIATION_SELECTOR] = [...polarBear]
const woman = '👩'
const rice = '🌾'
[(woman, ZWJ, rice)].join('') // 👩‍🌾
```

- 이처럼 이모지는 하나로 결합을 할 수 있고, 이모지 조합을 'Emoji ZWJ Sequence'라 함
- 모든 이모지가 조합이 가능한 것은 아니지만 [다양한 조합이 가능](https://emojipedia.org/emoji-zwj-sequence)
- 어쨌거나 문자열 배열로 만들 수 있기 때문에 배열 메서드를 사용해 다음 동작도 가능

```jsx
'👨‍👩‍👦'.replace('👦', '👧') // 👨‍👩‍👧
```

## 이모지 알쓸신잡
### Database

- MySQL에서 이모지를 저장하고 싶었는데 에러가 발생
- MySQL이 UTF-8을 구현했을 때는 3byte 문자만 저장할 수 있어서 생긴 문제. 그래서 DBMS의 인코딩을 utf8mb4로 변경함

### 이모지의 길이

- 이모지 뿐만 아니라 유니코드에서 여러 코드 포인트로 조합된 문자를 제대로 다루지 않으면 버그가 발생할 수 있음
- 이모지 하나(🐻‍❄️)를 지우는데 4번의 키 스트로크가 필요했음. 지우고 나니 "🐻"가 나오는 걸 보니 앞에서 spread 문법으로 나눠지는 각 요소가 하나의 문자로 간주되지 않는 듯 보인다.
- 길이를 구할 때도 문제가 있음

```jsx
const a = 'a'
const b = '가'
const c = '🚀'

a.length // 1
b.length // 1
c.length // 2
```

- `c` 변수에 할당한 이모지는 하나임에도 불구하고 예상과 다르게 길이가 `2`가 나옴
  - JS는 문자열을 UTF-16으로 다루기 때문
- 🚀의 유니코드는 `U+1F680`고 UTF-32로 인코딩하면 `0001F680`, UTF-16로 인코딩하면 `0xD83D`와 `0xDE80`이라고 한다. 그래서 길이가 `2`가 됨
- [Lodash의 `toArray`로 이 문제를 해결](https://stackoverflow.com/a/46085147)

```jsx
import _ from 'lodash'
_.toArray('🐻‍❄️북극곰').length // 4
```

## Emoji 정규 표현식 패턴

### 1. **\p{Emoji}**

- 이모지로 정의된 모든 문자.
- 숫자, 기호, 기본 이모지, 조합형 이모지를 포함.
- **예**: 😀, 🐶, #️⃣, 1️⃣, 👨‍👩‍👧

### 2. **\p{Extended_Pictographic}**

- **픽토그램 스타일의 이모지**만 포함.
- 기호나 숫자 등은 제외.
- **예**: 😀, 🐶, 🏠, 🌳, 👨‍👩‍👧
---
ref.
이모지 이모저모 : https://www.padosum.dev/wiki/Various-Aspects-of-Emoji/
Extended_Pictographic : https://www.emojiall.com/ko/property-extended-pictographic-list
