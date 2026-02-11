import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: params.id
                }
            }
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: { id: existingFavorite.id }
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Check if post exists
            const post = await prisma.post.findUnique({
                where: { id: params.id }
            });

            if (!post) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }

            const favorite = await prisma.favorite.create({
                data: {
                    userId: session.user.id,
                    postId: params.id,
                    type: 'POST'
                }
            });
            return NextResponse.json({ favorited: true, id: favorite.id });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
