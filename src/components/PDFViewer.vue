<template>
  <div class="pdf-viewer">
    <PDFData
      class="pdf-viewer__main"
      :url="url"
      @page-count="updatePageCount"
      @page-focus="updateCurrentPage"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
      >

      <PDFPreview
        class="pdf-viewer__preview"
        slot="preview"
        slot-scope="{pages}"
        v-bind="{pages, scale, currentPage, pageCount}"
        />

      <PDFDocument
        class="pdf-viewer__document"
        slot="document"
        slot-scope="{pages}"
        v-bind="{pages, scale, currentPage, pageCount}"
        @scale-change="updateScale"
        />
    </PDFData>
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';
import PDFPreview from './PDFPreview';
import PDFData from './PDFData';

function floor(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.floor(value * multiplier) / multiplier;
}

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFPreview,
    PDFData,
  },

  props: {
    url: String,
  },

  data() {
    return {
      scale: undefined,
      currentPage: 1,
      pageCount: undefined,
    };
  },

  methods: {
    onDocumentRendered() {
      this.$emit('document-errored', this.url);
    },

    onDocumentErrored(e) {
      this.$emit('document-errored', e);
    },

    updateScale(scale) {
      this.scale = floor(scale, 2);
    },

    updatePageCount(pageCount) {
      this.pageCount = pageCount;
    },

    updateCurrentPage(pageNumber) {
      this.currentPage = pageNumber;
    },
  },

  watch: {
    url() {
      this.currentPage = undefined;
    },
  },

  mounted() {
    document.body.classList.add('overflow-hidden');
  },
};
</script>
<style scoped>
.pdf-viewer__preview {
  width: 15%;
  right: 85%;
}
.pdf-viewer__document {
  width: 85%;
  left: 15%;
}
</style>
