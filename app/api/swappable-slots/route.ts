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

    console.log('[DEBUG] User ID:', user.id)

    // Get all SWAPPABLE slots from other users (not the logged-in user)
    const { data: swappableSlots, error } = await supabase
      .from('events')
      .select(`
        id,
        user_id,
        title,
        description,
        start_time,
        end_time,
        status,
        created_at,
        updated_at
      `)
      .eq('status', 'SWAPPABLE')
      .neq('user_id', user.id)

    if (error) {
      console.error('Error fetching swappable slots:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch swappable slots',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('[DEBUG] Found swappable slots:', swappableSlots?.length || 0)

    return NextResponse.json({ 
      slots: swappableSlots || [],
      count: swappableSlots?.length || 0,
      user_id: user.id // For debugging
    })

  } catch (error) {
    console.error('Unexpected error in swappable-slots:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
