import { useState } from 'react'
import DashboardLayout from './layout/DashboardLayout'
import CreateRFP from './pages/CreateRFP'
import Vendors from './pages/Vendors'
import SendRFP from './pages/SendRFP'
import Compare from './pages/Compare'

function App() {
  const [view, setView] = useState('create') // create | vendors | send | compare
  const renderView = () => {
    switch (view) {
      case 'vendors':
        return <Vendors />
      case 'send':
        return <SendRFP />
      case 'compare':
        return <Compare />
      default:
        return <CreateRFP />
    }
  }

  return (
    <DashboardLayout view={view} setView={setView}>
      {renderView()}
    </DashboardLayout>
  )
}

export default App
