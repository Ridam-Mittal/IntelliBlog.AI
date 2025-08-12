import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx';
import CheckAuth from './components/CheckAuth.jsx'
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Write from './pages/Write';
import Settings from './pages/Settings';
import SinglePost from './components/SinglePost';
import Category from './pages/Category.jsx';
import { Toaster } from 'react-hot-toast';
import About from './pages/About.jsx';
import CategoryPosts from './pages/CategoryPosts.jsx';


const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route  path='/' element={<CheckAuth protectedRoute={false}>
          <Home/>
        </CheckAuth>} />
        <Route path='/register' element={<CheckAuth protectedRoute={false} custom={true}>
          <Register/>
        </CheckAuth>}/>
        <Route path='/login' element={<CheckAuth protectedRoute={false} custom={true}>
          <Login/>
        </CheckAuth>}/>
        <Route path='/write' element={<CheckAuth protectedRoute={true}>
          <Write/>
        </CheckAuth>}/>
         <Route path='/settings' element={<CheckAuth protectedRoute={true}>
          <Settings/>
        </CheckAuth>}/>
        <Route path='/post/:id' element={<CheckAuth protectedRoute={true}>
          <SinglePost/>
        </CheckAuth>}/>
        <Route path='/categories' element={<CheckAuth protectedRoute={false}>
          <Category/>
        </CheckAuth>}/>
        <Route path='/about' element={<CheckAuth protectedRoute={false}>
          <About/>
        </CheckAuth>}/>
        <Route path='/category/:categoryName' element={<CheckAuth protectedRoute={false}>
          <CategoryPosts/>
        </CheckAuth>}/>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '1rem',
            padding: '0.5rem',
            fontWeight: "600"
          },
          success: {
            style: { background: '#e0f8ec', color: '#05603a' },
          },
          error: {
            style: { background: '#fdecea', color: '#7a271a' },
          },
        }}
      />
    </BrowserRouter>
  </QueryClientProvider>
)
