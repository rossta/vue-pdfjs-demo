<script>
import debug from 'debug';
const log = debug('app:vue_features/documents/components/PDFPage');

import {PIXEL_RATIO} from '../utils/constants';

export default {
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    scrollBounds: {
      type: Object,
      default: () => ({}),
    },
    isPageFocused: {
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

    isElementVisible() {
      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;
      const {top, height} = this.elementBounds;
      const bottom = top + height;

      return height > 0 &&
        !(
          (bottom < scrollTop && top < scrollTop) ||
          (top > scrollBottom && bottom > scrollBottom)
        );
    },

    isElementFocused() {
      const {top: scrollTop, height: visibleHeight} = this.scrollBounds;
      const {top, bottom, height} = this.elementBounds;
      const halfHeight = (visibleHeight / 2);

      return height > 0 &&
        (top - halfHeight) <= scrollTop &&
        scrollTop < (bottom - halfHeight);
    },
  },

  methods: {
    focusElement() {
      if (this.isPageFocused) return;
      if (this.isElementFocused) return;

      const {top} = this.getElementBounds();
      this.$emit('page-top', top);
    },

    focusPage() {
      if (this.isPageFocused) return;

      this.$emit('page-focus', this.pageNumber);
    },

    drawPage() {
      if (this.renderTask) return;

      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(this.getRenderContext());
      this.renderTask
        .then(() => this.$emit('page-rendered', this.page))
        .catch(response => {
          this.$emit('page-errored', {
            response,
            page: this.page,
            text: `Failed to render page ${this.pageNumber}`,
          });
        });
    },

    destroyPage(page) {
      if (!page) return;
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      page._destroy();

      if (!this.renderTask) return;

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel();
      delete this.renderTask;
    },

    getRenderContext() {
      const {viewport} = this;
      const canvasContext = this.$el.getContext('2d');

      return {canvasContext, viewport};
    },

    getElementBounds() {
      const {offsetTop, clientHeight} = this.$el;
      return {
        top: offsetTop,
        bottom: offsetTop + clientHeight,
        height: clientHeight,
      };
    },
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage);
    },

    isPageFocused(isPageFocused) {
      if (isPageFocused) this.focusElement();
    },

    isElementFocused(isElementFocused) {
      if (isElementFocused) this.focusPage();
    },

    isElementVisible(isElementVisible) {
      if (isElementVisible) this.drawPage();
    },

    scale() {
      this.elementBounds = this.getElementBounds();
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale);
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.elementBounds = this.getElementBounds();
    if (this.isElementVisible) this.drawPage();
    if (this.isElementFocused) this.focusPage();
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
  margin: 0 auto 1em;
}
</style>
