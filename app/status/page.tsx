'use client';

import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
    const systems = [
        { name: 'Core Platform', status: 'OPERATIONAL', uptime: '99.99%' },
        { name: 'Database Clusters', status: 'OPERATIONAL', uptime: '100%' },
        { name: 'File Storage (SharePoint)', status: 'OPERATIONAL', uptime: '99.95%' },
        { name: 'Email Notifications', status: 'OPERATIONAL', uptime: '99.98%' },
        { name: 'Search Engine', status: 'DEGRADED', uptime: '98.50%', message: 'Indexing latency higher than normal' },
        { name: 'Third-party Integrations', status: 'OPERATIONAL', uptime: '99.90%' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return <CheckCircle2 className="w-5 h-5 text-success" />;
            case 'DEGRADED': return <AlertTriangle className="w-5 h-5 text-warning" />;
            case 'DOWN': return <AlertCircle className="w-5 h-5 text-error" />;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return 'Operationeel';
            case 'DEGRADED': return 'Prestatieproblemen';
            case 'DOWN': return 'Storing';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return 'bg-success/10 text-success border-success/20';
            case 'DEGRADED': return 'bg-warning/10 text-warning border-warning/20';
            case 'DOWN': return 'bg-error/10 text-error border-error/20';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link href="/support" className="text-dark-100 hover:text-primary mb-4 inline-block">
                        &larr; Terug naar Support
                    </Link>
                    <h1 className="text-3xl font-bold text-dark">Systeem Status</h1>
                    <p className="text-dark-100">Actuele status van alle platform services.</p>
                </div>

                <div className="card divide-y divide-light-300">
                    <div className="p-6 bg-success/5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark">Alle systemen operationeel</h2>
                            <p className="text-dark-100">Laatst geupdate: {new Date().toLocaleTimeString('nl-NL')}</p>
                        </div>
                    </div>

                    {systems.map((system) => (
                        <div key={system.name} className="p-6 flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-dark">{system.name}</h3>
                                {system.message && (
                                    <p className="text-sm text-warning mt-1">{system.message}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(system.status)}`}>
                                    {getStatusIcon(system.status)}
                                    {getStatusText(system.status)}
                                </div>
                                <p className="text-xs text-dark-100 mt-2">Uptime: {system.uptime}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-sm text-dark-100">
                    <p>Problemen ondervonden die hier niet staan vermeld?</p>
                    <Link href="/support/create" className="text-primary font-bold hover:underline">
                        Meld een incident
                    </Link>
                </div>
            </div>
        </div>
    );
}
