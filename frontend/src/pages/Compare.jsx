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
      const p = await api.getProposals(selectedRfp);
      console.log("p",p)
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
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Proposals & Comparison</h2>
          <div className="text-sm text-gray-500">Compare vendor proposals</div>
        </div>

        <div className="mt-4 flex gap-3">
          <select
            className="border p-2 rounded-md"
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

          <button
            className="bg-gray-100 px-3 py-2 rounded-md"
            onClick={loadProposals}
          >
            Load proposals
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded-md inline-flex items-center gap-2"
            onClick={compare}
          >
            <Award size={16} /> Compare & Recommend
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Proposals</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full">
              <thead className="text-sm text-gray-600 border-b">
                <tr>
                  <th className="py-2 text-left">Vendor</th>
                  <th className="py-2 text-left">Price</th>
                  <th className="py-2 text-left">Delivery</th>
                  <th className="py-2 text-left">Warranty</th>
                  <th className="py-2 text-left">Summary</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length ? (
                  proposals.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="py-3">{p.vendorId?.name || '—'}</td>
                      <td className="py-3">
                        {p.parsed?.total_price
                          ? `₹${p.parsed.total_price}`
                          : '—'}
                      </td>
                      <td className="py-3">
                        {p.parsed?.delivery_days
                          ? `${p.parsed.delivery_days} days`
                          : '—'}
                      </td>
                      <td className="py-3">{p.parsed?.warranty || '—'}</td>
                      <td className="py-3">{p.ai_summary || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-gray-500">
                      No proposals yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {recommendation && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-3">AI Recommendation</h3>
          <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded">
            {JSON.stringify(recommendation, null, 2)}
          </pre>
        </div>
      )}

      {/* Simulate Vendor Response */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-3">🧪 Simulate Vendor Response (Testing)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Since email integration is stubbed, use this to simulate a vendor sending a proposal.
        </p>
        <SimulateResponse 
          proposals={proposals} 
          onSuccess={loadProposals}
        />
      </div>
    </div>
  )
}

function SimulateResponse({ proposals, onSuccess }) {
  const [selectedProposal, setSelectedProposal] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const pendingProposals = proposals.filter(p => p.status === 'pending')

  const handleSubmit = async () => {
    if (!selectedProposal) return alert('Select a proposal')
    if (!emailBody.trim()) return alert('Enter email body')
    
    setSubmitting(true)
    try {
      const proposal = proposals.find(p => p._id === selectedProposal)
      await api.simulateInbound({
        rfpId: proposal.rfpId,
        vendorId: proposal.vendorId._id,
        emailBody
      })
      alert('Proposal received and parsed!')
      setEmailBody('')
      setSelectedProposal('')
      onSuccess()
    } catch (err) {
      console.error(err)
      alert('Failed to simulate response')
    } finally {
      setSubmitting(false)
    }
  }

  const fillSample = () => {
    setEmailBody(`Dear Procurement Team,

Thank you for the RFP opportunity. Here is our proposal:

Total Price: ₹45,000
Delivery Time: 25 days
Warranty: 2 years comprehensive warranty

Line Items:
- Laptops (20 units): ₹30,000
- Monitors (15 units): ₹12,000
- Keyboards (10 units): ₹3,000

We look forward to working with you.

Best regards,
Vendor Team`)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Select Pending Proposal</label>
        <select
          className="w-full border p-2 rounded-md mt-1"
          value={selectedProposal}
          onChange={(e) => setSelectedProposal(e.target.value)}
        >
          <option value="">-- choose proposal --</option>
          {pendingProposals.map((p) => (
            <option key={p._id} value={p._id}>
              {p.vendorId?.name || 'Unknown'} (Status: {p.status})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Vendor Email Response</label>
        <textarea
          className="w-full border p-2 rounded-md mt-1 font-mono text-sm"
          rows={8}
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          placeholder="Paste vendor's email response here..."
        />
      </div>

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : 'Submit Response'}
        </button>
        <button
          className="bg-gray-100 px-4 py-2 rounded-md"
          onClick={fillSample}
        >
          Fill Sample
        </button>
      </div>
    </div>
  )
}
