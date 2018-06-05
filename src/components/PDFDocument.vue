<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in pages"
      v-bind="{scale}"
      :key="page.pageNumber"
      :page="page"
      :isCurrentPage="page.pageNumber === currentPage"
      :containerBounds="elementBounds"
      @page-top="updateScrollTop"
      @page-focus="handlePageFocus"
      @page-rendered="pageRendered"
      @page-errored="pageErrored"
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

import range from 'lodash/range';
import throttle from 'lodash/throttle';

import deferredPromise from '../utils/deferredPromise';
import PDFPage from './PDFPage';

function importPDFJS() {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles
  return import(
    /* webpackChunkName: 'pdfjs-dist' */
    'pdfjs-dist/webpack');
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
      elementBounds: {},
      pdf: undefined,
      pages: [],
    };
  },

  watch: {
    url: {
      handler(url) {
        this.getDocument(url)
          .then(pdf => (this.pdf = pdf))
          .catch(response => {
            this.$emit('document-errored', {text: 'Failed to retrieve PDF', response});
            log('Failed to retrieve PDF', response);
          });
      },
      immediate: true,
    },

    pdf(pdf) {
      this.pages = [];
      getAllPages(pdf)
        .then(pages => (this.pages = pages))
        .then(() => this.$emit('pages-fetched', this.pages))
        .then(() => log('Retrieved all pages'))
        .catch(response => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
          log('Failed to retrieve pages', response);
        });
    },

    pages(pages) {
      const promises = pages.map((page) => {
        page._renderPromise = deferredPromise();
        return page._renderPromise;
      });
      Promise.all(promises)
        .then(() => this.$emit('document-rendered'))
        .then(() => log('Rendered all pages'))
        .catch(response => {
          this.$emit('document-errored', {text: 'Failed to render pages', response});
          log('Failed to render pages', response);
        });
    },
  },

  methods: {
    getDocument(url) {
      if (this.loadingTask) {
        this.loadingTask.destroy();
        delete this.loadingTask;
      }
      return importPDFJS().then(pdfjs => {
        this.loadingTask = pdfjs.getDocument(url);
        return this.loadingTask;
      });
    },

    updateScrollTop(scrollTop) {
      this.$el.scrollTop = scrollTop;
      this.handleScroll();
    },

    handlePageFocus(pageNumber) {
      this.$emit('page-focus', pageNumber);
    },

    pageRendered(page) {
      page._renderPromise.resolve(page);
    },

    pageErrored(error) {
      this.$emit('errored', error);
    },

    getElementBounds() {
      const $el = this.$el;
      return {
        top: $el.scrollTop,
        bottom: $el.scrollTop + $el.clientHeight,
      };
    },

    handleScroll() {
      this.elementBounds = this.getElementBounds();
    },
  },

  mounted() {
    this.handleScroll();
    this.throttledScroll = throttle(this.handleScroll, 500);
    window.addEventListener('scroll', this.throttledScroll, true);
  },

  beforeDestroy() {
    if (this.throttledScroll) window.removeEventListener('scroll', this.throttledScroll, true);
  },
};
</script>
<style>
.pdf-document {
  position: absolute;
  overflow: auto;
  width: 100%;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
}
@media print {
  .pdf-document {
    position: static;
  }
}
</style>
