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
        }
        favourites {
          anime {
            nodes {
              title {
                english
              }
              coverImage {
                extraLarge
              }
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
