import type { ListActivity } from "./types"

export const fetchAniListUser = async (username: string) => {
  const query = `
    query ($name: String) {
      User(name: $name) {
        id
        name
        avatar {
          large
        }
        statistics {
          anime {
            count
            minutesWatched
            meanScore
            episodesWatched
            genres {
              genre
              count
            }
          }
          manga {
            count
            meanScore
            chaptersRead
            volumesRead
            genres {
              genre
              count
            }
          }
        }
        favourites {
          anime {
            nodes {
              title {
                english
                romaji
              }
              coverImage {
                extraLarge
              }
              siteUrl
            }
          }
          manga {
            nodes {
              title {
                english
                romaji
              }
              coverImage {
                extraLarge
              }
              siteUrl
            }
          }
        }
      }
    }
  `

  const variables = {
    name: username
  }

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch from AniList')
  }

  const json = await response.json()
  return json.data.User
}

export const fetchAniListUserActivitiesPaginated = async (userId: string, type: 'ANIME_LIST' | 'MANGA_LIST') => {
  const query = `
    query ($id: Int, $page: Int, $type: ActivityType) {
      Page(perPage: 50, page: $page) {
        pageInfo {
          hasNextPage
        }
        activities(userId: $id, type: $type) {
          ... on ListActivity {
            status
            progress
            media {
              type
              id
            }
            createdAt
          }
        }
      }
    }
  `;

  let page = 1;
  let hasNextPage = true;
  const allActivities: ListActivity[] = [];

  while (hasNextPage && page <= 2) { // max 2 pages = 100 activities
    const variables = { id: userId, page, type };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from AniList');
    }

    const json = await response.json();
    const pageData = json.data.Page;
    allActivities.push(...pageData.activities);
    hasNextPage = pageData.pageInfo.hasNextPage;
    page++;
  }

  return allActivities;
};

export const fetchAniListUserAnimeActivities = async (userId: string) => {
  return fetchAniListUserActivitiesPaginated(userId, 'ANIME_LIST');
};

export const fetchAniListUserMangaActivities = async (userId: string) => {
  return fetchAniListUserActivitiesPaginated(userId, 'MANGA_LIST');
};