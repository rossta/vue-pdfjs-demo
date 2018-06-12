import throttle from 'lodash/throttle';

const instances = new WeakMap();

function inserted(el, binding) {
  const callback = binding.value;
  const throttledResize = throttle(callback, 300);
  if (instances.has(el)) {
    throw new Error(`Tried to add multiple resize directives for ${el}`);
  }
  instances.set(el, throttledResize)
  window.addEventListener('resize', throttledResize, true);
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
