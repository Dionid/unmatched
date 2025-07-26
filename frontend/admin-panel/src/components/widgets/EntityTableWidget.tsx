import { usePaasibleApi } from "@/lib/paasible";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RecordListOptions, RecordModel } from "pocketbase";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1
) => {
  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, "...", ...middleRange, "...", totalPages];
  }

  return [];
};

interface EntityTableWidgetProps {
  collectionName: string;
  displayColumns?: string[];
  columnNames?: Record<string, string>;
  columnTransformers?: Record<
    string,
    (value: any, item: RecordModel) => ReactNode
  >;
  collectionOptions?: RecordListOptions;
  searchableColumns?: string[];
}

export const EntityTableWidget: React.FC<EntityTableWidgetProps> = ({
  collectionName,
  displayColumns,
  columnNames,
  columnTransformers,
  collectionOptions,
  searchableColumns,
}) => {
  const api = usePaasibleApi();
  const [items, setItems] = useState<RecordModel[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const paginationRange = getPaginationRange(page, totalPages, 1);

  const listQuery = useCallback(async () => {
    try {
      const filter = Object.entries(searchTerms)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key} ~ "${value}"`)
        .join(" && ");

      const options = { ...collectionOptions };
      if (filter) {
        if (options.filter) {
          options.filter = `(${options.filter}) && (${filter})`;
        } else {
          options.filter = filter;
        }
      }

      const result = await api.pb
        .collection(collectionName)
        .getList(page, 20, options);
      setItems(result.items);
      setTotalPages(result.totalPages);
    } catch (error: Error | unknown) {
      if (!(error instanceof Error)) {
        console.error("Unexpected error:", error);
        toast.error("Неизвестная ошибка при загрузке данных");
        return;
      }
      toast.error(
        `Ошибка загрузки коллекции ${collectionName}: ${error.message}`
      );
      setItems([]);
    }
  }, [api.pb, collectionName, page, collectionOptions, searchTerms]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      listQuery();
    }, 500);
    return () => clearTimeout(debounce);
  }, [listQuery]);

  const handleSearchChange = (column: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [column]: value }));
  };

  const handleDelete = async (id: string) => {
    await api.pb.collection(collectionName).delete(id);
    toast.success("Элемент удален");
    listQuery();
  };

  const handleBulkDelete = async () => {
    await Promise.all(
      selectedItems.map((id) => api.pb.collection(collectionName).delete(id))
    );
    toast.success("Элементы удалены");
    setSelectedItems([]);
    listQuery();
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  if (!items.length) {
    return (
      <Card>
        <CardContent>
          <div>Нет данных</div>
        </CardContent>
      </Card>
    );
  }

  const columns =
    displayColumns ||
    Object.keys(items[0] || {}).filter(
      (key) => !["@collectionId", "@collectionName", "@expand"].includes(key)
    );

  return (
    <div className="space-y-4">
      <div className="hidden">
        <Button
          variant="destructive"
          onClick={handleBulkDelete}
          disabled={selectedItems.length === 0}
        >
          Удалить выбранные ({selectedItems.length})
        </Button>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={
                    items.length > 0 && selectedItems.length === items.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column} className="p-2 py-4">
                  <div>{columnNames?.[column] || column}</div>
                  {searchableColumns?.includes(column) && (
                    <div className="py-2">
                      <Input
                        placeholder={`Поиск по ${
                          columnNames?.[column] || column
                        }`}
                        value={searchTerms[column] || ""}
                        onChange={(e) =>
                          handleSearchChange(column, e.target.value)
                        }
                        className="mt-1 h-8"
                      />
                    </div>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-6">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.id, checked)
                    }
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {columnTransformers?.[column]
                      ? columnTransformers[column](item[column], item)
                      : String(item[column])}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {paginationRange.map((p, index) => (
              <PaginationItem key={`${p}-${index}`}>
                {p === "..." ? (
                  <span>...</span>
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setPage(p as number);
                    }}
                    isActive={p === page}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
