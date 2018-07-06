<template>
  <div
    class="pdf-document scrolling-document"
    @page-jump="onPageJump"
    @pages-fetch="fetchPages"
    >
    <PDFPage
      v-for="page in pages"
      v-bind="{scale, page, scrollTop, scrollHeight, focusedPage}"
      :key="page.pageNumber"
      class="scrolling-page"
      @page-jump="onPageJump"
      @page-rendered="onPageRendered"
      @page-errored="onPageErrored"
      @page-focus="onPageFocused"
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

import {PIXEL_RATIO, VIEWPORT_RATIO} from '../utils/constants';

import PDFPage from './PDFPage';

function getDocument(url) {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles
  return import(
    /* webpackChunkName: 'pdfjs-dist' */
    'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url));
}

// pdf: instance of PDFDocumentProxy
// see docs for PDF.js for more info
function getPages(pdf, first, last) {
  const allPages = range(first, last+1).map(number => pdf.getPage(number));
  return Promise.all(allPages);
}

const BUFFER_LENGTH = 3;

function getDefaults() {
  return {
    pdf: undefined,
    pages: [],
    cursor: 0,
    focusedPage: undefined,
    scrollTop: 0,
    scrollHeight: 0,
  };
}

export default {
  name: 'PDFDocument',

  components: {
    PDFPage,
  },

  props: {
    scale: {
      type: Number,
      default: 1.0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    url: {
      type: String,
      required: true,
    },
  },

  data() {
    return getDefaults();
  },

  computed: {
    defaultViewport() {
      if (!this.pages.length) return {width: 0, height:0};
      const [page] = this.pages;

      return page.getViewport(1.0);
    },

    isPortrait() {
      const {width, height} = this.defaultViewport;
      return width <= height;
    },

    fetchedPageCount() {
      return this.pages.length;
    },

    pageCount() {
      return this.pdf ? this.pdf.numPages : 0;
    },
  },

  methods: {
    pageWidthScale() {
      const {defaultViewport, $el} = this;
      if (!defaultViewport.width) return 0;

      return ($el.clientWidth * PIXEL_RATIO) * VIEWPORT_RATIO / defaultViewport.width;
    },

    // Determine an ideal scale using viewport of document's first page, the pixel ratio from the browser
    // and a subjective scale factor based on the screen size.
    fitWidth() {
      const scale = this.pageWidthScale();
      log('fit width scale', scale);
      this.$emit('scale-change', scale);
    },

    onPageJump(scrollTop) {
      this.$el.scrollTop = scrollTop; // triggers 'scroll' event
    },

    onPageFocused(pageNumber) {
      this.$emit('page-focus', pageNumber);
    },

    onPageRendered({text, page}) {
      log(text, page);
    },

    onPageErrored({text, response, page}) {
      log('Error!', text, response, page);
    },

    updateScrollBounds() {
      const {scrollTop, clientHeight} = this.$el;
      this.scrollTop = scrollTop;
      this.scrollHeight = clientHeight;
    },

    isBottomVisible() {
      const {scrollTop, clientHeight, scrollHeight} = this.$el;
      return scrollTop + clientHeight >= scrollHeight;
    },

    onBoundaryChange() {
      if (this.isBottomVisible()) this.fetchPages();
      this.updateScrollBounds();
    },

    onResize() {
      this.fitWidth();
      this.onBoundaryChange();
    },

    fetchPages(currentPage = 0) {
      if (!this.pdf) return;
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      const startIndex = this.pages.length;
      if (this.cursor > startIndex) return;

      const startPage = startIndex + 1;
      const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount);
      this.cursor = endPage;

      log(`Fetching pages ${startPage} to ${endPage}`);
      getPages(this.pdf, startPage, endPage)
        .then((pages) => {
          const deleteCount = 0;
          this.pages.splice(startIndex, deleteCount, ...pages);
          return this.pages;
        })
        .catch((response) => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
          log('Failed to retrieve pages', response);
        });
    },
  },

  watch: {
    pageCount: 'fitWidth',

    fetchedPageCount(count, oldCount) {
      if (oldCount === 0) this.fitWidth();

      // Set focusedPage after new pages are mounted
      this.$nextTick(() => {
        this.focusedPage = this.currentPage;
      });
    },

    currentPage(currentPage) {
      if (currentPage > this.pages.length) {
        this.fetchPages(currentPage);
      } else {
        this.focusedPage = currentPage;
      }
    },

    url: {
      handler(url) {
        getDocument(url)
          .then(pdf => (this.pdf = pdf))
          .catch(response => {
            this.$emit('document-errored', {text: 'Failed to retrieve PDF', response});
            log('Failed to retrieve PDF', response);
          });
      },
      immediate: true,
    },

    pdf(pdf, oldPdf) {
      if (!pdf) return;
      if (oldPdf) Object.assign(this, getDefaults());

      this.$emit('page-count', this.pageCount);
      this.fetchPages();
    },
  },

  mounted() {
    this.onBoundaryChange();
    this.$el.addEventListener('scroll', throttle(this.onBoundaryChange, 300), true);

    const throttledOnResize = throttle(this.onResize, 300);
    window.addEventListener('resize', throttledOnResize, true);
    this.throttledOnResize = throttledOnResize;
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.throttledOnResize, true);
  },
};
</script>

<style>
.pdf-document {
  position: absolute;
  overflow: auto;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #525f69;
}

.scrolling-page:first-child {
  margin-top: 1em;
}
.scrolling-page {
  margin-bottom: 1em;
}

@media print {
  .pdf-document {
    position: static;
  }
}
</style>
