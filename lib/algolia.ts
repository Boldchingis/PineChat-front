'use client';

// Try dynamic import
async function getAlgoliaClient() {
  // Dynamically import the module
  const algoliaModule = await import('algoliasearch');
  // Get the default export which should be the function
  const algoliasearch = algoliaModule.default;
  
  const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
  
  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
    throw new Error('Algolia App ID or Search Key is missing');
  }
  
  return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
}

const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;

// Create a function that gets or creates the index
async function getIndex() {
  const client = await getAlgoliaClient();
  return client.initIndex(ALGOLIA_INDEX_NAME);
}

export const searchUsers = async (query: string) => {
  try {
    const index = await getIndex();
    const { hits } = await index.search(query, {
      hitsPerPage: 20,
    });
    return hits;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  searchUsers,
};