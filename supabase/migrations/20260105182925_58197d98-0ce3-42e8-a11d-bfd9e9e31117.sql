-- Create function to increment API request count
CREATE OR REPLACE FUNCTION public.increment_api_requests(key_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys 
  SET 
    requests_today = requests_today + 1,
    last_used_at = now()
  WHERE id = key_id;
END;
$$;

-- Create function to reset daily request counts (can be called via cron)
CREATE OR REPLACE FUNCTION public.reset_daily_api_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys SET requests_today = 0;
END;
$$;