export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  status: BlogPostStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  meta_description?: string;
  meta_keywords?: string[];
  featured_image_url?: string;
  reading_time_minutes?: number;
}

export interface CreateBlogPostInput {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  status?: BlogPostStatus;
  published_at?: string;
  tags?: string[];
  meta_description?: string;
  meta_keywords?: string[];
  featured_image_url?: string;
}

export interface UpdateBlogPostInput {
  slug?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  status?: BlogPostStatus;
  published_at?: string;
  tags?: string[];
  meta_description?: string;
  meta_keywords?: string[];
  featured_image_url?: string;
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  author: string;
  published_at?: string;
  created_at: string;
  tags?: string[];
  featured_image_url?: string;
  reading_time_minutes?: number;
}

export interface PaginatedBlogPosts {
  posts: BlogPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPostFilters {
  status?: BlogPostStatus;
  tag?: string;
  search?: string;
  author?: string;
}
