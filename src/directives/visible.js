import debug from "debug"
const log = debug("app:directives/visible")

const instances = new WeakMap();

function createObserver(el, vnode, callback) {
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      callback(el)
      disconnectObserver(observer);
    }
  })

  // Observe when element is inserted in DOM
  vnode.context.$nextTick(() => observer.observe(el))

  return observer;
}
function disconnectObserver(observer) {
  if (observer) observer.disconnect();
}

function bind(el, { value }, vnode) {
  if (typeof window.IntersectionObserver === 'undefined') {
    log('IntersectionObserver API is not available in your browser.')
  } else {
    const observer = createObserver(el, vnode, () => {
      log("Element is visible", el)
      const callback = value;
      if (typeof callback === "function") callback(el);
    })
    instances.set(el, {observer})
  }
}

function update(el, { value, oldValue }, vnode) {
  if (value === oldValue) return;

  const {observer} = instances.get(el)
  disconnectObserver(observer);
  bind(el, { value }, vnode);
}

function unbind(el) {
  if (instances.has(el)) {
    const {observer} = instances.get(el);
    disconnectObserver(observer);
    instances.delete(el);
  }
}

export default {
  bind,
  update,
  unbind
}
