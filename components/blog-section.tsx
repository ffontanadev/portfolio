import { getAllPosts } from "@/lib/blog"
import { BlogStackedCards } from "./blog-stacked-cards"

export function BlogSection() {
  const posts = getAllPosts()

  if (posts.length === 0) {
    return null
  }

  return (
    <section id="blog" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#f97316] to-[#ea580c] bg-clip-text text-transparent">
            Blog & Artículos
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comparto conocimientos, experiencias y mejores prácticas del desarrollo web moderno
          </p>
        </div>

        {/* Stacked Cards */}
        <BlogStackedCards posts={posts} />
      </div>
    </section>
  )
}
