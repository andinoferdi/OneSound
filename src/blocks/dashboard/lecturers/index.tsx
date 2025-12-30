"use client";

import React, { memo, useMemo, useRef } from "react";

import { PageTitle } from "@/components/layouts/page-title";
import {
  PaginateTable,
  type PaginateTableRef,
} from "@/components/paginate-table";

import { usePermissions } from "@/services/auth";
import type { Lecturer } from "@/types/lecturers";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";

interface ActionCellProps {
  row: Lecturer;
}

const ActionCell = memo(function ActionCell({ row }: ActionCellProps) {
  return (
    <Link
      href={`/dashboard/lecturers/${row.id}`}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
    >
      <Eye className="mr-2 h-4 w-4" />
      Detail
    </Link>
  );
});

const LecturerPage = () => {
  const tableRef = useRef<PaginateTableRef>(null);
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("user:manage");

  const columns = useMemo<ColumnDef<Lecturer>[]>(
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
        accessorKey: "lecturer_id",
        header: "NIDN",
        meta: { style: { minWidth: "120px" } },
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.lecturer_id}
          </span>
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
        accessorKey: "department",
        header: "Departemen",
        meta: { style: { minWidth: "200px" } },
        cell: ({ row }) => (
          <span className="text-sm">{row.original.department || "-"}</span>
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
        <PageTitle title="Daftar Dosen Wali" />
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
      <PageTitle title="Daftar Dosen Wali" />

      <div className="mt-4">
        <PaginateTable
          ref={tableRef}
          id="lecturers-table"
          url="/dashboard/lecturers"
          columns={
            columns as ColumnDef<
              Record<string, unknown> & { id?: string | number }
            >[]
          }
          perPage={10}
          queryKey={["lecturers", "paginated"]}
        />
      </div>
    </section>
  );
};

export default LecturerPage;
