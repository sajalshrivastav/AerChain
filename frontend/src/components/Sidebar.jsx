import React from 'react'
import { FileText, Users, Send, BarChart3, X } from 'lucide-react'

const Sidebar = ({ view, setView, isOpen, onClose }) => {
  const items = [
    {
      id: 'create',
      label: 'Create RFP',
      icon: FileText,
      description: 'Draft a new RFP with AI',
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Users,
      description: 'Manage your vendor list',
    },
    {
      id: 'send',
      label: 'Send RFP',
      icon: Send,
      description: 'Distribute RFP to vendors',
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: BarChart3,
      description: 'Evaluate and compare proposals',
    },
  ]
  const handleItemClick = (id) => {
    setView(id)
    if (onClose) onClose()
  }
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white shadow-sm flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-tight">
              RFP Assistant
            </h1>
            <p className="text-[11px] text-slate-500">
              AI-powered procurement workspace
            </p>
          </div>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col py-3 px-2 space-y-1 overflow-y-auto">
        {items.map(({ id, label, icon: Icon, description }) => {
          const active = view === id

          return (
            <button
              key={id}
              onClick={() => handleItemClick(id)}
              className={`group relative flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition
                  ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border text-[13px] transition
                    ${
                      active
                        ? 'border-blue-200 bg-white text-blue-600 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300'
                    }`}
              >
                <Icon size={16} />
              </div>

              <div className="flex flex-col items-start">
                <span className="leading-snug">{label}</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  {description}
                </span>
              </div>

              {active && (
                <span className="absolute right-2 h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer / Hint */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p className="text-[11px] text-slate-500 leading-snug">
          Tip: Use <span className="font-semibold text-slate-700">Tab</span> and{' '}
          <span className="font-semibold text-slate-700">Enter</span> to
          navigate quickly.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
