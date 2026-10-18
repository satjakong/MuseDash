import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Info, ListMusic, Search as SearchIcon } from 'lucide-react';
import { usePlayerStore } from '../store';
import { PreviewPlayer } from '../usePreviewPlayer'; 

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');

  const currentTrack = usePlayerStore(state => state.currentTrack);

  useEffect(() => {
    if (location.pathname === '/search') {
      setInputValue(searchParams.get('q') || '');
    } else {
      setInputValue('');
    }
  }, [location.pathname, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    navigate(`/search?q=${val}`, { replace: true });
  };

  const isSearchPage = location.pathname === '/search';

  return (
    <div className={`app-shell ${currentTrack ? 'has-player' : ''}`}>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img src="/assets/logo.png" alt="Muse Music" />
        </NavLink>

        <nav className="nav-links" style={isSearchPage ? { flex: 1, marginLeft: '20px' } : {}}>
          {isSearchPage ? (
            <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, marginRight: '10px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchChange}
                autoFocus
                placeholder="ใส่ชื่อเพลงเพื่อค้นหา"
                style={{ 
                  width: '100%', 
                  padding: '7px 36px 7px 20px', 
                  borderRadius: '999px', 
                  border: '1px solid #444',
                  outline: 'none',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              />
              <SearchIcon size={18} style={{ position: 'absolute', right: '14px', color: '#aaaaaa' }} />
            </div>
          ) : (
            <NavLink to="/search"><SearchIcon size={17}/> search</NavLink>
          )}

          <NavLink to="/favorites"><ListMusic size={17}/> playlist</NavLink>
          <NavLink to="/about"><Info size={17}/> about</NavLink>
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>

      <PreviewPlayer />
    </div>
  );
}