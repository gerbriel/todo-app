-- Create themes table for admin panel
CREATE TABLE IF NOT EXISTS public.themes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    colors jsonb DEFAULT '{}',
    fields jsonb DEFAULT '[]',
    labels jsonb DEFAULT '[]',
    is_default boolean DEFAULT false,
    is_global boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view global themes" ON public.themes
    FOR SELECT USING (is_global = true);

CREATE POLICY "Authenticated users can view their themes" ON public.themes
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Admins can insert themes" ON public.themes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

CREATE POLICY "Admins can update themes" ON public.themes
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

CREATE POLICY "Admins can delete themes" ON public.themes
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

-- Create admin_settings table for application settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key text UNIQUE NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_by uuid REFERENCES auth.users(id),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin settings policies
CREATE POLICY "Everyone can view admin settings" ON public.admin_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage admin settings" ON public.admin_settings
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('default_board_template', '"kanban"', 'Default board template for new users'),
('max_cards_per_list', '100', 'Maximum number of cards allowed per list'),
('allow_guest_access', 'true', 'Whether to allow guest users'),
('enable_email_notifications', 'false', 'Enable email notifications system'),
('app_maintenance_mode', 'false', 'Enable maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    target_type text,
    target_id text,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for activity log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log policies
CREATE POLICY "Admins can view activity log" ON public.admin_activity_log
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

CREATE POLICY "Admins can insert activity log" ON public.admin_activity_log
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'
        )
    );

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_action text,
    p_target_type text DEFAULT NULL,
    p_target_id text DEFAULT NULL,
    p_details jsonb DEFAULT '{}'
) RETURNS void AS $$
BEGIN
    INSERT INTO public.admin_activity_log (
        admin_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_target_type,
        p_target_id,
        p_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.themes TO authenticated;
GRANT ALL ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_activity_log TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_activity TO authenticated;

-- Create SQL execution function for admin panel
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    rec record;
    results jsonb[] := '{}';
BEGIN
    -- Only allow admins to execute SQL
    IF NOT (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%admin%' 
            OR id = 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'::uuid
        )
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    -- Allow SELECT, INSERT, UPDATE, CREATE TABLE, ALTER TABLE, but prevent destructive operations
    IF query ILIKE '%DROP TABLE%' OR query ILIKE '%DROP DATABASE%' OR query ILIKE '%TRUNCATE%' THEN
        RAISE EXCEPTION 'Destructive operations not allowed via SQL console.';
    END IF;
    
    -- Try to execute the query
    BEGIN
        -- For queries that return data
        IF query ILIKE 'SELECT%' OR query ILIKE 'WITH%' THEN
            FOR rec IN EXECUTE query LOOP
                results := results || to_jsonb(rec);
            END LOOP;
            RETURN to_jsonb(results);
        ELSE
            -- For DDL/DML operations
            EXECUTE query;
            RETURN '{"status": "success", "message": "Query executed successfully"}'::jsonb;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'error', true,
                'message', SQLERRM,
                'detail', SQLSTATE
            );
    END;
END;
$$;

GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;