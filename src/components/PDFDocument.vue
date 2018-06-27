<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in pages"
      v-bind="{scale}"
      :key="page.pageNumber"
      :page="page"
    />
  </div>
</template>

<script>
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).
import debug from 'debug';
const log = debug('app:components/PDFDocument');

import PDFPage from './PDFPage';

import range from 'lodash/range';

export default {
  components: {
    PDFPage,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    scale: {
      type: Number,
      default: 1.0,
    },
  },

  data() {
    return {
      pdf: undefined,
      pages: [],
    };
  },

  watch: {
    pdf: {
      handler(pdf) {
        this.pages = [];
        const promises = range(1, pdf.numPages).map(number => pdf.getPage(number));
        return Promise.all(promises).
          then(pages => (this.pages = pages)).
          then(() => log('pages fetched'))
      }
    },
  },

  methods: {
    fetchPDF() {
      import(
        /* webpackChunkName: 'pdfjs-dist' */
        'pdfjs-dist/webpack'
      ).
        then(pdfjs => pdfjs.getDocument(this.url)).
        then(pdf => (this.pdf = pdf)).
        then(() => log('pdf fetched'))
    },
  },

  created() {
    this.fetchPDF();
  },
};
</script>
<style>
.pdf-document {
  position: fixed;
  overflow: scroll;
  width: 100%;
  height: 90%;
}
</style>
