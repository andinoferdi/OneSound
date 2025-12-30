"use client";

import React, { memo, useMemo, useState, useRef, useEffect } from "react";

import { UserForm } from "@/blocks/dashboard/user/form";
import { PageTitle } from "@/components/layouts/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaginateTable,
  type PaginateTableRef,
} from "@/components/paginate-table";

import { usePermissions } from "@/services/auth";

import {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getRoles,
} from "@/services/user";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/user";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvalidateMutation } from "@/hooks/use-invalidate-mutation";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  Eye,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";

interface ErrorWithMessage {
  message?: string;
  response?: {
    data?: {
      data?: {
        message?: string;
      };
      message?: string;
    };
  };
  data?: {
    message?: string;
  };
}

const getErrorMessage = (err: unknown) => {
  const error = err as ErrorWithMessage;
  return (
    error?.response?.data?.data?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

const getStatusBadge = (isActive: boolean) => {
  if (isActive) {
    return (
      <Badge
        variant="default"
        className="bg-green-600 text-white border-green-600 hover:bg-green-700"
      >
        Aktif
      </Badge>
    );
  }
  return <Badge variant="destructive">Tidak Aktif</Badge>;
};

interface ActionCellProps {
  row: User;
}

const ActionCell = memo(function ActionCell({ row }: ActionCellProps) {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const userId = selectedId ?? row.id;

  const userByIdQuery = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId),
    enabled: openForm && Boolean(userId),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
  });

  const user = (openForm ? userByIdQuery.data ?? row : row) as User;

  const usersPaginatedKey = ["users", "paginated"] as const;

  const refetchUsersTable = async () => {
    await queryClient.refetchQueries({
      queryKey: usersPaginatedKey,
      exact: true,
      type: "active",
    });
  };

  const updateMutation = useInvalidateMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    invalidates: [["users"], ["roles"], ["lecturers"], ["students"]],
    onSuccess: async () => {
      await refetchUsersTable();
      toast.success("User berhasil diupdate");
      handleCloseForm();
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const deleteMutation = useInvalidateMutation({
    mutationFn: (id: string) => deleteUser(id),
    invalidates: [["users"], ["roles"], ["lecturers"], ["students"]],
    onSuccess: async () => {
      await refetchUsersTable();
      toast.success("User berhasil dihapus");
      setOpenDelete(false);
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const roleMutation = useInvalidateMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      updateUserRole(id, roleId),
    invalidates: [["users"], ["roles"], ["lecturers"], ["students"]],
    onSuccess: async () => {
      await refetchUsersTable();
      toast.success("Role user berhasil diupdate");
      setOpenRole(false);
      setSelectedRoleId("");
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const handleEdit = () => {
    setSelectedId(row.id);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedId(null);
  };

  const handleFormSubmit = async (values: {
    username: string;
    email: string;
    full_name: string;
    role_id: string;
    password?: string;
    is_active?: boolean;
  }) => {
    if (!selectedId) return;

    try {
      const data: UpdateUserRequest = {
        username: values.username,
        email: values.email,
        full_name: values.full_name,
        role_id: values.role_id,
        is_active: values.is_active,
      };
      await updateMutation.mutateAsync({ id: selectedId, data });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(row.id);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleOpenRole = () => {
    setSelectedId(row.id);
    setSelectedRoleId(row.role_id);
    setOpenRole(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId) {
      toast.error("Role wajib dipilih");
      return;
    }
    try {
      await roleMutation.mutateAsync({ id: row.id, roleId: selectedRoleId });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const canManage = hasPermission("user:manage");

  if (!canManage) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={
              updateMutation.isPending ||
              deleteMutation.isPending ||
              roleMutation.isPending
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/user/${row.id}`}
              className="flex cursor-pointer items-center"
              aria-label="Lihat detail user"
            >
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleEdit}
            disabled={updateMutation.isPending}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Ubah
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleOpenRole}
            disabled={roleMutation.isPending}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Atur Role
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            disabled={deleteMutation.isPending}
            variant="destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ubah User</DialogTitle>
            <DialogDescription>
              Ubah data user di form berikut.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            mode="edit"
            initialValues={user}
            roles={rolesQuery.data ?? []}
            onSubmit={handleFormSubmit}
            submitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              User yang dihapus tidak dapat dikembalikan. Pastikan user tidak
              memiliki data terkait (student profile, lecturer profile, atau
              prestasi).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openRole} onOpenChange={setOpenRole}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Role</DialogTitle>
            <DialogDescription>Pilih role untuk user ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-select">Role</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={roleMutation.isPending}
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {(rolesQuery.data ?? []).map((role) => (
                    <SelectItem
                      key={role.id}
                      value={String(role.id)}
                      textValue={String(role.name ?? "")}
                    >
                      {role.name ?? "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpenRole(false)}
              disabled={roleMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={roleMutation.isPending || !selectedRoleId}
            >
              {roleMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

const UserPage = () => {
  const queryClient = useQueryClient();
  const tableRef = useRef<PaginateTableRef>(null);
  const pathname = usePathname();

  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage");

  const [openCreate, setOpenCreate] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
  });

  const usersPaginatedKey = ["users", "paginated"] as const;

  const refetchUsersTable = async () => {
    await queryClient.refetchQueries({
      queryKey: usersPaginatedKey,
      exact: true,
      type: "active",
    });
  };

  useEffect(() => {
    if (pathname === "/user") {
      void queryClient.refetchQueries({
        queryKey: ["users", "paginated"],
        exact: true,
        type: "active",
      });
    }
  }, [pathname, queryClient]);

  const createMutation = useInvalidateMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    invalidates: [["users"], ["roles"], ["lecturers"], ["students"]],
    onSuccess: async () => {
      await refetchUsersTable();
      toast.success("User berhasil dibuat");
      setOpenCreate(false);
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        meta: { style: { width: "110px" } },
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            #{row.original.id.slice(-8)}
          </span>
        ),
      },
      {
        accessorKey: "username",
        header: "Username",
        meta: { style: { minWidth: "150px" } },
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.username}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { style: { minWidth: "200px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Nama Lengkap",
        meta: { style: { minWidth: "200px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.full_name}</span>
        ),
      },
      {
        accessorKey: "role_id",
        header: "Role ID",
        meta: { style: { width: "120px" } },
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.role_id.slice(-8)}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        meta: { style: { width: "100px" } },
        cell: ({ row }) => getStatusBadge(row.original.is_active),
      },
      {
        id: "actions",
        header: "Aksi",
        enableHiding: false,
        meta: { style: { width: "110px" }, align: "right" },
        cell: ({ row }) => <ActionCell row={row.original} />,
      },
    ],
    []
  );

  const handleOpenCreate = () => setOpenCreate(true);

  const handleCreateSubmit = async (values: {
    username: string;
    email: string;
    full_name: string;
    role_id: string;
    password?: string;
    is_active?: boolean;
    student_id?: string;
    program_study?: string;
    academic_year?: string;
    advisor_id?: string;
    lecturer_id?: string;
    department?: string;
  }) => {
    try {
      const data: CreateUserRequest = {
        username: values.username,
        email: values.email,
        password: values.password ?? "",
        full_name: values.full_name,
        role_id: values.role_id,
        is_active: values.is_active,
        student_id: values.student_id,
        program_study: values.program_study,
        academic_year: values.academic_year,
        advisor_id: values.advisor_id,
        lecturer_id: values.lecturer_id,
        department: values.department,
      };
      await createMutation.mutateAsync(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const isCreating = createMutation.isPending;

  if (!canManage) {
    return (
      <section className="p-4">
        <PageTitle title="Manajemen User" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <PageTitle title="Manajemen User" />

      <div className="mt-4">
        <PaginateTable
          ref={tableRef}
          id="users-table"
          url="/users"
          columns={
            columns as ColumnDef<
              Record<string, unknown> & { id?: string | number }
            >[]
          }
          perPage={10}
          queryKey={["users", "paginated"]}
          Plugin={
            <Button
              onClick={handleOpenCreate}
              disabled={isCreating}
              className="text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          }
        />
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah User</DialogTitle>
            <DialogDescription>
              Isi form berikut untuk menambah user baru.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            mode="create"
            roles={rolesQuery.data ?? []}
            onSubmit={handleCreateSubmit}
            submitting={isCreating}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UserPage;
