import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Listing from './pages/Listing'
import Login from './pages/Login'
import Post from './pages/Post'
import MyListings from './pages/MyListings'
import { Conversation, Inbox } from './pages/Messages'
import { Empty } from './components/States'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="listing/:id" element={<Listing />} />
        <Route path="login" element={<Login mode="login" />} />
        <Route path="signup" element={<Login mode="signup" />} />
        <Route path="post" element={<Post />} />
        <Route path="my-listings" element={<MyListings />} />
        <Route path="messages" element={<Inbox />} />
        <Route path="messages/:id" element={<Conversation />} />
        <Route path="*" element={<Empty>Page not found.</Empty>} />
      </Route>
    </Routes>
  )
}
