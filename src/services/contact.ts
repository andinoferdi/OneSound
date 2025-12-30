import { type ContactFormData, type CommentFormData, type ContactResponse, type CommentsResponse } from '@/types/contact';

export const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  try {
    const response = await fetch('https://formsubmit.co/andinoferdiansah@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        _subject: 'Pesan Baru dari Website Portfolio',
        _captcha: 'false',
        _template: 'table',
      }),
    });

    if (response.ok || response.status === 0) {
      return {
        success: true,
        message: 'Pesan berhasil dikirim! Terima kasih atas feedback Anda.',
      };
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
    };
  }
};

export const getComments = async (): Promise<CommentsResponse> => {
  try {
    const response = await fetch('/api/comments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      comments: data.comments || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {
      comments: [],
      count: 0,
    };
  }
};

export const addComment = async (commentData: CommentFormData): Promise<ContactResponse> => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentData.content,
        user_name: commentData.user_name,
        profile_image: commentData.profile_image || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    await response.json();
    return {
      success: true,
      message: 'Komentar berhasil ditambahkan!',
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menambahkan komentar. Silakan coba lagi.',
    };
  }
};
