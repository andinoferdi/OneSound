import {
  ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { format } from "date-fns";
import { ChevronDown, Loader2, Settings2 } from "lucide-react";

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

type RowItem = Record<string, unknown> & {
  uuid?: string;
  id?: string | number;
  type?: string;
  date?: string;
  data?: { uuid?: string; id?: string | number };
};

interface PaginationData {
  data: RowItem[];
  from?: number;
  to?: number;
  total?: number;
  current_page?: number;
  last_page?: number;
}

interface PaginateTableProps<TData = RowItem> {
  columns: ColumnDef<TData, unknown>[];
  url: string;
  id: string;
  payload?: Record<string, unknown>;
  massSelect?: string[] | number[];
  onChangeMassSelect?: (values: (string | number)[]) => void;
  massSelectField?: string;
  Plugin?: ReactNode;
  grouped?: boolean;
  queryKey?: unknown[];
  perPage?: number;
  searchIsForm?: boolean;
  onSuccess?: () => void;
}

export interface PaginateTableRef {
  refetch: () => void;
  data: PaginationData | undefined;
}

const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Memuat...</p>
      </div>
    </div>
  );
};

const perOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

const DateFormatter = ({ date }: { date: string | Date }) => {
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(date), "EEEE, dd MMMM yyyy");
    } catch {
      return "";
    }
  }, [date]);

  return <p className="text-sm font-medium">{formattedDate}</p>;
};

type QueryResponse =
  | { status?: string; data?: unknown[] | PaginationData }
  | unknown[]
  | PaginationData;

const normalizeToPagination = (
  rawData: QueryResponse,
  page: number,
  per: number,
  search: string
): PaginationData => {
  let allItems: unknown[] = [];

  if (Array.isArray(rawData)) {
    allItems = rawData;
  } else if (
    rawData &&
    typeof rawData === "object" &&
    "status" in rawData &&
    rawData.status === "success" &&
    "data" in rawData
  ) {
    const inner = (rawData as { data?: unknown[] | PaginationData }).data;
    if (Array.isArray(inner)) {
      allItems = inner;
    } else if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      Array.isArray((inner as PaginationData).data)
    ) {
      return inner as PaginationData;
    }
  } else if (
    rawData &&
    typeof rawData === "object" &&
    "data" in rawData &&
    Array.isArray((rawData as PaginationData).data)
  ) {
    return rawData as PaginationData;
  }

  const baseItems = allItems;
  if (baseItems.length === 0) {
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  }

  const filteredItems = (() => {
    if (!search) return baseItems;

    const searchLower = search.toLowerCase();
    return baseItems.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const itemStr = JSON.stringify(item).toLowerCase();
      return itemStr.includes(searchLower);
    });
  })();

  const total = filteredItems.length;
  const lastPage = Math.ceil(total / per) || 1;
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const startIndex = (safePage - 1) * per;
  const endIndex = startIndex + per;
  const paginatedData = filteredItems.slice(startIndex, endIndex);

  return {
    data: paginatedData as RowItem[],
    current_page: safePage,
    last_page: lastPage,
    from: total > 0 ? startIndex + 1 : 0,
    to: Math.min(endIndex, total),
    total,
  };
};

