import type { AppsflyerSmartScriptConfig } from './types';

/**
 * 生成 Appsflyer Smart Script 的 HTML 片段，用于粘贴到 index.html <head> 中
 * Smart Script 会自动追加 af_js_web 和 af_ss_ver 参数到 OneLink URL
 */
export function createSmartScriptTag(config: AppsflyerSmartScriptConfig = {}): string {
  const {
    scriptUrl = 'https://onelinksmartscript.appsflyer.com/onelink-smart-script-latest.js',
    webDevKey,
    oneLinkId,
  } = config;

  const initBlock =
    webDevKey && oneLinkId
      ? `
  if (typeof window.AF_SMART_SCRIPT !== 'undefined') {
    window.AF_SMART_SCRIPT.displayQrCode('qr-container');
  }`
      : '';

  return `<!-- Appsflyer Smart Script -->
<script>
  !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
  (t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
  t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
  o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
  p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","banners",${webDevKey ? `"${webDevKey}"` : '""'});
  AF('pba', 'event', {eventType: 'EVENT', eventName: 'PageView'});
</script>
<script src="${scriptUrl}"></script>
<script>${initBlock}
</script>
<!-- End Appsflyer Smart Script -->`;
}
