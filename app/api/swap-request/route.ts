import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { mySlotId, theirSlotId } = await request.json()
    
    if (!mySlotId || !theirSlotId) {
      return NextResponse.json({ 
        error: 'Missing required fields: mySlotId and theirSlotId' 
      }, { status: 400 })
    }

    // Verify that both slots exist and are currently SWAPPABLE
    const { data: mySlot, error: mySlotError } = await supabase
      .from('events')
      .select('*')
      .eq('id', mySlotId)
      .eq('user_id', user.id)
      .single()

    if (mySlotError || !mySlot) {
      return NextResponse.json({ 
        error: 'Your slot not found or you do not own it' 
      }, { status: 404 })
    }

    if (mySlot.status !== 'SWAPPABLE') {
      return NextResponse.json({ 
        error: 'Your slot is not available for swapping' 
      }, { status: 400 })
    }

    const { data: theirSlot, error: theirSlotError } = await supabase
      .from('events')
      .select('*')
      .eq('id', theirSlotId)
      .eq('status', 'SWAPPABLE')
      .neq('user_id', user.id)
      .single()

    if (theirSlotError || !theirSlot) {
      return NextResponse.json({ 
        error: 'Target slot not found or not available for swapping' 
      }, { status: 404 })
    }

    // Start a transaction to create swap request and update slot statuses
    const { data: swapRequest, error: createError } = await supabase
      .from('swap_requests')
      .insert({
        requester_id: user.id,
        responder_id: theirSlot.user_id,
        requester_slot_id: mySlotId,
        responder_slot_id: theirSlotId,
        status: 'PENDING'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating swap request:', createError)
      return NextResponse.json({ 
        error: 'Failed to create swap request' 
      }, { status: 500 })
    }

    // Update both slots to SWAP_PENDING status
    const { error: updateMySlotError } = await supabase
      .from('events')
      .update({ status: 'SWAP_PENDING' })
      .eq('id', mySlotId)

    const { error: updateTheirSlotError } = await supabase
      .from('events')
      .update({ status: 'SWAP_PENDING' })
      .eq('id', theirSlotId)

    if (updateMySlotError || updateTheirSlotError) {
      console.error('Error updating slot statuses:', { updateMySlotError, updateTheirSlotError })
      
      // Rollback: delete the swap request if slot updates failed
      await supabase
        .from('swap_requests')
        .delete()
        .eq('id', swapRequest.id)
      
      return NextResponse.json({ 
        error: 'Failed to update slot statuses' 
      }, { status: 500 })
    }

    // Fetch complete swap request with related data for response
    const { data: completeSwapRequest, error: fetchError } = await supabase
      .from('swap_requests')
      .select(`
        *
      `)
      .eq('id', swapRequest.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete swap request:', fetchError)
    }

    return NextResponse.json({ 
      success: true,
      swapRequest: completeSwapRequest || swapRequest,
      message: 'Swap request created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in swap-request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
