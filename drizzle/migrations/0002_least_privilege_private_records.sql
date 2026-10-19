REVOKE ALL ON public.profiles, public.user_media_status FROM anon;
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;