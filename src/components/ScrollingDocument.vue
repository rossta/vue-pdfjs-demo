<template>
  <div
    class="scrolling-document"
    v-bottom.immediate="fetchPages"
    v-scroll.immediate="updateScrollBounds"
    >
    <ScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-bind="{page, scrollBounds, focusedPage, enablePageJump}"
      @page-jump="onPageJump"
      >
      <template slot-scope="{page, isElementVisible, isPageFocused, isElementFocused}">
        <slot v-bind="{page, isElementVisible, isPageFocused, isElementFocused}"></slot>
      </template>
    </ScrollingPage>
  </div>
</template>

<script>
import bottom from '../directives/bottom';
import scroll from '../directives/scroll';

import ScrollingPage from './ScrollingPage';

export default {
  components: {
    ScrollingPage,
  },

  directives: {
    bottom,
    scroll,
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
  },

  data() {
    return {
      focusedPage: undefined,
      scrollBounds: {},
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
  },
}
</script>
