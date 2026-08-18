/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';

import { setApplicationInfo, setFavicon, setJsonLd, setMeta } from './meta';

function createDoc(): Document {
  const doc = document.implementation.createHTMLDocument('test');
  doc.documentElement.innerHTML = '<head></head><body></body>';
  return doc;
}

describe('setMeta', () => {
  it('creates meta by name', () => {
    const doc = createDoc();
    setMeta('description', 'hello world', 'name', doc);

    const el = doc.querySelector('meta[name="description"]');
    expect(el?.getAttribute('content')).toBe('hello world');
  });

  it('updates existing meta by property', () => {
    const doc = createDoc();
    setMeta('og:title', 'old', 'property', doc);
    setMeta('og:title', 'new', 'property', doc);

    expect(doc.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(doc.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('new');
  });
});

describe('setFavicon', () => {
  it('creates icon and apple-touch-icon links', () => {
    const doc = createDoc();
    setFavicon('/favicon.ico', { doc, appleTouchIcon: '/apple.png' });

    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.ico');
    expect(doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe(
      '/apple.png',
    );
  });

  it('updates existing favicon links', () => {
    const doc = createDoc();
    setFavicon('/a.ico', { doc });
    setFavicon('/b.ico', { doc });

    expect(doc.querySelectorAll('link[rel="icon"]')).toHaveLength(1);
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/b.ico');
  });
});

describe('setJsonLd', () => {
  it('writes escaped JSON-LD script', () => {
    const doc = createDoc();
    setJsonLd({ '@context': 'https://example.com', headline: 'A "quoted" title' }, doc);

    const el = doc.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(el?.textContent || '{}')).toEqual({
      '@context': 'https://example.com',
      headline: 'A "quoted" title',
    });
  });
});

describe('setApplicationInfo', () => {
  it('writes WebSite structured data', () => {
    const doc = createDoc();
    setApplicationInfo({
      doc,
      context: 'https://example.com',
      headline: 'Drama Title',
      description: 'Watch now',
      image: 'https://example.com/cover.jpg',
      publisherName: 'Reelflix',
    });

    const data = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent || '{}',
    );

    expect(data).toMatchObject({
      '@context': 'https://example.com',
      '@type': 'WebSite',
      headline: 'Drama Title',
      description: 'Watch now',
      image: 'https://example.com/cover.jpg',
      publisher: {
        '@type': 'Organization',
        name: 'Reelflix',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/cover.jpg',
        },
      },
    });
  });
});
