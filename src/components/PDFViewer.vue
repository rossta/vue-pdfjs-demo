<template>
  <div class="pdf-viewer">
    <PDFDocument
      class="pdf-document"
      slot="document"
      v-bind="{url, scale, currentPage, pageCount}"
      @scale-change="updateScale"
      @page-count="updatePageCount"
      @page-focus="updateCurrentPage"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
      />
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';

function floor(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.floor(value * multiplier) / multiplier;
}

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
  },

  props: {
    url: String,
  },

  data() {
    return {
      scale: undefined,
      fit: undefined,
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

    updateFit(fit) {
      this.fit = fit;
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
