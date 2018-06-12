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
    isFocusedPage: {
      type: Boolean,
      default: false,
    },
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
  },

  methods: {
    focusPage() {
      if (this.isElementFocused() && !this.isFocusedPage) {
        this.logBoundaries('focused');
        this.$emit('page-focus', this.pageNumber);
      }

      if (this.isElementVisible() && !this.renderTask) {
        this.drawPage();
      }
    },

    drawPage() {
      this.cancelRenderTask();

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

      this.cancelRenderTask();
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

    isElementFocused() {
      const {top: scrollTop, height: visibleHeight} = this.scrollBounds;
      const {top, bottom} = this.getElementBounds();
      const halfHeight = (visibleHeight / 2);

      return (top - halfHeight) <= scrollTop && scrollTop < (bottom - halfHeight);
    },

    isElementVisible() {
      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;
      const {top, height} = this.getElementBounds();
      const bottom = top + height;

      return !(
        (bottom < scrollTop && top < scrollTop) ||
        (top > scrollBottom && bottom > scrollBottom)
      );
    },

    logBoundaries(label) {
      const {top: scrollTop, bottom: scrollBottom, height: clientHeight} = this.scrollBounds;
      log(
        `Page ${this.pageNumber}`, label,
        this.getElementBounds(),
        {scrollTop, scrollBottom, clientHeight},
      );
    },

    cancelRenderTask() {
      if (!this.renderTask) return;

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel();
      delete this.renderTask;
    },
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage);
    },

    isFocusedPage(isFocusedPage) {
      if (isFocusedPage && !this.isElementFocused()) {
        const {top} = this.getElementBounds();
        this.$emit('page-top', top);
      }
    },

    scrollBounds() {
      this.focusPage();
    },

    scale() {
      this.focusPage();
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale);
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.focusPage();
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
