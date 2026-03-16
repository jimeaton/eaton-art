import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'aboutPage',
  title: 'About the Artist',
  type: 'document',
  fields: [
    defineField({
      name: 'heroSlides',
      title: 'Hero Slideshow Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            },
          ],
        },
      ],
      description: 'Images that cycle in the full-width slideshow at the top of the page.',
    }),
    defineField({
      name: 'introHeading',
      title: 'Intro Heading',
      type: 'string',
      description: 'The large pink/red heading below the slideshow.',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Main body text.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About the Artist' };
    },
  },
});
