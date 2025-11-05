"use server"

import { createClient } from "@/lib/supabase/server"

interface SwapRequest {
  id: string
  requester_id: string
  responder_id: string
  requester_slot_id: string
  responder_slot_id: string
  status: string
}

export async function acceptSwapRequestAction(request: SwapRequest) {
  const supabase = await createClient()

  try {
    console.log("[v0] Server action: accepting swap:", request.id)

    // Use RPC function with server client (has service role permissions)
    const { data, error } = await supabase.rpc("accept_swap_request", {
      p_swap_request_id: request.id,
      p_requester_id: request.requester_id,
      p_responder_id: request.responder_id,
      p_requester_slot_id: request.requester_slot_id,
      p_responder_slot_id: request.responder_slot_id,
    })

    if (error) {
      console.error("[v0] RPC error:", error)
      throw new Error(error.message || "Failed to accept swap")
    }

    console.log("[v0] Swap accepted:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in server action:", error)
    throw error
  }
}

export async function rejectSwapRequestAction(request: SwapRequest) {
  const supabase = await createClient()

  try {
    console.log("[v0] Server action: rejecting swap:", request.id)

    const { data, error } = await supabase.rpc("reject_swap_request", {
      p_swap_request_id: request.id,
      p_requester_slot_id: request.requester_slot_id,
      p_responder_slot_id: request.responder_slot_id,
    })

    if (error) {
      console.error("[v0] RPC error:", error)
      throw new Error(error.message || "Failed to reject swap")
    }

    console.log("[v0] Swap rejected:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in server action:", error)
    throw error
  }
}
