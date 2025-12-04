import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
// import Topbar from './Topbar'

const DashboardLayout = ({ children, view, setView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area wrapper with left padding when md+ */}
      <div className="md:pl-64">
        {/* topbar */}
        {/* <Topbar onToggleSidebar={() => setSidebarOpen(true)} /> */}

        {/* content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
