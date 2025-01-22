-- Remove automatic user creation and update triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

DROP FUNCTION IF EXISTS public.handle_user_creation();
DROP FUNCTION IF EXISTS public.handle_user_update(); 