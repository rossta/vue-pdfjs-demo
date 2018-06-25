<template>
  <ScrollingDocument
    class="pdf-document preview-enabled"
    v-resize="updateScale"
    v-bind="{pages, pageCount, currentPage}"
    :enable-page-jump="true"
    @page-jump="onPageJump"
    @pages-fetch="onPagesFetch"
    @pages-reset="updateScale"
    >
    <PDFPage
      slot-scope="{page, isElementVisible, isPageFocused, isElementFocused}"
      v-bind="{scale, page, isElementVisible, isPageFocused, isElementFocused}"
      @page-rendered="onPageRendered"
      @page-errored="onPageErrored"
      @page-focus="onPageFocused"
    />
  </ScrollingDocument>
</template>

<script>
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).
import debug from 'debug';
const log = debug('app:components/PDFDocument');

import floor from '../utils/floor';
import {PIXEL_RATIO, VIEWPORT_RATIO} from '../utils/constants';

import resize from '../directives/resize';

import ScrollingDocument from './ScrollingDocument';
import PDFPage from './PDFPage';

export default {
  name: 'PDFDocument',

  components: {
    ScrollingDocument,
    PDFPage,
  },

  directives: {
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
    isPreviewEnabled: {
      default: false,
    },
  },

  data() {
    return {
      baseScaleFactor: undefined,
    };
  },

  computed: {
    firstPage() {
      if (!this.pages.length) return undefined;
      const [page] = this.pages;
      return page;
    },

    defaultViewportWidth() {
      return this.firstPage ? this.firstPage.getViewport(1.0).width : 0;
    },
  },

  methods: {
    // Determine an ideal scale using viewport of document's first page, the pixel ratio from the browser
    // and a subjective scale factor based on the screen size.
    updateScale(newCount, oldCount) {
      const {defaultViewportWidth} = this;
      if (!defaultViewportWidth) return;

      const scaleFactor = this.scaleFactor();
      if (oldCount === 0) {
        this.baseScaleFactor = scaleFactor;
      }

      const pageWidthScale = scaleFactor * VIEWPORT_RATIO;

      log('calculating initial scale', pageWidthScale);
      this.$emit('scale-change', pageWidthScale);
    },

    scaleFactor() {
      const {defaultViewportWidth} = this;
      const pixelWidth = this.$el.clientWidth * PIXEL_RATIO;
      return floor(pixelWidth / defaultViewportWidth, 2);
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
  },

  watch: {
    pageCount: 'updateScale',
    isPreviewEnabled() {
      log('factor', this.scaleFactor, this.baseScaleFactor);
      if (this.baseScaleFactor === this.scaleFactor) {
        this.updateScale();
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
@media print {
  .pdf-document {
    position: static;
  }
}
</style>
