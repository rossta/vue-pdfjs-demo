<script>
export default {
  props: ['page', 'scrollBounds', 'focusedPage'],

  data() {
    return {
      elementBounds: {},
    };
  },

  computed: {
    isPageFocused() {
      return this.page.pageNumber === this.focusedPage;
    },
    isElementVisible() {
      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;
      const {top, height} = this.elementBounds;
      const bottom = top + height;

      return height > 0 && bottom > scrollTop && top < scrollBottom;
    },
  },

  methods: {
    updateElementBounds() {
      const {offsetTop, clientHeight} = this.$el;
      this.elementBounds = {
        top: offsetTop,
        bottom: offsetTop + clientHeight,
        height: clientHeight,
      };
    },
  },

  watch: {
    scrollBounds: 'updateElementBounds',
  },

  created() {
    this.$on('update-visibility', this.updateElementBounds);
  },

  mounted() {
    this.updateElementBounds();
  },

  render() {
    const {page, isElementVisible, isPageFocused, elementBounds} = this;
    return this.$scopedSlots.default({
      page,
      isElementVisible,
      isPageFocused,
      elementBounds,
    });
  },
}
</script>
