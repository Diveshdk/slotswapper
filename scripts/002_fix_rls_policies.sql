-- Drop old swap update policy that's too restrictive
drop policy if exists "swap_requests_update_own" on public.swap_requests;

-- New policy: responder can update, but also allow service role for events updates
create policy "swap_requests_update_own" on public.swap_requests 
for update 
using (auth.uid() = responder_id)
with check (auth.uid() = responder_id);

-- Add new events policies to allow ownership transfer during swaps
drop policy if exists "events_update_own" on public.events;

create policy "events_update_own" on public.events 
for update 
using (auth.uid() = user_id);

-- Allow system to update events during swap (status changes)
-- This requires using a trusted transaction
create policy "events_update_swap_status" on public.events 
for update 
using (status IN ('SWAPPABLE', 'SWAP_PENDING'))
with check (true);

-- Also ensure we can read swapped events
drop policy if exists "events_select_own" on public.events;

create policy "events_select_all_own_or_swappable" on public.events 
for select 
using (auth.uid() = user_id OR status = 'SWAPPABLE');
