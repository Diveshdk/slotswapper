import { createClient } from "@/lib/supabase/server"

interface SwapRequest {
  id: string
  requester_id: string
  responder_id: string
  requester_slot_id: string
  responder_slot_id: string
  status: string
}

/**
 * Accept a swap request - transfer event ownership (server-side)
 */
export async function acceptSwapRequest(request: SwapRequest) {
  const supabase = createClient()

  try {
    console.log("[v0] Starting swap acceptance for:", request.id)

    // Use a Postgres function to atomically handle the swap
    const { data, error } = await supabase.rpc("accept_swap_request", {
      p_swap_request_id: request.id,
      p_requester_id: request.requester_id,
      p_responder_id: request.responder_id,
      p_requester_slot_id: request.requester_slot_id,
      p_responder_slot_id: request.responder_slot_id,
    })

    if (error) {
      console.error("[v0] RPC Error accepting swap:", error)
      throw new Error(error.message || "Failed to accept swap")
    }

    console.log("[v0] Swap accepted successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in acceptSwapRequest:", error)
    throw error
  }
}

/**
 * Reject a swap request - revert slots to SWAPPABLE
 */
export async function rejectSwapRequest(request: SwapRequest) {
  const supabase = createClient()

  try {
    console.log("[v0] Starting swap rejection for:", request.id)

    // Use a Postgres function for atomic rejection
    const { data, error } = await supabase.rpc("reject_swap_request", {
      p_swap_request_id: request.id,
      p_requester_slot_id: request.requester_slot_id,
      p_responder_slot_id: request.responder_slot_id,
    })

    if (error) {
      console.error("[v0] RPC Error rejecting swap:", error)
      throw new Error(error.message || "Failed to reject swap")
    }

    console.log("[v0] Swap rejected successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in rejectSwapRequest:", error)
    throw error
  }
}
