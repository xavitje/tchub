'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileText, BarChart3, Calendar, X, Image as ImageIcon } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { validateFile } from '@/lib/upload';

type PostType = 'POST' | 'POLL' | 'EVENT';

export default function NewPostPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { showNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [postType, setPostType] = useState<PostType>('POST');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Poll specific
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollEndsAt, setPollEndsAt] = useState('');
    const [allowMultiple, setAllowMultiple] = useState(false);

    // Event specific
    const [eventStartDate, setEventStartDate] = useState('');
    const [eventEndDate, setEventEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [isVirtual, setIsVirtual] = useState(false);
    const [meetingLink, setMeetingLink] = useState('');
    const [maxAttendees, setMaxAttendees] = useState('');

    const handleAddPollOption = () => {
        setPollOptions([...pollOptions, '']);
    };

    const handleRemovePollOption = (index: number) => {
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            showNotification('error', error);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url);
                showNotification('success', 'Afbeelding geüpload');
            } else {
                showNotification('error', 'Upload mislukt');
            }
        } catch (error) {
            showNotification('error', 'Fout bij uploaden');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            showNotification('error', 'Je moet ingelogd zijn om een bericht te plaatsen');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: postType,
                    title,
                    content,
                    imageUrl,
                    authorId: session.user.id,
                    pollOptions,
                    pollEndsAt,
                    allowMultiple,
                    eventStartDate,
                    eventEndDate,
                    location,
                    isVirtual,
                    meetingLink,
                    maxAttendees,
                }),
            });

            const data = await res.json();
            if (data.id) {
                showNotification('success', 'Bericht succesvol aangemaakt!');
                router.push('/discussions');
            } else {
                showNotification('error', 'Fout bij maken van bericht: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            showNotification('error', 'Systeemfout bij maken van bericht.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-dark mb-2">Log in om een bericht te plaatsen</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-6">Nieuw Bericht</h1>

                {/* Post Type Selector */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-dark mb-4">Selecteer Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setPostType('POST')}
                            className={`p-4 rounded-lg border-2 transition-all ${postType === 'POST'
                                ? 'border-primary bg-primary-50'
                                : 'border-light-400 hover:border-primary-200'
                                }`}
                        >
                            <FileText className={`w-8 h-8 mx-auto mb-2 ${postType === 'POST' ? 'text-primary' : 'text-dark-100'}`} />
                            <h3 className="font-semibold text-dark">Post</h3>
                            <p className="text-sm text-dark-100 mt-1">Deel een bericht of discussie</p>
                        </button>

                        <button
                            onClick={() => setPostType('POLL')}
                            className={`p-4 rounded-lg border-2 transition-all ${postType === 'POLL'
                                ? 'border-primary bg-primary-50'
                                : 'border-light-400 hover:border-primary-200'
                                }`}
                        >
                            <BarChart3 className={`w-8 h-8 mx-auto mb-2 ${postType === 'POLL' ? 'text-primary' : 'text-dark-100'}`} />
                            <h3 className="font-semibold text-dark">Poll</h3>
                            <p className="text-sm text-dark-100 mt-1">Vraag meningen van het team</p>
                        </button>

                        <button
                            onClick={() => setPostType('EVENT')}
                            className={`p-4 rounded-lg border-2 transition-all ${postType === 'EVENT'
                                ? 'border-primary bg-primary-50'
                                : 'border-light-400 hover:border-primary-200'
                                }`}
                        >
                            <Calendar className={`w-8 h-8 mx-auto mb-2 ${postType === 'EVENT' ? 'text-primary' : 'text-dark-100'}`} />
                            <h3 className="font-semibold text-dark">Event</h3>
                            <p className="text-sm text-dark-100 mt-1">Organiseer een evenement</p>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="card p-6">
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark mb-2">
                            Titel *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder={
                                postType === 'POST' ? 'Geef je bericht een titel...' :
                                    postType === 'POLL' ? 'Wat wil je vragen?' :
                                        'Naam van het evenement'
                            }
                            required
                        />
                    </div>

                    {/* Content/Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark mb-2">
                            {postType === 'EVENT' ? 'Beschrijving' : 'Inhoud'} *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="input min-h-[150px]"
                            placeholder={
                                postType === 'POST' ? 'Deel je gedachten...' :
                                    postType === 'POLL' ? 'Geef meer context aan je poll (optioneel)' :
                                        'Beschrijf het evenement...'
                            }
                            required={postType !== 'POLL'}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-dark mb-2">
                            Afbeelding (Optioneel)
                        </label>
                        <div className="flex items-center gap-4">
                            {imageUrl ? (
                                <div className="relative group">
                                    <img src={imageUrl} alt="Preview" className="h-32 w-48 object-cover rounded-lg border border-light-400" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl(null)}
                                        className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="h-32 w-48 flex flex-col items-center justify-center border-2 border-dashed border-light-400 rounded-lg text-dark-100 hover:border-primary hover:text-primary transition-colors bg-light-50"
                                >
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">{isUploading ? 'Uploaden...' : 'Afbeelding toevoegen'}</span>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </div>
                    </div>
                    {postType === 'POLL' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Poll Opties *
                                </label>
                                {pollOptions.map((option, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                            className="input flex-1"
                                            placeholder={`Optie ${index + 1}`}
                                            required
                                        />
                                        {pollOptions.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePollOption(index)}
                                                className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddPollOption}
                                    className="btn btn-secondary mt-2"
                                >
                                    + Optie toevoegen
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Poll eindigt op (optioneel)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={pollEndsAt}
                                    onChange={(e) => setPollEndsAt(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="allowMultiple"
                                    checked={allowMultiple}
                                    onChange={(e) => setAllowMultiple(e.target.checked)}
                                    className="w-4 h-4 text-primary"
                                />
                                <label htmlFor="allowMultiple" className="text-sm text-dark">
                                    Sta meerdere antwoorden toe
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Event Specific Fields */}
                    {postType === 'EVENT' && (
                        <div className="mb-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        Start Datum & Tijd *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventStartDate}
                                        onChange={(e) => setEventStartDate(e.target.value)}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        Eind Datum & Tijd (optioneel)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventEndDate}
                                        onChange={(e) => setEventEndDate(e.target.value)}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="isVirtual"
                                    checked={isVirtual}
                                    onChange={(e) => setIsVirtual(e.target.checked)}
                                    className="w-4 h-4 text-primary"
                                />
                                <label htmlFor="isVirtual" className="text-sm text-dark">
                                    Virtueel evenement
                                </label>
                            </div>

                            {isVirtual ? (
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        Meeting Link *
                                    </label>
                                    <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="input"
                                        placeholder="https://teams.microsoft.com/..."
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-dark mb-2">
                                        Locatie *
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="input"
                                        placeholder="Kantoor Amsterdam, Vergaderzaal A"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Max aantal deelnemers (optioneel)
                                </label>
                                <input
                                    type="number"
                                    value={maxAttendees}
                                    onChange={(e) => setMaxAttendees(e.target.value)}
                                    className="input"
                                    placeholder="Onbeperkt"
                                    min="1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-light-400">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Annuleren
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Publiceren...' : 'Publiceren'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
