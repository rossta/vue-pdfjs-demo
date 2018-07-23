<template>
  <div class="scrolling-document">
    <ScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-bind="{page, scrollTop, clientHeight, focusedPage, enablePageJump}"
      @page-jump="onPageJump"
      >
      <div
        class="scrolling-page"
        slot-scope="{isElementVisible, isPageFocused, isElementFocused}"
        >
        <slot v-bind="{page, isElementVisible, isPageFocused, isElementFocused}"></slot>
      </div>
    </ScrollingPage>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

import {VIEWPORT_RATIO, PIXEL_RATIO} from '../utils/constants';
import ScrollingPage from './ScrollingPage';

export default {
  components: {
    ScrollingPage,
  },

  props: {
    pages: {
      required: true,
    },
    enablePageJump: {
      type: Boolean,
      default: false,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    isParentVisible: {
      default: true,
    },
  },

  data() {
    return {
      focusedPage: undefined,
      scrollTop: 0,
      clientHeight: 0,
      didReachBottom: false,
    };
  },

  computed: {
    pagesLength() {
      return this.pages.length;
    },
  },

  methods: {
    fetchPages(currentPage) {
      this.$emit('pages-fetch', currentPage);
    },

    onPageJump(scrollTop) {
      this.$emit('page-jump', scrollTop);
    },

    pageWidthScale() {
      const {defaultViewport, $el} = this;
      if (!defaultViewport.width) return 0;

      return ($el.clientWidth * PIXEL_RATIO) * VIEWPORT_RATIO / defaultViewport.width;
    },

    // Determine an ideal scale using viewport of document's first page, the pixel ratio from the browser
    // and a subjective scale factor based on the screen size.
    fitWidth() {
      const scale = this.pageWidthScale();
      this.$emit('scale-change', scale);
    },

    updateScrollBounds() {
      const {scrollTop, clientHeight} = this.$el;
      this.scrollTop = scrollTop;
      this.clientHeight = clientHeight;
      this.didReachBottom = this.isBottomVisible();
    },

    isBottomVisible() {
      const {scrollTop, clientHeight, scrollHeight} = this.$el;
      return scrollTop + clientHeight >= scrollHeight;
    },

    onResize() {
      this.fitWidth();
      this.updateScrollBounds();
    },
  },

  watch: {
    isParentVisible: 'updateScrollBounds',

    pageCount: 'fitWidth',

    fetchedPageCount(count, oldCount) {
      if (oldCount === 0) this.fitWidth();
    },

    pagesLength(count, oldCount) {
      if (oldCount === 0) this.$emit('pages-reset');

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

    didReachBottom(didReachBottom) {
      if (didReachBottom) this.fetchPages();
    },
  },

  mounted() {
    this.updateScrollBounds();
    this.$el.addEventListener('scroll', throttle(this.updateScrollBounds, 300), true);

    const throttledOnResize = throttle(this.onResize, 300);
    window.addEventListener('resize', throttledOnResize, true);
    this.throttledOnResize = throttledOnResize;
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.throttledOnResize, true);
  },
}
</script>
