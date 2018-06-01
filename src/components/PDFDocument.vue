<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in pages"
      v-bind="{scale, scrollTop}"
      :key="page.pageNumber"
      :page="page"
      :isCurrentPage="page.pageNumber === currentPage"
      :containerBounds="elementBounds"
      @scroll-top="updateScrollTop"
      @page-number="updatePageNumber"
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

import throttle from 'lodash/throttle';
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
      scrollTop: 0,
      pdf: undefined,
      pages: [],
    };
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
        this.pages = [];
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
    updateScrollTop(scrollTop) {
      this.$el.scrollTop = scrollTop;
      this.handleScroll();
    },

    updatePageNumber(pageNumber) {
      this.$emit('page-number', pageNumber);
    },

    pageErrored(error) {
      this.$emit('errored', error);
    },

    elementBounds() {
      const $el = this.$el;
      return {
        top: $el.scrollTop,
        bottom: $el.scrollTop + $el.clientHeight,
      };
    },

    handleScroll() {
      this.scrollTop = this.$el.scrollTop;
    },
  },

  mounted() {
    this.throttledScroll = throttle(this.handleScroll, 500)
    window.addEventListener('scroll', this.throttledScroll, true)
  },

  beforeDestroy() {
    if (this.throttledScroll) window.removeEventListener('scroll', this.throttledScroll, true)
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
</style>
