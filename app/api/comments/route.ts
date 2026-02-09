import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { postId, authorId, content, parentId } = body;

        if (!postId || !authorId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify author exists
        const author = await prisma.user.findUnique({
            where: { id: authorId }
        });

        if (!author) {
            return NextResponse.json({ error: 'Author not found' }, { status: 404 });
        }

        const comment = await prisma.comment.create({
            data: {
                postId,
                authorId,
                content,
                parentId: parentId || null,
            },
            include: {
                author: true,
            },
        });

        // Update comment count on post
        await prisma.post.update({
            where: { id: postId },
            data: {
                commentCount: {
                    increment: 1,
                },
            },
        });

        // Create notification for the post author
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, title: true }
        });

        if (post && post.authorId !== authorId) {
            await prisma.notification.create({
                data: {
                    userId: post.authorId,
                    type: 'NEW_COMMENT',
                    title: `Nieuwe reactie op "${post.title}"`,
                    message: `${author.displayName} heeft gereageerd: "${content.length > 50 ? content.substring(0, 47) + '...' : content}"`,
                    link: `/discussions/${postId}`
                }
            });
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
