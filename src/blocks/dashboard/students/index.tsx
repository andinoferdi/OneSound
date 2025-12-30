"use client";

import React, { memo, useMemo, useRef } from "react";

import { PageTitle } from "@/components/layouts/page-title";
import {
  PaginateTable,
  type PaginateTableRef,
} from "@/components/paginate-table";

import { usePermissions } from "@/services/auth";
import type { Student } from "@/types/students";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";

interface ActionCellProps {
  row: Student;
}

const ActionCell = memo(function ActionCell({ row }: ActionCellProps) {
  return (
    <Link
      href={`/dashboard/students/${row.id}`}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
    >
      <Eye className="mr-2 h-4 w-4" />
      Detail
    </Link>
  );
});

const StudentPage = () => {
  const tableRef = useRef<PaginateTableRef>(null);
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage");

  const columns = useMemo<ColumnDef<Student>[]>(
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
        accessorKey: "student_id",
        header: "NIM",
        meta: { style: { minWidth: "120px" } },
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.student_id}</span>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Nama",
        meta: { style: { minWidth: "200px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.full_name || "-"}</span>
        ),
      },
      {
        accessorKey: "program_study",
        header: "Program Studi",
        meta: { style: { minWidth: "150px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.program_study || "-"}</span>
        ),
      },
      {
        accessorKey: "academic_year",
        header: "Tahun Akademik",
        meta: { style: { width: "120px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.academic_year || "-"}</span>
        ),
      },
      {
        accessorKey: "advisor_id",
        header: "ID Dosen Wali",
        meta: { style: { width: "120px" } },
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.advisor_id ? row.original.advisor_id.slice(-8) : "-"}
          </span>
        ),
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

  if (!canManage) {
    return (
      <section className="p-4">
        <PageTitle title="Daftar Mahasiswa" />
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
      <PageTitle title="Daftar Mahasiswa" />

      <div className="mt-4">
        <PaginateTable
          ref={tableRef}
          id="students-table"
          url="/dashboard/students"
          columns={
            columns as ColumnDef<
              Record<string, unknown> & { id?: string | number }
            >[]
          }
          perPage={10}
          queryKey={["students", "paginated"]}
        />
      </div>
    </section>
  );
};

export default StudentPage;
