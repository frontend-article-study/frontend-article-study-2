# BEM

BEM은 CSS 방법론 중 하나입니다.

BEM 패턴을 사용하면, 컴포넌트마다 고유한 컨텍스트를 만들 수 있어 모듈화에 이상적이며, 모듈화를 저해하는 css의 상속 및 특수성을 최소화할 수 있습니다.



## 1.BEM(Block, Elements, Modifiers)

### Block

Block은 그 자체로 의미가 있는 컴포넌트 입니다. ex) header, container, menu, checkbox, input 등

![img](https://miro.medium.com/v2/resize:fit:1400/1*09FZssiWmVHWk3I1bNTldw.png)

```
//html
<ul class="menu">...</ul>

//css
.menu {color: #042;}
```



### Element

Element는 블럭을 구성하는 한 부분입니다. 엘리멘트는 블록에 의존적인 형태이며, 명명 규칙은 블럭 뒤에 __를 붙여주고, 엘리먼트 이름을 붙여야 합니다.



![img](https://miro.medium.com/v2/resize:fit:1026/1*4L7UW-Luf3hEhxTN_1tjKw.png)



```
//html
<ul class="menu">
	<li class="menu__elem">tab1</li>
	<li class="menu__elem">tab2</li>
	<li class="menu__elem">tab3</li>
	<li class="menu__elem">tab4</li>
</ul>

//css

good
.menu {color: #042;}
.menu__elem { color: #042; }

bad
.menu .menu__elem { color: #042; } or ul.menu__elem { color: #042; }
```



### Modifier

 Modifier는 블록이나 엘리먼트에 변화를 줄 수 있는 값으로, 모양, 동작 또는 상태를 변경하는데 사용합니다.
![img](https://miro.medium.com/v2/resize:fit:1400/1*ZTWDj6qrNVly6Ch2o6id1w.png)



```
<ul class="menu">     
  <li class="menu__elem-disabled">tab1</li>
	<li class="menu__elem">tab2</li>
	<li class="menu__elem">tab3</li>
	<li class="menu__elem">tab4</li>
</ul>

```





참고자료

https://getbem.com/introduction/





