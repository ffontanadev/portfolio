import { supabase } from '../lib/supabase';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPostListItem,
  PaginatedBlogPosts,
  BlogPostFilters,
} from '../types/blog';

export class BlogServiceError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'BlogServiceError';
    this.code = code;
    this.details = details;
  }
}

export const blogService = {
  async getPublishedPosts(
    page = 1,
    limit = 10,
    filters?: BlogPostFilters
  ): Promise<PaginatedBlogPosts> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, author, published_at, created_at, tags, featured_image_url, reading_time_minutes', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      if (filters?.author) {
        query = query.eq('author', filters.author);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw new BlogServiceError('Failed to fetch published posts', error.code, error);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        posts: (data || []) as BlogPostListItem[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error fetching published posts', undefined, error);
    }
  },

  async getAllPosts(
    page = 1,
    limit = 10,
    filters?: BlogPostFilters
  ): Promise<PaginatedBlogPosts> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, author, published_at, created_at, tags, featured_image_url, reading_time_minutes', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      if (filters?.author) {
        query = query.eq('author', filters.author);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw new BlogServiceError('Failed to fetch all posts', error.code, error);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        posts: (data || []) as BlogPostListItem[],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error fetching all posts', undefined, error);
    }
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new BlogServiceError('Failed to fetch post by slug', error.code, error);
      }

      return data as BlogPost;
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error fetching post by slug', undefined, error);
    }
  },

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new BlogServiceError('Failed to fetch post by ID', error.code, error);
      }

      return data as BlogPost;
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error fetching post by ID', undefined, error);
    }
  },

  async createPost(input: CreateBlogPostInput): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([input as never])
        .select()
        .single();

      if (error) {
        throw new BlogServiceError('Failed to create post', error.code, error);
      }

      return data as BlogPost;
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error creating post', undefined, error);
    }
  },

  async updatePost(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(input as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new BlogServiceError('Failed to update post', error.code, error);
      }

      return data as BlogPost;
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error updating post', undefined, error);
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new BlogServiceError('Failed to delete post', error.code, error);
      }
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error deleting post', undefined, error);
    }
  },

  async publishPost(id: string): Promise<BlogPost> {
    return this.updatePost(id, {
      status: 'published',
      published_at: new Date().toISOString(),
    });
  },

  async unpublishPost(id: string): Promise<BlogPost> {
    return this.updatePost(id, {
      status: 'draft',
    });
  },

  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published');

      if (error) {
        throw new BlogServiceError('Failed to fetch tags', error.code, error);
      }

      const tagsSet = new Set<string>();
      (data as Array<{ tags?: string[] | null }>)?.forEach((post) => {
        post.tags?.forEach((tag: string) => tagsSet.add(tag));
      });

      return Array.from(tagsSet).sort();
    } catch (error) {
      if (error instanceof BlogServiceError) throw error;
      throw new BlogServiceError('Unexpected error fetching tags', undefined, error);
    }
  },
};
