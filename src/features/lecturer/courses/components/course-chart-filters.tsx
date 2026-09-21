"use client";

import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";

interface CourseChartTeamFilterProps {
  idPrefix: string;
  teamId: string;
  teamOptions: CustomSelectOption[];
  onTeamChange: (value: string) => void;
}

export function CourseChartTeamFilter({
  idPrefix,
  teamId,
  teamOptions,
  onTeamChange,
}: CourseChartTeamFilterProps) {
  return (
    <div className="w-full sm:w-44">
      <label htmlFor={`${idPrefix}-team`} className="sr-only">
        Lọc theo nhóm
      </label>
      <CustomSelect
        id={`${idPrefix}-team`}
        value={teamId}
        options={teamOptions}
        onChange={onTeamChange}
        triggerClassName="h-8 bg-muted/35"
      />
    </div>
  );
}
