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

      <PDFPrint
        @print="handlePrint"
        v-bind="{renderPromise}"
        class="header-item"
        />

      <slot name="header"></slot>
    </header>

    <PDFDocument
      v-bind="{url, scale, currentPage, force}"
      @page-focus="currentPageChanged"
      @pages-fetched="pagesFetched"
      @document-errored="documentErrored"
      @document-rendered="documentRendered"
      />
  </div>
</template>

<script>
import deferredPromise from '../utils/deferredPromise';

import PDFDocument from './PDFDocument';
import PDFPaginator from './PDFPaginator';
import PDFPrint from './PDFPrint';
import PDFZoom from './PDFZoom';

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFPrint,
    PDFZoom,
    PDFPaginator,
  },

  props: {
    url: String,
    scale: Number,
  },

  data() {
    return {
      renderPromise: deferredPromise(),
      currentPage: undefined,
      pageCount: undefined,
      rendered: false,
      force: false,
    };
  },

  methods: {
    documentRendered() {
      console.log('document rendered'); // eslint-disable-line
      this.renderPromise.resolve();
    },

    documentErrored(e) {
      this.$emit('document-errored', e);
    },

    scaleChanged(scale) {
      this.$emit('scale-changed', scale);
    },

    pagesFetched(pages) {
      this.pageCount = pages.length;
    },

    currentPageChanged(pageNumber) {
      this.currentPage = pageNumber;
    },

    handlePrint() {
      this.force = true;
    },
  },

  watch: {
    url: {
      handler() {
        this.renderPromise = deferredPromise();
      },
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
