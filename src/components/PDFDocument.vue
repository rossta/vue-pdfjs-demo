<template>
  <div class="pdf-document">
    <PDFPage
      v-for="page in visiblePages"
      v-bind="{scale}"
      :key="page.pageNumber"
      :page="page"
      :isFocusedPage="page.pageNumber === focusedPage"
      :containerBounds="elementBounds"
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
import PDFPage from './PDFPage';

const BUFFER_LENGTH = 4;

function getScaleFactor() {
  const [LARGE, MIDDLE, SMALL] = [480, 768, 1024];
  const SCALE_FACTORS = {
    [SMALL]: 0.95,
    [MIDDLE]: 0.85,
    [LARGE]: 0.60,
  };
  const clientWidth = document.body.clientWidth;
  if (clientWidth > LARGE) {
    return SCALE_FACTORS[LARGE];
  } else if (clientWidth > MIDDLE) {
    return SCALE_FACTORS[MIDDLE];
  } else {
    return SCALE_FACTORS[SMALL];
  }
}

export default {
  components: {
    PDFPage,
  },
  props: {
    pages: {
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
      focusedPage: undefined,
      elementBounds: {},
      visiblePages: [],
    };
  },

  watch: {
    pages(pages) {
      if (pages.length) this.visiblePages = pages.slice(0, BUFFER_LENGTH);
      this.updateScale();
    },

    currentPage(currentPage) {
      this.updateVisiblePages(currentPage);
      this.$nextTick(() => (this.focusedPage = currentPage));
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
      const elementBounds = this.getElementBounds();
      this.elementBounds = elementBounds;

      if (this.isBottomVisible()) this.updateVisiblePages();
    },

    handleResize() {
      this.updateScale();
    },

    updateScale() {
      if (!this.pages.length) return;
      const [page] = this.pages;
      const width = this.$el.clientWidth;
      const defaultViewport = page.getViewport(1.0);
      const pageWidthScale = (width * PIXEL_RATIO) * getScaleFactor() / defaultViewport.width;

      log('calculating initial scale', width, defaultViewport.width, pageWidthScale);
      this.$emit('scale-change', pageWidthScale);
    },

    pageRendered(page) {
      this.$parent.$emit('page-rendered', page);
    },

    pageErrored(error) {
      this.$parent.$emit('page-errored', error);
    },

    getElementBounds() {
      const $el = this.$el;
      return {
        top: $el.scrollTop,
        bottom: $el.scrollTop + $el.clientHeight,
      };
    },

    isBottomVisible() {
      const {scrollTop, clientHeight, scrollHeight} = this.$el;
      return (scrollTop + clientHeight) >= scrollHeight || clientHeight >= scrollHeight;
    },

    updateVisiblePages(currentPage) {
      const visibleCount = this.visiblePages.length;
      const totalPages = currentPage || this.pages.length;

      if (visibleCount < totalPages) {
        const buffer = currentPage ? currentPage - visibleCount : BUFFER_LENGTH;
        this.visiblePages.splice(visibleCount, 0, ...this.pages.slice(visibleCount, visibleCount+buffer));
      }
    },
  },

  mounted() {
    this.handleScroll();
    this.throttledScroll = throttle(this.handleScroll, 500);
    window.addEventListener('scroll', this.throttledScroll, true);

    this.throttledResize = throttle(this.handleResize, 500)
    window.addEventListener('resize', this.handleResize, true)
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
