<template>
  <div class="pdf-viewer">
    <header class="box-shadow">
      <PDFZoom
        :scale="scale"
        @change="scaleChanged"
        class="header-item"
        />

      <PDFPaginator
        v-model="currentPage"
        :pageCount="pageCount"
        class="header-item"
        />

      <slot name="header"></slot>
    </header>

    <PDFDocumentProxy
      :url="url"
      @page-count="updatePageCount"
      @page-focus="pageFocused"
      @document-rendered="documentRendered"
      @document-errored="documentErrored"
      >
      <PDFPreview
        slot="preview"
        slot-scope="{pages}"
        v-bind="{pages, currentPage, pageCount}"
        />
      <PDFDocument
        slot="document"
        slot-scope="{pages}"
        v-bind="{pages, scale, currentPage, pageCount}"
        @scale-change="scaleChanged"
        />
    </PDFDocumentProxy>
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';
import PDFDocumentProxy from './PDFDocumentProxy';
import PDFPaginator from './PDFPaginator';
import PDFPreview from './PDFPreview';
import PDFZoom from './PDFZoom';

function round(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFDocumentProxy,
    PDFPaginator,
    PDFPreview,
    PDFZoom,
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
    documentRendered() {
      this.$emit('document-errored', this.url);
    },

    documentErrored(e) {
      this.$emit('document-errored', e);
    },

    scaleChanged(scale) {
      this.scale = round(scale, 1);
    },

    updatePageCount(pageCount) {
      this.pageCount = pageCount;
    },

    pageFocused(pageNumber) {
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
header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 1em;
  position: relative;
  z-index: 99;
}
.header-item {
  margin: 0 2.5em;
}

@media print {
  header {
    display: none;
  }
}
</style>
