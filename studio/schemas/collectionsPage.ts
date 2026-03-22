import { defineType, defineField } from 'sanity';
import { richTextBlock } from './richTextBlock';

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
      of: [richTextBlock],
    }),
    defineField({
      name: 'columnRight',
      title: 'Right Column',
      type: 'array',
      of: [richTextBlock],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Collections & Awards' };
    },
  },
});
