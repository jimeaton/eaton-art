import { defineType, defineField } from 'sanity';
import { richTextBlock } from './richTextBlock';

export default defineType({
  name: 'midwayMuralsPage',
  title: 'Midway Murals',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Page Heading (H1)',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        richTextBlock,
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text' },
            { name: 'maxWidth', type: 'number', title: 'Max width (px)', description: 'Leave blank for full width' },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Midway Murals' };
    },
  },
});
