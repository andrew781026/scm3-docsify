
# 可篩選的下拉選單 ( filter_select )

## 簡介

scm3 跟 ecm 有許多需要在下拉選單中有搜尋的功能 , 因此前端團隊製作了 `filter_select` 元件

目前內涵的功能如下 : 
- 可篩選
- 可清除現有選擇
- 切換成自由輸入模式

## 快速開始

將下方的 css 跟 js 引入到 html 中 , 即可開始使用 `filter_select` 元件

```html
 <!-- 引用 jquery -->
 <script src="/js/jQuery.js" type="text/javascript"></script>

  <!-- 引入 jbox -->
  <link rel="stylesheet" href="/css/jbox.css">
  <link rel="stylesheet" href="/css/tooltip.css">
  <script src="/js/jbox.min.js"></script>

  <!-- 引入 filter-select.js & 其樣式 -->
  <link rel="stylesheet" href="/css/filter_select.css">
  <link rel="stylesheet" href="/js/filter_select.js">
```

## 直接試用( PlayGround )

<vuep template="#filter_select"></vuep>

<script v-pre type="text/x-template" id="filter_select">
<style>
    
</style>
<template>
 <div name='select_search_example' 
    class="filter-select" 
    allow-create='@新增' 
    scroll-height='130px' 
    placeholder="Search.." 
    data-value="js" 
    data-json='
          [
            {"value":"@新增","text":"新增 🐈"},
            {"value":"JQuery","text":"JQuery"},
            {"value":"js","text":"JavaScript"},
            {"value":"java","text":"Java"},
            {"value":"Python","text":"python"},
            {"value":"react","text":"React"},
            {"value":"vue","text":"vue"},
            {"value":"go","text":"go"},
            {"value":"c++","text":"C++"},
            {"value":"c#","text":"C#"}
          ]
        '>
    </div>
</template>
<script>
  import filter_select from './js/filter_select.js'

  export default {
    mounted(){
        window.initFilterSelect();
    }
  }
</script>
</script>

### 參數

#### allow-create

設定用於切換到 create mode 的 value 值

#### placeholder

輸入框的 placeholder , nodata mode 時會顯示

#### data-value

- 類型 : String 

下拉選單中的被選中的項目值

#### data-json

- 類型 : Array<{value,text}> 

下拉選單中的可選項目 `value` = 項目值 , `text` = 項目文字 

#### data-mode

- 類型 : String : 'create' . 'nodata' . 'edit' . 'view'

下拉選單目前的狀態  `create` = 自由輸入文字 , `nodata` = 沒有選擇任何選項, `edit` = 篩選中 , `view` = 查看目前選擇向

> data-mode = 'create' 

設定 `allow-create` , 當選擇的項目的 value 跟 allow-create 相同時 , 會開啟 create 模式

create 模式 , 不顯示閜拉選單 , 但可以任意輸入文字 

![](https://i.imgur.com/H6ETtBf.gif)

> data-mode = 'nodata'

沒有選擇資料時 , 顯示 placeholder 的文字

![](https://i.imgur.com/frR3dOG.png)

利用 close icon 將資料清空後 , 會轉換成 nodata mode 

![](https://i.imgur.com/Ave9WqR.gif)

> data-mode = 'edit'

edit mode 在關閉下拉選單時 , 會根據上次選擇的項目切換成 view mode 或 nodata mode

![](https://i.imgur.com/WTQPQKt.gif)

> data-mode = 'view'

view mode 顯示被選擇項目的 text

![](https://i.imgur.com/qXfey6I.png)

### 事件綁定

在 `.filter-select > input` 上有綁定 .trigger('change') 當選擇值發生變化時 , 會 trigger
如果需要監聽選擇值的變化 , 可以利用 `changeHandler` 來做監聽

```javascript
$('.filter-select > input').on('change',changeHandler)
```
