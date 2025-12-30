"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useInvalidateMutation } from "@/hooks/use-invalidate-mutation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  GraduationCap,
  UserCog,
} from "lucide-react";

import { PageTitle } from "@/components/layouts/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getUserById,
  createStudentProfile,
  createLecturerProfile,
  updateStudentAdvisor,
  getLecturers,
  getRoles,
  getStudentByUserId,
  getLecturerByUserId,
} from "@/services/user";
import type {
  Student,
  Lecturer,
  CreateStudentRequest,
  CreateLecturerRequest,
} from "@/types/user";
import { usePermissions } from "@/services/auth";
import { toast } from "react-toastify";

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

const formatDateSafe = (value: string | undefined) => {
  if (!value) return "-";
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return format(dt, "dd MMM yyyy, HH:mm");
  } catch {
    return value;
  }
};

const getErrorMessage = (err: unknown) => {
  const error = err as {
    message?: string;
    response?: { data?: { data?: { message?: string }; message?: string } };
    data?: { message?: string };
  };
  return (
    error?.response?.data?.data?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan"
  );
};

const UserDetail = () => {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { hasPermission } = usePermissions();

  const canManage = hasPermission("user:manage");

  const [openStudentProfile, setOpenStudentProfile] = useState(false);
  const [openLecturerProfile, setOpenLecturerProfile] = useState(false);
  const [openAdvisor, setOpenAdvisor] = useState(false);

  const [studentForm, setStudentForm] = useState<CreateStudentRequest>({
    student_id: "",
    program_study: "",
    academic_year: "",
    advisor_id: "",
  });

  const [lecturerForm, setLecturerForm] = useState<CreateLecturerRequest>({
    lecturer_id: "",
    department: "",
  });

  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  const userId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const {
    data: user,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
  });

  const lecturersQuery = useQuery({
    queryKey: ["lecturers"],
    queryFn: () => getLecturers(),
  });

  const roleName = useMemo(() => {
    if (!user || !rolesQuery.data) return "";
    const role = rolesQuery.data.find((r) => r.id === user.role_id);
    return role?.name ?? "";
  }, [user, rolesQuery.data]);

  const isMahasiswa = roleName.toLowerCase() === "mahasiswa";
  const isDosenWali = roleName.toLowerCase() === "dosen wali";

  const studentProfileQuery = useQuery<Student | null>({
    queryKey: ["students", "by-user", userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: Boolean(userId) && isMahasiswa,
    retry: false,
  });

  const lecturerProfileQuery = useQuery<Lecturer | null>({
    queryKey: ["lecturers", "by-user", userId],
    queryFn: () => getLecturerByUserId(userId),
    enabled: Boolean(userId) && isDosenWali,
    retry: false,
  });

  const studentProfile = studentProfileQuery.data;
  const lecturerProfile = lecturerProfileQuery.data;
  const hasStudentProfile = !!studentProfile;
  const hasLecturerProfile = !!lecturerProfile;

  const createStudentMutation = useInvalidateMutation({
    mutationFn: (data: CreateStudentRequest) =>
      createStudentProfile(userId, data),
    invalidates: [["students"], ["users", userId]],
    onSuccess: async () => {
      await studentProfileQuery.refetch();
      toast.success("Student profile berhasil dibuat");
      setOpenStudentProfile(false);
      setStudentForm({
        student_id: "",
        program_study: "",
        academic_year: "",
        advisor_id: "",
      });
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const createLecturerMutation = useInvalidateMutation({
    mutationFn: (data: CreateLecturerRequest) =>
      createLecturerProfile(userId, data),
    invalidates: [["lecturers"], ["roles"], ["users", userId]],
    onSuccess: async () => {
      await lecturerProfileQuery.refetch();
      toast.success("Lecturer profile berhasil dibuat");
      setOpenLecturerProfile(false);
      setLecturerForm({
        lecturer_id: "",
        department: "",
      });
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const updateAdvisorMutation = useInvalidateMutation({
    mutationFn: ({
      studentId,
      advisorId,
    }: {
      studentId: string;
      advisorId: string;
    }) => updateStudentAdvisor(studentId, advisorId),
    invalidates: [["students"], ["lecturers"]],
    onSuccess: async () => {
      await studentProfileQuery.refetch();
      toast.success("Advisor berhasil diupdate");
      setOpenAdvisor(false);
      setSelectedAdvisorId("");
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const handleCreateStudentProfile = async () => {
    if (!studentForm.student_id.trim()) {
      toast.error("NIM wajib diisi");
      return;
    }
    try {
      await createStudentMutation.mutateAsync(studentForm);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleCreateLecturerProfile = async () => {
    if (!lecturerForm.lecturer_id.trim()) {
      toast.error("NIDN wajib diisi");
      return;
    }
    try {
      await createLecturerMutation.mutateAsync(lecturerForm);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateAdvisor = async () => {
    if (!studentProfile) {
      toast.error("Student profile tidak ditemukan");
      return;
    }
    try {
      await updateAdvisorMutation.mutateAsync({
        studentId: studentProfile.id,
        advisorId: selectedAdvisorId,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!canManage) {
    return (
      <section className="p-4">
        <PageTitle title="Detail User" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </section>
    );
  }

  if (isLoading || isFetching) {
    return (
      <section className="p-4">
        <PageTitle title="Detail User" />
        <div className="mt-4 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="p-4">
        <PageTitle title="Detail User" />
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-destructive">
            Gagal memuat data user. {getErrorMessage(error)}
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <PageTitle title="Detail User" />
      </div>

      <div className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informasi User</CardTitle>
            <CardDescription>Data dasar user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">ID</Label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Username</Label>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p>{user.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Nama Lengkap</Label>
                <p className="font-medium">{user.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p>{roleName || user.role_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div>{getStatusBadge(user.is_active)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Dibuat</Label>
                <p>{formatDateSafe(user.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Diupdate</Label>
                <p>{formatDateSafe(user.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isMahasiswa && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profil Mahasiswa</CardTitle>
                  <CardDescription>Data profil mahasiswa</CardDescription>
                </div>
                {!hasStudentProfile && (
                  <Button onClick={() => setOpenStudentProfile(true)} size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Buat Profil Mahasiswa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasStudentProfile ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">NIM</Label>
                      <p className="font-medium">{studentProfile.student_id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Program Studi
                      </Label>
                      <p>{studentProfile.program_study || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Tahun Akademik
                      </Label>
                      <p>{studentProfile.academic_year || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Dosen Pembimbing
                      </Label>
                      <p className="font-mono text-sm">
                        {studentProfile.advisor_id || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Dibuat</Label>
                      <p>{formatDateSafe(studentProfile.created_at)}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        setSelectedAdvisorId(studentProfile.advisor_id || "");
                        setOpenAdvisor(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Perbarui Dosen Pembimbing
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  User belum memiliki profil mahasiswa.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isDosenWali && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profil Dosen Wali</CardTitle>
                  <CardDescription>Data profil dosen wali</CardDescription>
                </div>
                {!hasLecturerProfile && (
                  <Button
                    onClick={() => setOpenLecturerProfile(true)}
                    size="sm"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Buat Profil Dosen Wali
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {hasLecturerProfile ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">NIDN</Label>
                    <p className="font-medium">{lecturerProfile.lecturer_id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Departemen</Label>
                    <p>{lecturerProfile.department || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Dibuat</Label>
                    <p>{formatDateSafe(lecturerProfile.created_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  User belum memiliki profil dosen wali.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={openStudentProfile} onOpenChange={setOpenStudentProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Profil Mahasiswa</DialogTitle>
            <DialogDescription>
              Buat profil mahasiswa untuk user ini. User harus memiliki role
              Mahasiswa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">NIM *</Label>
              <Input
                id="student_id"
                value={studentForm.student_id}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, student_id: e.target.value })
                }
                placeholder="Masukkan NIM"
                disabled={createStudentMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_study">Program Studi</Label>
              <Input
                id="program_study"
                value={studentForm.program_study}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    program_study: e.target.value,
                  })
                }
                placeholder="Masukkan program studi"
                disabled={createStudentMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Tahun Akademik</Label>
              <Input
                id="academic_year"
                value={studentForm.academic_year}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    academic_year: e.target.value,
                  })
                }
                placeholder="Masukkan tahun akademik"
                disabled={createStudentMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advisor_id">Dosen Pembimbing (Opsional)</Label>
              <Select
                value={studentForm.advisor_id || "none"}
                onValueChange={(value) =>
                  setStudentForm({
                    ...studentForm,
                    advisor_id: value === "none" ? "" : value,
                  })
                }
                disabled={createStudentMutation.isPending}
              >
                <SelectTrigger id="advisor_id">
                  <SelectValue placeholder="Pilih dosen pembimbing (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Tidak ada dosen pembimbing
                  </SelectItem>
                  {(lecturersQuery.data ?? []).map((lecturer) => (
                    <SelectItem key={lecturer.id} value={lecturer.id}>
                      {lecturer.lecturer_id} - {lecturer.full_name || ""} -{" "}
                      {lecturer.department || "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenStudentProfile(false)}
              disabled={createStudentMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateStudentProfile}
              disabled={
                createStudentMutation.isPending ||
                !studentForm.student_id.trim()
              }
            >
              {createStudentMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openLecturerProfile} onOpenChange={setOpenLecturerProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Profil Dosen Wali</DialogTitle>
            <DialogDescription>
              Buat profil dosen wali untuk user ini. User harus memiliki role
              Dosen Wali.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lecturer_id">NIDN *</Label>
              <Input
                id="lecturer_id"
                value={lecturerForm.lecturer_id}
                onChange={(e) =>
                  setLecturerForm({
                    ...lecturerForm,
                    lecturer_id: e.target.value,
                  })
                }
                placeholder="Masukkan NIDN"
                disabled={createLecturerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departemen</Label>
              <Input
                id="department"
                value={lecturerForm.department}
                onChange={(e) =>
                  setLecturerForm({
                    ...lecturerForm,
                    department: e.target.value,
                  })
                }
                placeholder="Masukkan departemen"
                disabled={createLecturerMutation.isPending}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenLecturerProfile(false)}
              disabled={createLecturerMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateLecturerProfile}
              disabled={
                createLecturerMutation.isPending ||
                !lecturerForm.lecturer_id.trim()
              }
            >
              {createLecturerMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openAdvisor} onOpenChange={setOpenAdvisor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perbarui Dosen Pembimbing</DialogTitle>
            <DialogDescription>
              Pilih atau hapus dosen pembimbing untuk mahasiswa ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advisor-select">Dosen Pembimbing</Label>
              <Select
                value={selectedAdvisorId || "none"}
                onValueChange={(value) =>
                  setSelectedAdvisorId(value === "none" ? "" : value)
                }
                disabled={updateAdvisorMutation.isPending}
              >
                <SelectTrigger id="advisor-select">
                  <SelectValue placeholder="Pilih dosen pembimbing atau kosongkan untuk menghapus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Tidak ada dosen pembimbing
                  </SelectItem>
                  {(lecturersQuery.data ?? []).map((lecturer) => (
                    <SelectItem key={lecturer.id} value={lecturer.id}>
                      {lecturer.lecturer_id} - {lecturer.full_name || ""} -{" "}
                      {lecturer.department || "-"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenAdvisor(false)}
              disabled={updateAdvisorMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateAdvisor}
              disabled={updateAdvisorMutation.isPending}
            >
              {updateAdvisorMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UserDetail;
