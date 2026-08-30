import { GitCommitIcon, UsersIcon, GitPullRequestIcon, CodeIcon, SearchIcon, FilterIcon, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamProjectInfo } from "../../types/team-project";
import { MOCK_COMMITS } from "../../data/mock-team-projects";
import { getInitials } from "@/components/layout/sidebar/nav-config";

interface GithubCommitsTabProps {
  project: TeamProjectInfo;
}

export function GithubCommitsTab({ project }: GithubCommitsTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* GitHub Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <GitCommitIcon className="w-3.5 h-3.5" /> Tổng commit
          </div>
          <div className="text-xl font-bold">128</div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <UsersIcon className="w-3.5 h-3.5" /> Contributor
          </div>
          <div className="text-xl font-bold">{project.members.length}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <GitPullRequestIcon className="w-3.5 h-3.5" /> PR mở
          </div>
          <div className="text-xl font-bold">3</div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <GitPullRequestIcon className="w-3.5 h-3.5" /> PR đã merge
          </div>
          <div className="text-xl font-bold text-success">24</div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <CodeIcon className="w-3.5 h-3.5" /> Dòng code (+/-)
          </div>
          <div className="text-xl font-bold">
            <span className="text-success">+12.4k</span> <span className="text-muted-foreground/40 font-normal">/</span> <span className="text-danger">-4.2k</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" /> Hoạt động cuối
          </div>
          <div className="text-lg font-bold truncate" title="2 giờ trước">2 giờ trước</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm message hoặc mã SHA..." className="pl-9 bg-card" />
        </div>
        
        <Select defaultValue="all-members">
          <SelectTrigger className="w-[180px] bg-card">
            <FilterIcon className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Thành viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-members">Tất cả thành viên</SelectItem>
            {project.members.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select defaultValue="all-branches">
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-branches">Tất cả branch</SelectItem>
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="develop">develop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commit List */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/10 text-muted-foreground border-b text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Thành viên</th>
              <th className="px-4 py-3">Commit Message</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MOCK_COMMITS.map(commit => (
              <tr key={commit.id} className="hover:bg-muted/5 transition-colors cursor-pointer group">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                      {getInitials(commit.authorName)}
                    </div>
                    {commit.authorName}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground truncate max-w-[300px]" title={commit.message}>
                      {commit.message}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {commit.shortSha}
                      </span>
                      {commit.jiraIssueKey && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">
                          {commit.jiraIssueKey}
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="font-normal font-mono text-[10px]">
                    {commit.branch}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(commit.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <span className="text-success font-medium">+{commit.additions}</span>
                  <span className="text-muted-foreground/40 mx-1">/</span>
                  <span className="text-danger font-medium">-{commit.deletions}</span>
                  <span className="text-muted-foreground ml-2">({commit.filesChanged} files)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
