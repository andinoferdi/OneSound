import axios from "@/lib/axios";
import type {
  CurrentUserResponse,
  LoginFormData,
  LoginResponse,
  ProfileResponse,
} from "@/types/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export const authService = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>("/auth/login", {
      username: data.username,
      password: data.password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await axios.get<ProfileResponse | CurrentUserResponse>(
      "/auth/profile"
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "status" in response.data
    ) {
      const wrapped = response.data as ProfileResponse;
      if (wrapped.status === "success") {
        return wrapped.data;
      }
      throw new Error("Failed to get user profile");
    }
    return response.data as CurrentUserResponse;
  },

  updateProfile: async (formData: FormData): Promise<CurrentUserResponse> => {
    const response = await axios.post<ProfileResponse | CurrentUserResponse>(
      "/auth/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "status" in response.data
    ) {
      const wrapped = response.data as ProfileResponse;
      if (wrapped.status === "success") {
        return wrapped.data;
      }
      throw new Error("Failed to update profile");
    }
    return response.data as CurrentUserResponse;
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> => {
    const response = await axios.post<
      | { status: string; data: { token: string; refreshToken: string } }
      | { token: string; refreshToken: string }
    >("/auth/refresh", { refreshToken });
    if (
      response.data &&
      typeof response.data === "object" &&
      "status" in response.data
    ) {
      const wrapped = response.data as {
        status: string;
        data: { token: string; refreshToken: string };
      };
      if (wrapped.status === "success") {
        return wrapped.data;
      }
      throw new Error("Failed to refresh token");
    }
    return response.data as { token: string; refreshToken: string };
  },

  hasPermission: (
    userData: CurrentUserResponse | null,
    permission: string
  ): boolean => {
    if (!permission) {
      return true;
    }

    if (!userData || !userData.permissions) {
      return false;
    }

    return userData.permissions.includes(permission);
  },
};

export const useCurrentUser = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    enabled: !!token,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const usePermissions = () => {
  const { data: currentUser } = useCurrentUser();
  const { user: contextUser } = useAuth();
  const userData = currentUser || contextUser;

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(userData, permission);
  };

  const getUserData = (): CurrentUserResponse | null => {
    return userData;
  };

  return {
    hasPermission,
    getUserData,
    userData,
  };
};
