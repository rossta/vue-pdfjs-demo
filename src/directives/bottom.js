// https://github.com/vuejs/vue/issues/6385
import throttle from 'lodash/throttle';

function isBottomVisible(el) {
  const {scrollTop, clientHeight, scrollHeight} = el;
  return scrollTop + clientHeight >= scrollHeight;
}

function inserted(el, binding) {
  const callback = binding.value;
  const throttledScroll = throttle(() => {
    if (isBottomVisible(el)) {
      callback();
    }
  }, 300);
  el.addEventListener('scroll', throttledScroll, true);
}

export default {
  inserted,
};
