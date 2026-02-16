import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tchub-omega.vercel.app'

  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true }
  })

  const postEntries = posts.map((post: { id: string; updatedAt: Date }) => ({
    url: `${baseUrl}/discussions/${post.id}`,
    lastModified: post.updatedAt,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/training`, lastModified: new Date() },
    { url: `${baseUrl}/support`, lastModified: new Date() },
    { url: `${baseUrl}/platform-status`, lastModified: new Date() },
    { url: `${baseUrl}/ideas`, lastModified: new Date() }
  ]

  return [...staticPages, ...postEntries]
}