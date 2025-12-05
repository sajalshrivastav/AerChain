import React, { useEffect, useState } from 'react'
import api from '../api'
import { Award } from 'lucide-react'

export default function Compare() {
  const [rfps, setRfps] = useState([])
  const [selectedRfp, setSelectedRfp] = useState('')
  const [proposals, setProposals] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRfps()
  }, [])

  const loadRfps = async () => {
    try {
      const r = await api.listRfps()
      setRfps(r || [])
      if (r && r[0]) setSelectedRfp(r[0]._id)
    } catch (err) {
      console.error(err)
    }
  }

  const loadProposals = async () => {
    if (!selectedRfp) return alert('Select RFP')
    setLoading(true)
    try {
      const p = await api.getProposals(selectedRfp)
      console.log('p', p)
      setProposals(p || [])
      setRecommendation(null)
    } catch (err) {
      console.error(err)
      alert('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  const compare = async () => {
    if (!selectedRfp) return alert('Select RFP')
    setLoading(true)
    try {
      const res = await api.compareProposals(selectedRfp)
      setRecommendation(res)
    } catch (err) {
      console.error(err)
      alert('Compare failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header + Controls */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="inline-flex items-center text-xs font-semibold tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Proposals & Comparison
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900">
                Compare vendor proposals
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Select an RFP, load all received proposals, and let AI recommend
                the best option.
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <div className="font-medium text-slate-700">RFPs loaded</div>
              <div className="mt-1 text-[11px]">
                {rfps.length
                  ? `${rfps.length} available for comparison`
                  : 'No RFPs yet'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 min-w-[220px]">
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
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                onClick={loadProposals}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Load proposals'}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
                onClick={compare}
                disabled={loading || !selectedRfp}
              >
                <Award size={16} />
                Compare & Recommend
              </button>
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Proposals
            </h3>
            <span className="text-xs text-slate-500">
              {proposals.length
                ? `${proposals.length} proposal(s) loaded`
                : 'No proposals loaded'}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading…
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium">
                      Vendor
                    </th>
                    <th className="py-2.5 px-4 text-left font-medium">Price</th>
                    <th className="py-2.5 px-4 text-left font-medium">
                      Delivery
                    </th>
                    <th className="py-2.5 px-4 text-left font-medium">
                      Warranty
                    </th>
                    <th className="py-2.5 px-4 text-left font-medium">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.length ? (
                    proposals.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition"
                      >
                        <td className="py-3 px-4 align-top text-slate-900 text-sm">
                          {p.vendorId?.name || '—'}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-700">
                          {p.parsed?.total_price
                            ? `₹${p.parsed.total_price}`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-700">
                          {p.parsed?.delivery_days
                            ? `${p.parsed.delivery_days} days`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-700">
                          {p.parsed?.warranty || '—'}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-600 text-xs sm:text-sm max-w-md">
                          {p.ai_summary || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 px-4 text-center text-sm text-slate-400"
                      >
                        No proposals yet. Load proposals for a selected RFP to
                        view them here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        {recommendation && (
          <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Award size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  AI Recommendation
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Based on price, delivery time, warranty, and summary.
                </p>
              </div>
            </div>
            <pre className="text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-100 p-4 rounded-xl overflow-auto">
              {JSON.stringify(recommendation, null, 2)}
            </pre>
          </div>
        )}

        {/* Simulate Vendor Response */}
        {/* <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
             Simulate Vendor Response (Testing)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Email integration is stubbed. Use this section to simulate a vendor
            sending a proposal and test the parsing & comparison flow.
          </p>
          <SimulateResponse proposals={proposals} onSuccess={loadProposals} />
        </div> */}
      </div>
    </div>
  )
}

// function SimulateResponse({ proposals, onSuccess }) {
//   const [selectedProposal, setSelectedProposal] = useState('')
//   const [emailBody, setEmailBody] = useState('')
//   const [submitting, setSubmitting] = useState(false)

//   const pendingProposals = proposals.filter((p) => p.status === 'pending')

//   const handleSubmit = async () => {
//     if (!selectedProposal) return alert('Select a proposal')
//     if (!emailBody.trim()) return alert('Enter email body')

//     setSubmitting(true)
//     try {
//       const proposal = proposals.find((p) => p._id === selectedProposal)
//       await api.simulateInbound({
//         rfpId: proposal.rfpId,
//         vendorId: proposal.vendorId._id,
//         emailBody,
//       })
//       alert('Proposal received and parsed!')
//       setEmailBody('')
//       setSelectedProposal('')
//       onSuccess()
//     } catch (err) {
//       console.error(err)
//       alert('Failed to simulate response')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const fillSample = () => {
//     setEmailBody(`Dear Procurement Team,

// Thank you for the RFP opportunity. Here is our proposal:

// Total Price: ₹45,000
// Delivery Time: 25 days
// Warranty: 2 years comprehensive warranty

// Line Items:
// - Laptops (20 units): ₹30,000
// - Monitors (15 units): ₹12,000
// - Keyboards (10 units): ₹3,000

// We look forward to working with you.

// Best regards,
// Vendor Team`)
//   }

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-xs font-medium text-slate-600 mb-1.5">
//           Select Pending Proposal
//         </label>
//         <select
//           className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
//           value={selectedProposal}
//           onChange={(e) => setSelectedProposal(e.target.value)}
//         >
//           <option value="">-- choose proposal --</option>
//           {pendingProposals.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.vendorId?.name || 'Unknown'} (Status: {p.status})
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-xs font-medium text-slate-600 mb-1.5">
//           Vendor Email Response
//         </label>
//         <textarea
//           className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 bg-slate-50 hover:bg-white transition"
//           rows={8}
//           value={emailBody}
//           onChange={(e) => setEmailBody(e.target.value)}
//           placeholder="Paste vendor's email response here..."
//         />
//       </div>

//       <div className="flex flex-wrap gap-2">
//         <button
//           className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
//           onClick={handleSubmit}
//           disabled={submitting}
//         >
//           {submitting ? 'Processing…' : 'Submit Response'}
//         </button>
//         <button
//           className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
//           onClick={fillSample}
//         >
//           Fill Sample
//         </button>
//       </div>
//     </div>
//   )
// }
