import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'olr9n4p3',
  dataset:   'production',
  apiVersion: '2026-03-15',
  useCdn:     false,
});

// Helper to build Sanity image URLs
export { default as imageUrlBuilder } from '@sanity/image-url';
