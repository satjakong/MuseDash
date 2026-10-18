import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Heart, Pause, Play } from 'lucide-react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { popularTracks } from '../popular'
import { recommendedTracks } from '../recommend'
import { getTrackById } from '../api/itunes'
import { useFavorites, usePlayerStore } from '../store'
import type { MusicItem, ITunesTrack } from '../types'
import { ConfirmRemoveDialog } from '../ConfirmRemoveDialog'

type AppTrack = Partial<MusicItem> & Partial<ITunesTrack> & { id?: number; trackId?: number; trackName?: string; artistName?: string };

export function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const numericId = Number(id)

  const allTracks = [...popularTracks, ...recommendedTracks]

  const [track, setTrack] = useState<AppTrack | undefined>(
    allTracks.find(t => Number(t.id) === numericId),
  )

  const [albumTracks, setAlbumTracks] = useState<AppTrack[]>([])
  const albumTracksRef = useRef<AppTrack[]>([]) 
  const [albumInfo, setAlbumInfo] = useState<any>(null)
  const [error, setError] = useState('')
  const [loadingList, setLoadingList] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<AppTrack | null>(null)

  const { favoriteIds, toggleFavorite } = useFavorites()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore()

  useEffect(() => {
    albumTracksRef.current = albumTracks
  }, [albumTracks])

  // 1. ระบบซิงค์ข้อมูล: เปลี่ยน URL อัตโนมัติเมื่อเพลงที่เล่นอยู่เปลี่ยนไป
  useEffect(() => {
    const current = currentTrack as AppTrack
    const playingId = Number(current?.trackId || current?.id)
    if (playingId && playingId !== numericId) {
      const isInAlbum = albumTracks.some(t => Number(t.trackId || t.id) === playingId)
      if (isInAlbum) {
        navigate(`/track/${playingId}`, { replace: true })
      }
    }
  }, [currentTrack, albumTracks, numericId, navigate])

  // 2. โหลดข้อมูลเพลงและอัลบั้ม
  useEffect(() => {
    if (!numericId) return

    let cancelled = false

    async function loadTrack() {
      const existingTrack = albumTracksRef.current.find(t => Number(t.trackId || t.id) === numericId)
      if (existingTrack && albumInfo) {
        setTrack(existingTrack)
        return
      }

      setError('')
      setLoadingList(true)

      try {
        const data = await getTrackById(numericId)

        if (cancelled) return

        if (!data) {
          setTrack(undefined)
          setAlbumTracks([])
          setError('ไม่พบข้อมูลเพลงนี้')
          return
        }

        setTrack(data)

        const collectionId = (data as AppTrack).collectionId

        if (!collectionId) {
          setAlbumTracks([data])
          return
        }

        const res = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`)
        const albumData = await res.json()

        if (!cancelled) {
          const collection = albumData.results.find((item: any) => item.wrapperType === 'collection')
          let songs = albumData.results.filter((item: any) => item.wrapperType === 'track')

          if (songs.length === 0) {
            songs = [data]
          }

          setAlbumInfo(collection)
          setAlbumTracks(songs) 
        }
      } catch {
        if (!cancelled) {
          setError('โหลดข้อมูลเพลงหรือรายชื่อเพลงในอัลบั้มไม่สำเร็จ')
        }
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    }

    loadTrack()

    return () => {
      cancelled = true
    }
  }, [numericId, albumInfo])

  if (!track) {
    return (
      <section className="simple-page">
        <h1 style={{ color: 'white' }}>ไม่พบเพลง</h1>
        <button className="back-link" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          ย้อนกลับ
        </button>
      </section>
    )
  }

  const pageTrackId = Number(track.trackId || track.id)
  const currentCurrent = currentTrack as AppTrack
  const currentPlayingId = Number(currentCurrent?.trackId || currentCurrent?.id)

  const saved = favoriteIds.includes(pageTrackId)
  const playing = currentPlayingId === pageTrackId && isPlaying

  const requestToggleFavorite = () => {
    if (saved) {
      setPendingRemove(track)
    } else {
      toggleFavorite(pageTrackId)
    }
  }

  const confirmRemove = () => {
    if (pendingRemove) {
      toggleFavorite(Number(pendingRemove.trackId || pendingRemove.id))
    }
    setPendingRemove(null)
  }

  const formatDuration = (millis: number) => {
    if (!millis) return "0:00"
    const minutes = Math.floor(millis / 60000)
    const seconds = ((millis % 60000) / 1000).toFixed(0)
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`
  }

  const totalMillis = albumTracks.reduce((acc, song) => acc + (song.trackTimeMillis || 0), 0)
  const totalMinutes = Math.ceil(totalMillis / 60000)
  const totalSongsCount = albumInfo?.trackCount || albumTracks.length || 1
  const copyrightText = albumInfo?.copyright || `℗ ${new Date(track.releaseDate || track.year || Date.now()).getFullYear()} ${track.artistName || track.artist}`

  return (
    <div className="detail-page">
      <button onClick={() => navigate(-1)} className="back-link">
        <ArrowLeft size={16} /> Back
      </button>

      {error && <p className="api-message">{error}</p>}

      <section className="detail-panel">
        <div className="detail-artwork-container">
          <img
            className={`detail-artwork ${playing ? 'is-playing' : ''}`}
            src={(track.artworkUrl100 || track.artwork || '').replace('100x100', '600x600')}
            alt={track.collectionName || track.album || track.title}
            onError={e => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/assets/album-placeholder.svg'
            }}
          />
        </div>

        <div className="detail-info">
          <h1>{track.trackName || track.title} — {track.artistName || track.artist}</h1>

          <div className="credits-grid">
            <div>
              <h3>Performing Artists</h3>
              <p>{track.artistName || track.artist}</p>

              <h3>Production &amp; Engineering</h3>
              <p>{track.collectionName || track.album}</p>
            </div>

            <div>
              <h3>Composition &amp; Lyrics</h3>
              <p>{track.artistName || track.artist}</p>

              <h3>Track Information</h3>
              <p>Genre: {track.primaryGenreName || track.genre}</p>
              <p>Release year: {track.releaseDate ? track.releaseDate.substring(0, 4) : track.year}</p>
            </div>
          </div>

          <div className="detail-actions">
            <button
              className="game-play"
              onClick={() => currentPlayingId === pageTrackId ? togglePlay() : playTrack({ ...track, id: pageTrackId } as MusicItem, albumTracks as MusicItem[])}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
              {playing ? (
                <Pause size={19} fill="currentColor" />
              ) : (
                <Play size={19} fill="currentColor" />
              )}
            </button>

            <span>{playing ? 'Playing' : 'Preview'}</span>

            <button
              className={`game-favorite ${saved ? 'saved' : ''}`}
              onClick={requestToggleFavorite}
              aria-label={
                saved ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <Heart
                size={20}
                fill={saved ? 'currentColor' : 'none'}
              />
            </button>

            <span>{saved ? 'Added' : 'Add'}</span>

            <span className="detail-year">
              {track.primaryGenreName || track.genre}
            </span>
          </div>
        </div>
      </section>

      <section className="track-list-section">
        <div className="list-tab">List</div>

        <div className="track-list">
          {loadingList ? (
            <p>กำลังโหลดเพลงในอัลบั้ม...</p>
          ) : albumTracks.length > 0 ? (
            albumTracks.map((song, index) => (
              <Link
                to={`/track/${song.trackId || song.id}`}
                className="track-row"
                key={song.trackId || song.id}
                style={{ fontWeight: 'normal' }}
                onClick={() => {
                  playTrack({ ...song, id: song.trackId || song.id } as MusicItem, albumTracks as MusicItem[])
                }}
              >
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ color: '#574768', width: '20px' }}>{song.trackNumber || index + 1}</span>
                  <span>{song.trackName || song.title} — {song.artistName || song.artist}</span>
                </div>
                <span>{formatDuration(song.trackTimeMillis!)}</span>
              </Link>
            ))
          ) : (
            <p>ไม่พบเพลงอื่นในอัลบั้มนี้</p>
          )}
        </div>

        <p className="list-footer">
          {track.releaseDate ? track.releaseDate.substring(0, 4) : track.year} | {totalSongsCount} songs, {totalMinutes} minutes | {copyrightText.replace('℗', '').trim()}
        </p>
      </section>

      <ConfirmRemoveDialog
        track={pendingRemove as MusicItem}
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  )
}