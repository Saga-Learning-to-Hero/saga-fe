"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { lecturerCourseTeamPath } from "../../lib/team-project-routes";
import { MOCK_PROJECTS } from "../../data/mock-team-projects";
import type { TeamProjectInfo } from "../../types/team-project";

interface TeamSelectorProps {
  courseId: string;
  currentTeam: TeamProjectInfo;
}

export function TeamSelector({ courseId, currentTeam }: TeamSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full sm:w-[300px] justify-between h-auto py-2 px-3 border-dashed hover:border-solid hover:bg-muted/50 transition-all"
        )}
      >
        <div className="flex flex-col items-start truncate text-left w-[calc(100%-20px)]">
          <span className="font-bold text-sm truncate w-full">{currentTeam.teamName}</span>
          <span className="text-xs text-muted-foreground font-normal truncate w-full">
            {currentTeam.projectName}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm tên nhóm hoặc dự án..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy nhóm.</CommandEmpty>
            <CommandGroup>
              {MOCK_PROJECTS.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.teamName} ${project.projectName}`}
                  onSelect={() => {
                    router.push(lecturerCourseTeamPath(courseId, project.id));
                    setOpen(false);
                  }}
                  className="flex items-start gap-2 py-2"
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      currentTeam.id === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 truncate">
                    <span className="font-bold text-sm truncate">{project.teamName}</span>
                    <span className="text-xs text-muted-foreground truncate">{project.projectName}</span>
                    <div className="flex gap-2 mt-1">
                      {project.githubRepo && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">GitHub</span>
                      )}
                      {project.jiraProjectKey && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Jira</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
