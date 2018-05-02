<template>
  <div class="pdf-canvas">
    <PDFPage
      v-for="page in pages"
      :key="page.pageNumber"
      :page="page"
      v-bind="{scale, width}"
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
    src: {
      type: String,
      required: true,
    },
    scale: {
      type: Number,
      default: 1.0,
    },
    width: {
      type: Number,
      default: 700,
    },
  },
  data() {
    return {
      pdf: undefined,
      pages: [],
    };
  },
  watch: {
    src: {
      handler(src) {
        this.destroyPdf();
        getDocument(src).
          then(pdf => (this.pdf = pdf)).
          catch((e) => {
            this.$emit('errored');
            log('Failed to retrieve PDF', e);
          });
      },
      immediate: true,
    },
    pdf: {
      handler(pdf) {
        getAllPages(pdf).
          then(pages => (this.pages = pages)).
          catch((e) => {
            this.$emit('errored');
            log('Failed to retrieve pages', e);
          });
      }
    },
  },
  beforeDestroy() {
    this.destroyPdf();
  },
  methods: {
    destroyPdf() {
      if (this.pdf) {
        this.pdf.destroy();
        this.pdf = undefined;
      }
    },
  },
};
</script>
<style>
.pdf-document {
  margin: 1em;
}
</style>
