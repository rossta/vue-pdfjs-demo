<template>
  <div>
    <canvas ref="canvas" v-visible.once="drawPage" v-bind="canvasAttrs"></canvas>
    <div ref="textLayer" class="textLayer"></div>
  </div>
</template>

<script>
import debug from 'debug';
const log = debug('app:components/PDFPage');

import {PIXEL_RATIO} from '../utils/constants';
import visible from '../directives/visible';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer'
import {VIEWPORT_RATIO} from "../../../../../../pdf-viewer/utils/constants";
import 'pdfjs-dist/web/pdf_viewer.css'
import findAndReplaceDOMText from '../directives/findAndReplaceDOMText'

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
    optimalScale: {
      type: Number,
      required: true,
    },
    isPageFocused: {
      type: Boolean,
      default: false,
    },
    isElementFocused: {
      type: Boolean,
      default: false,
    },
    selections: {
      type: Array,
      default: []
    }
  },

  directives: {
    visible,
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
      if (this.isPageFocused) return;

      this.$emit('page-focus', this.pageNumber);
    },

    drawPage() {
      if (this.renderTask) return;

      const self = this;
      const {viewport} = this;
      const canvasContext = this.$refs.canvas.getContext('2d');
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

      this.page.getTextContent().then((textContent) => {

        // console.log(textContent);

        // Set the layer position
        const pdfCanvas = self.$refs.canvas;
        const canvasTop = pdfCanvas.offsetTop;
        const canvasLeft = pdfCanvas.offsetLeft;
        const canvasHeight = pdfCanvas.offsetHeight;
        const canvasWidth = pdfCanvas.offsetWidth;

        const textLayerDiv = self.$refs.textLayer;
        textLayerDiv.style.top = canvasTop + 'px';
        textLayerDiv.style.left = canvasLeft + 'px';
        textLayerDiv.style.width = canvasWidth + 'px';
        textLayerDiv.style.height = canvasHeight + 'px';

        // Scale text
        const defaultViewport = self.page.getViewport(1);
        const newScale = canvasWidth / (defaultViewport.width * VIEWPORT_RATIO);
        const newViewport = self.page.getViewport(newScale);

        // Create new instance of TextLayerBuilder class
        const textLayer = new TextLayerBuilder({
          textLayerDiv: self.$refs.textLayer,
          pageIndex: self.page.pageIndex,
          viewport: newViewport,
          enhanceTextSelection: true,
        });

        // Set text-fragments
        textLayer.setTextContent(textContent);

        // Render text-fragments
        textLayer.render();

        // Highlight text
        if (self.selections.length > 0) {

          const observer = new MutationObserver(function (mutations) {

            if (self.$refs.textLayer.children.length > 0) {

              for (let i=0; i<self.selections.length; i++) {
                if (self.page.pageNumber === self.selections[i].page) {

                  const color = self.selections[i].color;
                  const selection = self.selections[i].text
                          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                          .replace(/(\r\n|\n|\r|\s|[\u00a0])+/g, '(\\r\\n|\\n|\\r|\\s|[\\u00a0])+');
                  const wrapClass = 'css' + color.replace('#', '-');

                  findAndReplaceDOMText(self.$refs.textLayer, {
                    find: new RegExp(selection, 'gi'),
                    wrap: 'em',
                    wrapClass: wrapClass,
                  });

                  $('.' + wrapClass).css('background-color', color);
                }
              }

              observer.disconnect();
            }
          });

          observer.observe(self.$refs.textLayer, {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
          });
        }
      });
    },

    updateVisibility() {
      this.$parent.$emit('update-visibility');
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
    scale: 'updateVisibility',

    page(_newPage, oldPage) {
      this.destroyPage(oldPage);
    },

    isElementFocused(isElementFocused) {
      if (isElementFocused) this.focusPage();
    },
  },

  created() {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport(this.optimalScale);
  },

  mounted() {
    log(`Page ${this.pageNumber} mounted`);
  },

  beforeDestroy() {
    this.destroyPage(this.page);
  },
};
</script>
<style>
.pdf-page {
  display: block;
  margin: 0 auto;
}
</style>
