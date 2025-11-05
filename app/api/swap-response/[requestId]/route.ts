import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = params
    const { accepted } = await request.json()
    
    if (typeof accepted !== 'boolean') {
      return NextResponse.json({ 
        error: 'Missing required field: accepted (boolean)' 
      }, { status: 400 })
    }

    // Get the swap request and verify the user is the responder
    const { data: swapRequest, error: fetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !swapRequest) {
      return NextResponse.json({ 
        error: 'Swap request not found' 
      }, { status: 404 })
    }

    // Verify the current user is the responder
    if (swapRequest.responder_id !== user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized: You are not the responder for this swap request' 
      }, { status: 403 })
    }

    // Check if request is still pending
    if (swapRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Swap request has already been responded to' 
      }, { status: 400 })
    }

    if (!accepted) {
      // REJECTION: Use the existing RPC function to reject the swap
      const { data, error: rejectError } = await supabase.rpc('reject_swap_request', {
        p_swap_request_id: requestId,
        p_requester_slot_id: swapRequest.requester_slot_id,
        p_responder_slot_id: swapRequest.responder_slot_id,
      })

      if (rejectError) {
        console.error('Error rejecting swap request:', rejectError)
        return NextResponse.json({ 
          error: 'Failed to reject swap request' 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Swap request rejected successfully',
        data
      })

    } else {
      // ACCEPTANCE: Use the existing RPC function to accept the swap
      const { data, error: acceptError } = await supabase.rpc('accept_swap_request', {
        p_swap_request_id: requestId,
        p_requester_id: swapRequest.requester_id,
        p_responder_id: swapRequest.responder_id,
        p_requester_slot_id: swapRequest.requester_slot_id,
        p_responder_slot_id: swapRequest.responder_slot_id,
      })

      if (acceptError) {
        console.error('Error accepting swap request:', acceptError)
        return NextResponse.json({ 
          error: 'Failed to accept swap request' 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Swap request accepted successfully - ownership transferred',
        data
      })
    }

  } catch (error) {
    console.error('Unexpected error in swap-response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
