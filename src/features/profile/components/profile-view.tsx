"use client";

import { useState } from "react";
import { UserIcon, SettingsIcon } from "lucide-react";
import type { User } from "@/types/auth";
import { ProfileHeader } from "./profile-header";
import { ProfileInfoForm } from "./profile-info-form";
import { StudentJiraSettings } from "./student-jira-settings";
import { StudentGitHubSettings } from "./student-github-settings";

interface ProfileViewProps {
  user: User;
  compact?: boolean;
}

export function ProfileView({ user, compact = false }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"INFO" | "SETTINGS">("INFO");
  const isStudent = user.role === "STUDENT";

  return (
    <div className={compact ? "space-y-3.5 max-w-full pb-1" : "space-y-6 max-w-[1600px] mx-auto pb-12"}>
      {/* Profile Header Banner */}
      <ProfileHeader user={user} compact={compact} />

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("INFO")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${activeTab === "INFO"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Thông tin cá nhân</span>
        </button>

        {/* Cài đặt tích hợp - Chỉ hiển thị đối với Role Sinh viên */}
        {isStudent && (
          <button
            type="button"
            onClick={() => setActiveTab("SETTINGS")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${activeTab === "SETTINGS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Cài đặt Tích hợp (Jira & GitHub)</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "INFO" ? (
        <ProfileInfoForm user={user} compact={compact} />
      ) : (
        isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start animate-in fade-in-0 duration-200">
            {/* Jira Integration Card */}
            <StudentJiraSettings user={user} />

            {/* GitHub Integration Card */}
            <StudentGitHubSettings user={user} />
          </div>
        )
      )}
    </div>
  );
}

