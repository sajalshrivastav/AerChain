import { PlusCircle, Users, Loader2 } from 'lucide-react'
import api from '../api'
import { useEffect, useState } from 'react'

const Vendors = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [vendors, setVendors] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const list = await api.listVendors()
      setVendors(list || [])
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

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      return alert('Enter name and email')
    }

    setSubmitting(true)
    try {
      await api.createVendor({ name: name.trim(), email: email.trim() })
      setName('')
      setEmail('')
      await load()
    } catch (err) {
      console.error(err)
      alert('Failed to add vendor')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (fullName = '') => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center text-xs font-semibold tracking-wide text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              <Users size={14} className="mr-1.5" />
              Vendor Management
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-3">
              Vendor Management System
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add new vendors and keep track of your existing partners in one
              place.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right text-xs text-slate-500">
            <span className="font-medium text-slate-700">Total Vendors</span>
            <span className="mt-1 inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {loading ? '—' : vendors.length}
            </span>
          </div>
        </header>

        {/* Add Vendor Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Add a new vendor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide the vendor&apos;s name and email to create a new entry.
              </p>
            </div>
          </div>

          <form
            onSubmit={add}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Vendor name
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 placeholder:text-slate-400 bg-slate-50 hover:bg-white transition"
                placeholder="e.g. Acme Supplies Pvt. Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email address
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 placeholder:text-slate-400 bg-slate-50 hover:bg-white transition"
                placeholder="vendor@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Add Vendor
                </>
              )}
            </button>
          </form>
        </section>

        {/* Vendors List Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Saved Vendors
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {loading
                  ? 'Fetching vendor list...'
                  : vendors.length
                  ? 'Click on a row to view details (if needed in future).'
                  : 'No vendors added yet — start by adding your first vendor.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5 sm:px-6 font-medium text-xs text-slate-500 tracking-wide">
                    Vendor
                  </th>
                  <th className="py-3.5 px-5 sm:px-6 font-medium text-xs text-slate-500 tracking-wide">
                    Email
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-8 px-5 sm:px-6 text-center text-slate-500 text-sm"
                    >
                      <div className="inline-flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Loading vendors...
                      </div>
                    </td>
                  </tr>
                ) : vendors.length ? (
                  vendors.map((v) => (
                    <tr
                      key={v._id}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition"
                    >
                      <td className="py-3.5 px-5 sm:px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shadow-sm">
                            {getInitials(v.name)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {v.name}
                            </div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">
                              Vendor
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 sm:px-6 align-middle">
                        <span className="inline-flex text-xs sm:text-sm text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          {v.email}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-10 px-5 sm:px-6 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                          <Users size={18} className="text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-600">
                          No vendors yet
                        </p>
                        <p className="text-xs text-slate-400 max-w-xs">
                          Start building your vendor list by adding your first
                          vendor above.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Vendors
