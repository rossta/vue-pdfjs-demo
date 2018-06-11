<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in pages"
      v-bind="{scale}"
      :key="page.pageNumber"
      :page="page"
      :is-focused-page="page.pageNumber === focusedPage"
      :scroll-bounds="elementBounds"
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

import throttle from 'lodash/throttle';

import {PIXEL_RATIO} from '../utils/constants';
import responsiveScaleFactor from '../utils/responsiveScaleFactor';
import PDFPage from './PDFPage';

export default {
  components: {
    PDFPage,
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
      elementBounds: {},
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
      this.elementBounds = this.getScrollBounds();

      if (this.isBottomVisible()) this.fetchPages();
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

    isBottomVisible() {
      const {scrollTop, clientHeight, scrollHeight} = this.$el;
      return (scrollTop + clientHeight) >= scrollHeight;
    },

    fetchPages(currentPage) {
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      this.$parent.$emit('fetch-pages', currentPage);
    },
  },

  mounted() {
    this.handleScroll();
    this.throttledScroll = throttle(this.handleScroll, 300);
    window.addEventListener('scroll', this.throttledScroll, true);

    this.throttledResize = throttle(this.handleResize, 300);
    window.addEventListener('resize', this.handleResize, true);
  },

  beforeDestroy() {
    if (this.throttledScroll) window.removeEventListener('scroll', this.throttledScroll, true);
    if (this.throttledResize) window.removeEventListener('resize', this.throttledResize, true);
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
