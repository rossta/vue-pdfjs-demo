// https://github.com/vuejs/vue/issues/6385

import throttle from 'lodash/throttle';
const map = new WeakMap();

function isBottomVisible(el) {
  const {scrollTop, clientHeight, scrollHeight} = el;
  return scrollTop + clientHeight >= scrollHeight;
}

function inserted(el, binding) {
  const callback = binding.value;
  const throttledScroll = throttle(() => {
    if (isBottomVisible(el)) callback();
  }, 300);
  if (map.has(el)) throw new Error(`Tried to use v-bottom on ${el} more than once`);
  map.set(el, throttledScroll);
  el.addEventListener('scroll', throttledScroll, true);
}

function unbind(el, binding) {
  const throttledScroll = map.get(el, binding);
  map.delete(el);
  if (throttledScroll) {
    el.removeEventListener('scroll', throttledScroll, true);
  }
}

export default {
  inserted,
  unbind,
};
