<template>
  <div
    class="pdf-viewer"
    :class="{ 'preview-enabled' : isPreviewEnabled }"
    >
    <header class="pdf-viewer__header box-shadow">
      <PDFZoom
        :scale="scale"
        @change="updateScale"
        class="header-item"
        />

      <PDFPaginator
        v-model="currentPage"
        :pageCount="pageCount"
        class="header-item"
        />

      <slot name="header"></slot>
    </header>

    <PDFDocumentProxy
      class="pdf-viewer__main"
      :url="url"
      @page-count="updatePageCount"
      @page-focus="updateCurrentPage"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
      >
      <PDFPreview
        class="pdf-viewer__preview"
        slot="preview"
        slot-scope="{pages}"
        v-bind="{pages, scale, currentPage, pageCount}"
        />

      <PDFDocument
        class="pdf-viewer__document"
        slot="document"
        slot-scope="{pages}"
        v-bind="{pages, scale, currentPage, pageCount}"
        @scale-change="updateScale"
        />
    </PDFDocumentProxy>
  </div>
</template>

<script>
import PDFDocument from './PDFDocument';
import PDFDocumentProxy from './PDFDocumentProxy';
import PDFPaginator from './PDFPaginator';
import PDFPreview from './PDFPreview';
import PDFZoom from './PDFZoom';

function round(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export default {
  name: 'PDFViewer',

  components: {
    PDFDocument,
    PDFDocumentProxy,
    PDFPaginator,
    PDFPreview,
    PDFZoom,
  },

  props: {
    url: String,
  },

  data() {
    return {
      scale: undefined,
      currentPage: 1,
      pageCount: undefined,
      isPreviewEnabled: true,
    };
  },

  methods: {
    onDocumentRendered() {
      this.$emit('document-errored', this.url);
    },

    onDocumentErrored(e) {
      this.$emit('document-errored', e);
    },

    updateScale(scale) {
      this.scale = round(scale, 1);
    },

    updatePageCount(pageCount) {
      this.pageCount = pageCount;
    },

    updateCurrentPage(pageNumber) {
      this.currentPage = pageNumber;
    },
  },

  watch: {
    url() {
      this.currentPage = undefined;
    },
  },

  mounted() {
    document.body.classList.add('overflow-hidden');
  },
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 1em;
  position: relative;
  z-index: 99;
}
.header-item {
  margin: 0 2.5em;
}

.pdf-viewer .pdf-viewer__document,
.pdf-viewer .pdf-viewer__preview {
  top: 70px;
}

.pdf-viewer__preview {
  display: none;
}

.pdf-viewer.preview-enabled .pdf-viewer__preview {
  display: block;
  width: 15%;
  right: 85%;
}

.pdf-viewer.preview-enabled .pdf-viewer__document {
  top: 70px;
  width: 85%;
  left: 15%;
}

@media print {
  header {
    display: none;
  }
}
</style>
