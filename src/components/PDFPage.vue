<script>
import debug from 'debug';
const log = debug('app:vue_features/documents/components/PDFPage');

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
    width: {
      type: Number,
      required: true,
    },
  },

  computed: {
    viewport() {
      return this.getViewport(this.viewportScale);
    },
    viewportScale() {
      return this.width / this.getViewport(this.scale).width;
    },
    canvasWidth() {
      return this.viewport.width;
    },
    canvasHeight() {
      return this.viewport.height;
    },
    pageNumber() {
      return this.page.pageNumber;
    },
  },

  methods: {
    renderPage() {
      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.page.render(this.getRenderContext()).
        then(() => log('Page rendered')).
        then(() => this.$emit('rendered', this.page)).
        catch(reason => this.$emit('errored', reason))
    },
    getRenderContext() {
      const {viewport} = this;

      const canvas = this.$el;
      const canvasContext = canvas.getContext('2d');

      return {canvasContext, viewport};
    },
    getViewport(scale) {
      // PDFPageProxy#getViewport
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      return this.page.getViewport(scale);
    },
  },

  mounted() {
    log(`PDFPage ${this.pageNumber} mounted`);
    this.renderPage();
  },

  updated() {
    log(`PDFPage ${this.pageNumber} updated`);
    this.renderPage();
  },

  beforeDestroy() {
    // PDFPageProxy#_destroy
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.page._destroy();
  },

  render(h) {
    const {canvasWidth, canvasHeight} = this;
    return h('canvas', {
      attrs: {
        width: canvasWidth,
        height: canvasHeight,
        class: 'pdf-page',
      },
    });
  },
};
</script>
<style>
.pdf-page {
  margin-bottom: 1em;
}
</style>
