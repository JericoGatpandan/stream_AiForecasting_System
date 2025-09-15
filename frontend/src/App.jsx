import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Home as HomeIcon, Map as MapIcon, BarChart2, ChevronLeft, ChevronRight, Cloud, Bell, Settings } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Home from './pages/Home'
import Map from './pages/Map'
import Analytics from './pages/Analytics'
import Forecast from './pages/Forecast'
import Alerts from './pages/Alerts'

function App() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Router>
      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-50 transition-all duration-300 
        ${isOpen ? 'w-48' : 'w-16'} flex flex-col`}
      >
        {/* Logo */}

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 m-2 rounded-md hover:bg-gray-100 self-end"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Links */}
        <div className="flex-1 flex flex-col items-start space-y-4 mt-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
          >
            <HomeIcon className="w-5 h-5" />
            {isOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/forecast"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
          >
            <Cloud className="w-5 h-5" />
            {isOpen && <span>Forecast</span>}
          </Link>

          <Link
            to="/map"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
          >
            <MapIcon className="w-5 h-5" />
            {isOpen && <span>Weather Map</span>}
          </Link>

          <Link
            to="/analytics"
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
          >
            <BarChart2 className="w-5 h-5" />
            {isOpen && <span>Analytics</span>}
          </Link>

          <Link
            to="/alerts"
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition w-full"
          >
            <Bell className="w-5 h-5" />
            {isOpen && <span>Alerts</span>}
          </Link>




        </div>
      </nav>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-48' : 'ml-16'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/map" element={<Map />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />

        </Routes>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
