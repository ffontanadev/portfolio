# Supabase Database Setup

This directory contains the database schema and setup instructions for the blog feature.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in your project details:
   - Name: Your project name
   - Database Password: Choose a strong password (save this!)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for setup to complete

### 2. Set Up Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy your project URL and anon public key
3. Create a `.env` file in the root of your portfolio project:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Create the Database Schema

1. In your Supabase project dashboard, go to the SQL Editor
2. Click "New Query"
3. Copy the entire contents of `schema.sql` from this directory
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL

This will create:
- The `blog_posts` table with all necessary columns
- Indexes for performance optimization
- Row Level Security (RLS) policies for secure access
- Automatic triggers for `updated_at` and `reading_time_minutes`

### 4. Verify the Setup

1. Go to the Table Editor in your Supabase dashboard
2. You should see the `blog_posts` table
3. Click on it to view the schema

## Database Schema

### blog_posts Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| slug | VARCHAR(255) | URL-friendly unique identifier |
| title | VARCHAR(500) | Post title |
| content | TEXT | Markdown content |
| excerpt | TEXT | Optional short summary |
| author | VARCHAR(255) | Author name |
| status | VARCHAR(20) | 'draft' or 'published' |
| published_at | TIMESTAMPTZ | When the post was published |
| created_at | TIMESTAMPTZ | When the post was created |
| updated_at | TIMESTAMPTZ | Auto-updated on changes |
| tags | TEXT[] | Array of tag strings |
| meta_description | TEXT | SEO meta description |
| meta_keywords | TEXT[] | SEO keywords |
| featured_image_url | TEXT | URL to featured image |
| reading_time_minutes | INTEGER | Auto-calculated reading time |

## Security

Row Level Security (RLS) is enabled with the following policies:

- **Public users**: Can view published posts only
- **Authenticated users**: Can view, create, update, and delete all posts

## Authentication Setup (Optional)

To enable the admin interface, you'll need to set up authentication:

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Email provider (already enabled by default)
3. Go to Authentication > Users
4. Click "Invite user" or "Add user" to create your admin account
5. Use this email/password to log into the admin interface

## Testing

You can test the setup by:

1. Going to the Table Editor
2. Manually inserting a test blog post
3. Setting its status to 'published'
4. Running your app and navigating to `/blog`
