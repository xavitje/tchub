'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, ThumbsUp, Bookmark, Share2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';

export default function PostDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const { showNotification } = useNotification();

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${params.id}`);
                const data = await res.json();
                if (data.id) {
                    setPost(data);
                }
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [params.id]);

    const handleLike = async () => {
        if (!session?.user?.id) return;

        // Optimistic update
        const isLiked = post.likedByMe;
        setPost({
            ...post,
            likedByMe: !isLiked,
            likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
        });

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to toggle like');
        } catch (error) {
            // Revert on error
            setPost({
                ...post,
                likedByMe: isLiked,
                likeCount: post.likeCount
            });
            showNotification('error', 'Kon like niet updaten');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            showNotification('error', 'Je moet ingelogd zijn om te reageren');
            return;
        }

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: params.id,
                    authorId: session.user.id,
                    content: newComment,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to submit comment');
            }

            const data = await res.json();
            if (data.id) {
                setPost({
                    ...post,
                    comments: [data, ...(post.comments || [])],
                    commentCount: post.commentCount + 1,
                });
                setNewComment('');
                showNotification('success', 'Reactie geplaatst');
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
            showNotification('error', 'Kon reactie niet plaatsen');
        }
    };

    const handleReplySubmit = async (commentId: string) => {
        if (!session?.user?.id) return;

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: params.id,
                    authorId: session.user.id,
                    content: replyContent,
                    parentId: commentId,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit reply');

            const data = await res.json();
            if (data.id) {
                // Find parent comment and add reply
                const updatedComments = post.comments.map((c: any) => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), data],
                        };
                    }
                    return c;
                });
                setPost({
                    ...post,
                    comments: updatedComments,
                    commentCount: post.commentCount + 1,
                });
                setReplyContent('');
                setReplyingTo(null);
                showNotification('success', 'Antwoord geplaatst');
            }
        } catch (error) {
            console.error('Failed to submit reply:', error);
            showNotification('error', 'Kon antwoord niet plaatsen');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Post niet gevonden</h1>
                <Link href="/discussions" className="text-primary hover:underline">Terug naar discussies</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-dark-100 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Terug
                </button>

                <div className="card p-8 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {post.author?.profileImage ? (
                                <img src={post.author.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{post.author?.displayName?.substring(0, 2).toUpperCase() || '??'}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-dark">{post.author?.displayName}</span>
                                {post.isPinned && (
                                    <span className="badge bg-primary text-white text-xs">Gepind</span>
                                )}
                            </div>
                            <span className="text-sm text-dark-100">{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-dark mb-4">{post.title}</h1>

                    {post.imageUrl && (
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full max-h-96 object-cover rounded-lg mb-6 border border-light-400"
                        />
                    )}

                    <div className="prose max-w-none mb-6">
                        <p className="text-dark-100 whitespace-pre-line">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-dark-100 mb-6 pb-6 border-b border-light-400">
                        <span>{post.viewCount} weergaven</span>
                        <span>•</span>
                        <span>{post.likeCount} likes</span>
                        <span>•</span>
                        <span>{post.commentCount} reacties</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            className={`btn ${post.likedByMe ? 'btn-primary' : 'btn-outline'} flex items-center gap-2 transition-all`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                            {post.likedByMe ? 'Liked' : 'Like'}
                        </button>
                        <button className="btn btn-outline flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Reageer
                        </button>
                        <button className="btn btn-outline flex items-center gap-2">
                            <Bookmark className="w-4 h-4" />
                            Opslaan
                        </button>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-dark mb-6">
                        Reacties ({post.commentCount})
                    </h2>

                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="input min-h-[100px] mb-3"
                            placeholder="Schrijf een reactie..."
                            required
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="btn btn-primary">
                                Plaats reactie
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        {(post.comments || []).map((comment: any) => (
                            <div key={comment.id} className="border-b border-light-400 pb-6 last:border-0">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                        {comment.author?.profileImage ? (
                                            <img src={comment.author.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span>{comment.author?.displayName?.substring(0, 2).toUpperCase() || '??'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-dark">{comment.author?.displayName}</span>
                                            <span className="text-sm text-dark-100">• {new Date(comment.createdAt).toLocaleDateString('nl-NL')}</span>
                                        </div>
                                        <p className="text-dark-100 mb-3">{comment.content}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <button className="text-dark-100 hover:text-primary transition-colors">
                                                👍 {comment.likeCount}
                                            </button>
                                            <button
                                                onClick={() => setReplyingTo(comment.id)}
                                                className="text-dark-100 hover:text-primary transition-colors"
                                            >
                                                Reageer
                                            </button>
                                        </div>

                                        {replyingTo === comment.id && (
                                            <div className="mt-4 ml-4 pl-4 border-l-2 border-primary">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    className="input min-h-[80px] mb-2"
                                                    placeholder="Schrijf een reply..."
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReplySubmit(comment.id)}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Reageer
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Annuleer
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-4 ml-4 pl-4 border-l-2 border-light-400 space-y-4">
                                                {comment.replies.map((reply: any) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                                            <span>{reply.author?.displayName?.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-dark text-sm">{reply.author?.displayName}</span>
                                                                <span className="text-xs text-dark-100">• {new Date(reply.createdAt).toLocaleDateString('nl-NL')}</span>
                                                            </div>
                                                            <p className="text-dark-100 text-sm mb-2">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
