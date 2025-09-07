import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PollutionIncident {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  pollution_type: 'plastic' | 'oil_spill' | 'debris' | 'chemical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  ai_analysis: any;
  status: 'reported' | 'verified' | 'investigating' | 'resolved';
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    organization: string | null;
    role: string | null;
  };
}

export function usePollutionData() {
  const [incidents, setIncidents] = useState<PollutionIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pollution_incidents')
        .select(`
          *,
          profiles (
            display_name,
            organization,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents((data || []) as unknown as PollutionIncident[]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incident: Omit<PollutionIncident, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
    try {
      const { data, error } = await supabase
        .from('pollution_incidents')
        .insert([incident])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchIncidents();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateIncident = async (id: string, updates: Partial<PollutionIncident>) => {
    try {
      const { data, error } = await supabase
        .from('pollution_incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchIncidents();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pollution_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      await fetchIncidents();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Set up real-time subscription
    const channel = supabase
      .channel('pollution_incidents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pollution_incidents'
        },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident
  };
}