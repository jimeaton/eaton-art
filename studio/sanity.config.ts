import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

const singletonTypes = new Set(['aboutPage', 'collectionsPage', 'siteSettings']);
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name:      'eatonart',
  title:     'Eaton Studios',
  projectId: 'olr9n4p3',
  dataset:   'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('painting').title('Paintings'),
            S.divider(),
            S.listItem()
              .title('About the Artist')
              .id('aboutPage')
              .child(
                S.document()
                  .schemaType('aboutPage')
                  .documentId('aboutPage')
              ),
            S.listItem()
              .title('Collections & Awards')
              .id('collectionsPage')
              .child(
                S.document()
                  .schemaType('collectionsPage')
                  .documentId('collectionsPage')
              ),
            S.divider(),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide "New document" for singleton types
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Only allow publish/discard/restore on singletons (no duplicate/delete)
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
