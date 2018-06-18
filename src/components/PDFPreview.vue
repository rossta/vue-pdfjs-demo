<template>
  <div class="pdf-preview"
    v-bottom.immediate="fetchPages"
    v-scroll.immediate="updateScrollBounds"
    >
    <ScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-bind="{page, scrollBounds, focusedPage}"
      >
      <PDFThumbnail
        slot-scope="{page, isElementVisible, isPageFocused}"
        v-bind="{scale, page, isElementVisible, isPageFocused}"
        @thumbnail-rendered="thumbnailRendered"
        @thumbnail-errored="thumbnailErrored"
        @page-focus="onPageFocus"
      />
    </ScrollingPage>
  </div>
</template>

<script>
import bottom from '../directives/bottom';
import scroll from '../directives/scroll';

import PDFThumbnail from './PDFThumbnail';
import ScrollingPage from './ScrollingPage';

export default {
  name: 'PDFPreview',

  components: {
    PDFThumbnail,
    ScrollingPage,
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
    onPageFocus(pageNumber) {
      this.$parent.$emit('page-focus', pageNumber);
    },

    updateScrollBounds() {
      this.scrollBounds = this.getScrollBounds();
    },

    fetchPages(currentPage) {
      if (this.pageCount > 0 && this.pages.length === this.pageCount) return;

      this.$parent.$emit('pages-fetch', currentPage);
    },

    thumbnailRendered(payload) {
      this.$el.dispatchEvent(new Event('scroll'));
      this.$parent.$emit('thumbnail-rendered', payload);
    },

    thumbnailErrored(payload) {
      this.$parent.$emit('thumbnail-errored', payload);
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
  width: 15%;
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
