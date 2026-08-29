import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DownloadIcon } from "lucide-react";

interface ExportExcelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
}

export function ExportExcelDialog({ isOpen, onOpenChange, courseId }: ExportExcelDialogProps) {
  const [exportType, setExportType] = useState<"all" | "no-team">("all");
  
  const handleExport = () => {
    toast.success(`Đã tạo file danh-sach-lop-${courseId}.xlsx`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải danh sách Excel</DialogTitle>
          <DialogDescription>
            Chọn loại dữ liệu và các cột cần tải xuống cho lớp {courseId.toUpperCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Phạm vi dữ liệu</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-all" 
                checked={exportType === "all"} 
                onCheckedChange={() => setExportType("all")} 
              />
              <Label htmlFor="type-all" className="cursor-pointer">Tất cả sinh viên</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-no-team" 
                checked={exportType === "no-team"} 
                onCheckedChange={() => setExportType("no-team")} 
              />
              <Label htmlFor="type-no-team" className="cursor-pointer">Chỉ sinh viên chưa có nhóm</Label>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Các cột bao gồm</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="col-mssv" checked disabled />
                <Label htmlFor="col-mssv" className="text-muted-foreground">MSSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-name" checked disabled />
                <Label htmlFor="col-name" className="text-muted-foreground">Họ tên</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-email" checked disabled />
                <Label htmlFor="col-email" className="text-muted-foreground">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-team" checked defaultChecked />
                <Label htmlFor="col-team" className="cursor-pointer">Nhóm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-role" checked defaultChecked />
                <Label htmlFor="col-role" className="cursor-pointer">Vai trò</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="col-project" checked defaultChecked />
                <Label htmlFor="col-project" className="cursor-pointer">Tên dự án</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleExport}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
