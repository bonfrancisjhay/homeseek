import { useState, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

function ImageUploader({ existingImages, onFilesChange, onRemoveExisting }) {
    const safeImages = Array.isArray(existingImages) ? existingImages : [];
    const inputRef = useRef(null);
    const [previews, setPreviews] = useState([]);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        const urls  = files.map(f => URL.createObjectURL(f));
        setPreviews(urls);
        onFilesChange(files);
    };

    return (
        <div>
            {/* Existing images (edit mode) */}
                {safeImages.length > 0 && (                
                    <div className="flex flex-wrap gap-2 mb-3">
                    {safeImages.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100">
                            <img src={`${BASE_URL}${url}`} className="w-full h-full object-cover" alt="" />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting(url)}
                                className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                            >
                                <X size={11} color="#dc2626" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* New previews */}
            {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {previews.map((url, i) => (
                        <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border border-blue-100">
                            <img src={url} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                </div>
            )}

            {/* Upload trigger */}
            <button
                type="button"
                onClick={() => inputRef.current.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-[#3b82f6] hover:bg-blue-50 transition cursor-pointer"
            >
                <ImagePlus size={22} color="#9ca3af" />
                <span className="text-sm text-gray-400">Click to upload photos</span>
                <span className="text-xs text-gray-300">JPG, PNG, WebP · max 5MB each</span>
            </button>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFiles}
            />
        </div>
    );
}

export default ImageUploader;