import { toHTML } from '@portabletext/to-html';
import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './sanity';

const builder = imageUrlBuilder(sanityClient);

export function ptToHtml(blocks: any[]): string {
  if (!blocks?.length) return '';
  return toHTML(blocks, {
    components: {
      marks: {
        link: ({ children, value }: any) => {
          // If newTab field is absent (sidebar/legacy links), default to new tab.
          // If newTab field is present (page content links), use its value.
          const newTab = value.newTab !== undefined ? value.newTab : true;
          const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${value.href}"${target}>${children}</a>`;
        },
      },
      types: {
        // Images embedded in Portable Text (used in siteSettings sidebar)
        divider: () => '<hr />',
        image: ({ value }: any) => {
          const maxWidth = value.maxWidth;
          const fetchWidth = maxWidth ? maxWidth * 2 : 1600;
          const src = builder.image(value).width(fetchWidth).auto('format').url();
          const style = maxWidth
            ? `max-width:${maxWidth}px;width:100%;height:auto`
            : `width:100%;height:auto`;
          const img = `<img src="${src}" alt="${value.alt ?? ''}" style="${style}" />`;
          return value.url
            ? `<a href="${value.url}" target="_blank" rel="noopener noreferrer">${img}</a>`
            : img;
        },
      },
    },
  });
}
