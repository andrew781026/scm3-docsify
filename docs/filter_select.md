
<output data-lang="output">
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
</output>

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
