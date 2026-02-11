import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const post = await prisma.post.findUnique({
            where: { id: params.id },
            include: {
                author: true,
                event: {
                    include: {
                        registrations: true,
                    },
                },
                favorites: userId ? {
                    where: { userId: userId }
                } : false,
                likes: userId ? {
                    where: { userId: userId }
                } : false,
                comments: {
                    include: {
                        author: true,
                        replies: {
                            include: {
                                author: true,
                            },
                        },
                    },
                    where: {
                        parentId: null, // Only top-level comments
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const postWithLikeStatus = {
            ...post,
            likedByMe: userId ? post.likes.length > 0 : false,
            isFavorited: userId ? post.favorites.length > 0 : false,
            likes: undefined,
            favorites: undefined,
        };

        return NextResponse.json(postWithLikeStatus);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}
