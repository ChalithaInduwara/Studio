import { useState, useEffect } from 'react';
import {
    BookOpen,
    Download,
    Search,
    FileText,
    Video,
    Music,
    ExternalLink,
    Loader2,
    BookMarked,
    ArrowRight
} from 'lucide-react';
import { materialService } from '@/services/material.service';
import { cn } from '@/utils/cn';
import { FileUploadModal } from './modals/FileUploadModal';

export function TutorResources() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<any[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await materialService.getAll();
            if (res.success) {
                // In a real app, we might filter for "public" or "tutor-only" materials
                // For now, we show all available learning materials
                setResources(res.data.filter((m: any) => m.materialType === 'learning' || !m.classId));
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const DOWNLOAD_BASE = API_BASE.replace('/api/v1', '');

    useEffect(() => {
        fetchResources();
    }, []);

    const filteredResources = resources.filter(res => {
        const matchesSearch = (res.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || res.mimeType?.includes(typeFilter);
        return matchesSearch && matchesType;
    });

    const resourceTypes = [
        { id: 'all', label: 'All Resources', icon: BookOpen },
        { id: 'pdf', label: 'PDF Guides', icon: FileText },
        { id: 'video', label: 'Video Tutorials', icon: Video },
        { id: 'audio', label: 'Audio Samples', icon: Music },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Background Decorative Element */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Tutor Resources</h1>
                    <p className="text-indigo-100 mt-2 max-w-lg">
                        Access teaching guides, lesson templates, and pedagogical resources to enhance your student's learning experience.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <BookMarked className="absolute bottom-4 right-8 w-32 h-32 text-white/10 rotate-12" />
            </div>

            {/* Modern Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search resources by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {resourceTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setTypeFilter(type.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all",
                                typeFilter === type.id
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white text-gray-600 border border-gray-100 hover:border-indigo-200"
                            )}
                        >
                            <type.icon className="w-4 h-4" />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-gray-500 font-medium">Loading Resources Hub...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.length > 0 ? (
                        filteredResources.map((resource) => (
                            <div key={resource._id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                                        resource.mimeType?.includes('pdf') ? "bg-red-50 text-red-600" :
                                            resource.mimeType?.includes('video') ? "bg-blue-50 text-blue-600" :
                                                resource.mimeType?.includes('audio') ? "bg-purple-50 text-purple-600" :
                                                    "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {resource.mimeType?.includes('pdf') ? <FileText className="w-7 h-7" /> :
                                            resource.mimeType?.includes('video') ? <Video className="w-7 h-7" /> :
                                                resource.mimeType?.includes('audio') ? <Music className="w-7 h-7" /> :
                                                    <BookOpen className="w-7 h-7" />}
                                    </div>
                                    <a
                                        href={`${DOWNLOAD_BASE}${resource.fileUrl}`}
                                        download={resource.fileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2">
                                    {resource.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                    {resource.description || 'Professional teaching material and guide for Swara Academy instructors.'}
                                </p>

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg">
                                        {resource.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                                    </span>
                                    <a
                                        href={`${DOWNLOAD_BASE}${resource.fileUrl}`}
                                        target="_blank"
                                        className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-purple-700 transition-colors"
                                    >
                                        Preview
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No resources found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom CTA */}
            <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden mt-12">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold">Have useful material to share?</h2>
                        <p className="text-gray-400 mt-2">Upload your own guides and resources to help other tutors in the community.</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 whitespace-nowrap group">
                        Contribute Resource
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            {showUploadModal && (
                <FileUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchResources();
                    }}
                    materialType="learning"
                />
            )}
        </div>
    );
}
