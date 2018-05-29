<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in pages"
      :key="page.pageNumber"
      :page="page"
      v-bind="{scale}"
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
  },

  data() {
    return {
      pdf: undefined,
      pages: [],
    };
  },

  watch: {
    url: {
      handler(url) {
        this.cleanup();
        this.loadingTask = getDocument(url);
        this.loadingTask.
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
          then(() => log('Retrieved all pages')).
          catch((response) => {
            this.$emit('errored', {text: 'Failed to retrieve pages', response});
            log('Failed to retrieve pages', response);
          });
      }
    },
  },

  methods: {
    cleanup() {
      if (this.loadingTask) {
        this.loadingTask.destroy();
      }
    },
    pageErrored(error) {
      this.$emit('errored', error);
   },
  },

  beforeDestroy() {
    this.cleanup();
  },
};
</script>
