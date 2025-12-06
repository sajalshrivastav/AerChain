import { PlusCircle, Trash2 } from 'lucide-react'

const Card = ({ index, item, onFieldChange, onRemove }) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 shadow-sm p-4 flex flex-col justify-between">
      {/* Top / badge row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
            Item #{index + 1}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] text-rose-500 hover:text-rose-600 inline-flex items-center gap-1"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>

        {/* “Title” area */}
        <input
          className="w-full bg-white rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 mb-2"
          placeholder='Item name (e.g. 16" Business Laptop)'
          value={item.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />

        {/* Specs / description area */}
        <textarea
          className="w-full bg-white rounded-xl px-3 py-2 text-xs text-slate-600 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 resize-none"
          rows={3}
          placeholder="Key specs (CPU, RAM, storage, screen size, warranty, etc.)"
          value={item.specs || item.description || ''}
          onChange={(e) => onFieldChange('specs', e.target.value)}
        />
      </div>

      {/* Bottom bar */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Quantity</span>
          <input
            type="number"
            min={1}
            className="w-20 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={item.quantity ?? ''}
            onChange={(e) => onFieldChange('quantity', Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-slate-400">Max unit price</span>
          <input
            className="w-28 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-emerald-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="₹ amount"
            value={item.max_unit_price || ''}
            onChange={(e) => onFieldChange('max_unit_price', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default Card
