<script>
export default {
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    focusedPage: {
      type: Number,
      default: undefined,
    },
    scrollBounds: {
      type: Object,
      default: () => ({}),
    },
    enablePageJump: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      elementBounds: {},
    };
  },

  computed: {
    isPageFocused() {
      return this.page.pageNumber === this.focusedPage;
    },

    isElementFocused() {
      const {top: scrollTop} = this.scrollBounds;
      const {top, bottom, height} = this.elementBounds;
      const halfHeight = (height / 2);

      return height > 0 &&
        (top - halfHeight) <= scrollTop &&
        scrollTop < (bottom - halfHeight);
    },

    isElementVisible() {
      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;
      const {top, height} = this.elementBounds;
      const bottom = top + height;

      return height > 0 && bottom > scrollTop && top < scrollBottom;
    },
  },

  methods: {
    jumpToPage() {
      if (
        !this.enablePageJump ||
        this.isElementFocused ||
        !this.isPageFocused
      ) return;

      const {top} = this.elementBounds;
      this.$emit('page-jump', top);
    },

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
    isPageFocused: 'jumpToPage',
  },

  created() {
    this.$on('update-visibility', this.updateElementBounds);
  },

  mounted() {
    this.updateElementBounds();
  },

  render() {
    const {page, isElementVisible, isPageFocused, isElementFocused} = this;
    return this.$scopedSlots.default({
      page,
      isElementVisible,
      isPageFocused,
      isElementFocused,
    });
  },
}
</script>
