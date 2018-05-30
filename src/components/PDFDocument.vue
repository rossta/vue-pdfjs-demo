<template>
  <div
    class="pdf-document"
    :style="{height}"
    >
    <PDFPage
      v-for="page in pages"
      v-bind="{scale}"
      :key="page.pageNumber"
      :page="page"
      :scrollTop="$el.scrollTop"
      :isCurrentPage="page.pageNumber === currentPage"
      @active="pageActive"
      @errored="pageErrored"
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

function getDocument(src) {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles
  return import(
    /* webpackChunkName: 'pdfjs-dist' */
    'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(src));
}

// pdf: instance of PDFDocumentProxy
// see docs for PDF.js for more info
function getAllPages(pdf) {
  const allPages = range(1, pdf.numPages).map(number => pdf.getPage(number));
  return Promise.all(allPages);
}

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
    currentPage: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      pdf: undefined,
      pages: [],
    };
  },

  computed: {
    height() {
      return `1000px`;
    },
  },

  watch: {
    url: {
      handler(url) {
        getDocument(url).
          then(pdf => (this.pdf = pdf)).
          catch((response) => {
            this.$emit('errored', {text: 'Failed to retrieve PDF', response});
            log('Failed to retrieve PDF', response);
          });
      },
      immediate: true,
    },
    pdf: {
      handler(pdf) {
        getAllPages(pdf).
          then(pages => (this.pages = pages)).
          then(() => this.$emit('fetched', this.pages)).
          then(() => log('Retrieved all pages')).
          catch((response) => {
            this.$emit('errored', {text: 'Failed to retrieve pages', response});
            log('Failed to retrieve pages', response);
          });
      }
    },
    currentPage(pageNumber) {
      this.currentPage = pageNumber;
    },
  },

  methods: {
    pageActive(offsetTop) {
      this.$el.scrollTop = offsetTop;
    },
    pageErrored(error) {
      this.$emit('errored', error);
   },
  },
};
</script>
<style>
.pdf-document {
  position: fixed;
  overflow: scroll;
}
</style>
