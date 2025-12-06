import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search } from 'lucide-react'

const MultiSelect = ({
  items = [],
  selectedItems = [],
  onChange,
  isMulti = true,
  placeholder = 'Select items...',
  displayKey = 'name',
  valueKey = '_id',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredItems = items.filter(
    (item) =>
      String(item[displayKey])
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.email &&
        item.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const selectedItemObjects = items.filter((item) =>
    selectedItems.includes(item[valueKey]),
  )

  const toggleItem = (id) => {
    if (isMulti) {
      onChange(
        selectedItems.includes(id)
          ? selectedItems.filter((x) => x !== id)
          : [...selectedItems, id],
      )
    } else {
      onChange([id])
      setIsOpen(false)
    }
  }

  const removeItem = (id, e) => {
    e.stopPropagation()
    onChange(selectedItems.filter((x) => x !== id))
  }

  const getDisplayText = (item) => {
    if (item.budget !== undefined) {
      return `${item[displayKey]} — ₹${item.budget || '—'}`
    }
    return item[displayKey]
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm bg-slate-50 hover:bg-white transition cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {selectedItemObjects.length > 0 ? (
            isMulti ? (
              selectedItemObjects.map((item) => (
                <span
                  key={item[valueKey]}
                  className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {item[displayKey]}
                  <button
                    onClick={(e) => removeItem(item[valueKey], e)}
                    className="hover:bg-teal-200 rounded-full p-0.5 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-900 font-medium">
                {getDisplayText(selectedItemObjects[0])}
              </span>
            )
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-600 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <label
                  key={item[valueKey]}
                  className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 last:border-b-0"
                >
                  <input
                    type={isMulti ? 'checkbox' : 'radio'}
                    name={isMulti ? undefined : 'single-select'}
                    checked={selectedItems.includes(item[valueKey])}
                    onChange={() => toggleItem(item[valueKey])}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">
                      {getDisplayText(item)}
                    </div>
                    {item.email && (
                      <div className="text-xs text-slate-600 truncate">
                        {item.email}
                      </div>
                    )}
                  </div>
                </label>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                No items found
              </div>
            )}
          </div>

          {/* Footer Actions - Only for Multi Select */}
          {isMulti && filteredItems.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-200 flex gap-2 bg-slate-50">
              <button
                onClick={() =>
                  onChange([
                    ...selectedItems,
                    ...filteredItems
                      .filter((item) => !selectedItems.includes(item[valueKey]))
                      .map((item) => item[valueKey]),
                  ])
                }
                className="flex-1 text-xs font-medium text-teal-600 hover:text-teal-700 py-1 rounded transition"
              >
                Select All
              </button>
              <div className="w-px bg-slate-300" />
              <button
                onClick={() =>
                  onChange(
                    selectedItems.filter(
                      (id) =>
                        !filteredItems
                          .map((item) => item[valueKey])
                          .includes(id),
                    ),
                  )
                }
                className="flex-1 text-xs font-medium text-red-600 hover:text-red-700 py-1 rounded transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
