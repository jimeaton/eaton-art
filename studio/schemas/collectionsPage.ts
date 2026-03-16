import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'collectionsPage',
  title: 'Collections & Awards',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Page Heading (H1)',
      type: 'string',
    }),
    defineField({
      name: 'columnLeft',
      title: 'Left Column',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'columnRight',
      title: 'Right Column',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Collections & Awards' };
    },
  },
});
