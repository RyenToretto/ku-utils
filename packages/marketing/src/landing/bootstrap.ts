import type { LandingConfig } from './types';

/**
 * 生成落地页 bootstrap IIFE 脚本（含 <script> 标签）
 * 输出的脚本在 window 上挂载：
 *   - window.isTiktok (boolean)
 *   - window.__PAGE_PARAMS__ (frozen object)
 *   - window.__PKG__ (string)
 *   - window.__DEVICE_TOKEN__ (string)
 */
export function createBootstrapScript(config: LandingConfig): string {
  const {
    pkg,
    tiktokCondition = "p.utm_source==='tiktok'||p.cha==='tt'",
    deriveFbc = false,
    ignoreParams = [],
  } = config;

  const ignoreCheck =
    ignoreParams.length > 0 ? `if(${JSON.stringify(ignoreParams)}.indexOf(k)!==-1)return;` : '';

  const fbcBlock = deriveFbc ? "if(p.fbclid){p._fbc='fb.1.'+Date.now()+'.'+p.fbclid;}" : '';

  return `<!-- Landing Bootstrap -->
<script>
  ;(function(){
  var p={};
  try{
    var s=window.location.search;
    if(s){var sStr=s.endsWith('/')?s.slice(0,-1):s;
    new URLSearchParams(sStr).forEach(function(v,k){${ignoreCheck}p[k]=v;});}
  }catch(e){}
  try{
    var h=window.location.hash;
    if(h&&h.indexOf('?')!==-1){var hStr=h.endsWith('/')?h.slice(0,-1):h;
    new URLSearchParams(hStr.split('?')[1]).forEach(function(v,k){${ignoreCheck}p[k]=v;});}
  }catch(e){}
  ${fbcBlock}
  window.isTiktok=${tiktokCondition};
  window.__PAGE_PARAMS__=Object.freeze(p);
  var pkg=/android/i.test(navigator.userAgent)?'${pkg.android}':'${pkg.ios}';
  var sKey='__'+pkg+'__';
  var tk='';
  try{tk=window.localStorage.getItem(sKey)||'';}catch(e){}
  if(!tk){var ts=new Date().getTime();
  tk='xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,function(c){
  var r=(ts+Math.random()*16)%16|0;ts=Math.floor(ts/16);
  return(c==='x'?r:(r&0x3)|0x8).toString(16);});
  try{window.localStorage.setItem(sKey,tk);}catch(e){}}
  window.__PKG__=pkg;
  window.__DEVICE_TOKEN__=tk;
  })()
</script>
<!-- End Landing Bootstrap -->`;
}
