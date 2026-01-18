-- Create table to track rate limit notifications to avoid spamming
CREATE TABLE public.rate_limit_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  threshold_percent INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient lookups
CREATE INDEX idx_rate_limit_notifications_key_date ON public.rate_limit_notifications (api_key_id, sent_at);

-- Enable RLS
ALTER TABLE public.rate_limit_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own rate limit notifications"
  ON public.rate_limit_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert rate limit notifications"
  ON public.rate_limit_notifications
  FOR INSERT
  WITH CHECK (true);