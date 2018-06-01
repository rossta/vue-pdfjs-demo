<template>
  <div class="pdf-paginator">
    <input
      :value="value"
      @input="input"
      min="1"
      :max="pageCount"
      type="number"
      /> / <span>{{ pageCount }}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: Number,
    pageCount: Number,
  },

  methods: {
    input(event) {
      this.$emit('input', parseInt(event.target.value, 10));
    },
  },

  watch: {
    pageCount() {
      this.$emit('input', 1);
    },
  }
}
</script>

<style>
.pdf-paginator {
  color: white;
  font-weight: bold;
}
.pdf-paginator input {
  width: 2em;
  padding: 0.3em;
}
</style>
