import type { MusicItem, ITunesTrack, LookupResponse } from '../types'

export async function getTrackById(id: number): Promise<(MusicItem & { collectionId?: number }) | null> {
  // Example endpoint requested: https://itunes.apple.com/lookup?id=${id}
  const response = await fetch(`https://itunes.apple.com/lookup?id=${id}`)
  if (!response.ok) throw new Error('โหลดข้อมูลเพลงจาก iTunes ไม่สำเร็จ')
  const data: LookupResponse = await response.json()
  const track = data.results?.[0]
  if (!track) return null
  return {
    id: track.trackId,
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName ?? 'Single',
    artwork: track.artworkUrl100?.replace('100x100bb', '600x600bb') ?? '',
    duration: track.trackTimeMillis ? `${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor(track.trackTimeMillis / 1000) % 60).padStart(2, '0')}` : '--:--',
    year: track.releaseDate?.slice(0, 4) ?? 'Unknown',
    genre: track.primaryGenreName ?? 'Music',
    description: track.longDescription ?? track.description ?? `${track.trackName} by ${track.artistName}`,
    previewUrl: track.previewUrl,
    collectionId: track.collectionId,
  }
}

export async function getAlbumTracks(collectionId: number) {
  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${collectionId}&entity=song`,
  )

  if (!response.ok) {
    throw new Error('โหลดเพลงในอัลบั้มไม่สำเร็จ')
  }

  const data: LookupResponse = await response.json()
  // เปลี่ยนจาก (item: any) เป็น (item: ITunesTrack)
  return data.results.slice(1).map((item: ITunesTrack) => ({
    id: item.trackId,
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName,
    artwork: item.artworkUrl100,
    previewUrl: item.previewUrl,
    duration: item.trackTimeMillis
      ? `${Math.floor(item.trackTimeMillis / 60000)}:${String(
          Math.floor((item.trackTimeMillis % 60000) / 1000),
        ).padStart(2, '0')}`
      : '',
    genre: item.primaryGenreName,
    year: item.releaseDate?.slice(0, 4),
    description: '',
  }))
}

// ค้นหาเพลงตามคีย์เวิร์ด (จำกัด 24 เพลง)
export const searchTracks = async (term: string): Promise<LookupResponse> => {
  const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=24`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
};

// ดึงข้อมูลเพลงแบบกลุ่ม (สำหรับหน้า Recommend)
export const fetchTracksByIds = async (ids: number[]): Promise<LookupResponse> => {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${ids.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch recommended tracks');
  return res.json();
};

// ดึงข้อมูลเพลงเดี่ยว
export const fetchTrackById = async (id: string): Promise<ITunesTrack> => {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch track details');
  const data: LookupResponse = await res.json();
  return data.results[0];
};

// ดึงเพลงทั้งหมดในอัลบั้ม
export const fetchAlbumTracks = async (collectionId: number): Promise<ITunesTrack[]> => {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`);
  if (!res.ok) throw new Error('Failed to fetch album tracks');
  const data: LookupResponse = await res.json();
  // เปลี่ยนจาก (item: any) เป็น (item: ITunesTrack)
  return data.results.filter((item: ITunesTrack) => item.wrapperType === 'track');
};