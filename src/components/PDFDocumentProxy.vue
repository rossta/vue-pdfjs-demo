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
function getAllPages(pdf) {
  const allPages = range(1, pdf.numPages).map(number => pdf.getPage(number));
  return Promise.all(allPages);
}

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

    pdf(pdf) {
      this.pages = [];
      getAllPages(pdf)
        .then(this.updatePages)
        .catch(response => {
          this.$emit('document-errored', {text: 'Failed to retrieve pages', response});
          log('Failed to retrieve pages', response);
        });
    },
  },

  methods: {
    updatePages(pages) {
      const promises = pages.map((page) => {
        page._renderPromise = deferredPromise();
        return page._renderPromise;
      });

      Promise.all(promises)
        .then(() => this.$emit('document-rendered'))
        .then(() => log('Rendered all pages'))
        .catch(response => {
          this.$emit('document-errored', {text: 'Failed to render pages', response});
          log('Failed to render pages', response);
        });

      log('Retrieved all pages');
      this.pages = pages;
      this.$emit('pages-fetched', this.pages);

      return pages;
    },

    pageRendered(page) {
      log(`Page ${page.pageNumber} rendered`);
      page._renderPromise.resolve(page);
    },

    pageErrored({text, response, page}) {
      log(text, response);
      page._renderPromise.reject(response);
    },
  },

  created() {
    this.$on('page-rendered', this.pageRendered);
    this.$on('page-errored', this.pageErrored);
  },

  render() {
    return this.$scopedSlots.default({
      pages: this.pages,
    });
  },
};
</script>
