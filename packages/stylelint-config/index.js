import noAmpersandClassConcat from './plugins/no-ampersand-class-concat.js';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  plugins: [noAmpersandClassConcat, 'stylelint-order'],
  rules: {
    'ku-utils/no-ampersand-class-concat': true,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': null,
  },
};
