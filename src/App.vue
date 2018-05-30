<template>
  <div id="app">
    <PDFUploader
      :documentError="documentError"
      @updated="urlUpdated"
      />

    <PDFViewer
      v-bind="{url, scale}"
      @document-errored="documentErrored"
      @scale-changed="scaleChanged"
      />
  </div>
</template>

<script>
import PDFUploader from './components/PDFUploader.vue'
import PDFViewer from './components/PDFViewer.vue'

export default {
  name: 'app',

  components: {
    PDFUploader,
    PDFViewer,
  },

  data() {
    return {
      url: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS',
      scale: 2.5,
      documentError: undefined,
    };
  },

  methods: {
    handleResize() {
      const [LARGE, MIDDLE, SMALL] = [2.5, 1.5, 1];
      const clientWidth = document.body.clientWidth;
      if (clientWidth >= LARGE) {
        this.scale = LARGE;
      } else if (clientWidth >= MIDDLE) {
        this.scale = MIDDLE;
      } else {
        this.scale = SMALL;
      }
    },
    urlUpdated(url) {
      this.url = url;
    },
    documentErrored(e) {
      this.documentError = e.text;
    },
    scaleChanged(scale) {
      console.log('scale changed', scale);
      this.scale = scale;
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
