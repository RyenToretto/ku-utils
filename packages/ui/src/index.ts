import type { App } from 'vue';

import DuButton from './components/DuButton/DuButton.vue';
import DuCard from './components/DuCard/DuCard.vue';
import DuEmpty from './components/DuEmpty/DuEmpty.vue';
import DuLiquidFloatingBar from './components/DuLiquidFloatingBar/DuLiquidFloatingBar.vue';
import DuLiquidGlass from './components/DuLiquidGlass/DuLiquidGlass.vue';
import DuModal from './components/DuModal/DuModal.vue';
import DuStatusTag from './components/DuStatusTag/DuStatusTag.vue';

export { DuButton, DuCard, DuEmpty, DuLiquidFloatingBar, DuLiquidGlass, DuModal, DuStatusTag };

const components = [
  DuButton,
  DuCard,
  DuEmpty,
  DuLiquidFloatingBar,
  DuLiquidGlass,
  DuModal,
  DuStatusTag,
];

export function install(app: App) {
  components.forEach((component) => {
    app.component(component.name || component.__name || '', component);
  });
}
