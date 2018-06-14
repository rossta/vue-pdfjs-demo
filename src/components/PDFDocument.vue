<template>
  <div
    class="pdf-document preview-enabled"
    v-bottom="fetchPages"
    v-scroll.immediate="updateScrollBounds"
    v-resize="updateScale"
    >
    <PDFPage
      v-for="page in pages"
      v-bind="{scale, scrollBounds, page}"
      :key="page.pageNumber"
      :is-page-focused="page.pageNumber === focusedPage"
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

  methods: {
    handlePageTop(scrollTop) {
      this.$el.scrollTop = scrollTop; // triggers 'scroll' event
    },

    handlePageFocus(pageNumber) {
      this.$parent.$emit('page-focus', pageNumber);
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

    updateScrollBounds() {
      this.scrollBounds = this.getScrollBounds();
    },

    fetchPages(currentPage) {
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      this.$parent.$emit('fetch-pages', currentPage);
    },

    pageRendered(payload) {
      this.$parent.$emit('page-rendered', payload);
    },

    pageErrored(payload) {
      this.$parent.$emit('page-errored', payload);
    },

    getScrollBounds() {
      const {scrollTop, clientHeight} = this.$el;
      return {
        top: scrollTop,
        bottom: scrollTop + clientHeight,
        height: clientHeight,
      };
    },
  },

  watch: {
    pages() {
      if (!this.focusedPage) this.updateScale();
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

    pageCount: 'updateScale',
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
.pdf-document.preview-enabled {
  width: 80%;
  left: 20%;
}
@media print {
  .pdf-document {
    position: static;
  }
}
</style>
