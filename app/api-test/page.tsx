'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<string>('')
  const [mySlotId, setMySlotId] = useState('')
  const [theirSlotId, setTheirSlotId] = useState('')
  const [requestId, setRequestId] = useState('')
  const [accepted, setAccepted] = useState(true)

  const supabase = createClient()

  const testAPI = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    setLoading(endpoint)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setResults((prev: Record<string, any>) => ({
          ...prev,
          [endpoint]: { error: 'Not authenticated. Please login first.' }
        }))
        return
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(`/api/${endpoint}`, options)
      const data = await response.json()
      
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data: data
        }
      }))
    } catch (error) {
      setResults((prev: Record<string, any>) => ({
        ...prev,
        [endpoint]: { error: error instanceof Error ? error.message : 'Unknown error' }
      }))
    } finally {
      setLoading('')
    }
  }

  const testSwapRequest = () => {
    if (!mySlotId || !theirSlotId) {
      alert('Please enter both slot IDs')
      return
    }
    testAPI('swap-request', 'POST', {
      mySlotId: mySlotId.trim(),
      theirSlotId: theirSlotId.trim()
    })
  }

  const testSwapResponse = () => {
    if (!requestId) {
      alert('Please enter a request ID')
      return
    }
    testAPI(`swap-response/${requestId.trim()}`, 'POST', { accepted })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Swap API Test Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you're logged in (check auth status below)</li>
          <li>Create some events and mark them as 'SWAPPABLE' first</li>
          <li>Test each endpoint by clicking the buttons</li>
          <li>Use the returned IDs to test the POST endpoints</li>
        </ol>
      </div>

      <div className="grid gap-6">
        
        {/* Test Connection */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">🔍 Test Connection & Status</h3>
          <button
            onClick={() => testAPI('test')}
            disabled={loading === 'test'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading === 'test' ? 'Testing...' : 'Test API Connection'}
          </button>
          {results.test && (
            <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(results.test, null, 2)}
            </pre>
          )}
        </div>

        {/* 1. GET Swappable Slots */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">1️⃣ GET /api/swappable-slots</h3>
          <p className="text-gray-600 mb-3">Returns all swappable slots from other users</p>
          <button
            onClick={() => testAPI('swappable-slots')}
            disabled={loading === 'swappable-slots'}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading === 'swappable-slots' ? 'Loading...' : 'Get Swappable Slots'}
          </button>
          {results['swappable-slots'] && (
            <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(results['swappable-slots'], null, 2)}
            </pre>
          )}
        </div>

        {/* 2. POST Swap Request */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">2️⃣ POST /api/swap-request</h3>
          <p className="text-gray-600 mb-3">Create a new swap request</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="My Slot ID"
              value={mySlotId}
              onChange={(e) => setMySlotId(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Their Slot ID"
              value={theirSlotId}
              onChange={(e) => setTheirSlotId(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={testSwapRequest}
            disabled={loading === 'swap-request'}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading === 'swap-request' ? 'Creating...' : 'Create Swap Request'}
          </button>
          {results['swap-request'] && (
            <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(results['swap-request'], null, 2)}
            </pre>
          )}
        </div>

        {/* 3. POST Swap Response */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">3️⃣ POST /api/swap-response/[requestId]</h3>
          <p className="text-gray-600 mb-3">Accept or reject a swap request</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Swap Request ID"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="border rounded px-3 py-2 md:col-span-2"
            />
            <select
              value={accepted.toString()}
              onChange={(e) => setAccepted(e.target.value === 'true')}
              className="border rounded px-3 py-2"
            >
              <option value="true">Accept</option>
              <option value="false">Reject</option>
            </select>
          </div>
          <button
            onClick={testSwapResponse}
            disabled={loading.startsWith('swap-response')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading.startsWith('swap-response') ? 'Responding...' : `${accepted ? 'Accept' : 'Reject'} Swap`}
          </button>
          {Object.keys(results).filter(key => key.startsWith('swap-response')).map(key => (
            <pre key={key} className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-60">
              <strong>{key}:</strong><br />
              {JSON.stringify(results[key], null, 2)}
            </pre>
          ))}
        </div>

        {/* List Swap Requests */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">📋 GET /api/swap-requests</h3>
          <p className="text-gray-600 mb-3">List your incoming and outgoing swap requests</p>
          <button
            onClick={() => testAPI('swap-requests')}
            disabled={loading === 'swap-requests'}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading === 'swap-requests' ? 'Loading...' : 'Get My Swap Requests'}
          </button>
          {results['swap-requests'] && (
            <pre className="mt-3 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(results['swap-requests'], null, 2)}
            </pre>
          )}
        </div>

      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">💡 Tips:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>First run "Test API Connection" to check your auth status</li>
          <li>Use "Get Swappable Slots" to find slot IDs for testing</li>
          <li>Copy the slot IDs from the results to test swap requests</li>
          <li>Create swap requests first, then use their IDs to test responses</li>
          <li>Check the browser console for additional debug information</li>
        </ul>
      </div>
    </div>
  )
}
