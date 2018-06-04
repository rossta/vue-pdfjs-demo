<template>
  <div class="pdf-print">
    <a @click.prevent.stop="print" class="icon"><IconPrint /></a>
  </div>
</template>

<script>
import IconPrint from '../assets/icon-print.svg';

export default {
  components: {
    IconPrint,
  },

  props: {
    renderPromise: {
      type: Promise,
      required: true,
    },
  },

  methods: {
    print() {
      this.$emit('print');
      this.renderPromise.then(() => {
        window.print();
      });
    },
  },
};
</script>

<style>

</style>
