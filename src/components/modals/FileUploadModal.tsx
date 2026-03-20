import { useState, useRef } from 'react';
import {
    X,
    Upload,
    File,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileAudio,
    FileText,
    Image as ImageIcon,
    Video
} from 'lucide-react';
import { materialService } from '@/services/material.service';
import { cn } from '@/utils/cn';

interface FileUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
    classId?: string;
    bookingId?: string;
    materialType?: 'learning' | 'recording' | 'exam' | 'project' | 'other';
}

export function FileUploadModal({
    onClose,
    onSuccess,
    classId,
    bookingId,
    materialType = 'learning'
}: FileUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            if (!title) setTitle(e.dataTransfer.files[0].name);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!title) setTitle(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('isPublic', String(isPublic));
            formData.append('materialType', materialType);
            if (classId) formData.append('classId', classId);
            if (bookingId) formData.append('bookingId', bookingId);

            const res = await materialService.upload(formData);
            if (res.success) {
                onSuccess();
            } else {
                setError(res.message || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (mime: string) => {
        if (mime.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
        if (mime.startsWith('audio/')) return <FileAudio className="w-8 h-8 text-purple-500" />;
        if (mime.startsWith('video/')) return <Video className="w-8 h-8 text-indigo-500" />;
        if (mime.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        return <File className="w-8 h-8 text-gray-500" />;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Upload {materialType === 'learning' ? 'Material' : 'File'}</h2>
                        <p className="text-sm text-gray-500">Securely upload documents or media</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Alert */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Dropzone */}
                    {!file ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
                                dragActive
                                    ? "border-purple-500 bg-purple-50/50"
                                    : "border-gray-200 hover:border-purple-400 hover:bg-gray-50"
                            )}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <Upload className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-gray-900">Click or drag file to upload</p>
                                <p className="text-sm text-gray-500 mt-1">PDF, Audio, Video, or Images up to 100MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl relative group">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all"
                                placeholder="Display name for this file"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all resize-none"
                                placeholder="Briefly describe what's in this file"
                                rows={2}
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors" />
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                Make file public (Visible to all students)
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Confirm Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
