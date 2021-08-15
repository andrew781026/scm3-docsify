# Translucent borders

?> Background：:point_right: [background-clip](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-clip)

By default, the color of the background will reach the lower layer of the border, which indicates the translucent border effect set previously will be covered. CSS3 allows us to change the default behavior of the background by setting the `background-clip:padding-box` to accomplish what we require.

<vuep template="#translucent-borders_tpl"></vuep>

<script v-pre type="text/x-template" id="translucent-borders_tpl">
<style>
  main{
    width: 100%;
    padding: 60px 80px 80px;
    background: #b4a078;
  }
  div{
    padding: 12px;
    margin: 20px auto;
    background: white;
    border: 10px solid hsla(0, 0%, 100%, .5);
  }
  label{
    color: #f4f0ea;
  }
  input[id="pb"]:checked ~ div{
    background-clip: padding-box;
  }
</style>
<template>
  <main>
    <input id="pb" type="checkbox" checked/>
    <label for="pb">padding-box(default)</label>
    <div>A paragraph of filler text. La la la de dah de dah de dah de la.</div>
  </main>
</template>
<script>  
</script>
</script>
