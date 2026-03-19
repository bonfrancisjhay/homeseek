import { useEffect } from 'react'
import api from './services/api'

function App() {

  useEffect(() => {
    api.get('/boarding-houses')
      .then(response => {
        console.log('Connected! Data:', response.data)
      })
      .catch(error => {
        console.log('Error:', error.message)
      })
  }, [])

  return (
    <div>
      <h1>HomeSeek</h1>
      <p>Check the browser console (F12)</p>
    </div>
  )
}

export default App