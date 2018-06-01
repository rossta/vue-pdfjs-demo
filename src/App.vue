<template>
  <div id="app">

    <PDFViewer
      v-bind="{url, scale}"
      @document-errored="documentErrored"
      @scale-changed="scaleChanged"
      >
      <PDFUploader
        :documentError="documentError"
        @updated="urlUpdated"
        slot="header"
        class="header-item"
        />
    </PDFViewer>
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
    console.log('start scale', this.defaultResponsiveScale());
    return {
      url: 'https://cdn.filestackcontent.com/5qOCEpKzQldoRsVatUPS',
      scale: this.defaultResponsiveScale(),
      documentError: undefined,
    };
  },

  methods: {
    defaultResponsiveScale() {
      const [LARGE, MIDDLE, SMALL] = [480, 768, 1024];
      const RESPONSIVE_SCALES = {
        [SMALL]: 0.85,
        [MIDDLE]: 0.95,
        [LARGE]: 2.5
      };
      const clientWidth = document.body.clientWidth;
      console.log('client width', clientWidth);
      if (clientWidth > LARGE) {
        return RESPONSIVE_SCALES[LARGE];
      } else if (clientWidth > MIDDLE) {
        return RESPONSIVE_SCALES[MIDDLE];
      } else {
        return RESPONSIVE_SCALES[SMALL];
      }
    },
    handleResize() {
      this.scale = this.defaultResponsiveScale();
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
}
label.form {
  color: white;
  font-family: Monaco, 'Courier New', Courier, monospace;
  font-weight: bold;
  margin-bottom: 2em;
  display: block;
}
input {
  padding: 0.45em;
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
