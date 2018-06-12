<template>
  <div
    class="pdf-document"
    v-bottom="fetchPages"
    v-scroll.immediate="handleScroll"
    v-resize="handleResize"
    >
    <PDFPage
      v-for="page in pages"
      v-bind="{scale, scrollBounds}"
      :key="page.pageNumber"
      :page="page"
      :is-focused-page="page.pageNumber === focusedPage"
      @page-top="handlePageTop"
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

import {PIXEL_RATIO} from '../utils/constants';
import responsiveScaleFactor from '../utils/responsiveScaleFactor';
import bottom from '../directives/bottom';
import scroll from '../directives/scroll';
import resize from '../directives/resize';

import PDFPage from './PDFPage';

export default {
  components: {
    PDFPage,
  },

  directives: {
    bottom,
    scroll,
    resize,
  },

  props: {
    pages: {
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
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
      focusedPage: undefined,
      scrollBounds: {},
    };
  },

  watch: {
    pages() {
      if (!this.focusedPage) this.updateScale();
      this.$nextTick(() => {
        this.focusedPage = this.currentPage;
      });
    },

    currentPage(currentPage) {
      if (currentPage >= this.pages.length) {
        this.fetchPages(currentPage);
      } else {
        this.focusedPage = currentPage;
      }
    },

    pageCount() {
      this.updateScale();
    },
  },

  methods: {
    handlePageTop(scrollTop) {
      this.$el.scrollTop = scrollTop; // triggers 'scroll' event
    },

    handlePageFocus(pageNumber) {
      this.$emit('page-focus', pageNumber);
    },

    handleScroll() {
      this.scrollBounds = this.getScrollBounds();
    },

    handleResize() {
      this.updateScale();
    },

    // Determine an ideal scale using viewport of document's first page, the pixel ratio from the browser
    // and a subjective scale factor based on the screen size.
    updateScale() {
      if (!this.pages.length) return;
      const [page] = this.pages;
      const width = this.$el.clientWidth;
      const defaultViewport = page.getViewport(1.0);
      const pageWidthScale = (width * PIXEL_RATIO) * responsiveScaleFactor() / defaultViewport.width;

      log('calculating initial scale', width, defaultViewport.width, pageWidthScale);
      this.$emit('scale-change', pageWidthScale);
    },

    pageRendered(page) {
      this.$parent.$emit('page-rendered', page);
    },

    pageErrored(error) {
      this.$parent.$emit('page-errored', error);
    },

    getScrollBounds() {
      const {scrollTop, clientHeight} = this.$el;
      return {
        top: scrollTop,
        bottom: scrollTop + clientHeight,
        height: clientHeight,
      };
    },

    fetchPages(currentPage) {
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      this.$parent.$emit('fetch-pages', currentPage);
    },
  },
};
</script>

<style>
.pdf-document {
  position: absolute;
  overflow: auto;
  width: 100%;
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
  background: #525f69;
}
@media print {
  .pdf-document {
    position: static;
  }
}
</style>
