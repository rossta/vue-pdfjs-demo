<script>
import debug from 'debug';
const log = debug('app:vue_features/documents/components/PDFPage');

const CSS_UNITS = 96.0 / 72.0;

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
    containerBounds: {
      type: Object,
      default: () => ({}),
    },
    isCurrentPage: {
      type: Boolean,
      default: false,
    },
    force: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    actualSizeViewport() {
      return this.viewport.clone({scale: this.scale * CSS_UNITS});
    },

    canvasStyle() {
      const {width: actualSizeWidth, height: actualSizeHeight} = this.actualSizeViewport;
      const pixelRatio = window.devicePixelRatio || 1;
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map(dim =>
        Math.ceil(dim / pixelRatio),
      );
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
        class: 'pdf-page',
      };
    },

    pageNumber() {
      return this.page.pageNumber;
    },
  },

  methods: {
    focusPage() {
      if (this.isElementFocused()) {
        this.logBoundaries('page focused');
        this.$emit('page-focus', this.pageNumber);
      }

      if (this.shouldDrawPage()) {
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
        .then(() => log(`Page ${this.pageNumber} rendered`))
        .catch(response => {
          log(`Failed to render page ${this.pageNumber}`, response);
          this.$emit('page-errored', {text: `Failed to render page ${this.pageNumber}`, response});
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
      const $el = this.$el;
      return {
        top: $el.offsetTop,
        bottom: $el.offsetTop + $el.clientHeight,
      };
    },

    isElementFocused() {
      const {top: containerTop, bottom: containerBottom} = this.containerBounds;
      const {top, bottom} = this.getElementBounds();
      const containerMiddle = containerTop + (containerBottom - containerTop) / 2;
      return top <= containerMiddle && bottom >= containerMiddle;
    },

    isElementVisible() {
      const {top: containerTop, bottom: containerBottom} = this.containerBounds;
      const {top, bottom} = this.getElementBounds();

      return !(
        (bottom < containerTop && top < containerTop) ||
        (top > containerBottom && bottom > containerBottom)
      );
    },

    shouldDrawPage() {
      return this.force || (this.isElementVisible() && !this.renderTask);
    },

    logBoundaries(label) {
      const {top: containerTop, bottom: containerBottom} = this.containerBounds;
      const {top, bottom} = this.getElementBounds();
      log(label, {containerTop, containerBottom}, {top, bottom}, this.pageNumber);
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

    isCurrentPage(isCurrentPage) {
      if (isCurrentPage && !this.isElementFocused()) {
        const {top} = this.getElementBounds();
        this.$emit('page-top', top);
      }
    },

    containerBounds() {
      this.focusPage();
    },

    scale() {
      this.focusPage();
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale * CSS_UNITS);
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
  margin: 0 auto 0.5em;
}
</style>
