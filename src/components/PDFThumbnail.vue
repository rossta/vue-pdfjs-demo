<template>
  <div
    @click="focusPage"
    :class="{ focused: isPageFocused }"
    class="pdf-thumbnail"
    >
    <img
      v-if="src"
      :src="src"
      />
    <div
      v-else
      class="placeholder"
      >
      Loading
    </div>
    <span class="page-number">{{ pageNumber }}</span>
  </div>
</template>

<script>
import debug from 'debug';
const log = debug('app:components/PDFThumbnail');

export default {
  props: ['page', 'scale', 'scrollBounds', 'isPageFocused'],

  data() {
    return {
      src: undefined,
      elementBounds: {},
    };
  },

  computed: {
    viewport() {
      return this.page.getViewport(1.0);
    },

    pageNumber() {
      return this.page.pageNumber;
    },

    isElementVisible() {
      const {top: scrollTop, bottom: scrollBottom} = this.scrollBounds;
      const {top, height} = this.elementBounds;
      const bottom = top + height;

      return height > 0 &&
        bottom > scrollTop &&
        top < scrollBottom;

    },
  },

  methods: {
    focusPage() {
      this.$emit('page-focus', this.pageNumber);
    },

    updateElementBounds() {
      this.elementBounds = this.getElementBounds();
    },

    getElementBounds() {
      const {offsetTop, clientHeight} = this.$el;
      return {
        top: offsetTop,
        bottom: offsetTop + clientHeight,
        height: clientHeight,
      };
    },

    drawPage() {
      if (this.renderTask) return;

      const {viewport} = this;
      const canvas = document.createElement('canvas')
      const canvasContext = canvas.getContext('2d')
      const renderContext = { canvasContext, viewport };
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      this.renderTask = this.page.render(renderContext);
      this.renderTask
        .then(() => {
          this.src = canvas.toDataURL();

          // Zeroing the width and height causes Firefox to release graphics
          // resources immediately, which can greatly reduce memory consumption.
          canvas.width = 0;
          canvas.height = 0;
        })
        .then(() => {
          this.$emit('page-rendered', {
            page: this.page,
            text: `Rendered thumbnail ${this.pageNumber}`,
          });
         })
        .catch(response => {
          this.destroyRenderTask();
          this.$emit('page-errored', {
            response,
            page: this.page,
            text: `Failed to render thumbnail ${this.pageNumber}`,
          });
        });
    },

    destroyPage(_newPage, page) {
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
    page: 'destroyPage',

    isElementVisible(isElementVisible) {
      if (isElementVisible) this.drawPage();
    },

    scale: 'updateElementBounds',
    scrollBounds: 'updateElementBounds',
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
    this.elementBounds = this.getElementBounds();
    if (this.isElementVisible) this.drawPage();
  },

  beforeDestroy() {
    this.destroyPage(undefined, this.page);
  },
}
</script>

<style scoped>
.pdf-thumbnail {
  cursor: pointer;
  margin: 0 auto 1em;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

img, .placeholder {
  border: 10px solid transparent;
  border-radius: 8px;
  width: 75%;
}

.pdf-thumbnail.focused img {
  border-color: rgba(50, 50, 30, 0.5);
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  height: 24vh;
  background-clip: content-box;
}

.page-number {
  color: white;
  font-weight: bold;
}
</style>
