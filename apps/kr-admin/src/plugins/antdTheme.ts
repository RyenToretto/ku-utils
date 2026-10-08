import tome from '@ku-utils/skin/tokens';
import { theme as antTheme, type ThemeConfig } from 'antd';

type MappingAlgorithm = NonNullable<
  Extract<ThemeConfig['algorithm'], (...args: never[]) => unknown>
>;

/**
 * tome 皮肤 → antd ThemeConfig。
 * antd 用真实色值派生 hover/active 等色阶，所以吃 `@ku-utils/skin/tokens` 的已解析值，
 * 不能写 var(--ku-*)；明暗由调用方按 html.dark 同步切换。
 */
export function createAntdTheme(isDark: boolean): ThemeConfig {
  const ku = isDark ? tome.dark : tome.light;

  // 暗色算法会把种子色往暗底混一档；品牌/状态色以皮肤原值为准（与 kv3 一致）
  const pinSkinColors: MappingAlgorithm = (_seed, map) => ({
    ...map!,
    colorPrimary: ku['color-primary'],
    colorPrimaryHover: ku['color-primary-hover'],
    colorSuccess: ku['color-success'],
    colorWarning: ku['color-warning'],
    colorError: ku['color-danger'],
    colorInfo: ku['color-info'],
  });

  return {
    algorithm: [isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm, pinSkinColors],
    token: {
      colorPrimary: ku['color-primary'],
      colorSuccess: ku['color-success'],
      colorWarning: ku['color-warning'],
      colorError: ku['color-danger'],
      colorInfo: ku['color-info'],
      colorSuccessBg: ku['color-success-bg'],
      colorSuccessBorder: ku['color-success-border'],
      colorWarningBg: ku['color-warning-bg'],
      colorWarningBorder: ku['color-warning-border'],
      colorErrorBg: ku['color-danger-bg'],
      colorErrorBorder: ku['color-danger-border'],
      colorInfoBg: ku['color-info-bg'],
      colorInfoBorder: ku['color-info-border'],
      colorLink: ku['text-link'],
      colorLinkHover: ku['text-link-hover'],
      colorText: ku['text-primary'],
      colorTextHeading: ku['text-primary'],
      colorTextSecondary: ku['text-secondary'],
      colorTextTertiary: ku['text-placeholder'],
      colorTextPlaceholder: ku['text-placeholder'],
      colorTextDisabled: ku['text-disabled'],
      colorTextLightSolid: ku['text-on-primary'],
      colorBorder: ku['border-default'],
      colorBorderSecondary: ku['border-light'],
      colorSplit: ku.divider,
      colorBgContainer: ku['bg-card'],
      colorBgElevated: ku['bg-card-elevated'],
      colorBgLayout: ku['bg-page-from'],
      colorBgMask: ku['bg-overlay'],
      colorBgSpotlight: ku['bg-tooltip'],
      // 对齐 skin el-base.css：--el-border-radius-base 8 / small 4
      borderRadius: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
    },
    components: {
      // el-button 默认态文字为 --el-text-color-regular
      Button: {
        defaultColor: ku['text-secondary'],
      },
      // el-pager 页码 2px 圆角
      Pagination: {
        borderRadius: 2,
      },
      // 对齐 kv3 el-card：标题常规字重、18/20 内边距、4px 圆角；default / small 同尺寸
      Card: {
        headerHeight: 54,
        headerHeightSM: 54,
        headerPadding: 20,
        headerPaddingSM: 20,
        headerFontSize: 14,
        headerFontSizeSM: 14,
        bodyPadding: 20,
        bodyPaddingSM: 20,
        fontWeightStrong: 400,
        borderRadiusLG: 4,
      },
      Table: {
        colorText: ku['text-secondary'],
        headerBg: ku['bg-card'],
        headerColor: ku['text-primary'],
        headerSplitColor: 'transparent',
        borderColor: ku['border-light'],
        rowHoverBg: ku['bg-hover'],
        rowSelectedBg: ku['color-primary-bg'],
        rowSelectedHoverBg: ku['bg-hover'],
        cellPaddingBlockMD: 8,
        cellPaddingInlineMD: 8,
      },
      // 对齐 kv3 el-dialog：卡片底色、modal 阴影、16 内边距、18/24 常规字重标题（头/脚间距见 antd-ku-bridge）
      Modal: {
        contentBg: ku['bg-card'],
        headerBg: ku['bg-card'],
        boxShadow: ku['shadow-modal'],
        fontWeightStrong: 400,
        paddingMD: 16,
        paddingContentHorizontalLG: 16,
        titleFontSize: 18,
        titleLineHeight: 24 / 18,
      },
      // 对齐 kv3 el-form：项间距 18、标签次级色
      Form: {
        itemMarginBottom: 18,
        labelColor: ku['text-secondary'],
      },
      // 对齐 kv3 el-alert：无边框、16px 内边距、标题行高 24
      Alert: {
        defaultPadding: '8px 16px',
        lineWidth: 0,
        lineHeight: 24 / 14,
      },
    },
  };
}
