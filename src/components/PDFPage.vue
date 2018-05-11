<script>
import debug from 'debug';
const log = debug('app:vue_features/documents/components/PDFPage');

const CSS_UNITS = 96.0  / 72.0;

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
  },

  data() {
    return {
      drawn: false,
    };
  },

  computed: {
    viewport() {
      return this.getViewport(this.scale * CSS_UNITS);
    },
    canvasAttrs() {
      let style = '';
      let {width, height} = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim))

      if (this.drawn) {
        const pixelRatio = this.getPixelRatio();
        const [pixelWidth, pixelHeight] = [width, height].map(dim => Math.ceil(dim / pixelRatio));
        style = `width: ${pixelWidth}px; height: ${pixelHeight}px;`
      }

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
    renderPage() {
      this.drawn = true;
      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.page.render(this.getRenderContext()).
        then(() => this.$emit('rendered', this.page)).
        then(() => log(`Page ${this.pageNumber} rendered`)).
        catch(response => {
          log(`Failed to render page ${this.pageNumber}`, response);
          this.$emit(
            'errored',
            {text: `Failed to render page ${this.pageNumber}`, response}
          );
        });
    },
    destroyPage(page) {
      if (!page) return;
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      page._destroy();
    },
    getCanvasContext() {
      const canvas = this.$el;
      return canvas.getContext('2d');
    },
    getRenderContext() {
      const {viewport} = this;
      const canvasContext = this.getCanvasContext();

      return {canvasContext, viewport};
    },
    getViewport(scale) {
      // PDFPageProxy#getViewport
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      return this.page.getViewport(scale);
    },
    getPixelRatio() {
      const ctx = this.getCanvasContext();
      let devicePixelRatio = window.devicePixelRatio || 1;
      let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1;
      return devicePixelRatio / backingStoreRatio;
    },
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage);
    },
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.renderPage();
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
  margin-bottom: 1em;
}
</style>
