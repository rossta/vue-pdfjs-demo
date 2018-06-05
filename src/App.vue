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
import debug from 'debug';
const log = debug('app:App');

import throttle from 'lodash/throttle'
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
      log('scale changed', scale);
      this.scale = scale;
    },
  },

  mounted() {
    this.throttledResize = throttle(this.handleResize, 500)
    window.addEventListener('resize', this.throttledResize, true)
  },

  beforeDestroy() {
    if (this.throttledResize) window.removeEventListener('resize', this.throttledResize, true)
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

a.icon {
  cursor: pointer;
  display: block;
  border: 1px #333 solid;
  background: white;
  color: #333;
  font-weight: bold;
  padding: 0.25em;
  width: 1em;
  height: 1em;
  font-size: 1.5em;
}

@media print {
  body {
    background-color: transparent;
  }
  #app {
    margin: 0;
    padding: 0;
  }
}
</style>
