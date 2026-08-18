import DuButton from './components/DuButton.vue';
import DuEmpty from './components/DuEmpty.vue';
import DuStatusTag from './components/DuStatusTag.vue';

export { DuButton, DuEmpty, DuStatusTag };

const components = [DuButton, DuEmpty, DuStatusTag];

export function install(Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
}
