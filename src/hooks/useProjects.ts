import { useState, useEffect } from 'react';
import { supabase, SolarProject } from '../lib/supabase';
import { AnalysisState } from '../store/types';
import { useAuth } from './useAuth';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's projects
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('solar_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Save a new project
  const saveProject = async (projectData: AnalysisState, projectName?: string) => {
    if (!user) {
      throw new Error('User must be logged in to save projects');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('solar_projects')
        .insert({
          user_id: user.id,
          name: projectName || projectData.projectName || 'Untitled Solar Project',
          address: projectData.settings.address,
          project_data: projectData
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local projects list
      setProjects(prev => [data, ...prev]);

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, projectData: AnalysisState, projectName?: string) => {
    if (!user) {
      throw new Error('User must be logged in to update projects');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('solar_projects')
        .update({
          name: projectName || projectData.projectName || 'Untitled Solar Project',
          address: projectData.settings.address,
          project_data: projectData
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local projects list
      setProjects(prev => prev.map(p => p.id === projectId ? data : p));

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string) => {
    if (!user) {
      throw new Error('User must be logged in to delete projects');
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('solar_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local projects list
      setProjects(prev => prev.filter(p => p.id !== projectId));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Load a project
  const loadProject = async (projectId: string): Promise<{ success: boolean; data?: AnalysisState; error?: string }> => {
    if (!user) {
      throw new Error('User must be logged in to load projects');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('solar_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.project_data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  return {
    projects,
    loading,
    error,
    saveProject,
    updateProject,
    deleteProject,
    loadProject,
    fetchProjects
  };
};