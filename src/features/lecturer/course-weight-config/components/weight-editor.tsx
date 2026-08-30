"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeIcon, FileTextIcon, FlaskConicalIcon, CheckSquareIcon } from "lucide-react";
import type { ContributionCriterion } from "../types/course-weight-config";

interface WeightEditorProps {
  criterion: ContributionCriterion;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const CRITERION_INFO: Record<ContributionCriterion, { label: string; desc: string; icon: React.ElementType; colorCls: string }> = {
  CODE: {
    label: "CODE",
    desc: "Phát triển và duy trì mã nguồn",
    icon: CodeIcon,
    colorCls: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  TEST: {
    label: "TEST",
    desc: "Kiểm thử và đảm bảo chất lượng",
    icon: CheckSquareIcon,
    colorCls: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  DOCUMENT: {
    label: "DOCUMENT",
    desc: "Tài liệu kỹ thuật, hướng dẫn",
    icon: FileTextIcon,
    colorCls: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  RESEARCH: {
    label: "RESEARCH",
    desc: "Nghiên cứu, khảo sát, thử nghiệm",
    icon: FlaskConicalIcon,
    colorCls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
};

export function WeightEditor({ criterion, value, onChange, disabled }: WeightEditorProps) {
  const info = CRITERION_INFO[criterion];
  const Icon = info.icon;
  const [localStr, setLocalStr] = useState<string>(value.toString());

  // Sync local string when parent value changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStr(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLocalStr(rawValue);
    
    if (rawValue === "") {
      return;
    }
    
    let num = parseInt(rawValue, 10);
    if (!Number.isFinite(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    onChange(num);
  };
  
  const handleInputBlur = () => {
    if (localStr === "") {
      setLocalStr("0");
      onChange(0);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[130px_minmax(100px,1fr)_80px] gap-3 items-center py-3">
      {/* Icon & Label */}
      <div className="flex items-center gap-2 shrink-0 col-span-2 sm:col-span-1">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${info.colorCls}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <Label className="font-bold text-sm tracking-tight">{info.label}</Label>
          <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1" title={info.desc}>
            {info.desc}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          onValueChange={(vals) => onChange(typeof vals === 'number' ? vals : vals[0])}
          className="cursor-pointer"
          aria-label={`Trọng số cho ${info.label}`}
        />
      </div>

      {/* Input */}
      <div className="w-full shrink-0 relative">
        <Input
          type="number"
          min={0}
          max={100}
          disabled={disabled}
          value={localStr}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="pr-6 font-mono font-bold text-right text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none pointer-events-none">
          %
        </span>
      </div>
    </div>
  );
}
