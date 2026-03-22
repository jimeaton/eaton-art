import { defineType, defineField } from 'sanity';

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
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Midway Murals' };
    },
  },
});
