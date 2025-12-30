"use client";

import { memo, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FilePondUpload } from "@/components/ui/filepond-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authService, useCurrentUser, useUpdateProfile } from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";

import { FilePondFile } from "filepond";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const profileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    nip: z.string().optional(),
    image: z.any().optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0) {
      if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password minimal 6 karakter",
          path: ["password"],
        });
      }

      // Password confirmation validation
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Konfirmasi password tidak sesuai",
          path: ["password_confirmation"],
        });
      }
    }
  });

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = memo(function ProfilePage() {
  const { data: currentUser, isLoading: isFetching } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [imageFiles, setImageFiles] = useState<FilePondFile[] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      nip: "",
      password: "",
      password_confirmation: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordConfirmationVisibility = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  // Populate form with current user data
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.full_name || "",
        email: currentUser.email || "",
        nip: (currentUser as any).nip || "",
        password: "",
        password_confirmation: "",
      });
    }
  }, [currentUser, reset]);

  const handleImageUpdate = (files: FilePondFile[] | null) => {
    setImageFiles(files);
    if (files && files.length > 0) {
      setValue("image", files[0].file);
    } else {
      setValue("image", null);
    }
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (data.nip) formData.append("nip", data.nip);

    // Only include password if it's provided
    if (data.password && data.password.length > 0) {
      formData.append("password", data.password);
    }

    // Add image if uploaded
    if (imageFiles && imageFiles.length > 0) {
      formData.append("image", imageFiles[0].file);
    }

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Profile berhasil diperbarui");

        // Clear password fields after successful update
        setValue("password", "");
        setValue("password_confirmation", "");
        setShowPassword(false);
        setShowPasswordConfirmation(false);

        // Clear image files
        setImageFiles(null);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Gagal memperbarui profile"
        );
      },
    });
  };

  // Show skeleton while loading
  if (isFetching) {
    return (
      <section className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const userRole = currentUser?.role || "User";

  return (
    <section className="p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your personal information and profile picture
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Current Role Display */}
            <div className="rounded-md bg-info-light p-4">
              <div className="flex items-center">
                <div className="text-sm text-info-text">
                  <strong>Role:</strong> {userRole}
                </div>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <FilePondUpload
                allowMultiple={false}
                maxFiles={1}
                acceptedFileTypes={[
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/gif",
                ]}
                labelIdle='Drag & Drop your profile picture or <span class="filepond--label-action">Browse</span>'
                onupdatefiles={handleImageUpdate}
                disabled={updateProfileMutation.isPending}
                credits={false}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 400x400px. Max size: 2MB
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Masukkan nama"
                disabled={updateProfileMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Masukkan email"
                disabled={updateProfileMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* NIP Field */}
            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input
                id="nip"
                type="text"
                {...register("nip")}
                placeholder="Masukkan NIP"
                disabled={updateProfileMutation.isPending}
              />
              {errors.nip && (
                <p className="text-sm text-destructive">{errors.nip.message}</p>
              )}
            </div>

            {/* Password Section Divider */}
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Change Password
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Leave password fields blank if you don't want to change your
                password
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru (Opsional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Masukkan password baru"
                  disabled={updateProfileMutation.isPending}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={updateProfileMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Konfirmasi Password Baru (Opsional)
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  {...register("password_confirmation")}
                  placeholder="Konfirmasi password baru"
                  disabled={updateProfileMutation.isPending}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordConfirmationVisibility}
                  disabled={updateProfileMutation.isPending}
                  tabIndex={-1}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="min-w-[140px]"
              >
                {updateProfileMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
});

export default ProfilePage;
