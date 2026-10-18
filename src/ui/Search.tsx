import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchTracks, fetchTracksByIds } from '../api/itunes';
import { recommendedTracks } from '../recommend';
import type { ITunesTrack } from '../types';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); 
    
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = debouncedQuery.trim() !== '';
  const recommendIds = recommendedTracks.map(track => track.id);

  const { data, isLoading, isError } = useQuery({
    queryKey: isSearching ? ['search', debouncedQuery] : ['recommend', 'default'],
    queryFn: () => isSearching ? searchTracks(debouncedQuery) : fetchTracksByIds(recommendIds),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="search-full-container">
      <div className="search-full-tab">
        <h2>Search</h2>
      </div>

      <div className="search-full-content">
        {isLoading ? (
          <div className="loading-state">
            <h3 style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>กำลังโหลด...</h3>
          </div>
        ) : isError ? (
          <div className="error-state">
            <h3 style={{ color: '#ff42d6', textAlign: 'center', marginTop: '50px' }}>เกิดข้อผิดพลาดในการดึงข้อมูล</h3>
          </div>
        ) : (
          <div className="recommend-grid">
            {data?.results?.map((track: ITunesTrack) => (
              <Link to={`/track/${track.trackId}`} key={track.trackId} className="recommend-card">
                <div className="recommend-artwork">
                  <img 
                    src={track.artworkUrl100?.replace('100x100', '300x300')} 
                    alt={track.trackName} 
                  />
                </div>
                <div className="song-pill">{track.trackName}</div>
                <p>{track.artistName}</p>
                
                <button className="card-heart" onClick={(e) => {
                    e.preventDefault(); 
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}