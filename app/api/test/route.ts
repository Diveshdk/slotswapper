import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection by fetching user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .limit(5)

    // Test swap requests
    const { data: swapRequests, error: swapError } = await supabase
      .from('swap_requests')
      .select('*')
      .or(`requester_id.eq.${user.id},responder_id.eq.${user.id}`)
      .limit(5)

    const connectionStatus = {
      user: {
        id: user.id,
        email: user.email
      },
      database: {
        connected: true,
        eventsCount: events?.length || 0,
        swapRequestsCount: swapRequests?.length || 0,
        errors: {
          events: eventsError?.message || null,
          swapRequests: swapError?.message || null
        }
      },
      apiEndpoints: {
        '/api/swappable-slots': 'GET - Returns all swappable slots from other users',
        '/api/swap-request': 'POST - Create a new swap request',
        '/api/swap-response/[requestId]': 'POST - Accept or reject a swap request',
        '/api/swap-requests': 'GET - List user\'s incoming and outgoing swap requests',
        '/api/test': 'GET - This endpoint for testing'
      }
    }

    return NextResponse.json(connectionStatus)

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
