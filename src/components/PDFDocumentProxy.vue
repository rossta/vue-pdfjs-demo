<script>
// PDFDocument renders an entire PDF inline using
// PDF.js and <canvas>. Currently does not support,
// rendering of selected pages (but could be easily
// updated to do so).
import debug from 'debug';
const log = debug('app:components/PDFDocumentProxy');

import range from 'lodash/range';
import deferredPromise from '../utils/deferredPromise';

function getDocument(url) {
  // Using import statement in this way allows Webpack
  // to treat pdf.js as an async dependency so we can
  // avoid adding it to one of the main bundles
  return import(
    /* webpackChunkName: 'pdfjs-dist' */
    'pdfjs-dist/webpack').then(pdfjs => pdfjs.getDocument(url));
}

// pdf: instance of PDFDocumentProxy
// see docs for PDF.js for more info
function getPages(pdf, first, last) {
  const allPages = range(first, last+1).map(number => pdf.getPage(number));
  return Promise.all(allPages);
}

const BUFFER_LENGTH = 3;

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      pdf: undefined,
      pages: [],
      cursor: 0,
    };
  },

  watch: {
    url: {
      handler(url) {
        getDocument(url)
          .then(pdf => (this.pdf = pdf))
          .catch(response => {
            this.$emit('document-errored', {text: 'Failed to retrieve PDF', response});
            log('Failed to retrieve PDF', response);
          });
      },
      immediate: true,
    },

    pdf(pdf, oldPdf) {
      if (!pdf) return;
      if (oldPdf) this.pages = [];

      this.$emit('page-count', this.pageCount);
      this.fetchPages();
    },
  },

  computed: {
    pageCount() {
      return this.pdf && this.pdf.numPages;
    },
  },

  methods: {
    fetchPages(currentPage = 0) {
      if (!this.pdf) return;
      if (this.pages.length === this.pageCount) return;

      const startIndex = this.pages.length;
      if (this.cursor > startIndex) return;

      const startPage = startIndex + 1;
      const endPage = Math.min(Math.max(currentPage, startIndex + BUFFER_LENGTH), this.pageCount);
      this.cursor = endPage;

      log(`Fetching pages ${startPage} to ${endPage}`);
      getPages(this.pdf, startPage, endPage)
        .then((pages) => {
          const deleteCount = 0;
          this.pages.splice(startIndex, deleteCount, ...pages);
          return this.pages;
        })
        .catch(response => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
          log('Failed to retrieve pages', response);
        });
    },

    pageRendered(page) {
      log(`Page ${page.pageNumber} rendered`);
    },

    pageErrored({text, response, page}) {
      log(text, response, page);
    },
  },

  created() {
    this.$on('page-rendered', this.pageRendered);
    this.$on('page-errored', this.pageErrored);
    this.$on('fetch-pages', this.fetchPages);
  },

  render() {
    return this.$scopedSlots.default({
      pages: this.pages,
    });
  },
};
</script>
