CREATE TABLE public.user_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  area text NOT NULL,
  media_id text,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ideas_area CHECK (area IN ('guion','produccion','montaje','analisis')),
  CONSTRAINT ideas_title_len CHECK (char_length(title) BETWEEN 1 AND 120),
  CONSTRAINT ideas_body_len CHECK (char_length(body) BETWEEN 1 AND 5000)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ideas TO authenticated;
GRANT ALL ON public.user_ideas TO service_role;
ALTER TABLE public.user_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY ideas_own ON public.user_ideas FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY ideas_mfa ON public.user_ideas AS RESTRICTIVE FOR ALL TO authenticated USING (public.cinetrack_assurance_ok()) WITH CHECK (public.cinetrack_assurance_ok());

CREATE OR REPLACE FUNCTION public.my_notifications()
RETURNS TABLE(kind text, activity_id text, actor text, body text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM (
    SELECT 'like'::text, l.activity_id, COALESCE(p.pseudonym, p.display_name, 'Cinéfilo'), NULL::text, l.created_at
    FROM post_likes l JOIN activity_feed a ON a.id::text = l.activity_id
    LEFT JOIN profiles p ON p.id = l.user_id
    WHERE a.user_id = auth.uid() AND l.user_id <> auth.uid()
    UNION ALL
    SELECT 'comment', c.activity_id, c.display_name, c.body, c.created_at
    FROM post_comments c JOIN activity_feed a ON a.id::text = c.activity_id
    WHERE a.user_id = auth.uid() AND c.user_id <> auth.uid()
  ) n ORDER BY 5 DESC LIMIT 30
$$;
REVOKE EXECUTE ON FUNCTION public.my_notifications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_notifications() TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;