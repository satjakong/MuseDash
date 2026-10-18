export interface MusicItem {
  id: number
  title: string
  artist: string
  album: string
  artwork: string
  duration: string
  year: string
  genre: string
  description: string
  previewUrl?: string
}

export interface ITunesTrack {
  wrapperType?: string
  kind?: string
  trackId: number
  trackName: string
  artistName: string
  collectionId?: number
  collectionName?: string
  artworkUrl100?: string
  trackTimeMillis?: number
  releaseDate?: string
  primaryGenreName?: string
  previewUrl?: string
  longDescription?: string
  description?: string
  trackNumber?: number
  trackCount?: number
  copyright?: string
}

export interface LookupResponse { 
  resultCount: number
  results: ITunesTrack[] 
}