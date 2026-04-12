import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

export default function ExploreListPagination({
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="text-muted-foreground flex h-9 items-center px-3 text-sm tabular-nums">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
