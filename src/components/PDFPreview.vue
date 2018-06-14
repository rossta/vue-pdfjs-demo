<template>
  <div class="pdf-preview"
    v-bottom="fetchPages"
    v-scroll.immediate="updateScrollBounds"
    >
    <PDFThumbnail
      v-for="page in pages"
      v-bind="{page, scrollBounds}"
      :key="page.pageNumber"
      :is-page-focused="page.pageNumber === focusedPage"
      @page-focus="handlePageFocus"
     />
  </div>
</template>

<script>
// import debug from 'debug';
// const log = debug('app:components/PDFPreview');

import bottom from '../directives/bottom';
import scroll from '../directives/scroll';

import PDFThumbnail from './PDFThumbnail';

export default {
  props: ['pages', 'currentPage', 'pageCount'],

  components: {
    PDFThumbnail,
  },

  directives: {
    bottom,
    scroll,
  },


  data() {
    return {
      focusedPage: undefined,
      scrollBounds: {},
    };
  },

  methods: {
    handlePageFocus(pageNumber) {
      this.$parent.$emit('page-focus', pageNumber);
    },

    updateScrollBounds() {
      this.scrollBounds = this.getScrollBounds();
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

  watch: {
    pages() {
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

<style scoped>
.pdf-preview {
  position: absolute;
  overflow: auto;
  width: 20%;
  z-index: 1;
  padding: 2em 0;
  top: 70px;
  left: 0;
  right: 80%;
  bottom: 0;
}
@media print {
  .pdf-preview {
    display: none;
  }
}
</style>
