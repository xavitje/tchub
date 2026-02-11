'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, MessageSquare, Building2, HelpCircle, GraduationCap, Ticket, ShieldCheck, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchResult } from '@/lib/search-content';

export function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                setIsOpen(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setSelectedIndex(-1);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            navigateToResult(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const navigateToResult = (result: SearchResult) => {
        if (result.url.startsWith('http')) {
            window.open(result.url, '_blank');
        } else {
            router.push(result.url);
        }
        setIsOpen(false);
        setQuery('');
    };

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'USER': return <User className="w-4 h-4 text-primary" />;
            case 'POST': return <MessageSquare className="w-4 h-4 text-info" />;
            case 'HUB': return <Building2 className="w-4 h-4 text-success" />;
            case 'FAQ': return <HelpCircle className="w-4 h-4 text-warning" />;
            case 'TRAINING': return <GraduationCap className="w-4 h-4 text-primary" />;
            case 'TICKET': return <Ticket className="w-4 h-4 text-error" />;
            case 'STATUS': return <ShieldCheck className="w-4 h-4 text-success" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="relative group">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                    isOpen ? "text-primary" : "text-dark-100 group-focus-within:text-primary"
                )} />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Zoek alles: collega's, FAQ, trainingen..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-full bg-light-200 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl py-2 pl-10 pr-10 text-sm transition-all duration-200 outline-none"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-light-300 rounded-full text-dark-100 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-strong border border-light-400 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1">
                        {loading && results.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-dark-100">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span className="text-sm">Zoeken...</span>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-dark-100">Geen resultaten gevonden voor "{query}"</p>
                            </div>
                        ) : (
                            results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => navigateToResult(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-150",
                                        index === selectedIndex ? "bg-primary/5 ring-1 ring-primary/10" : "hover:bg-light-100"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-light-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {result.type === 'USER' && result.metadata?.image ? (
                                            <img src={result.metadata.image} alt="" className="w-full h-full rounded-lg object-cover" />
                                        ) : (
                                            getIcon(result.type)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-dark text-sm truncate">{result.title}</span>
                                            <span className="text-[10px] font-bold text-dark-100/50 uppercase tracking-tighter bg-light-300 px-1.5 py-0.5 rounded">
                                                {result.type}
                                            </span>
                                        </div>
                                        {result.description && (
                                            <p className="text-xs text-dark-100 line-clamp-1 mt-0.5">
                                                {result.description}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-4 h-4 self-center transition-all",
                                        index === selectedIndex ? "text-primary translate-x-1 opacity-100" : "text-dark-100 opacity-0"
                                    )} />
                                </button>
                            ))
                        )}
                    </div>
                    {results.length > 0 && (
                        <div className="bg-light-100 px-4 py-2 border-t border-light-400 flex justify-between items-center">
                            <span className="text-[10px] text-dark-100 font-medium italic">
                                Gebruik pijltjestoetsen om te navigeren
                            </span>
                            <span className="text-[10px] text-dark-100 font-bold uppercase">
                                {results.length} resultaten
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
