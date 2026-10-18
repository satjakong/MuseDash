# iTunes API

This UI uses the public iTunes Search API (no Apple Music developer token needed for catalog search).

- Search songs: `https://itunes.apple.com/search?term=artist%20or%20song&entity=song&limit=24`
- Look up a song by numeric track ID: `https://itunes.apple.com/lookup?id=${id}`

The detail page calls `getTrackById(id)` and the search field calls `searchTracks(term)`. The seeded IDs in `src/data.ts` are UI fallback data; replace them with known iTunes `trackId` values if a seeded lookup returns no results. Preview playback only works when iTunes returns a `previewUrl`.
