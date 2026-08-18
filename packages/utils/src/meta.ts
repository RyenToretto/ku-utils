export type MetaAttribute = 'name' | 'property' | 'http-equiv';

export interface SetFaviconOptions {
  /** apple-touch-icon 地址，默认与 href 相同 */
  appleTouchIcon?: string;
  doc?: Document;
}

export interface ApplicationInfoOptions {
  /** JSON-LD @context，默认当前页 origin */
  context?: string;
  /** 内容标题 */
  headline: string;
  description: string;
  image: string;
  /** 发布者/站点名 */
  publisherName: string;
  /** 发布者 logo，默认使用 image */
  publisherLogo?: string;
  /** WebPage @id，默认与 context 相同 */
  pageId?: string;
  /** JSON-LD 根 @type，默认 WebSite */
  type?: string;
  doc?: Document;
}

function resolveDocument(doc?: Document): Document | null {
  if (doc) return doc;
  if (typeof document === 'undefined') return null;
  return document;
}

function resolvePageOrigin(doc: Document): string {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return doc.baseURI ? new URL(doc.baseURI).origin : '';
}

function upsertLink(doc: Document, rel: string, href: string): void {
  let el = doc.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = doc.createElement('link');
    el.setAttribute('rel', rel);
    doc.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * 设置或创建 meta 标签（按 name / property / http-equiv 查找）
 */
export function setMeta(
  metaName: string,
  content: string,
  attribute: MetaAttribute = 'name',
  doc?: Document,
): void {
  const root = resolveDocument(doc);
  if (!root) return;

  const selector = `meta[${attribute}="${metaName}"]`;
  let el = root.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = root.createElement('meta');
    el.setAttribute(attribute, metaName);
    root.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * 设置 favicon 与 apple-touch-icon（不存在则创建）
 */
export function setFavicon(href: string, options: SetFaviconOptions = {}): void {
  const root = resolveDocument(options.doc);
  if (!root) return;

  upsertLink(root, 'icon', href);
  upsertLink(root, 'apple-touch-icon', options.appleTouchIcon ?? href);
}

/**
 * 写入 JSON-LD 结构化数据（不存在则创建 script[type="application/ld+json"]）
 */
export function setJsonLd(data: Record<string, unknown>, doc?: Document): void {
  const root = resolveDocument(doc);
  if (!root) return;

  const json = JSON.stringify(data);
  let el = root.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!el) {
    el = root.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    root.head.appendChild(el);
  }
  el.textContent = json;
}

/**
 * 写入 WebSite / WebPage 结构化数据（分享页、落地页 SEO 常用）
 */
export function setApplicationInfo(options: ApplicationInfoOptions): void {
  const root = resolveDocument(options.doc);
  if (!root) return;

  const context = options.context ?? resolvePageOrigin(root);
  const pageId = options.pageId ?? context;
  const publisherLogo = options.publisherLogo ?? options.image;

  setJsonLd(
    {
      '@context': context,
      '@type': options.type ?? 'WebSite',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageId,
      },
      headline: options.headline,
      description: options.description,
      image: options.image,
      publisher: {
        '@type': 'Organization',
        name: options.publisherName,
        logo: {
          '@type': 'ImageObject',
          url: publisherLogo,
        },
      },
    },
    root,
  );
}
