import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'sidebar',
      title: 'Sidebar Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'object',
          name: 'divider',
          title: 'Divider (HR)',
          fields: [
            { name: 'style', type: 'string', hidden: true, initialValue: 'hr' },
          ],
          preview: {
            prepare() {
              return { title: '──────────────────────' };
            },
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            },
            {
              name: 'url',
              type: 'url',
              title: 'Link URL',
              description: 'Optional — makes the image a clickable link.',
            },
            {
              name: 'maxWidth',
              type: 'number',
              title: 'Max Width (px)',
              description: 'Optional — limits the display width of this image.',
            },
          ],
        },
      ],
      description: 'Appears in the sidebar on all pages. Add images, text, links — in any order.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
