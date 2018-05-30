<template>
  <div class="pdf-zoom">
    <a @click.prevent.stop="zoomIn">+</a>
    <a @click.prevent.stop="zoomOut">-</a>
  </div>
</template>

<script>
export default {
  props: {
    scale: Number,
    increment: {
      type: Number,
      default: 0.25,
    },
  },

  methods: {
    zoomIn() {
      this.$emit('change', this.scale + this.increment);
    },
    zoomOut() {
      if (this.scale <= this.increment) return;
      this.$emit('change', this.scale - this.increment);
    },
  },
}
</script>

<style>
.pdf-zoom a {
  float: left;
  cursor: pointer;
  display: block;
  border: 1px #333 solid;
  background: white;
  color: #333;
  font-weight: bold;
  line-height: 1.5em;
  width: 1.5em;
  height: 1.5em;
  font-size: 1.5em;
}
</style>
