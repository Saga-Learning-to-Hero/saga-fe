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
import { FileUpIcon, FileSpreadsheetIcon, DownloadIcon } from "lucide-react";

interface ImportExcelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExcelDialog({ isOpen, onOpenChange }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  
  // Fake file handling for UI
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleReset = () => setFile(null);

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(handleReset, 300);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập danh sách từ Excel</DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx, .xls) để cập nhật danh sách lớp và nhóm.
            <br />
            <span className="text-amber-500 font-semibold mt-2 inline-block">
              Lưu ý: Đây là giao diện minh họa. Dữ liệu sẽ chưa được cập nhật vào hệ thống.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            {file ? (
              <>
                <FileSpreadsheetIcon className="w-12 h-12 text-success mb-4" />
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Chọn file khác
                </Button>
              </>
            ) : (
              <>
                <FileUpIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Kéo thả file vào đây hoặc</p>
                <p className="text-sm text-muted-foreground mb-4">Hỗ trợ .xlsx, .xls</p>
                
                <div className="relative">
                  <Button variant="outline">Chọn file Excel</Button>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
            <span className="text-sm text-muted-foreground">Chưa có file mẫu?</span>
            <Button variant="link" size="sm" className="h-auto p-0">
              <DownloadIcon className="w-4 h-4 mr-1.5" />
              Tải file Excel mẫu
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button disabled={!file} onClick={() => onOpenChange(false)}>
            Nhập danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
