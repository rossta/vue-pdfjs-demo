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
    scrollTop: {
      type: Number,
      default: 0,
    },
    isCurrentPage: {
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
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map(dim => Math.ceil(dim / pixelRatio));
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`
    },

    canvasAttrs() {
      let {width, height} = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim))
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
    renderPage() {
      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(this.getRenderContext());
      this.renderTask.
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


      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      if (this.renderTask) this.renderTask.cancel();
    },

    getRenderContext() {
      const {viewport} = this;
      const canvasContext = this.$el.getContext('2d');

      return {canvasContext, viewport};
    },
  },

  watch: {
    page(page, oldPage) {
      this.destroyPage(oldPage);
    },

    isCurrentPage(isCurrentPage) {
      if (isCurrentPage) {
        this.$emit('active', this.$el.offsetTop);
      }
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.scale * CSS_UNITS);
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
  display: block;
  margin: 0 auto 0.5em;
}
</style>
