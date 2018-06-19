<template>
  <ScrollingDocument
    class="pdf-preview"
    @pages-fetch="onPagesFetch"
    v-bind="{pages, pageCount, currentPage}"
    >
    <PDFThumbnail
      slot-scope="{page, isElementVisible, isPageFocused}"
      v-bind="{scale, page, isElementVisible, isPageFocused}"
      @thumbnail-rendered="thumbnailRendered"
      @thumbnail-errored="thumbnailErrored"
      @page-focus="onPageFocused"
      />
  </ScrollingDocument>
</template>

<script>
import ScrollingDocument from './ScrollingDocument';
import PDFThumbnail from './PDFThumbnail';

export default {
  name: 'PDFPreview',

  components: {
    ScrollingDocument,
    PDFThumbnail,
  },

  props: {
    pages: {
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1.0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },

  methods: {
    onPagesFetch(currentPage) {
      this.$parent.$emit('pages-fetch', currentPage);
    },

    onPageFocused(pageNumber) {
      this.$parent.$emit('page-focus', pageNumber);
    },

    thumbnailRendered(payload) {
      this.$el.dispatchEvent(new Event('scroll'));
      this.$parent.$emit('thumbnail-rendered', payload);
    },

    thumbnailErrored(payload) {
      this.$parent.$emit('thumbnail-errored', payload);
    },
  },
};
</script>

<style scoped>
.pdf-preview {
  position: absolute;
  overflow: auto;
  width: 15%;
  z-index: 1;
  padding: 2em 0;
  top: 70px;
  left: 0;
  right: 80%;
  bottom: 0;
}
@media print {
  .pdf-preview {
    display: none;
  }
}
</style>
