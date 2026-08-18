import type { PixelConfig } from './types';

/**
 * 生成 TikTok + Facebook Pixel 条件化加载脚本（不含外层 <script> 标签）
 * 始终创建 fbq/ttq stub 以防止 ReferenceError，仅按渠道加载实际 SDK
 *
 * 懒 ID 策略由业务层控制：有独立 ID 时传入对应配置，无独立 ID 时不传该配置，功能自动禁用
 */
export function createPixelScripts(config: PixelConfig): string {
  const blocks: string[] = [];

  const ttSdkId = config.tiktok?.sdkId;
  const ttLoadCall = ttSdkId ? `if(window.isTiktok){ttq.load('${ttSdkId}');ttq.page();}` : '';

  blocks.push(`<!-- TikTok Pixel Code Start -->
<script>
  !function(w,d,t){
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
    var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
    ${ttLoadCall}
  }(window,document,'ttq');
</script>
<!-- TikTok Pixel Code End -->`);

  const fbConfig = config.facebook;
  if (fbConfig) {
    const externalId =
      fbConfig.useExternalId !== false ? ',{external_id:window.__DEVICE_TOKEN__}' : '';

    blocks.push(`<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    if(!window.isTiktok){s.parentNode.insertBefore(t,s);}
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  if(!window.isTiktok){
    fbq('init','${fbConfig.pixelId}'${externalId});
    fbq('track','PageView');
  }
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${fbConfig.pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`);
  }

  return blocks.join('\n\n');
}
