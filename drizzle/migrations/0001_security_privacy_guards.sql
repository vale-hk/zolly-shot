REVOKE SELECT ON public.media_items, public.quotes, public.activity_feed FROM anon, authenticated;
GRANT SELECT (id,title,year,genre,poster_url,type,synopsis,director,duration) ON public.media_items TO anon, authenticated;
GRANT SELECT (id,media_id,quote_text,timestamp,display_name,created_at) ON public.quotes TO anon, authenticated;
GRANT SELECT (id,media_id,action_type,comment,rating,display_name,created_at) ON public.activity_feed TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_cinetrack_profile() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.create_cinetrack_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles(id,display_name) VALUES (new.id,left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'),''),'Cinéfilo'),60));
  RETURN new;
END; $$;
COMMENT ON COLUMN public.profiles.avatar_url IS 'DEPRECATED: CineTrack collects only a display name.';
CREATE FUNCTION public.cinetrack_assurance_ok() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT auth.uid() IS NOT NULL AND ((auth.jwt()->>'aal') = 'aal2' OR NOT EXISTS (SELECT 1 FROM auth.mfa_factors WHERE user_id = auth.uid() AND status = 'verified'));
$$;
REVOKE ALL ON FUNCTION public.cinetrack_assurance_ok() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cinetrack_assurance_ok() TO authenticated, service_role;
CREATE POLICY library_mfa ON public.user_media_status AS RESTRICTIVE FOR ALL TO authenticated USING(public.cinetrack_assurance_ok()) WITH CHECK(public.cinetrack_assurance_ok());
CREATE POLICY profile_mfa ON public.profiles AS RESTRICTIVE FOR ALL TO authenticated USING(public.cinetrack_assurance_ok()) WITH CHECK(public.cinetrack_assurance_ok());
CREATE POLICY catalog_mfa_write ON public.media_items AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.cinetrack_assurance_ok());
CREATE POLICY quotes_mfa_write ON public.quotes AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.cinetrack_assurance_ok());
CREATE POLICY feed_mfa_write ON public.activity_feed AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK(public.cinetrack_assurance_ok());
CREATE FUNCTION public.validate_cinetrack_content() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_TABLE_NAME = 'profiles' THEN
   IF length(btrim(new.display_name)) NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'invalid display name' USING ERRCODE = '23514'; END IF;
   new.avatar_url := NULL;
 ELSIF TG_TABLE_NAME = 'media_items' THEN
   IF length(btrim(new.title)) NOT BETWEEN 1 AND 120 OR length(new.genre) NOT BETWEEN 1 AND 60 OR new.year < 1888 OR new.year > extract(year FROM current_date)+2 OR length(new.poster_url) > 2048 OR new.poster_url !~ '^https://' OR coalesce(length(new.synopsis),0) > 2000 OR coalesce(length(new.director),0) > 120 OR (new.duration IS NOT NULL AND new.duration NOT BETWEEN 1 AND 10000) THEN RAISE EXCEPTION 'invalid media' USING ERRCODE = '23514'; END IF;
 ELSE
   IF length(new.media_id) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'invalid media id' USING ERRCODE = '23514'; END IF;
   SELECT display_name INTO new.display_name FROM public.profiles WHERE id = new.user_id;
   new.display_name := coalesce(new.display_name,'Cinéfilo');
   IF TG_TABLE_NAME = 'activity_feed' THEN
     IF coalesce(length(new.comment),0) > 300 OR (new.rating IS NOT NULL AND (new.rating < 0.5 OR new.rating > 5 OR new.rating*2 <> trunc(new.rating*2))) THEN RAISE EXCEPTION 'invalid activity' USING ERRCODE = '23514'; END IF;
   ELSE
     IF length(btrim(new.quote_text)) NOT BETWEEN 3 AND 300 OR (new.timestamp <> '—' AND new.timestamp !~ '^[0-9]{1,2}:[0-5][0-9]:[0-5][0-9]$') THEN RAISE EXCEPTION 'invalid quote' USING ERRCODE = '23514'; END IF;
   END IF;
 END IF;
 RETURN new;
END; $$;
REVOKE ALL ON FUNCTION public.validate_cinetrack_content() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_cinetrack_content();
CREATE TRIGGER validate_media BEFORE INSERT OR UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.validate_cinetrack_content();
CREATE TRIGGER validate_quote BEFORE INSERT OR UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.validate_cinetrack_content();
CREATE TRIGGER validate_activity BEFORE INSERT OR UPDATE ON public.activity_feed FOR EACH ROW EXECUTE FUNCTION public.validate_cinetrack_content();