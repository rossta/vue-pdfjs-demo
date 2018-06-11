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
      @document-rendered="documentRendered"
      @document-errored="documentErrored"
      >
      <PDFDocument
        slot-scope="{pages, pageCount}"
        v-bind="{pages, scale, currentPage}"
        @scale-change="scaleChanged"
        @page-focus="pageFocused"
        />
    </PDFDocumentProxy>
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';
import PDFDocumentProxy from './PDFDocumentProxy';
import PDFPaginator from './PDFPaginator';
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
    PDFZoom,
    PDFPaginator,
  },

  props: {
    url: String,
  },

  data() {
    return {
      scale: undefined,
      currentPage: undefined,
      pageCount: undefined,
      rendered: false,
      force: false,
    };
  },

  methods: {
    documentRendered() {
      this.renderPromise.resolve();
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
