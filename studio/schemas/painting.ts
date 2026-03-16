import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'painting',
  title: 'Painting',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the painting for screen readers and SEO. e.g. "57th Street Overpass — Oil on Canvas by Kathleen Eaton"',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      placeholder: 'Oil on Canvas',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      placeholder: '24"h × 36"w',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Leave blank if not for sale.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Sold',             value: 'sold' },
          { title: 'Urban Landscapes', value: 'urban-landscapes' },
          { title: 'Suburbia',         value: 'suburbia' },
          { title: 'Posters',          value: 'posters' },
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Upload Date',
      type: 'datetime',
      description: 'Original upload date from WordPress. Controls gallery order — most recent first.',
      options: { dateFormat: 'YYYY-MM-DD', timeStep: 60 },
    }),
  ],
  preview: {
    select: {
      title:    'title',
      media:    'image',
      category: 'category',
    },
    prepare({ title, media, category }) {
      const badges = [category].filter(Boolean).join(' · ');
      return {
        title,
        subtitle: badges,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Most Recent First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