const PaginateTable = memo(
  forwardRef<PaginateTableRef, PaginateTableProps>(
    (
      {
        columns,
        url,
        id,
        payload = {},
        massSelect = [],
        onChangeMassSelect = () => {},
        massSelectField = "uuid",
        Plugin,
        grouped = false,
        queryKey,
        perPage = 10,
        searchIsForm = true,
        onSuccess,
      },
      ref
    ) => {
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 500);
      const [page, setPage] = useState(1);
      const [per, setPer] = useState(perPage);
      const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
      );

      const payloadKey = useMemo(() => payload, [payload]);

      const {
        data: rawData,
        isFetching,
        refetch,
        isSuccess,
      } = useQuery<QueryResponse>({
        queryKey: queryKey ? queryKey : [url, payloadKey],
        queryFn: async () => {
          try {
            const res = await axios.get<QueryResponse>(url, {
              params: { ...payloadKey },
              timeout: 10000,
            });
            return res.data;
          } catch (error) {
            console.error("PaginateTable query error:", error);
            return { data: [], current_page: 1, last_page: 1, total: 0 };
          }
        },
        placeholderData: { data: [], current_page: 1, last_page: 1, total: 0 },
        retry: 1,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      });

      useEffect(() => {
        if (isSuccess && rawData && onSuccess) {
          onSuccess();
        }
      }, [isSuccess, rawData, onSuccess]);

      const data = useMemo(() => {
        if (!rawData) {
          return { data: [], current_page: 1, last_page: 1, total: 0 };
        }
        return normalizeToPagination(rawData, page, per, debouncedSearch);
      }, [rawData, page, per, debouncedSearch]);

      useImperativeHandle(ref, () => ({
        refetch,
        data,
      }));

      const table = useReactTable({
        data: data.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: { columnVisibility },
      });

      const hideableColumns = useMemo(() => {
        return table
          .getAllLeafColumns()
          .filter(
            (column) =>
              column.getCanHide() && typeof column.accessorFn !== "undefined"
          );
      }, [table]);

      const getColumnLabel = useCallback(
        (columnId: string) => {
          const col = table.getColumn(columnId);
          if (!col) return columnId;
          const header = col.columnDef.header;
          if (typeof header === "string") return header;
          return col.id;
        },
        [table]
      );

      const toggleColumnVisibility = useCallback(
        (columnId: string) => {
          table.setColumnVisibility((prev) => {
            const currentlyVisible = prev[columnId] !== false;
            const next: VisibilityState = { ...prev };

            if (currentlyVisible) {
              next[columnId] = false;
              return next;
            }

            if (columnId in next) {
              delete next[columnId];
            }
            return next;
          });
        },
        [table]
      );

      useEffect(() => {
        setPage(1);
      }, [debouncedSearch]);

      useEffect(() => {
        if (!data.last_page) return;
        if (page <= data.last_page) return;
        setPage(data.last_page);
      }, [data.last_page, page]);

      const pagination = useMemo(() => {
        const lastPage = data.last_page || 0;
        const limit = lastPage <= page + 1 ? 5 : 2;
        return Array.from({ length: lastPage }, (_, i) => i + 1).filter(
          (i) =>
            i >= (page < 3 ? 3 : page) - limit &&
            i <= (page < 3 ? 3 : page) + limit
        );
      }, [page, data.last_page]);

      const handleMassSelect = useCallback(
        (checked: boolean) => {
          if (!checked) {
            onChangeMassSelect([]);
            return;
          }

          if (!data.data?.length) {
            onChangeMassSelect([]);
            return;
          }

          onChangeMassSelect(
            data.data.map(
              (
                item: Record<string, unknown> & {
                  uuid?: string;
                  id?: string | number;
                }
              ) => {
                const fieldValue = item[massSelectField as keyof typeof item];
                return isNaN(Number(fieldValue))
                  ? String(fieldValue)
                  : Number(fieldValue);
              }
            )
          );
        },
        [data.data, massSelectField, onChangeMassSelect]
      );

      const handleSearch = useCallback(
        (e: React.FormEvent) => {
          e.preventDefault();
          refetch();
        },
        [refetch]
      );

      const handlePrevPage = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 1));
      }, []);

      const handleNextPage = useCallback(() => {
        setPage((prev) => prev + 1);
      }, []);

      const showLoading = isFetching;
      const visibleColumnsCount = table.getVisibleLeafColumns().length;

      return (
        <Card id={id} className="relative w-full">
          <CardContent>
            <LoadingOverlay isLoading={showLoading} />

            <div className="mb-4 flex flex-wrap justify-between gap-2 pt-4">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto flex h-8 items-center gap-1"
                      aria-label="Tampilkan kolom"
                    >
                      <Settings2 className="h-4 w-4" />
                      <span>Tampilkan</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuLabel>Tampilkan kolom</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {hideableColumns.map((column) => {
                      const label = getColumnLabel(column.id);
                      const isVisible = column.getIsVisible();

                      return (
                        <DropdownMenuItem
                          key={column.id}
                          className="flex cursor-pointer items-center gap-2"
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleColumnVisibility(column.id);
                          }}
                          aria-label={`Toggle kolom ${label}`}
                        >
                          <Checkbox
                            checked={isVisible}
                            onCheckedChange={() => {}}
                            className="pointer-events-none h-4 w-4"
                            aria-label={`Checkbox ${label}`}
                          />
                          <span className="text-sm capitalize">{label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {searchIsForm ? (
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                      type="search"
                      className="w-full"
                      placeholder="Cari ..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Cari data"
                    />
                  </form>
                ) : (
                  <div className="flex">
                    <Input
                      type="search"
                      className="w-full"
                      placeholder="Cari ..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Cari data"
                    />
                  </div>
                )}
              </div>

              {Plugin ? (
                <div className="flex items-center gap-4">{Plugin}</div>
              ) : null}
            </div>

            <div className="rounded-md border">
              <ScrollArea className="w-full max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="py-4 font-medium"
                            style={
                              (
                                header.column.columnDef.meta as {
                                  style?: React.CSSProperties;
                                }
                              )?.style
                            }
                          >
                            {header.column.columnDef.header === "check" &&
                            Boolean(data.data?.length) ? (
                              <div className="flex h-4 w-4 items-center">
                                <Checkbox
                                  className="h-5 w-5 cursor-pointer"
                                  checked={
                                    massSelect?.length === data.data.length
                                  }
                                  onCheckedChange={(checked) =>
                                    handleMassSelect(Boolean(checked))
                                  }
                                  aria-label="Pilih semua"
                                />
                              </div>
                            ) : header.isPlaceholder ? null : (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, idx) => (
                        <TableRow
                          key={
                            grouped
                              ? `row.${
                                  (row.original as RowItem).type === "group"
                                    ? (row.original as RowItem).date
                                    : (row.original as RowItem).data?.uuid ??
                                      idx
                                }`
                              : `row.${
                                  (row.original as RowItem).uuid ??
                                  (row.original as RowItem).id ??
                                  idx
                                }`
                          }
                        >
                          {(row.original as RowItem).type === "group" ? (
                            <TableCell
                              key={`cell.${row.id}.${
                                (row.original as RowItem).date ?? idx
                              }`}
                              className={cn(
                                "py-4",
                                (row.original as RowItem).type === "group" &&
                                  "bg-info-light"
                              )}
                              colSpan={Math.max(visibleColumnsCount, 1)}
                            >
                              <div className="flex flex-col gap-2">
                                {(row.original as RowItem).date ? (
                                  <DateFormatter
                                    date={
                                      (row.original as RowItem).date as string
                                    }
                                  />
                                ) : null}
                              </div>
                            </TableCell>
                          ) : (
                            row.getVisibleCells().map((cell, indexCell) => (
                              <TableCell
                                key={`cell.${cell.id}.${
                                  (cell.row.original as RowItem).uuid ??
                                  (cell.row.original as RowItem).id ??
                                  indexCell
                                }`}
                                className="py-4"
                                style={
                                  (
                                    cell.column.columnDef.meta as {
                                      style?: React.CSSProperties;
                                    }
                                  )?.style
                                }
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow key="no-data">
                        <TableCell
                          colSpan={Math.max(visibleColumnsCount, 1)}
                          className="h-24 text-center"
                        >
                          <p className="text-muted-foreground text-sm">
                            Data tidak ditemukan
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <div className="flex flex-1 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Baris per halaman
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex h-8 items-center gap-1"
                        aria-label="Baris per halaman"
                      >
                        {per} <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start">
                      {perOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className="flex cursor-pointer items-center justify-between"
                          onSelect={(e) => {
                            e.preventDefault();
                            setPer(option.value);
                          }}
                          aria-label={`Atur baris per halaman ${option.label}`}
                        >
                          <span className="text-sm">{option.label}</span>
                          <span
                            className={cn(
                              "text-sm",
                              per === option.value ? "opacity-100" : "opacity-0"
                            )}
                          >
                            ✓
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-muted-foreground text-sm">
                  Halaman {data.current_page || 1} dari {data.last_page || 1}
                </div>
              </div>

              <Pagination className="mx-0 w-auto" aria-label="Pagination">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={cn(
                        "cursor-pointer",
                        (data.current_page || 1) === 1 &&
                          "pointer-events-none opacity-50"
                      )}
                      onClick={handlePrevPage}
                      aria-label="Halaman sebelumnya"
                    />
                  </PaginationItem>

                  {pagination.map((item) => (
                    <PaginationItem key={item}>
                      <PaginationLink
                        isActive={item === page}
                        className="cursor-pointer"
                        onClick={() => setPage(item)}
                        aria-label={`Halaman ${item}`}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        "cursor-pointer",
                        (data.current_page || 1) === (data.last_page || 1) &&
                          "pointer-events-none opacity-50"
                      )}
                      onClick={handleNextPage}
                      aria-label="Halaman berikutnya"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      );
    }
  )
);

PaginateTable.displayName = "PaginateTable";

export { PaginateTable };
