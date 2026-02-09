import { Lightbulb, TrendingUp, Users, ThumbsUp } from 'lucide-react';

export default function IdeasPage() {
    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-dark">Ideas Portal</h1>
                    <button className="btn btn-primary">
                        Deel je idee
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <Lightbulb className="w-8 h-8 text-warning" />
                            <div>
                                <p className="text-2xl font-bold text-dark">127</p>
                                <p className="text-sm text-dark-100">Totaal ideeën</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-success" />
                            <div>
                                <p className="text-2xl font-bold text-dark">23</p>
                                <p className="text-sm text-dark-100">Geïmplementeerd</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-info" />
                            <div>
                                <p className="text-2xl font-bold text-dark">89</p>
                                <p className="text-sm text-dark-100">Actieve deelnemers</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <ThumbsUp className="w-8 h-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold text-dark">1,234</p>
                                <p className="text-sm text-dark-100">Totaal votes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-light-400">
                    <button className="px-4 py-2 font-medium text-primary border-b-2 border-primary">
                        Trending
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        Nieuw
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        In Behandeling
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        Geïmplementeerd
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {[
                            {
                                id: 1,
                                title: 'Mobile app voor HubTC',
                                description: 'Een dedicated mobile app zou het makkelijker maken om onderweg updates te checken en te reageren op berichten.',
                                author: 'Sarah Johnson',
                                votes: 87,
                                comments: 23,
                                status: 'In Behandeling',
                                category: 'Platform',
                            },
                            {
                                id: 2,
                                title: 'Integratie met CRM systeem',
                                description: 'Directe koppeling met ons CRM systeem voor betere klantdata synchronisatie.',
                                author: 'Michael Peters',
                                votes: 64,
                                comments: 18,
                                status: 'Onder Review',
                                category: 'Integratie',
                            },
                            {
                                id: 3,
                                title: 'Dark mode optie',
                                description: 'Een dark mode zou fijn zijn voor gebruik in de avonduren en bespaart batterij op mobile devices.',
                                author: 'Emma Williams',
                                votes: 52,
                                comments: 12,
                                status: 'Nieuw',
                                category: 'UI/UX',
                            },
                            {
                                id: 4,
                                title: 'Automatische vertaling van berichten',
                                description: 'Voor internationale teams zou automatische vertaling van berichten zeer handig zijn.',
                                author: 'David Chen',
                                votes: 41,
                                comments: 9,
                                status: 'Nieuw',
                                category: 'Feature',
                            },
                        ].map((idea) => (
                            <div key={idea.id} className="card p-6 hover:shadow-medium transition-shadow">
                                <div className="flex gap-4">
                                    {/* Vote Section */}
                                    <div className="flex flex-col items-center gap-1">
                                        <button className="w-8 h-8 rounded-lg hover:bg-primary-50 flex items-center justify-center transition-colors">
                                            <span className="text-primary">▲</span>
                                        </button>
                                        <span className="font-bold text-dark">{idea.votes}</span>
                                        <button className="w-8 h-8 rounded-lg hover:bg-light-300 flex items-center justify-center transition-colors">
                                            <span className="text-dark-100">▼</span>
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="badge bg-primary-50 text-primary text-xs">
                                                {idea.category}
                                            </span>
                                            <span className={`badge text-xs ${idea.status === 'In Behandeling'
                                                    ? 'bg-warning/20 text-warning'
                                                    : idea.status === 'Onder Review'
                                                        ? 'bg-info/20 text-info'
                                                        : 'bg-light-300 text-dark-100'
                                                }`}>
                                                {idea.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-dark mb-2">
                                            {idea.title}
                                        </h3>
                                        <p className="text-dark-100 mb-3">{idea.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-dark-100">
                                            <span>Door {idea.author}</span>
                                            <span>•</span>
                                            <span>💬 {idea.comments} reacties</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Submit Idea */}
                        <div className="card p-6 bg-gradient-to-br from-primary to-primary-700 text-white">
                            <Lightbulb className="w-12 h-12 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Heb je een idee?</h3>
                            <p className="text-primary-100 text-sm mb-4">
                                Deel je innovatieve ideeën met het team en help ons beter te worden!
                            </p>
                            <button className="btn bg-white text-primary hover:bg-primary-50 w-full">
                                Deel je idee
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Categorieën</h3>
                            <div className="space-y-2">
                                {[
                                    { name: 'Platform', count: 34 },
                                    { name: 'UI/UX', count: 28 },
                                    { name: 'Integratie', count: 19 },
                                    { name: 'Feature', count: 46 },
                                ].map((cat, i) => (
                                    <button
                                        key={i}
                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-light-200 transition-colors text-left"
                                    >
                                        <span className="text-dark">{cat.name}</span>
                                        <span className="text-sm text-dark-100">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recently Implemented */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Recent Geïmplementeerd
                            </h3>
                            <div className="space-y-3">
                                {[
                                    'Notificatie voorkeuren',
                                    'Bulk acties voor posts',
                                    'Verbeterde zoekfunctie',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="text-success mt-1">✓</span>
                                        <span className="text-sm text-dark-100">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Top Contributors
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Sarah J.', ideas: 12 },
                                    { name: 'Michael P.', ideas: 9 },
                                    { name: 'Emma W.', ideas: 7 },
                                ].map((user, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm text-dark">{user.name}</span>
                                        </div>
                                        <span className="text-xs text-dark-100">{user.ideas} ideeën</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
