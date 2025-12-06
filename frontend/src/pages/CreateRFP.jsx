import { useState, useEffect } from 'react'
import api from '../api'
import { CheckCircle, Play, Plus } from 'lucide-react'
import Card from '../components/Card'

export default function CreateRFP() {
  const Tab = ['Create RFP', 'Generated Draft']
  const [text, setText] = useState('')
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [vendorsList, setVendorsList] = useState([])
  const [selectedTab, setSelectedTab] = useState(Tab[0])

  const updateItemField = (index, field, value) => {
    if (!draft) return
    const items = Array.isArray(draft.items) ? [...draft.items] : []
    items[index] = { ...(items[index] || {}), [field]: value }
    setDraft({ ...draft, items })
  }
  const removeItem = (index) => {
    if (!draft) return
    const items = Array.isArray(draft.items) ? [...draft.items] : []
    items.splice(index, 1)
    setDraft({ ...draft, items })
  }

  const addItem = () => {
    if (!draft) return
    const items = Array.isArray(draft.items) ? [...draft.items] : []
    items.push({ name: '', specs: '', quantity: 1, max_unit_price: '' })
    setDraft({ ...draft, items })
  }

  const load = async () => {
    setLoading(true)
    try {
      const list = await api.listVendors()
      console.log('list ', list)
      setVendorsList(list || [])
    } catch (err) {
      console.error(err)
      alert('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const generate = async () => {
    if (!text.trim()) return alert('Please enter your requirement.')
    setLoading(true)
    setDraft(null)
    try {
      const res = await api.generateRfpDraft(text)
      setDraft(res.rfpDraft || res)
      setSelectedTab(Tab[1])
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

  function onSelectedTab(name) {
    setSelectedTab(name)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-6">
            <p className="inline-flex items-center text-xs font-semibold tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              RFP Creation
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              AI-assisted Request for Proposal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Describe what you need, generate a draft instantly, and save it as
              a structured RFP.
            </p>
          </div>

          {/* Tabs */}
          <div className="inline-flex items-center rounded-full bg-slate-100 p-1 mb-5 shadow-sm">
            {Tab.map((tabName) => {
              const isActive = selectedTab === tabName
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => onSelectedTab(tabName)}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tabName}
                </button>
              )
            })}
          </div>

          {/* CREATE TAB */}
          {selectedTab === Tab[0] && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 mb-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create RFP
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Describe the procurement requirement — AI will suggest a
                    draft RFP you can review and edit.
                  </p>
                </div>
                {loading && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Generating...
                  </span>
                )}
              </div>

              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Requirement details
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                rows={5}
                placeholder="E.g. Need 20 laptops with 16GB RAM and 27-inch monitors. Budget 50,000. Delivery in 30 days."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={generate}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
                  className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Clear
                </button>

                {message && (
                  <div className="ml-auto inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-xs">
                    <CheckCircle size={14} />
                    <span>{message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GENERATED DRAFT TAB */}
          {selectedTab === Tab[1] && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 mb-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Generated Draft
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Review and refine the AI-generated RFP fields before saving.
                  </p>
                </div>
                {!draft && (
                  <span className="text-[11px] text-slate-400">
                    No draft yet? Generate one from the <b>Create RFP</b> tab.
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Title
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                    value={draft?.title || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Budget
                    </label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                      value={draft?.budget || ''}
                      onChange={(e) =>
                        setDraft({ ...draft, budget: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Delivery days
                    </label>
                    <input
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                      value={draft?.delivery_days || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          delivery_days: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Payment terms
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                    value={draft?.payment_terms || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, payment_terms: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Warranty
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
                    value={draft?.warranty || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, warranty: e.target.value })
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Items
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-medium"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.isArray(draft?.items) &&
                      draft.items.map((item, idx) => (
                        <Card
                          key={idx}
                          index={idx}
                          item={item}
                          onFieldChange={(field, value) =>
                            updateItemField(idx, field, value)
                          }
                          onRemove={() => removeItem(idx)}
                        />
                      ))}
                  </div>

                  {(!draft?.items || draft.items.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-500">
                        No items added yet
                      </p>
                      <button
                        type="button"
                        onClick={addItem}
                        className="mt-2 text-teal-600 hover:text-teal-700 text-xs font-medium"
                      >
                        Add your first item
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    className="bg-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    onClick={save}
                    disabled={saving || !draft}
                  >
                    {saving ? 'Saving...' : 'Save RFP'}
                  </button>
                  <button
                    className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    onClick={() => setDraft(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Vendors Sidebar */}
        <div className="w-full lg:w-80">
          <div className="bg-white relative top-[23%] left-[20px] rounded-2xl shadow-sm border border-slate-100 h-[380px] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 ">
              <h3 className="text-sm font-semibold">Vendors</h3>
              <p className="text-[11px] mt-0.5">
                {loading && !vendorsList.length
                  ? 'Loading vendor list...'
                  : 'Vendors who can receive your RFP.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {vendorsList.length === 0 && !loading && (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-xs text-slate-400 max-w-[220px]">
                    No vendors added yet. Create vendors first to send them this
                    RFP.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {vendorsList.map(({ _id, email, name }, index) => (
                  <div
                    key={_id}
                    className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        #{index + 1}
                      </span>
                      <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Vendor
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
