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

    // Get incoming swap requests (where user is the responder)
    const { data: incomingRequests, error: incomingError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('responder_id', user.id)
      .order('created_at', { ascending: false })

    // Get outgoing swap requests (where user is the requester)
    const { data: outgoingRequests, error: outgoingError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })

    if (incomingError || outgoingError) {
      console.error('Error fetching swap requests:', { incomingError, outgoingError })
      return NextResponse.json({ error: 'Failed to fetch swap requests' }, { status: 500 })
    }

    return NextResponse.json({ 
      incoming: incomingRequests || [],
      outgoing: outgoingRequests || [],
      totalIncoming: incomingRequests?.length || 0,
      totalOutgoing: outgoingRequests?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error in swap-requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
