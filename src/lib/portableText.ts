import { toHTML } from '@portabletext/to-html';
import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './sanity';

const builder = imageUrlBuilder(sanityClient);

export function ptToHtml(blocks: any[]): string {
  if (!blocks?.length) return '';
  return toHTML(blocks, {
    components: {
      marks: {
        link: ({ children, value }: any) =>
          `<a href="${value.href}" target="_blank" rel="noopener noreferrer">${children}</a>`,
      },
      types: {
        // Images embedded in Portable Text (used in siteSettings sidebar)
        divider: () => '<hr />',
        image: ({ value }: any) => {
          const maxWidth = value.maxWidth ?? 270;
          const src = builder.image(value).width(maxWidth * 2).auto('format').url();
          const style = `max-width:${maxWidth}px`;
          const img = `<img src="${src}" alt="${value.alt ?? ''}" style="${style}" />`;
          return value.url
            ? `<a href="${value.url}" target="_blank" rel="noopener noreferrer">${img}</a>`
            : img;
        },
      },
    },
  });
}
