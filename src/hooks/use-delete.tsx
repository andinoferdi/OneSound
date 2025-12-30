import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import axios from '@/lib/axios';

type UseDeleteCallbacks = {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
};

type UseDeleteOptions = {
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type HttpMethod = 'delete' | 'get' | 'post' | 'put' | 'patch';

const useDelete = (callbacks?: UseDeleteCallbacks, options?: UseDeleteOptions) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<{
    url: string;
    method: HttpMethod;
    body?: any;
  } | null>(null);

  const { onSuccess, onError, onSettled } = callbacks || {};

  const {
    title = 'Are you sure?',
    description = 'Data that has been deleted cannot be restored!',
    confirmText = 'Yes, delete',
    cancelText = 'Cancel',
    confirmButtonClass = '',
    cancelButtonClass = ''
  } = options || {};

  const handleDelete = async () => {
    if (!currentRequest) return;

    setIsDeleting(true);
    setError(null);

    try {
      const { url, method, body } = currentRequest;
      let response;

      switch (method) {
        case 'delete':
          response = await axios.delete(url, { data: body });
          break;
        case 'post':
          response = await axios.post(url, body);
          break;
        case 'put':
          response = await axios.put(url, body);
          break;
        case 'patch':
          response = await axios.patch(url, body);
          break;
        case 'get':
          response = await axios.get(url, { params: body });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      setOpen(false);
      onSuccess && onSuccess();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';

      // Filter out unlink errors (file not found) as they don't affect the main operation
      if (errorMessage.includes('unlink') || errorMessage.includes('No such file or directory')) {
        // Don't show unlink errors to user, treat as success
        setOpen(false);
        onSuccess && onSuccess();
        return;
      }

      setError(errorMessage);
      onError && onError(err);
    } finally {
      setIsDeleting(false);
      onSettled && onSettled();
    }
  };

  const deleteData = (url: string, method: HttpMethod = 'delete', body?: any) => {
    setCurrentRequest({ url, method, body });
    setOpen(true);
  };

  const DeleteConfirmDialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {error && !error.includes('unlink') && !error.includes('No such file or directory') && (
            <div className='text-destructive mt-2 text-sm font-medium'>{error}</div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={cancelButtonClass} disabled={isDeleting}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${confirmButtonClass}`}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    delete: deleteData,
    DeleteConfirmDialog
  };
};

export { useDelete };
