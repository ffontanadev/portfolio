import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../services/blog';
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPostFilters,
} from '../types/blog';

const QUERY_KEYS = {
  posts: ['blog', 'posts'] as const,
  publishedPosts: (page: number, limit: number, filters?: BlogPostFilters) =>
    ['blog', 'published', page, limit, filters] as const,
  allPosts: (page: number, limit: number, filters?: BlogPostFilters) =>
    ['blog', 'all', page, limit, filters] as const,
  postBySlug: (slug: string) => ['blog', 'post', 'slug', slug] as const,
  postById: (id: string) => ['blog', 'post', 'id', id] as const,
  tags: ['blog', 'tags'] as const,
};

export function usePublishedPosts(
  page = 1,
  limit = 10,
  filters?: BlogPostFilters
) {
  return useQuery({
    queryKey: QUERY_KEYS.publishedPosts(page, limit, filters),
    queryFn: () => blogService.getPublishedPosts(page, limit, filters),
  });
}

export function useAllPosts(
  page = 1,
  limit = 10,
  filters?: BlogPostFilters
) {
  return useQuery({
    queryKey: QUERY_KEYS.allPosts(page, limit, filters),
    queryFn: () => blogService.getAllPosts(page, limit, filters),
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.postBySlug(slug),
    queryFn: () => blogService.getPostBySlug(slug),
    enabled: !!slug,
  });
}

export function usePostById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.postById(id),
    queryFn: () => blogService.getPostById(id),
    enabled: !!id,
  });
}

export function useTags() {
  return useQuery({
    queryKey: QUERY_KEYS.tags,
    queryFn: () => blogService.getAllTags(),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogPostInput) => blogService.createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogPostInput }) =>
      blogService.updatePost(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postBySlug(data.slug) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(data.id) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.publishPost(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postBySlug(data.slug) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
  });
}

export function useUnpublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.unpublishPost(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postBySlug(data.slug) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postById(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags });
    },
  });
}
