'use client';

import QuizPlayer from '@/components/training/QuizPlayer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }: { params: { quizId: string } }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-light py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-dark-100 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Terug
                </button>

                <QuizPlayer quizId={params.quizId} />
            </div>
        </div>
    );
}
