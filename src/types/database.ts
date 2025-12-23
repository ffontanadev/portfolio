export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          excerpt: string | null;
          author: string;
          status: 'draft' | 'published';
          published_at: string | null;
          created_at: string;
          updated_at: string;
          tags: string[] | null;
          meta_description: string | null;
          meta_keywords: string[] | null;
          featured_image_url: string | null;
          reading_time_minutes: number | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          excerpt?: string | null;
          author: string;
          status?: 'draft' | 'published';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          featured_image_url?: string | null;
          reading_time_minutes?: number | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author?: string;
          status?: 'draft' | 'published';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[] | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          featured_image_url?: string | null;
          reading_time_minutes?: number | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
