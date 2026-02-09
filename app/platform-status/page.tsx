export default function PlatformStatusPage() {
    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-6">Platformstatus</h1>

                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-dark">HubTC Platform</h3>
                            <span className="w-3 h-3 bg-success rounded-full"></span>
                        </div>
                        <p className="text-sm text-dark-100">Operationeel</p>
                        <p className="text-xs text-dark-50 mt-1">Laatste update: 2 min geleden</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-dark">SharePoint</h3>
                            <span className="w-3 h-3 bg-success rounded-full"></span>
                        </div>
                        <p className="text-sm text-dark-100">Operationeel</p>
                        <p className="text-xs text-dark-50 mt-1">Laatste update: 5 min geleden</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-dark">Azure Services</h3>
                            <span className="w-3 h-3 bg-success rounded-full"></span>
                        </div>
                        <p className="text-sm text-dark-100">Operationeel</p>
                        <p className="text-xs text-dark-50 mt-1">Laatste update: 1 min geleden</p>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-semibold text-dark mb-4">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-dark-100 mb-1">Response Time</p>
                            <p className="text-2xl font-bold text-success">142ms</p>
                        </div>
                        <div>
                            <p className="text-sm text-dark-100 mb-1">Uptime (30d)</p>
                            <p className="text-2xl font-bold text-success">99.9%</p>
                        </div>
                        <div>
                            <p className="text-sm text-dark-100 mb-1">Active Users</p>
                            <p className="text-2xl font-bold text-primary">1,247</p>
                        </div>
                        <div>
                            <p className="text-sm text-dark-100 mb-1">API Calls/min</p>
                            <p className="text-2xl font-bold text-info">3,421</p>
                        </div>
                    </div>
                </div>

                {/* Recent Incidents */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-dark mb-4">Recente Incidenten</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-light-200 rounded-lg">
                            <span className="w-2 h-2 bg-success rounded-full mt-2"></span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-dark">Gepland onderhoud voltooid</h3>
                                    <span className="text-xs text-dark-100">3 feb 2026</span>
                                </div>
                                <p className="text-sm text-dark-100">
                                    Database optimalisatie succesvol afgerond. Geen impact op gebruikers.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-light-200 rounded-lg">
                            <span className="w-2 h-2 bg-warning rounded-full mt-2"></span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-dark">Vertraagde notificaties</h3>
                                    <span className="text-xs text-dark-100">1 feb 2026</span>
                                </div>
                                <p className="text-sm text-dark-100">
                                    Tijdelijke vertraging in push notificaties. Opgelost binnen 15 minuten.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
