import React from 'react'
import { FileText, Users, Send, BarChart3 } from 'lucide-react'

const Sidebar = ({ view, setView, isOpen, onClose }) => {
  const items = [
    { id: 'create', label: 'Create RFP', icon: FileText },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'send', label: 'Send RFP', icon: Send },
    { id: 'compare', label: 'Compare', icon: BarChart3 },
  ]
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">RFP Assistant</h1>
      </div>

      <nav className="flex flex-col mt-4">
        {items.map(({ id, label, icon: Icon }) => {
          const active = view === id

          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium w-full text-left
                ${
                  active
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-5 py-4 border-t text-sm text-gray-500">
        Logged in as <span className="font-medium text-gray-700">Sajal</span>
      </div>
    </aside>
  )
}

export default Sidebar
