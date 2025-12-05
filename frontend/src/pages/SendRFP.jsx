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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* SEND RFP CARD */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="inline-flex items-center text-xs font-semibold tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Send RFP
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900">
                Distribute RFP to vendors
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Choose an RFP and select vendors to send it to. Email delivery
                can be wired later; this flow focuses on who gets which RFP.
              </p>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <div className="font-medium text-slate-700">Overview</div>
              <div className="mt-1 text-[11px]">
                {rfps.length} RFPs · {vendors.length} vendors
              </div>
            </div>
          </div>

          {/* SELECTORS */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* RFP SELECT */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Select RFP
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
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
              {!rfps.length && (
                <p className="mt-1 text-[11px] text-slate-400">
                  No RFPs yet. Create one before sending.
                </p>
              )}
            </div>

            {/* VENDORS MULTI-SELECT */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Select Vendors
              </label>
              <div className="border border-slate-200 rounded-xl p-3 mt-1 max-h-44 overflow-auto bg-slate-50">
                {vendors.map((v) => (
                  <label
                    key={v._id}
                    className="flex items-start gap-2 mb-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedVendors.includes(v._id)}
                      onChange={() => toggleVendor(v._id)}
                    />
                    <span>
                      <span className="font-medium">{v.name}</span>{' '}
                      <span className="text-xs text-slate-500">
                        ({v.email})
                      </span>
                    </span>
                  </label>
                ))}

                {!vendors.length && (
                  <div className="text-xs text-slate-400">
                    No vendors yet. Add vendors in the Vendors section first.
                  </div>
                )}
              </div>
              {selectedVendors.length > 0 && (
                <p className="mt-1 text-[11px] text-emerald-600">
                  {selectedVendors.length} vendor(s) selected.
                </p>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
              onClick={send}
              disabled={sending}
            >
              <Mail size={16} />
              {sending ? 'Sending...' : 'Send RFP'}
            </button>

            <button
              className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              onClick={() => {
                setSelectedVendors([])
                setSelectedRfp('')
              }}
            >
              Reset
            </button>

            <p className="text-[11px] text-slate-400">
              Selected RFP and vendors will be used to trigger the send
              workflow.
            </p>
          </div>
        </div>

        {/* ACTIVITY LOG */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Activity Log
            </h3>
            {log.length > 0 && (
              <span className="text-[11px] text-slate-500">
                {log.length} event{log.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-slate-700 space-y-2 max-h-64 overflow-auto">
            {log.length ? (
              log
                .slice()
                .reverse()
                .map((l, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                    <span>{l}</span>
                  </div>
                ))
            ) : (
              <div className="text-slate-400">
                No activity yet. Send an RFP to see log entries here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
