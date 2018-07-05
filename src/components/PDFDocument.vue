<template>
  <div
    class="pdf-document scrolling-document"
    v-resize="fitWidth"
    v-bottom.immediate="onPagesFetch"
    v-scroll.immediate="updateScrollBounds"
    @page-jump="onPageJump"
    @pages-fetch="onPagesFetch"
    >
    <PDFPage
      v-for="page in pages"
      v-bind="{scale, page, scrollBounds, focusedPage}"
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

import {PIXEL_RATIO, VIEWPORT_RATIO} from '../utils/constants';

import resize from '../directives/resize';
import bottom from '../directives/bottom';
import scroll from '../directives/scroll';

import PDFPage from './PDFPage';

export default {
  name: 'PDFDocument',

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
    fit: {
      type: String,
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

    pagesLength() {
      return this.pages.length;
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

    onPagesFetch(currentPage) {
      this.$parent.$emit('pages-fetch', currentPage);
    },

    onPageFocused(pageNumber) {
      this.$parent.$emit('page-focus', pageNumber);
    },

    onPageRendered(payload) {
      this.$parent.$emit('page-rendered', payload);
    },

    onPageErrored(payload) {
      this.$parent.$emit('page-errored', payload);
    },

    updateScrollBounds() {
      const {scrollTop, clientHeight} = this.$el;
      this.scrollBounds = {
        top: scrollTop,
        bottom: scrollTop + clientHeight,
        height: clientHeight,
      };
    },
  },

  watch: {
    pageCount: 'fitWidth',

    pagesLength(count, oldCount) {
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
