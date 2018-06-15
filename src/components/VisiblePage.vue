<script>
import debug from 'debug';
const log = debug('app:components/VisiblePage');
export default {
  props: ['page', 'scrollBounds'],

  data() {
    return {
      elementBounds: {},
    };
  },

  computed: {
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

  created() {
    this.$on('update-visibility', this.updateElementBounds);
  },

  mounted() {
    log('mounted', this.$el);
    this.updateElementBounds();
  },

  render() {
    const {page, isElementVisible} = this;
    return this.$scopedSlots.default({
      page,
      isElementVisible,
    });
  },
}
</script>
