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
        then(() => this.$emit('rendered', this.page)).
        then(() => log(`Page ${this.pageNumber} rendered`)).
        catch(response => this.$emit(
          'errored',
          {text: `Failed to render page ${this.pageNumber}`, response}
        ))
    },
    destroyPage(page) {
      if (!page) return;
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      page._destroy();
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

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage);
    },
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.renderPage();
  },

  updated() {
    log(`Page ${this.pageNumber} updated`);
    this.renderPage();
  },

  beforeDestroy() {
    this.destroyPage(this.page);
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
