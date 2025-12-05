import React, { useState } from 'react'
import api from '../api'
import { CheckCircle, Play } from 'lucide-react'

export default function CreateRFP() {
  const [text, setText] = useState('')
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const generate = async () => {
    if (!text.trim()) return alert('Please enter your requirement.')
    setLoading(true)
    setDraft(null)
    try {
      const res = await api.generateRfpDraft(text)
      setDraft(res.rfpDraft || res)
    } catch (err) {
      console.error(err)
      alert('Failed to generate draft.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!draft) return alert('No draft to save.')
    setSaving(true)
    try {
      const payload = { ...draft }
      const r = await api.createRfp(payload)
      setMessage('Saved RFP id: ' + r._id)
      setTimeout(() => setMessage(''), 3000)
      setDraft(null)
      setText('')
    } catch (err) {
      console.error(err)
      alert('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Create RFP</h2>
        <p className="text-sm text-gray-500 mb-4">
          Describe the procurement requirement — AI will suggest a draft RFP.
        </p>

        <textarea
          className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400"
          rows={4}
          placeholder="E.g. Need 20 laptops with 16GB RAM and 15 monitors 27-inch. Budget 50,000. Delivery in 30 days."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            <Play size={16} />
            {loading ? 'Generating...' : 'Generate RFP'}
          </button>

          <button
            onClick={() => {
              setText('')
              setDraft(null)
            }}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>

          {message && (
            <div className="ml-auto inline-flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm">{message}</span>
            </div>
          )}
        </div>
      </div>

      {draft && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-3">Generated Draft</h3>

          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            className="w-full border p-2 rounded-md mb-3"
            value={draft.title || ''}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget
              </label>
              <input
                className="w-full border p-2 rounded-md mb-3"
                value={draft.budget || ''}
                onChange={(e) =>
                  setDraft({ ...draft, budget: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery days
              </label>
              <input
                className="w-full border p-2 rounded-md mb-3"
                value={draft.delivery_days || ''}
                onChange={(e) =>
                  setDraft({ ...draft, delivery_days: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Payment terms
          </label>
          <input
            className="w-full border p-2 rounded-md mb-3"
            value={draft.payment_terms || ''}
            onChange={(e) =>
              setDraft({ ...draft, payment_terms: e.target.value })
            }
          />

          <label className="block text-sm font-medium text-gray-700">
            Warranty
          </label>
          <input
            className="w-full border p-2 rounded-md mb-3"
            value={draft.warranty || ''}
            onChange={(e) => setDraft({ ...draft, warranty: e.target.value })}
          />

          <label className="block text-sm font-medium text-gray-700">
            Items (JSON)
          </label>
          <textarea
            className="w-full border p-2 rounded-md mb-3"
            rows={4}
            value={JSON.stringify(draft.items || [], null, 2)}
            onChange={(e) => {
              try {
                setDraft({ ...draft, items: JSON.parse(e.target.value) })
              } catch {}
            }}
          />

          <div className="flex gap-3">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save RFP'}
            </button>
            <button
              className="px-4 py-2 rounded-md bg-gray-100"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
