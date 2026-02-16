import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jouwdomein.nl'

  // 1. Posts ophalen
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true }
  })

  // Voeg types toe aan de 'post' parameter
  const postEntries = posts.map((post: { id: string; updatedAt: Date }) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: post.updatedAt,
  }))

  // 2. Hubs ophalen
  const hubs = await prisma.hub.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  })

  // Voeg types toe aan de 'hub' parameter
  const hubEntries = hubs.map((hub: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/hubs/${hub.slug}`,
    lastModified: hub.updatedAt,
  }))

  // 3. Statische pagina's
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/training`, lastModified: new Date() },
    { url: `${baseUrl}/support`, lastModified: new Date() },
  ]

  return [...staticPages, ...postEntries, ...hubEntries]
}