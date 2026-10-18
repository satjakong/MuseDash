import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './ui/Layout'
import { MainPage } from './ui/MainPage'
import { DetailPage } from './ui/DetailPage'
import { FavoritesPage } from './ui/FavoritesPage'
import { About } from './ui/About'
import { Search } from './ui/Search'

export const router = createBrowserRouter([
  { 
    path: '/', 
    element: <Layout />, 
    children: [
      { index: true, element: <MainPage /> }, 
      { path: 'track/:id', element: <DetailPage /> }, 
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'search', element: <Search/> },
      { path: 'about', element: <About /> },
    ]
  }
])