import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DataDisplay from './pages/DataDisplay'
import Chatbot from './pages/Chatbot'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data" element={<DataDisplay />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </Router>
  )
}

export default App
