<template>
  <div class="pdf-viewer">
    <PDFPaginator
      v-bind="{pageCount}"
      @change="currentPageChanged"
      />
    <PDFZoom
      :scale="scale"
      @change="scaleChanged"
      />
    <PDFDocument
      v-bind="{url, scale, currentPage}"
      @fetched="pagesFetched"
      @errored="documentErrored"
      />
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';
import PDFPaginator from './PDFPaginator';
import PDFZoom from './PDFZoom';

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFZoom,
    PDFPaginator,
  },

  props: {
    url: String,
    scale: Number,
  },

  data() {
    return {
      currentPage: undefined,
      pageCount: undefined,
    };
  },

  methods: {
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
  },
}
</script>

<style>
.pdf-paginator {
  color: white;
  position: fixed;
  top: 8%;
  left: 10%;
}
.pdf-paginator input {
  width: 2em;
  padding: 0.3em;
}
</style>
