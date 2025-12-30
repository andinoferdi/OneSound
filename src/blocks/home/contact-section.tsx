"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { validateImageFileStrict } from "@/lib/file-validation";
import {
  User,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentCard } from "@/components/comment-card";
import { FileUpload } from "@/components/ui/file-upload";
import { submitContactForm, getComments, addComment } from "@/services/contact";
import {
  type ContactFormData,
  type CommentFormData,
  type Comment,
} from "@/types/contact";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const commentSchema = z.object({
  user_name: z.string().min(1, "Name is required"),
  content: z.string().min(5, "Comment must be at least 5 characters"),
  profile_image: z.string().optional(),
});

export const ContactSection = () => {
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });

  const [commentForm, setCommentForm] = useState<CommentFormData>({
    user_name: "",
    content: "",
    profile_image: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await getComments();
      setComments(response.comments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const validateFileType = async (
    file: File
  ): Promise<{ isValid: boolean; reason?: string }> => {
    try {
      const result = await validateImageFileStrict(file);
      return result;
    } catch (error) {
      console.error("File validation error:", error);
      return { isValid: false, reason: "File validation failed" };
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // Enhanced validation with magic number detection
      const validationResult = await validateFileType(file);
      if (!validationResult.isValid) {
        toast.error(`File rejected: ${validationResult.reason}`);
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = contactSchema.parse(contactForm);
      setIsSubmittingContact(true);

      const response = await submitContactForm(validatedData);

      if (response.success) {
        toast.success(response.message);
        setContactForm({ name: "", email: "", message: "" });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("An error occurred while sending message");
      }
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = commentSchema.parse({
        ...commentForm,
        profile_image: imagePreview || undefined,
      });

      setIsSubmittingComment(true);

      const response = await addComment(validatedData);

      if (response.success) {
        toast.success(response.message);
        setCommentForm({ user_name: "", content: "", profile_image: "" });
        setImagePreview("");
        await loadComments();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("An error occurred while adding comment");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or just want to chat? I&apos;d love to hear
            from you!
          </p>
        </header>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          data-aos="fade-up"
        >
          {/* Contact Form */}
          <div className="space-y-6">
            <div className="bg-background/90 border border-border/60 rounded-xl p-6 backdrop-blur-md">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Send Message
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="pl-10"
                    disabled={isSubmittingContact}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10"
                    disabled={isSubmittingContact}
                  />
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    placeholder="Your Message"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="pl-10 min-h-[120px]"
                    disabled={isSubmittingContact}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full cursor-pointer"
                  icon={
                    isSubmittingContact ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )
                  }
                >
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <div className="bg-background/90 border border-border/60 rounded-xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Comments</h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {comments.length} comments
                </span>
              </div>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4 mb-6">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={commentForm.user_name}
                  onChange={(e) =>
                    setCommentForm((prev) => ({
                      ...prev,
                      user_name: e.target.value,
                    }))
                  }
                  disabled={isSubmittingComment}
                />

                <Textarea
                  placeholder="Write your comment..."
                  value={commentForm.content}
                  onChange={(e) =>
                    setCommentForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="min-h-[80px]"
                  disabled={isSubmittingComment}
                />

                {/* Image Upload Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Profile Photo (Optional)
                  </label>

                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <FileUpload
                        onChange={handleImageUpload}
                        accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.webp,.heic,.heif,.svg,.avif"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingComment}
                  size="sm"
                  className="cursor-pointer"
                  icon={
                    isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )
                  }
                >
                  {isSubmittingComment ? "Sending..." : "Send Comment"}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto right-scrollbar relative">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment, index) => {
                    const isLastPinned =
                      comment.is_pinned &&
                      (index === comments.length - 1 ||
                        !comments[index + 1]?.is_pinned);

                    return (
                      <div key={comment.id}>
                        <CommentCard comment={comment} />
                        {isLastPinned && (
                          <div className="my-4 border-t border-border/40"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
