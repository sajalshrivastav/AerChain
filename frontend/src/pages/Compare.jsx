import React, { useEffect, useState } from 'react'
import api from '../api'
import { Award, TrendingUp, RefreshCw } from 'lucide-react'

export default function Compare() {
  const [rfps, setRfps] = useState([])
  const [selectedRfp, setSelectedRfp] = useState('')
  const [proposals, setProposals] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [processingProposals, setProcessingProposals] = useState(new Set())

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

  const refreshProposals = async () => {
    setRefreshing(true)
    setDebugInfo(null)
    
    // Mark all pending proposals as processing
    const pendingIds = proposals
      .filter(p => p.status === 'pending')
      .map(p => p._id)
    setProcessingProposals(new Set(pendingIds))
    
    try {
      // Step 1: Trigger processing of pending proposals
      console.log('🔄 Triggering email processing...')
      const processResult = await api.processPendingProposals()
      console.log('✅ Process result:', processResult)
      
      // Step 2: Wait a moment for processing to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Reload proposals
      if (selectedRfp) {
        const p = await api.getProposals(selectedRfp)
        setProposals(p || [])
        
        // Show debug info
        const pending = (p || []).filter(prop => prop.status === 'pending').length
        const received = (p || []).filter(prop => prop.status === 'received').length
        setDebugInfo({
          total: (p || []).length,
          pending,
          received,
          message: processResult.message
        })
        
        alert(`✅ Refreshed! ${received} received, ${pending} pending`)
      } else {
        alert('✅ Email processing triggered')
      }
    } catch (err) {
      console.error('Refresh error:', err)
      alert('Failed to refresh: ' + (err.response?.data?.error || err.message))
    } finally {
      setRefreshing(false)
      setProcessingProposals(new Set())
    }
  }

  // Get score color for text
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // Sort scores by highest first
  const sortedScores = recommendation?.scores
    ? [...recommendation.scores].sort((a, b) => (b.score || 0) - (a.score || 0))
    : []

  const topVendor = sortedScores[0]

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
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-60"
                onClick={refreshProposals}
                disabled={refreshing || loading}
                title="Check Gmail for new vendor responses"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Checking…' : 'Refresh from Gmail'}
              </button>
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

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={16} className="text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">
                  {debugInfo.message}
                </p>
                <div className="mt-2 text-xs text-blue-800 space-y-1">
                  <div>📊 Total proposals: {debugInfo.total}</div>
                  <div>✅ Received: {debugInfo.received}</div>
                  <div>⏳ Pending: {debugInfo.pending}</div>
                </div>
                {debugInfo.pending > 0 && (
                  <p className="mt-2 text-xs text-blue-700">
                    💡 Tip: If proposals are still pending, check your backend console logs for connection issues or messageId mismatches.
                  </p>
                )}
              </div>
              <button
                onClick={() => setDebugInfo(null)}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
                    proposals.map((p) => {
                      const isProcessing = processingProposals.has(p._id)
                      const isPending = p.status === 'pending'
                      
                      return (
                        <tr
                          key={p._id}
                          className={`border-b border-slate-50 transition ${
                            isProcessing 
                              ? 'bg-blue-50 animate-pulse' 
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-4 align-top text-slate-900 text-sm">
                            <div className="flex items-center gap-2">
                              {isProcessing && (
                                <RefreshCw size={14} className="text-blue-600 animate-spin" />
                              )}
                              {p.vendorId?.name || '—'}
                              {isPending && !isProcessing && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top text-slate-700">
                            {isProcessing ? (
                              <span className="text-blue-600 text-xs">Processing...</span>
                            ) : (
                              p.parsed?.total_price
                                ? `₹${p.parsed.total_price}`
                                : '—'
                            )}
                          </td>
                          <td className="py-3 px-4 align-top text-slate-700">
                            {isProcessing ? (
                              <span className="text-blue-600 text-xs">Processing...</span>
                            ) : (
                              p.parsed?.delivery_days
                                ? `${p.parsed.delivery_days} days`
                                : '—'
                            )}
                          </td>
                          <td className="py-3 px-4 align-top text-slate-700">
                            {isProcessing ? (
                              <span className="text-blue-600 text-xs">Processing...</span>
                            ) : (
                              p.parsed?.warranty || '—'
                            )}
                          </td>
                          <td className="py-3 px-4 align-top text-slate-600 text-xs sm:text-sm max-w-md">
                            {isProcessing ? (
                              <span className="text-blue-600 text-xs">
                                Fetching and parsing email response...
                              </span>
                            ) : (
                              p.ai_summary || '—'
                            )}
                          </td>
                        </tr>
                      )
                    })
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  AI Rankings
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                {recommendation.summary}
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {sortedScores.map((item, index) => {
                const vendor = proposals.find(
                  (p) => p.vendorId?._id === item.vendorId,
                )
                const isTop = index === 0

                return (
                  <div
                    key={item.vendorId}
                    className={`px-4 py-3 transition ${
                      isTop
                        ? 'bg-emerald-50 border-l-2 border-l-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-600">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {vendor?.vendorId?.name || 'Unknown'}
                        </span>
                        {isTop && (
                          <Award size={14} className="text-emerald-600" />
                        )}
                      </div>
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          item.score,
                        )}`}
                      >
                        {item.score}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <div>
                        <span className="text-slate-700 font-medium">
                          Strengths:{' '}
                        </span>
                        {item.strengths || '—'}
                      </div>
                      <div>
                        <span className="text-slate-700 font-medium">
                          Weaknesses:{' '}
                        </span>
                        {item.weaknesses || '—'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {topVendor && (
              <div className="px-4 py-3 bg-emerald-50 border-t border-slate-200">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award size={12} className="text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-emerald-800">
                      RECOMMENDED
                    </p>
                    <p className="text-sm font-bold text-emerald-900 mt-0.5">
                      {proposals.find(
                        (p) => p.vendorId?._id === topVendor.vendorId,
                      )?.vendorId?.name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-emerald-800 mt-1">
                      {recommendation.recommendation?.reason ||
                        'Best overall value'}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
