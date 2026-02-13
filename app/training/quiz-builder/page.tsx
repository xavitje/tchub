'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import QuizBuilder from '@/components/training/QuizBuilder';
import { Suspense } from 'react';

function QuizBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const moduleId = searchParams.get('moduleId');
    const courseId = searchParams.get('courseId');

    if (!moduleId && !courseId) {
        return <div>Invalid parameters</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <QuizBuilder
                moduleId={moduleId || undefined}
                courseId={courseId || undefined}
                onCancel={() => router.back()}
            />
        </div>
    );
}

export default function QuizBuilderPage() {
    return (
        <div className="min-h-screen bg-light py-8 px-4">
            <Suspense fallback={<div>Loading...</div>}>
                <QuizBuilderContent />
            </Suspense>
        </div>
    );
}
