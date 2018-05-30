<template>
  <div class="pdf-viewer">
    <PDFDocument
      v-bind="{url, scale}"
      @errored="documentErrored"
      />
    <PDFZoom
      :scale="scale"
      @change="scaleChanged"
      />
  </div>
</template>

<script>
import PDFDocument from './PDFDocument.vue'
import PDFZoom from './PDFZoom.vue'

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFZoom,
  },

  props: {
    url: String,
    scale: Number,
  },

  methods: {
    documentErrored(e) {
      this.$emit('document-errored', e);
    },

    scaleChanged(scale) {
      console.log('scale changed', scale);
      this.$emit('scale-changed', scale);
    },
  },
}
</script>
