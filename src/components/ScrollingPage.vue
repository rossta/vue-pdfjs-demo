<script>
export default {
  name: 'ScrollingPage',

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    focusedPage: {
      type: Number,
      default: undefined,
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    scrollHeight: {
      type: Number,
      default: 0
    },
    enablePageJump: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      top: 0,
      height: 0,
    };
  },

  computed: {
    isPageFocused() {
      return this.page.pageNumber === this.focusedPage;
    },

    isElementFocused() {
      const {top, bottom, height, scrollTop, scrollHeight} = this;
      if (!height) return;

      const halfHeight = (height / 2);
      const halfScreen = (scrollHeight / 2);
      const delta = height >= halfScreen ? halfScreen : halfHeight;
      const threshold = scrollTop + delta;

      return top < threshold && bottom >= threshold;
    },

    isElementVisible() {
      const {top, bottom, height, scrollTop, scrollBottom} = this;
      if (!height) return;

      return top < scrollBottom && bottom > scrollTop;
    },

    bottom() {
      return this.top + this.height;
    },

    scrollBottom() {
      return this.scrollTop + this.scrollHeight;
    },
  },

  methods: {
    jumpToPage() {
      if (!this.enablePageJump || this.isElementFocused || !this.isPageFocused) return;

      this.$emit('page-jump', this.top);
    },

    updateElementBounds() {
      const {offsetTop, offsetHeight} = this.$el;
      this.top = offsetTop;
      this.height = offsetHeight;
    },
  },

  watch: {
    scrollTop: 'updateElementBounds',
    scrollHeight: 'updateElementBounds',
    isPageFocused: 'jumpToPage',
  },

  created() {
    this.$on('update-visibility', this.updateElementBounds);
  },

  mounted() {
    this.updateElementBounds();
  },

  render() {
    const {isElementVisible, isPageFocused, isElementFocused} = this;
    return this.$scopedSlots.default({
      isElementVisible,
      isPageFocused,
      isElementFocused,
    });
  },
}
</script>
