<template>
  <div class="pdf-viewer">
    <header>
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

    <PDFDocument
      v-bind="{url, scale, currentPage}"
      @scale-change="scaleChanged"
      @page-focus="pageFocused"
      @pages-fetched="pagesFetched"
      @document-rendered="documentRendered"
      @document-errored="documentErrored"
      />
  </div>
</template>

<script>
import deferredPromise from '../utils/deferredPromise';
import PDFDocument from './PDFDocument';
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
      renderPromise: deferredPromise(),
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

    pagesFetched(pages) {
      this.pageCount = pages.length;
    },

    pageFocused(pageNumber) {
      this.currentPage = pageNumber;
    },
  },

  watch: {
    url() {
      this.renderPromise = deferredPromise();
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
  margin-bottom: 1em;
}
.header-item {
  margin: 0.25em 2.5em;
}

@media print {
  header {
    display: none;
  }
}
</style>
