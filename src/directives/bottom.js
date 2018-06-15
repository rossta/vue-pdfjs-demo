// https://github.com/vuejs/vue/issues/6385
import throttle from 'lodash/throttle';

const instances = new WeakMap();

function isBottomVisible(el) {
  const {scrollTop, clientHeight, scrollHeight} = el;
  return scrollTop + clientHeight >= scrollHeight;
}

function inserted(el, binding) {
  const callback = binding.value;
  const visibleCallback = () => {
    if (isBottomVisible(el)) callback();
  };
  if (binding.modifiers.immediate) visibleCallback();
  const throttledCallback = throttle(visibleCallback, 300);
  el.addEventListener('scroll', throttledCallback, true);
  window.addEventListener('resize', throttledCallback, true);

  if (instances.has(el)) {
    throw new Error(`Tried to add multiple resize directives for ${el}`);
  }
  instances.set(el, throttledCallback);
}

function unbind(el) {
  if (instances.has(el)) {
    const callback = instances.get(el);
    instances.delete(el);
    window.removeEventListener('resize', callback, true);
  }
}

export default {
  inserted,
  unbind,
};
