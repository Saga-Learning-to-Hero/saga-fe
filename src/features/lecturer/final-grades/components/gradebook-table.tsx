"use client";

import type { FinalGradebook } from "../types/final-grades";
import { LockIcon } from "lucide-react";
import { StatusBadge } from "./status-badge";

export function GradebookTable({ gradebook }: { gradebook: FinalGradebook }) {
  const { components, students } = gradebook;
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-[240px] bg-muted/95 p-4 font-bold backdrop-blur-md">
                Sinh viên
              </th>
              <th scope="col" className="p-4 font-bold whitespace-nowrap">
                Nhóm
              </th>
              {sortedComponents.map((comp) => (
                <th key={comp.id} scope="col" className="p-4 text-right font-bold whitespace-nowrap">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-foreground">{comp.name}</span>
                    <span className="text-xs font-medium">{comp.weight}%</span>
                  </div>
                </th>
              ))}
              <th scope="col" className="p-4 text-right font-extrabold text-primary whitespace-nowrap">
                Tổng kết
              </th>
              <th scope="col" className="p-4 font-bold whitespace-nowrap">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-muted/30 transition-colors group">
                <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 p-4 transition-colors">
                  <div className="flex flex-col min-w-[200px]">
                    <span className="font-bold text-foreground">{student.fullName}</span>
                    <span className="text-xs font-mono text-muted-foreground">{student.studentCode}</span>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  {student.groupName ? (
                    <span className="font-medium text-foreground">{student.groupName}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Chưa có nhóm</span>
                  )}
                </td>

                {sortedComponents.map((comp) => {
                  const scoreObj = student.componentScores.find((s) => s.componentId === comp.id);
                  const score = scoreObj?.score;

                  return (
                    <td key={comp.id} className="p-4 text-right">
                      {score !== undefined && score !== null ? (
                        <span className="font-mono text-base font-medium">
                          {score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}

                <td className="p-4 text-right bg-primary/5">
                  {student.finalScore !== null ? (
                    <div className="flex items-center justify-end gap-1.5">
                      {student.status === "LOCKED" && <LockIcon className="size-3.5 text-muted-foreground" />}
                      <span className="font-mono text-lg font-extrabold text-primary">
                        {student.finalScore.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="p-4 whitespace-nowrap">
                  <StatusBadge status={student.status} />
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={components.length + 4} className="p-8 text-center text-muted-foreground">
                  Chưa có sinh viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
