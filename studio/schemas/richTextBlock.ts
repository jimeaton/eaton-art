// Shared Portable Text block definition with a custom link annotation
// that lets editors choose whether a link opens in a new tab.
export const richTextBlock = {
  type: 'block',
  marks: {
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
          },
          {
            name: 'newTab',
            type: 'boolean',
            title: 'Open in new tab',
            initialValue: false,
          },
        ],
      },
    ],
  },
};
