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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { ChevronDown, Loader2, Search } from "lucide-react";

// Custom hook to debounce values
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

interface PaginationData {
  data: Array<
    Record<string, unknown> & { uuid?: string; id?: string | number }
  >;
  from?: number;
  to?: number;
  total?: number;
  current_page?: number;
  last_page?: number;
}

interface PaginateCustomProps<
  TData = Record<string, unknown> & { uuid?: string; id?: string | number }
> {
  url: string;
  id: string;
  payload?: Record<string, unknown>;
  renderItem: (item: TData, index: number) => ReactNode;
  Plugin?: ReactNode;
  queryKey?: string[];
  perPage?: number;
  emptyMessage?: string;
  containerClassName?: string;
  showToolbar?: boolean;
}

export interface PaginateCustomRef {
  refetch: () => void;
  data: PaginationData | undefined;
}

// Loading overlay component
const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
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

const PaginateCustom = memo(
  forwardRef<PaginateCustomRef, PaginateCustomProps>(
    (
      {
        url,
        id,
        payload = {},
        renderItem,
        Plugin,
        queryKey,
        perPage = 10,
        emptyMessage = "Data not found",
        containerClassName = "",
        showToolbar = true,
      },
      ref
    ) => {
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 500);
      const [page, setPage] = useState(1);
      const [per, setPer] = useState(perPage);

      const { data, isFetching, refetch } = useQuery<PaginationData>({
        queryKey: queryKey ? queryKey : [url, payload],
        queryFn: () =>
          axios
            .get(url, {
              params: {
                search: debouncedSearch,
                page,
                per_page: Number(per),
                ...payload,
              },
            })
            .then((res) => res.data),
        placeholderData: { data: [] },
      });

      useImperativeHandle(ref, () => ({
        refetch,
        data,
      }));

      useEffect(() => {
        refetch();
      }, [debouncedSearch, per, page, refetch]);

      const pagination = useMemo(() => {
        const lastPage = data?.last_page || 0;
        const limit = lastPage <= page + 1 ? 5 : 2;
        return Array.from({ length: lastPage }, (_, i) => i + 1).filter(
          (i) =>
            i >= (page < 3 ? 3 : page) - limit &&
            i <= (page < 3 ? 3 : page) + limit
        );
      }, [page, data?.last_page]);

      const handleSearch = useCallback(
        (e: React.FormEvent) => {
          e.preventDefault();
          refetch();
        },
        [refetch]
      );

      // Determine if we should show the loading overlay
      const showLoading = isFetching;

      return (
        <Card>
          <CardContent>
            <div id={id} className="relative w-full">
              <LoadingOverlay isLoading={showLoading} />
              {showToolbar && (
                <div className="mb-4 flex flex-wrap justify-between gap-2 pt-4">
                  <div className="flex items-center gap-2">
                    <form
                      onSubmit={handleSearch}
                      className="relative flex w-full max-w-md"
                    >
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="text"
                        placeholder="Cari di sini..."
                        className="h-10 w-full rounded-lg border border-border bg-muted px-4 pr-10 text-[14px] leading-5 font-normal tracking-[-0.01em] text-foreground placeholder-muted-foreground focus:border-border focus:bg-background focus:ring-0 focus:outline-none"
                      />
                      <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </form>
                  </div>
                  {Plugin && (
                    <div className="flex items-center gap-4">{Plugin}</div>
                  )}
                </div>
              )}

              {/* Custom items container */}
              <div className={cn("", containerClassName)}>
                {data?.data?.length ? (
                  data.data.map((item, index) => (
                    <div key={item.uuid || item.id || index}>
                      {renderItem(item, index)}
                    </div>
                  ))
                ) : (
                  <div className="flex h-24 items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      {emptyMessage}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <div className="flex flex-1 shrink-0 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Items per page
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex h-8 items-center gap-1"
                        >
                          {per} <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {perOptions.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={per === option.value}
                            onCheckedChange={() => setPer(option.value)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Page {data?.current_page || 1} of {data?.last_page || 1}
                  </div>
                </div>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={cn(
                          "cursor-pointer",
                          data?.current_page === 1 &&
                            "pointer-events-none opacity-50"
                        )}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>

                    {pagination.map((item: number) => (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={item === page}
                          className="cursor-pointer"
                          onClick={() => setPage(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        className={cn(
                          "cursor-pointer",
                          data?.current_page === data?.last_page &&
                            "pointer-events-none opacity-50"
                        )}
                        onClick={() => setPage((prev) => prev + 1)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
  )
);

PaginateCustom.displayName = "PaginateCustom";

export { PaginateCustom };
