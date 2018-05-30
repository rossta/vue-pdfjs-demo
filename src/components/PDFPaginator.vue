<template>
  <div class="pdf-paginator">
    <input
      v-model="currentPage"
      :max="pageCount"
      min="1"
      type="number"
      /> / <span>{{ pageCount }}</span>
  </div>
</template>

<script>
export default {
  props: {
    pageCount: Number,
  },

  data() {
    return {
      currentPage: undefined,
    };
  },

  watch: {
    currentPage(page) {
      this.$emit('change', parseInt(page, 10));
    },
    pageCount() {
      this.currentPage = 1;
    },
  }
}
</script>

<style>
.pdf-paginator {
  color: white;
}
.pdf-paginator input {
  width: 2em;
  padding: 0.3em;
}
</style>
