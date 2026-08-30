import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, DownloadIcon, UploadIcon, FilterIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MemberFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleFilterChange: (r: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  viewMode: "teams" | "table";
  onViewModeChange: (m: "teams" | "table") => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

export function MemberFilterBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onExportClick,
  onImportClick,
}: MemberFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tên, email, MSSV..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <Select value={roleFilter} onValueChange={(v) => v && onRoleFilterChange(v)}>
            <SelectTrigger className="w-[140px] hidden md:flex">
              <FilterIcon className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="LEADER">Trưởng nhóm</SelectItem>
              <SelectItem value="MEMBER">Thành viên</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => v && onStatusFilterChange(v)}>
            <SelectTrigger className="w-[150px] hidden md:flex">
              <SelectValue placeholder="Trạng thái nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="has-team">Đã có nhóm</SelectItem>
              <SelectItem value="no-team">Chưa có nhóm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex bg-muted p-1 rounded-md mr-2">
            <Button
              variant={viewMode === "teams" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("teams")}
              className="h-8 px-3"
            >
              Theo nhóm
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="h-8 px-3"
            >
              Danh sách
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onImportClick}>
            <UploadIcon className="w-4 h-4 mr-2" />
            Nhập Excel
          </Button>

          <Button variant="outline" size="sm" onClick={onExportClick}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Tải Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
