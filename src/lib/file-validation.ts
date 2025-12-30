
const IMAGE_MAGIC_NUMBERS = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  bmp: [0x42, 0x4D],
  webp: [0x52, 0x49, 0x46, 0x46], 
  tiff: [0x49, 0x49, 0x2A, 0x00], 
  tiff_be: [0x4D, 0x4D, 0x00, 0x2A], 
  svg: [0x3C, 0x3F, 0x78, 0x6D, 0x6C],
  ico: [0x00, 0x00, 0x01, 0x00],
};

// Allowed image MIME types
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/svg+xml',
  'image/x-icon',
  'image/avif'
];

// Allowed image extensions
const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', 
  '.tiff', '.tif', '.webp', '.heic', '.heif',
  '.raw', '.cr2', '.nef', '.arw', '.svg',
  '.psd', '.ico', '.jfif', '.avif'
];

/**
 * Check if file starts with image magic numbers
 */
export const checkImageMagicNumbers = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check JPEG
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.jpeg[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.jpeg[1] && 
          uint8Array[2] === IMAGE_MAGIC_NUMBERS.jpeg[2]) {
        resolve(true);
        return;
      }
      
      // Check PNG
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.png[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.png[1] && 
          uint8Array[2] === IMAGE_MAGIC_NUMBERS.png[2] && 
          uint8Array[3] === IMAGE_MAGIC_NUMBERS.png[3]) {
        resolve(true);
        return;
      }
      
      // Check GIF
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.gif[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.gif[1] && 
          uint8Array[2] === IMAGE_MAGIC_NUMBERS.gif[2] && 
          uint8Array[3] === IMAGE_MAGIC_NUMBERS.gif[3]) {
        resolve(true);
        return;
      }
      
      // Check BMP
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.bmp[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.bmp[1]) {
        resolve(true);
        return;
      }
      
      // Check WebP
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.webp[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.webp[1] && 
          uint8Array[2] === IMAGE_MAGIC_NUMBERS.webp[2] && 
          uint8Array[3] === IMAGE_MAGIC_NUMBERS.webp[3]) {
        resolve(true);
        return;
      }
      
      // Check TIFF
      if ((uint8Array[0] === IMAGE_MAGIC_NUMBERS.tiff[0] && 
           uint8Array[1] === IMAGE_MAGIC_NUMBERS.tiff[1] && 
           uint8Array[2] === IMAGE_MAGIC_NUMBERS.tiff[2] && 
           uint8Array[3] === IMAGE_MAGIC_NUMBERS.tiff[3]) ||
          (uint8Array[0] === IMAGE_MAGIC_NUMBERS.tiff_be[0] && 
           uint8Array[1] === IMAGE_MAGIC_NUMBERS.tiff_be[1] && 
           uint8Array[2] === IMAGE_MAGIC_NUMBERS.tiff_be[2] && 
           uint8Array[3] === IMAGE_MAGIC_NUMBERS.tiff_be[3])) {
        resolve(true);
        return;
      }
      
      // Check ICO
      if (uint8Array[0] === IMAGE_MAGIC_NUMBERS.ico[0] && 
          uint8Array[1] === IMAGE_MAGIC_NUMBERS.ico[1] && 
          uint8Array[2] === IMAGE_MAGIC_NUMBERS.ico[2] && 
          uint8Array[3] === IMAGE_MAGIC_NUMBERS.ico[3]) {
        resolve(true);
        return;
      }
      
      resolve(false);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 10)); // Read first 10 bytes
  });
};

/**
 * Comprehensive file validation for images
 */
export const validateImageFile = async (file: File): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension);
  
  if (!isValidExtension) {
    return {
      isValid: false,
      reason: `Invalid file extension: ${fileExtension}. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    };
  }
  
  // Check MIME type
  const isValidMimeType = ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
  
  if (!isValidMimeType) {
    return {
      isValid: false,
      reason: `Invalid MIME type: ${file.type}. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`
    };
  }
  
  // Check if MIME type starts with 'image/'
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      reason: `File is not an image type: ${file.type}`
    };
  }
  
  // Check magic numbers for additional security
  const hasValidMagicNumbers = await checkImageMagicNumbers(file);
  
  if (!hasValidMagicNumbers) {
    return {
      isValid: false,
      reason: 'File does not contain valid image magic numbers'
    };
  }
  
  return { isValid: true };
};

/**
 * Check if file is a video file (to explicitly reject)
 */
export const isVideoFile = (file: File): boolean => {
  const videoMimeTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/3gp',
    'video/quicktime'
  ];
  
  const videoExtensions = [
    '.mp4', '.avi', '.mov', '.wmv', '.flv', 
    '.webm', '.mkv', '.3gp', '.qt'
  ];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  return videoMimeTypes.includes(file.type) || videoExtensions.includes(fileExtension);
};

/**
 * Check if file is an audio file (to explicitly reject)
 */
export const isAudioFile = (file: File): boolean => {
  const audioMimeTypes = [
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
    'audio/m4a',
    'audio/wma'
  ];
  
  const audioExtensions = [
    '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'
  ];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  return audioMimeTypes.includes(file.type) || audioExtensions.includes(fileExtension);
};

/**
 * Enhanced file validation that explicitly rejects video and audio files
 */
export const validateImageFileStrict = async (file: File): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  // First check if it's explicitly a video or audio file
  if (isVideoFile(file)) {
    return {
      isValid: false,
      reason: 'Video files are not allowed. Only image files are permitted.'
    };
  }
  
  if (isAudioFile(file)) {
    return {
      isValid: false,
      reason: 'Audio files are not allowed. Only image files are permitted.'
    };
  }
  
  // Then do normal image validation
  return validateImageFile(file);
};
