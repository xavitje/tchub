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

        const { id: postId } = params;
        const userId = session.user.id;

        // Check if already liked
        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.postLike.delete({
                    where: {
                        postId_userId: {
                            postId,
                            userId
                        }
                    }
                }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likeCount: { decrement: 1 } }
                })
            ]);
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.$transaction([
                prisma.postLike.create({
                    data: {
                        postId,
                        userId
                    }
                }),
                prisma.post.update({
                    where: { id: postId },
                    data: { likeCount: { increment: 1 } }
                })
            ]);
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
