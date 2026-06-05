import { useState, useCallback } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ImageFile {
    id?: string;
    file?: File;
    preview: string;
    isLoading?: boolean;
    path?: string;
}

interface ImageUploadProps {
    images: ImageFile[];
    onImagesChange: (images: ImageFile[]) => void;
    maxImages?: number;
    accept?: string;
    disabled?: boolean;
    onUpload?: (file: File) => Promise<{ path: string; id?: string }>;
    onDelete?: (image: ImageFile) => Promise<void>;
    onUpdate?: (imageId: string, file: File, oldPath: string) => Promise<void>;
}

export function ImageUpload({
    images,
    onImagesChange,
    maxImages = 10,
    accept = 'image/jpeg,image/png,image/webp',
    disabled = false,
    onUpload,
    onDelete,
    onUpdate,
}: ImageUploadProps) {
    const [isUploading] = useState(false);

    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (images.length + files.length > maxImages) {
            toast.error(`Maksimal ${maxImages} gambar`);
            return;
        }

        for (const file of files) {
            if (!accept.split(',').includes(file.type)) {
                toast.error(`Tipe file ${file.type} tidak didukung`);
                continue;
            }

            const preview = URL.createObjectURL(file);
            const newImage: ImageFile = {
                file,
                preview,
                isLoading: true,
            };

            onImagesChange([...images, newImage]);

            if (onUpload) {
                try {
                    const result = await onUpload(file);
                    newImage.id = result.id;
                    newImage.path = result.path;
                    newImage.isLoading = false;
                    onImagesChange([...images, newImage]);
                } catch (error) {
                    toast.error('Gagal mengupload gambar');
                    onImagesChange(images.filter(img => img.preview !== preview));
                }
            } else {
                newImage.isLoading = false;
                onImagesChange([...images, newImage]);
            }
        }

        event.target.value = '';
    }, [images, maxImages, accept, onUpload, onImagesChange]);

    const handleRemoveImage = useCallback(async (index: number) => {
        const imageToRemove = images[index];

        if (onDelete && imageToRemove.id) {
            try {
                await onDelete(imageToRemove);
            } catch (error) {
                toast.error('Gagal menghapus gambar');
                return;
            }
        }

        if (imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }

        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    }, [images, onDelete, onImagesChange]);

    const handleUpdateImage = useCallback(async (index: number, file: File) => {
        const imageToUpdate = images[index];

        if (!imageToUpdate.id || !onUpdate) {
            return;
        }

        // Create preview for new file
        const preview = URL.createObjectURL(file);
        const updatedImage = { ...imageToUpdate, file, preview, isLoading: true };
        const newImages = [...images];
        newImages[index] = updatedImage;
        onImagesChange(newImages);

        try {
            await onUpdate(imageToUpdate.id, file, imageToUpdate.path || '');
            updatedImage.isLoading = false;
            updatedImage.path = preview;
            onImagesChange(newImages);
            toast.success('Gambar berhasil diperbarui');
        } catch (error) {
            toast.error('Gagal memperbarui gambar');
            updatedImage.isLoading = false;
            onImagesChange(images);
        }
    }, [images, onUpdate, onImagesChange]);

    const handleReplaceImage = useCallback((index: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                await handleUpdateImage(index, file);
            }
        };
        input.click();
    }, [handleUpdateImage, accept]);

    return (
        <div className="space-y-4">
            <Label>Gambar Produk</Label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((image, index) => (
                    <div
                        key={image.preview}
                        className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
                    >
                        {image.isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handleReplaceImage(index)}
                                disabled={disabled || image.isLoading}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveImage(index)}
                                disabled={disabled || image.isLoading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {images.length < maxImages && !disabled && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                        <Upload className="h-8 w-8" />
                        <span className="text-xs text-center">Upload Gambar</span>
                        <Input
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={disabled || isUploading}
                            multiple
                        />
                    </label>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                Format: JPG, PNG, WEBP. Maksimal {maxImages} gambar.
            </p>
        </div>
    );
}