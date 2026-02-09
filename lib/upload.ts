export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain'
];

export interface UploadResult {
    url: string;
    filename: string;
    type: 'image' | 'file';
    error?: string;
}

export const validateFile = (file: File): string | null => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        if (file.size > MAX_IMAGE_SIZE) {
            return `Afbeelding is te groot (max ${MAX_IMAGE_SIZE / (1024 * 1024)}MB)`;
        }
    } else if (ALLOWED_FILE_TYPES.includes(file.type)) {
        if (file.size > MAX_FILE_SIZE) {
            return `Bestand is te groot (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`;
        }
    } else {
        return 'Bestandstype niet ondersteund';
    }
    return null;
};
