import { useClient } from '@/hooks/common/use-client';
import { useUpload, type UploadFile } from '@longpoint/react';
import { SupportedMimeType } from '@longpoint/types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface UploadContextType {
  isOpen: boolean;
  files: UploadFile[];
  openDialog: (files?: File[]) => void;
  closeDialog: () => void;
  addFiles: (files: File[]) => void;
  uploadFiles: (files: File[]) => Promise<void>;
  cancelUpload: (fileId: string) => void;
  reset: () => void;
  isUploading: boolean;
  hasFiles: boolean;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

interface UploadProviderProps {
  children: ReactNode;
}

export function UploadProvider({ children }: UploadProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const client = useClient();
  const uploadHook = useUpload();

  const openDialog = useCallback((files?: File[]) => {
    setIsOpen(true);
    if (files && files.length > 0) {
      setPendingFiles(files);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setPendingFiles([]);
    uploadHook.reset();
  }, [uploadHook]);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<void> => {
      try {
        // Filter out unsupported mime types
        const supportedFiles = files.filter((file) => {
          const mimeType = file.type as SupportedMimeType;
          return Object.values(SupportedMimeType).includes(mimeType);
        });

        if (supportedFiles.length === 0) {
          throw new Error('No supported files selected');
        }

        // Remove files from pending state as we start uploading them
        setPendingFiles((prev) =>
          prev.filter(
            (pendingFile) =>
              !supportedFiles.some(
                (file) =>
                  file.name === pendingFile.name &&
                  file.size === pendingFile.size &&
                  file.type === pendingFile.type
              )
          )
        );

        // Create media containers and upload files
        const uploadPromises = supportedFiles.map(async (file) => {
          try {
            // Create media container
            const container = await client.media.createMedia({
              mimeType: file.type as SupportedMimeType,
              name: file.name,
              classifiersOnUpload: ['general-tagging'],
            });

            // Upload file to the returned URL
            await uploadHook.uploadFile(file, container.url);
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            // Add error file to upload hook for display
            const errorMessage =
              error instanceof Error ? error.message : 'Upload failed';
            uploadHook.addErrorFile(file, errorMessage);
            throw error;
          }
        });

        await Promise.allSettled(uploadPromises);
      } catch (error) {
        console.error('Upload failed:', error);
        throw error;
      }
    },
    [client, uploadHook]
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      setPendingFiles((prev) => [...prev, ...files]);
      // Auto-upload files immediately
      try {
        await uploadFiles(files);
      } catch (error) {
        console.error('Auto-upload failed:', error);
      }
    },
    [uploadFiles]
  );

  const cancelUpload = useCallback(
    (fileId: string) => {
      uploadHook.cancelUpload(fileId);
    },
    [uploadHook]
  );

  const reset = useCallback(() => {
    uploadHook.reset();
    setPendingFiles([]);
  }, [uploadHook]);

  // Combine pending files with upload files for display
  const allFiles = [
    ...pendingFiles.map((file) => ({
      id: `pending-${file.name}-${file.size}`,
      file,
      progress: 0,
      status: 'pending' as const,
    })),
    ...uploadHook.files,
  ];

  const value: UploadContextType = {
    isOpen,
    files: allFiles,
    openDialog,
    closeDialog,
    addFiles,
    uploadFiles,
    cancelUpload,
    reset,
    isUploading: uploadHook.isUploading,
    hasFiles: allFiles.length > 0,
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUploadContext(): UploadContextType {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
}
