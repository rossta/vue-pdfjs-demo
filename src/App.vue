<template>
  <div id="app">

    <PDFViewer
      v-bind="{url}"
      @document-errored="onDocumentErrored"
      >
      <PDFUploader
        v-if="enableUploader"
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
    return {
      url: process.env.VUE_APP_PDF_URL,
      documentError: undefined,
      enableUploader: process.env.VUE_APP_UPLOAD_ENABLED === 'true',
    };
  },

  methods: {
    urlUpdated(url) {
      this.documentError = undefined;
      this.url = url;
    },
    onDocumentErrored(e) {
      this.documentError = e.text;
    },
  },

}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #606f7b;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #62637a;
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

.box-shadow {
  box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.11), 0 5px 15px 0 rgba(0, 0, 0, 0.08);
}
.overflow-hidden {
  overflow: hidden;
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
