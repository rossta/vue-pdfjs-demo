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

import {PIXEL_RATIO} from '../utils/constants';
import responsiveScaleFactor from '../utils/responsiveScaleFactor';

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
  },

  methods: {
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
