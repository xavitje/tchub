'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, Printer } from 'lucide-react';

export default function CertificatePage({ params }: { params: { code: string } }) {
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCertificate() {
            try {
                const res = await fetch(`/api/certificates/${params.code}`);
                if (res.ok) {
                    const data = await res.json();
                    setCertificate(data);
                }
            } catch (error) {
                console.error('Error fetching certificate:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCertificate();
    }, [params.code]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!certificate) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                <div className="text-red-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
                <p className="text-gray-500">
                    We couldn't find a certificate with the code <span className="font-mono font-bold">{params.code}</span>.
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center">
            {/* Action Bar */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 print:hidden">
                <a href="/" className="text-gray-500 hover:text-gray-900 font-medium">
                    ← Back to Hub
                </a>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                    <Printer className="w-5 h-5" />
                    Download / Print PDF
                </button>
            </div>

            {/* Certificate Container */}
            <div className="bg-white w-full max-w-5xl aspect-[1.414/1] shadow-2xl relative overflow-hidden print:shadow-none print:w-full print:h-screen print:max-w-none print:m-0 print:rounded-none">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-16 border-8 border-transparent">
                    {/* Border Inner */}
                    <div className="absolute inset-8 border-2 border-gray-200 rounded-lg pointer-events-none"></div>

                    {/* Logo / Header */}
                    <div className="mb-12">
                        {/* Replace with actual logo if available */}
                        <div className="text-3xl font-bold tracking-widest text-primary uppercase mb-2">
                            Travel Counsellors
                        </div>
                        <div className="text-sm text-gray-400 font-medium tracking-[0.2em] uppercase">
                            Training Academy
                        </div>
                    </div>

                    <h1 className="text-6xl font-serif text-gray-900 mb-6 font-medium">
                        Certificate of Completion
                    </h1>

                    <p className="text-xl text-gray-500 mb-2">This is to certify that</p>

                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-8 py-2">
                        {certificate.userName}
                    </h2>

                    <p className="text-xl text-gray-500 mb-4">has successfully completed the course</p>

                    <h3 className="text-3xl font-bold text-gray-800 mb-12 max-w-2xl leading-tight">
                        {certificate.courseTitle}
                    </h3>

                    {/* Signatures / Date */}
                    <div className="w-full max-w-3xl flex justify-between items-end mt-12 px-12">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                                {new Date(certificate.issuedAt).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </div>
                            <div className="h-px w-48 bg-gray-300 mx-auto mb-2"></div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                Date Issued
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <CheckCircle2 className="w-12 h-12 text-primary opacity-20" />
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                                ID: {certificate.code}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 font-script mb-1">
                                Travel Counsellors
                            </div>
                            <div className="h-px w-48 bg-gray-300 mx-auto mb-2"></div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                Verified Authority
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
