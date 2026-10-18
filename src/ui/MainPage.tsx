import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, Pause, Play, Star, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { popularTracks } from '../popular'
import { recommendedTracks } from '../recommend'
import { getTrackById } from '../api/itunes'
import { useFavorites, usePlayerStore } from '../store'
import type { MusicItem, ITunesTrack } from '../types' 
import { useCarouselMotion } from '../useCarouselMotion'
import { ConfirmRemoveDialog } from '../ConfirmRemoveDialog'

type AppTrack = Partial<MusicItem> & Partial<ITunesTrack> & { id?: number; trackId?: number };

function Cover({ track, className = '' }: { track: AppTrack; className?: string }) {
  return (
    <img
      className={className}
      src={track.artworkUrl100?.replace('100x100', '300x300') || track.artwork || '/assets/album-placeholder.svg'}
      alt={track.collectionName || track.album || track.title || track.trackName}
      onError={e => {
        e.currentTarget.onerror = null
        e.currentTarget.src = '/assets/album-placeholder.svg'
      }}
    />
  )
}

function TrackCard({ track, onToggle }: { track: AppTrack; onToggle: (track: AppTrack) => void }) {
  const { favoriteIds } = useFavorites()
  const trackId = Number(track.trackId || track.id)
  const saved = favoriteIds.includes(trackId)

  return (
    <article className="recommend-card">
      <Link to={`/track/${trackId}`} className="recommend-artwork">
        <Cover track={track} />
      </Link>
      <Link to={`/track/${trackId}`} className="song-pill">
        {track.trackName || track.title}
      </Link>
      <p>{track.artistName || track.artist}</p>
      <button
        className={`card-heart ${saved ? 'saved' : ''}`}
        onClick={(e) => { e.preventDefault(); onToggle(track); }}
        aria-label="Toggle favorite"
      >
        <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}

export function MainPage() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(2)
  const { favoriteIds, toggleFavorite } = useFavorites()
  const [pendingRemove, setPendingRemove] = useState<AppTrack | null>(null)
  
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-tracks'],
    queryFn: async () => {
      const loadById = async (track: AppTrack) => {
        try { 
          const idToLoad = Number(track.id || track.trackId)
          return (await getTrackById(idToLoad)) ?? track 
        } 
        catch { return track }
      }
      const [popular, recommend] = await Promise.all([
        Promise.all(popularTracks.map(loadById)),
        Promise.all(recommendedTracks.map(loadById)),
      ])
      return { popular, recommend }
    },
    staleTime: 1000 * 60 * 5, 
  })

  const catalog = (data?.popular || popularTracks) as AppTrack[]
  const recommendItems = (data?.recommend || recommendedTracks) as AppTrack[]

  const requestToggle = (track: AppTrack) => {
    const trackId = Number(track.trackId || track.id);
    if (favoriteIds.includes(trackId)) setPendingRemove(track)
    else toggleFavorite(trackId)
  }

  const confirmRemove = () => {
    if (pendingRemove) toggleFavorite(Number(pendingRemove.trackId || pendingRemove.id))
    setPendingRemove(null)
  }

  const carousel = useMemo(() => (catalog.length ? catalog : popularTracks), [catalog]) as AppTrack[]
  const active = carousel[activeIndex % carousel.length]
  const getMotion = useCarouselMotion(activeIndex % carousel.length, carousel.length)

  const move = (step: number) => {
    setActiveIndex(current => (current + step + carousel.length) % carousel.length)
  }

  useEffect(() => {
    if (currentTrack && carousel.length > 0) {
      const current = currentTrack as AppTrack;
      const playingId = Number(current.trackId || current.id);
      const indexToActive = carousel.findIndex((t: AppTrack) => Number(t.trackId || t.id) === playingId);
      if (indexToActive !== -1 && indexToActive !== activeIndex) {
        setActiveIndex(indexToActive);
      }
    }
  }, [currentTrack?.id, carousel]);

  if (isError) {
    return (
      <div className="main-page flex flex-col items-center justify-center h-full text-white gap-4">
        <p className="text-red-400">เกิดข้อผิดพลาดในการโหลดข้อมูลจาก iTunes API</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-500 transition">
          <RotateCcw size={16} /> ลองใหม่อีกครั้ง
        </button>
      </div>
    )
  }

  return (
    <div className="main-page">
      <section className="popular-section game-select">
        <h2 className="section-title">
          <Star size={21} fill="currentColor" /> Popular
        </h2>
        
        <div className="select-glow" />

        {isLoading ? (
           <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-purple-400"></span></div>
        ) : (
          <>
            {[-2, -1, 0, 1, 2]
              .map(offset => ({
                offset,
                index: (activeIndex + offset + carousel.length) % carousel.length,
              }))
              .sort((a, b) => a.index - b.index)
              .map(({ offset, index }) => {
                const track = carousel[index]
                if (!track) return null;
                
                const angle = offset * 18
                const depth = Math.abs(offset) * 70
                const curve = Math.abs(offset) ** 1.5 * 35
                const scale = offset === 0 ? 1.05 : 1 - Math.abs(offset) * 0.08
                const motion = getMotion(index, offset)
                
                const trackId = Number(track.trackId || track.id)
                const currentPlayingId = Number((currentTrack as AppTrack)?.trackId || currentTrack?.id)
                const isThisTrackPlaying = currentPlayingId === trackId && isPlaying;

                return (
                  <button
                    key={trackId}
                    className={`game-song game-song-${offset + 2} ${offset === 0 ? 'selected' : ''} ${motion.className}`}
                    style={{
                      transform: `translateX(-50%) translateY(${curve}px) translateZ(-${depth}px) rotateY(${-angle}deg) scale(${scale})`,
                      zIndex: offset === 0 ? 50 : Math.abs(offset) === 1 ? 30 : 10,
                      ...motion.style,
                    }}
                    onClick={() => {
                      if (offset === 0) navigate(`/track/${trackId}`)
                      else setActiveIndex(index)
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

            <button className="slide-arrow slide-prev game-arrow" onClick={() => move(-1)}><ArrowLeft /></button>
            <button className="slide-arrow slide-next game-arrow" onClick={() => move(1)}><ArrowRight /></button>

            <div className="game-selected-actions">
              <button
                className="game-play"
                onClick={() => {
                  const targetId = Number(active?.trackId || active?.id);
                  const currentPlayingId = Number((currentTrack as AppTrack)?.trackId || currentTrack?.id);
                  if (currentPlayingId === targetId) togglePlay() 
                  else playTrack({ ...active, id: targetId } as MusicItem, carousel as MusicItem[])
                }}
              >
                {Number((currentTrack as AppTrack)?.trackId || currentTrack?.id) === Number(active?.trackId || active?.id) && isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
              </button>
              <button
                className={`game-favorite ${active && favoriteIds.includes(Number(active.trackId || active.id)) ? 'saved' : ''}`}
                onClick={() => active && requestToggle(active)}
              >
                <Heart size={20} fill={active && favoriteIds.includes(Number(active.trackId || active.id)) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="slide-indicators">
              {carousel.map((track: AppTrack, index: number) => (
                <button
                  key={Number(track.trackId || track.id)}
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="recommend-section">
        <div className="section-header">
          <h2 className="section-title"><Star size={21} fill="currentColor" /> Recommend</h2>
        </div>
        
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
             {[1,2,3,4].map(i => <div key={i} className="w-32 h-40 bg-white/10 animate-pulse rounded-lg flex-shrink-0"></div>)}
          </div>
        ) : (
          <div className="recommend-grid">
            {recommendItems.map((track: AppTrack) => (
              <TrackCard key={Number(track.trackId || track.id)} track={track} onToggle={requestToggle} />
            ))}
          </div>
        )}
      </section>

      <ConfirmRemoveDialog track={pendingRemove as MusicItem} onConfirm={confirmRemove} onCancel={() => setPendingRemove(null)} />
    </div>
  )
}