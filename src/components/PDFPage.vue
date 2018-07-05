<script>
import debug from 'debug';
const log = debug('app:components/PDFPage');

import {PIXEL_RATIO} from '../utils/constants';

export default {
  name: 'PDFPage',

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    scale: {
      type: Number,
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
  },

  data() {
    return {
      elementBounds: {},
    };
  },


  computed: {
    actualSizeViewport() {
      return this.viewport.clone({scale: this.scale});
    },

    canvasStyle() {
      const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
        .map(dim => Math.ceil(dim / PIXEL_RATIO));
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
    },

    canvasAttrs() {
      let {width, height} = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim));
      const style = this.canvasStyle;

      return {
        width,
        height,
        style,
        class: 'pdf-page box-shadow',
      };
    },

    pageNumber() {
      return this.page.pageNumber;
    },

    isPageFocused() {
      return this.page.pageNumber === this.focusedPage;
    },

    isElementFocused() {
      const {top, bottom, height} = this.elementBounds;
      if (!height) return;

      const {top: scrollTop, height: clientHeight} = this.scrollBounds;
      const halfHeight = (height / 2);
      const halfScreen = (clientHeight / 2);
      const delta = height >= halfScreen ? halfScreen : halfHeight;
      const threshold = scrollTop + delta;

      return top < threshold && bottom >= threshold;
    },

    isElementVisible() {
      const {top, bottom, height} = this.elementBounds;
      if (!height) return;

      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;

      return top < scrollBottom && bottom > scrollTop;
    },
  },

  methods: {
    jumpToPage() {
      if (this.isElementFocused || !this.isPageFocused) return;
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

    focusPage() {
      if (this.isPageFocused) return;

      this.$emit('page-focus', this.pageNumber);
    },

    drawPage() {
      if (this.renderTask) return;

      const {viewport} = this;
      const canvasContext = this.$el.getContext('2d');
      const renderContext = {canvasContext, viewport};

      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(renderContext);
      this.renderTask
        .then(() => {
          this.$emit('page-rendered', {
            page: this.page,
            text: `Rendered page ${this.pageNumber}`,
          });
         })
        .catch(response => {
          this.destroyRenderTask();
          this.$emit('page-errored', {
            response,
            page: this.page,
            text: `Failed to render page ${this.pageNumber}`,
          });
        });
    },

    destroyPage(page) {
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      if (page) page._destroy();

      this.destroyRenderTask();
    },

    destroyRenderTask() {
      if (!this.renderTask) return;

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel();
      delete this.renderTask;
    },
  },

  watch: {
    scale: 'updateElementBounds',
    scrollBounds: 'updateElementBounds',
    isPageFocused: 'jumpToPage',

    page(_newPage, oldPage) {
      this.destroyPage(oldPage);
    },

    isElementFocused(isElementFocused) {
      if (isElementFocused) this.focusPage();
    },

    isElementVisible(isElementVisible) {
      if (isElementVisible) this.drawPage();
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale);
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.updateElementBounds();
  },

  beforeDestroy() {
    this.destroyPage(this.page);
  },

  render(h) {
    const {canvasAttrs: attrs} = this;
    return h('canvas', {attrs});
  },
};
</script>
<style>
.pdf-page {
  display: block;
  margin: 0 auto;
}
</style>
