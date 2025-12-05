import React, { useEffect, useState } from 'react'
import api from '../api'
import { Mail } from 'lucide-react'

export default function SendRFP() {
  const [rfps, setRfps] = useState([])
  const [vendors, setVendors] = useState([])
  const [selectedRfp, setSelectedRfp] = useState('')
  const [selectedVendors, setSelectedVendors] = useState([])
  const [sending, setSending] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const r = await api.listRfps()
      const v = await api.listVendors()
      setRfps(r || [])
      setVendors(v || [])
      if (r && r[0]) setSelectedRfp(r[0]._id)
    } catch (err) {
      console.error(err)
      alert('Failed to load data')
    }
  }

  const toggleVendor = (id) => {
    setSelectedVendors((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )
  }

  const send = async () => {
    if (!selectedRfp) return alert('Select RFP')
    if (!selectedVendors.length) return alert('Select vendors')
    setSending(true)
    setLog((prev) => [
      ...prev,
      `Sending RFP ${selectedRfp} to ${selectedVendors.length} vendors...`,
    ])
    try {
      const res = await api.sendRfp(selectedRfp, selectedVendors)
      setLog((prev) => [
        ...prev,
        `Sent: ${res.sent.length} | Failed: ${res.failed.length}`,
      ])
    } catch (err) {
      console.error(err)
      setLog((prev) => [...prev, 'Send failed'])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Send RFP</h2>
          <div className="text-sm text-gray-500">
            Use the mailer to send RFP to selected vendors
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Select RFP
            </label>
            <select
              className="w-full border p-2 rounded-md mt-1"
              value={selectedRfp}
              onChange={(e) => setSelectedRfp(e.target.value)}
            >
              <option value="">-- choose RFP --</option>
              {rfps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} — ₹{r.budget || '—'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Select Vendors
            </label>
            <div className="border rounded-md p-3 mt-1 max-h-44 overflow-auto">
              {vendors.map((v) => (
                <label key={v._id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(v._id)}
                    onChange={() => toggleVendor(v._id)}
                  />
                  <span className="text-sm">
                    {v.name}{' '}
                    <span className="text-xs text-gray-500">({v.email})</span>
                  </span>
                </label>
              ))}
              {!vendors.length && (
                <div className="text-sm text-gray-500">No vendors yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
            onClick={send}
            disabled={sending}
          >
            <Mail size={16} />
            {sending ? 'Sending...' : 'Send RFP'}
          </button>
          <button
            className="px-4 py-2 rounded-md bg-gray-100"
            onClick={() => {
              setSelectedVendors([])
              setSelectedRfp('')
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-3">Activity Log</h3>
        <div className="text-sm text-gray-700 space-y-2">
          {log.length ? (
            log
              .slice()
              .reverse()
              .map((l, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  {l}
                </div>
              ))
          ) : (
            <div className="text-gray-500">No activity yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
