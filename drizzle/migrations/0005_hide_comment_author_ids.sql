REVOKE SELECT ON public.post_comments FROM anon, authenticated;
GRANT SELECT (id, activity_id, display_name, body, created_at) ON public.post_comments TO anon, authenticated;