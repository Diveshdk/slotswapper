-- Create functions to handle swaps atomically with SECURITY DEFINER
create or replace function public.accept_swap_request(
  p_swap_request_id uuid,
  p_requester_id uuid,
  p_responder_id uuid,
  p_requester_slot_id uuid,
  p_responder_slot_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  -- Update swap request status
  update public.swap_requests
  set status = 'ACCEPTED', updated_at = now()
  where id = p_swap_request_id;

  -- Transfer requester's slot to responder
  update public.events
  set user_id = p_responder_id, status = 'BUSY', updated_at = now()
  where id = p_requester_slot_id;

  -- Transfer responder's slot to requester
  update public.events
  set user_id = p_requester_id, status = 'BUSY', updated_at = now()
  where id = p_responder_slot_id;

  v_result := json_build_object(
    'success', true,
    'message', 'Swap accepted and ownership transferred'
  );

  return v_result;
end;
$$;

create or replace function public.reject_swap_request(
  p_swap_request_id uuid,
  p_requester_slot_id uuid,
  p_responder_slot_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  -- Update swap request status
  update public.swap_requests
  set status = 'REJECTED', updated_at = now()
  where id = p_swap_request_id;

  -- Revert both slots to SWAPPABLE
  update public.events
  set status = 'SWAPPABLE', updated_at = now()
  where id in (p_requester_slot_id, p_responder_slot_id);

  v_result := json_build_object(
    'success', true,
    'message', 'Swap rejected and slots reverted to SWAPPABLE'
  );

  return v_result;
end;
$$;
