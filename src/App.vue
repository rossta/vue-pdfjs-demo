<template>
  <div id="app">
    <PDFDocument v-bind="{src, width, scale}" />
  </div>
</template>

<script>
import PDFDocument from './components/PDFDocument.vue'

export default {
  name: 'app',

  components: {
    PDFDocument,
  },

  data() {
    return {
      src: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS',
      width: 750,
      scale: 1,
    };
  },
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #312b2b;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #303030;
  margin: 1em 0;
  padding: 1em;
}
</style>
