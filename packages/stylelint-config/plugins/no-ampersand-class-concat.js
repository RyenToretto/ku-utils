import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

const ruleName = 'ku-utils/no-ampersand-class-concat';
const messages = utils.ruleMessages(ruleName, {
  rejected: (selector) => `禁止使用 & 拼接类名: "${selector}"。请使用完整类名。&.class 形式除外。`,
});
const meta = { url: '' };

const plugin = createPlugin(ruleName, (primaryOption) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primaryOption,
    });
    if (!validOptions) return;

    root.walkRules((rule) => {
      const selectors = rule.selectors || [rule.selector];
      for (const selector of selectors) {
        if (/&[-_]/.test(selector) || /&__/.test(selector) || /&--/.test(selector)) {
          utils.report({
            message: messages.rejected(selector),
            node: rule,
            result,
            ruleName,
          });
        }
      }
    });
  };
});

plugin.ruleName = ruleName;
plugin.messages = messages;
plugin.meta = meta;

export default plugin;
