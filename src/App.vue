<template>
  <div id="app">
    <PDFUploader
      :documentError="documentError"
      @updated="urlUpdated" />
    <PDFDocument
      v-bind="{url, width, scale}"
      @errored="documentErrored"
      />
  </div>
</template>

<script>
import PDFUploader from './components/PDFUploader.vue'
import PDFDocument from './components/PDFDocument.vue'

export default {
  name: 'app',

  components: {
    PDFUploader,
    PDFDocument,
  },

  data() {
    return {
      url: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS',
      width: 750,
      scale: 1,
      documentError: undefined,
    };
  },

  methods: {
    handleResize() {
      const [LARGE, MIDDLE, SMALL] = [750, 480, 320];
      const clientWidth = document.body.clientWidth;
      if (clientWidth >= LARGE) {
        this.width = LARGE;
      } else if (clientWidth >= MIDDLE) {
        this.width = MIDDLE;
      } else {
        this.width = SMALL;
      }
    },
    documentErrored(e) {
      this.documentError = e.text;
    },
    urlUpdated(url) {
      this.url = url;
    },
  },

  mounted() {
    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
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
label.form {
  color: white;
  font-family: Monaco, 'Courier New', Courier, monospace;
  font-weight: bold;
  margin-bottom: 2em;
  display: block;
}
.form input {
  width: 75%;
  padding: 0.25em;
  font-size: 1em;
}
.error {
  border: 1px solid red;
  background: pink;
  color: red;
  padding: 0.5em 3em;
  display: inline;
}
</style>
