import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import DataDisplay from './pages/DataDisplay'
import Chatbot from './pages/Chatbot'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/data" element={<ProtectedRoute><DataDisplay /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
