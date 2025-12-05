import { PlusCircle } from 'lucide-react'
import api from '../api'
import { useEffect } from 'react'
import { useState } from 'react'

const Vendors = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(false)
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
    console.log(e)
    if (!name || !email) return alert('Enter name and email')
    try {
      await api.createVendor({ name, email })
      setName('')
      setEmail('')
      await load()
    } catch (err) {
      console.error(err)
      alert('Failed to add vendor')
    }
  }

  return (
    <div>
      <div className="vendor_container">
        <div className="header">
          <h4>Vendors Page</h4>
          <p>Manage Vendors Here </p>
        </div>
        <div className="vendor_add">
          <form onSubmit={add} className="flex gap-3">
            <input
              className="border rounded-md p-2 flex-1"
              placeholder="Vendor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border rounded-md p-2 flex-1"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
              type="submit"
            >
              <PlusCircle size={16} /> Add
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-3">Saved Vendors</h3>

          <table className="w-full text-left border-collapse">
            <thead className="text-sm text-gray-600">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : vendors.length ? (
                vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="py-3">{v.name}</td>
                    <td className="py-3 text-sm text-gray-700">{v.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500">
                    No vendors yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Vendors
