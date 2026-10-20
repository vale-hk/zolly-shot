ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pseudonym text;
GRANT UPDATE (pseudonym) ON public.profiles TO authenticated;
GRANT SELECT (pseudonym) ON public.profiles TO authenticated;

ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS based_on text;
GRANT SELECT (based_on) ON public.media_items TO anon, authenticated;
GRANT INSERT (based_on) ON public.media_items TO authenticated;

GRANT DELETE ON public.user_media_status TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_zolly_extras()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'profiles' THEN
    NEW.pseudonym := nullif(btrim(NEW.pseudonym), '');
    IF NEW.pseudonym IS NOT NULL AND char_length(NEW.pseudonym) > 40 THEN RAISE EXCEPTION 'invalid pseudonym'; END IF;
  ELSIF TG_TABLE_NAME = 'media_items' THEN
    IF NEW.type <> 'movie' THEN RAISE EXCEPTION 'only movies allowed'; END IF;
    NEW.based_on := nullif(btrim(NEW.based_on), '');
    IF NEW.based_on IS NOT NULL AND char_length(NEW.based_on) > 120 THEN RAISE EXCEPTION 'invalid based_on'; END IF;
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    NEW.body := btrim(NEW.body);
    IF char_length(NEW.body) < 1 OR char_length(NEW.body) > 300 THEN RAISE EXCEPTION 'invalid comment'; END IF;
    IF char_length(NEW.activity_id) < 1 OR char_length(NEW.activity_id) > 100 THEN RAISE EXCEPTION 'invalid post'; END IF;
    SELECT coalesce(display_name, 'Cinéfilo') INTO NEW.display_name FROM public.profiles WHERE id = auth.uid();
    NEW.display_name := coalesce(NEW.display_name, 'Cinéfilo');
  ELSIF TG_TABLE_NAME = 'post_likes' THEN
    IF char_length(NEW.activity_id) < 1 OR char_length(NEW.activity_id) > 100 THEN RAISE EXCEPTION 'invalid post'; END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.validate_zolly_extras() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER zolly_profiles_extras BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_zolly_extras();
CREATE TRIGGER zolly_media_extras BEFORE INSERT OR UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.validate_zolly_extras();

CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  display_name text NOT NULL DEFAULT 'Cinéfilo',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX post_comments_activity_idx ON public.post_comments(activity_id, created_at);
GRANT SELECT (id, activity_id, display_name, body, created_at) ON public.post_comments TO anon, authenticated;
GRANT INSERT (activity_id, body) ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_read ON public.post_comments FOR SELECT USING (true);
CREATE POLICY comments_add ON public.post_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY comments_mfa ON public.post_comments AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.cinetrack_assurance_ok());
CREATE TRIGGER zolly_comments_extras BEFORE INSERT ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.validate_zolly_extras();

CREATE TABLE public.post_likes (
  activity_id text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_own ON public.post_likes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY likes_mfa ON public.post_likes AS RESTRICTIVE FOR ALL TO authenticated USING (public.cinetrack_assurance_ok()) WITH CHECK (public.cinetrack_assurance_ok());
CREATE TRIGGER zolly_likes_extras BEFORE INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.validate_zolly_extras();

CREATE OR REPLACE FUNCTION public.post_like_counts()
RETURNS TABLE (activity_id text, likes bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT activity_id, count(*) FROM public.post_likes GROUP BY activity_id
$$;
REVOKE EXECUTE ON FUNCTION public.post_like_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.post_like_counts() TO anon, authenticated, service_role;