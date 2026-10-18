import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, Pause, Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getTrackById } from '../api/itunes'
import { useFavorites, usePlayerStore } from '../store'
import type { MusicItem } from '../types'
import { useCarouselMotion } from '../useCarouselMotion'
import { ConfirmRemoveDialog } from '../ConfirmRemoveDialog'

const MAX_DOTS = 7

function getDotWindow(total: number, active: number) {
  if (total <= MAX_DOTS) return { start: 0, end: total }
  const start = Math.min(Math.max(active - Math.floor(MAX_DOTS / 2), 0), total - MAX_DOTS)
  return { start, end: start + MAX_DOTS }
}

function Cover({ track }: { track: MusicItem | any }) {
  return (
    <img
      src={track.artworkUrl100?.replace('100x100', '300x300') || track.artwork || '/assets/album-placeholder.svg'}
      alt={track.album || track.title || track.trackName}
      onError={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = '/assets/album-placeholder.svg'
      }}
    />
  )
}

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore()
  
  const [favorites, setFavorites] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadFavorites() {
      if (favoriteIds.length === 0) {
        setFavorites([])
        setLoading(false)
        setIndex(0)
        return
      }
      setLoading(true)
      const results = await Promise.all(
        favoriteIds.map(async (id) => {
          try { return await getTrackById(id) } catch { return null }
        }),
      )
      if (!cancelled) {
        setFavorites(results.filter((track): track is any => track !== null))
        setIndex(0) 
        setLoading(false)
      }
    }
    loadFavorites()
    return () => { cancelled = true }
  }, [favoriteIds])

  const move = (step: number) => {
    if (favorites.length === 0) return
    setIndex((current) => (current + step + favorites.length) % favorites.length)
  }

  const total = favorites.length
  const activeIndex = total > 0 ? index % total : 0
  const getMotion = useCarouselMotion(activeIndex, total)

  useEffect(() => {
    if (currentTrack && favorites.length > 0) {
      const playingId = Number(currentTrack.trackId || currentTrack.id);
      const indexToActive = favorites.findIndex((t: any) => Number(t.trackId || t.id) === playingId);
      
      if (indexToActive !== -1 && indexToActive !== index) {
        setIndex(indexToActive);
      }
    }
  }, [currentTrack?.id, favorites]);

  const confirmRemove = () => {
    if (pendingRemove) toggleFavorite(pendingRemove.trackId || pendingRemove.id)
    setPendingRemove(null)
  }

  if (loading) {
    return <section className="favorites-page favorites-full"><div className="favorites-empty"><span className="loading loading-spinner loading-lg"></span><p>กำลังโหลดเพลงโปรด...</p></div></section>
  }

  if (favorites.length === 0) {
    return (
      <section className="favorites-page favorites-full">
        <div className="favorites-empty">
          <p>ยังไม่มีเพลงโปรด กดหัวใจที่เพลงเพื่อเพิ่มลงในรายการ</p>
          <Link to="/" className="back-link"><ArrowLeft size={16} /> กลับหน้า Home</Link>
        </div>
      </section>
    )
  }

  const active = favorites[activeIndex]
  const activePlaying = currentTrack?.id === (active.trackId || active.id) && isPlaying

  const requestToggle = (track: any) => {
    setPendingRemove(track)
  }

  const formatDuration = (millis: number) => {
    if (!millis) return "0:00"
    const minutes = Math.floor(millis / 60000)
    const seconds = ((millis % 60000) / 1000).toFixed(0)
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`
  }

  const visibleOffsets = total >= 5 ? [-2, -1, 0, 1, 2] : total >= 3 ? [-1, 0, 1] : total === 2 ? [0, 1] : [0]
  const dots = getDotWindow(total, activeIndex)
  const dotIndexes = Array.from({ length: dots.end - dots.start }, (_, k) => dots.start + k)

  return (
    <section className="favorites-page favorites-full">
      <section className="popular-section game-select favorite-select">
        <div className="select-glow" />

        {visibleOffsets
          .map((offset) => ({ offset, trackIndex: (activeIndex + offset + total) % total }))
          .sort((a, b) => a.trackIndex - b.trackIndex)
          .map(({ offset, trackIndex }) => {
            const track = favorites[trackIndex]
            if (!track) return null;

            const angle = offset * 18
            const depth = Math.abs(offset) * 70
            const curve = Math.abs(offset) ** 1.5 * 35
            const scale = offset === 0 ? 1.05 : 1 - Math.abs(offset) * 0.08
            const motion = getMotion(trackIndex, offset)
            
            const isThisTrackPlaying = currentTrack?.id === (track.trackId || track.id) && isPlaying

            return (
              <button
                key={track.trackId || track.id}
                className={`game-song game-song-${offset + 2} ${offset === 0 ? 'selected' : ''} ${motion.className}`}
                style={{
                  transform: `translateX(-50%) translateY(${curve}px) translateZ(-${depth}px) rotateY(${-angle}deg) scale(${scale})`,
                  zIndex: offset === 0 ? 50 : Math.abs(offset) === 1 ? 30 : 10,
                  ...motion.style,
                }}
                onClick={() => {
                  if (offset === 0) navigate(`/track/${track.trackId || track.id}`)
                  else setIndex(trackIndex)
                }}
              >
                <span className={`game-cover-wrap ${isThisTrackPlaying ? 'is-playing' : ''}`}>
                  <Cover track={track} />
                </span>
                {offset === 0 && (
                  <span className="game-song-caption">
                    <strong>{track.trackName || track.title}</strong>
                    <small>{track.artistName || track.artist}</small>
                  </span>
                )}
              </button>
            )
          })}

        {total > 1 && (
          <>
            <button className="slide-arrow slide-prev game-arrow" onClick={() => move(-1)}><ArrowLeft /></button>
            <button className="slide-arrow slide-next game-arrow" onClick={() => move(1)}><ArrowRight /></button>
          </>
        )}

        <div className="favorite-dock">
          <div className="dock-tier dock-top">
            <div className="game-selected-actions">
              <button
                className="game-play"
                onClick={() => {
                   const trackId = active.trackId || active.id;
                   if (currentTrack?.id === trackId) {
                     togglePlay();
                   } else {
                     playTrack({ ...active, id: trackId }, favorites);
                   }
                }}
              >
                {activePlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
              </button>
              <button className="game-favorite saved" onClick={() => setPendingRemove(active)}>
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="dock-tier dock-bottom">
            <div className="dock-dots">
              {dotIndexes.map((i) => {
                const isEdge = (i === dots.start && dots.start > 0) || (i === dots.end - 1 && dots.end < total)
                return (
                  <button key={favorites[i].trackId || favorites[i].id} className={`dock-dot ${i === activeIndex ? 'active' : ''} ${isEdge ? 'edge' : ''}`} onClick={() => setIndex(i)} />
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <ConfirmRemoveDialog track={pendingRemove} onConfirm={confirmRemove} onCancel={() => setPendingRemove(null)} />
    </section>
  )
}