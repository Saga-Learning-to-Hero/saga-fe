import { GitCommitIcon, UsersIcon, GitPullRequestIcon, CodeIcon, SearchIcon, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import type { TeamProjectInfo } from "../../types/team-project";
import { MOCK_COMMITS } from "../../data/mock-team-projects";
import { getInitials } from "@/components/layout/sidebar/nav-config";
import { CommitIssueChart, MemberContributionChart } from "./project-progress-charts";
import { useState, useMemo } from "react";

interface GithubCommitsTabProps {
  project: TeamProjectInfo;
}

export function GithubCommitsTab({ project }: GithubCommitsTabProps) {
  const [memberFilter, setMemberFilter] = useState("all-members");
  const [branchFilter, setBranchFilter] = useState("all-branches");
  const [search, setSearch] = useState("");

  const filteredCommits = useMemo(() => {
    return MOCK_COMMITS.filter(commit => {
      if (memberFilter !== "all-members" && commit.authorName !== project.members.find(m => m.id === memberFilter)?.fullName) {
        return false;
      }
      if (branchFilter !== "all-branches" && commit.branch !== branchFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return commit.message.toLowerCase().includes(q) || commit.shortSha.toLowerCase().includes(q);
      }
      return true;
    });
  }, [memberFilter, branchFilter, search, project.members]);

  // Derived metrics
  const totalCommits = filteredCommits.length;
  const uniqueAuthors = new Set(filteredCommits.map(c => c.authorName)).size;
  const totalAdditions = filteredCommits.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = filteredCommits.reduce((acc, c) => acc + c.deletions, 0);
  const prOpenCount = 3; // Mock value for now, could be derived if MOCK_PRS existed
  const prMergedCount = 24; // Mock value

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Group 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 flex flex-col min-h-[300px]">
          <h3 className="font-bold mb-1">Xu hướng Commit</h3>
          <p className="text-xs text-muted-foreground mb-4">Hoạt động code theo thời gian</p>
          <div className="flex-1 min-h-[220px]" aria-label="Biểu đồ commit và Jira issue">
            <CommitIssueChart />
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-5 md:p-6 flex flex-col min-h-[300px]">
          <h3 className="font-bold mb-1">Đóng góp cá nhân</h3>
          <p className="text-xs text-muted-foreground mb-4">Tỷ lệ đóng góp qua GitHub</p>
          <div className="flex-1 min-h-[220px]" aria-label="Biểu đồ phân bổ đóng góp thành viên">
            <MemberContributionChart />
          </div>
        </div>
      </div>

      {/* GitHub Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <GitCommitIcon className="w-3.5 h-3.5" /> Tổng commit
          </div>
          <div className="text-xl font-bold font-mono">{totalCommits}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <UsersIcon className="w-3.5 h-3.5" /> Người đóng góp
          </div>
          <div className="text-xl font-bold font-mono">{uniqueAuthors}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <GitPullRequestIcon className="w-3.5 h-3.5" /> PR mở
          </div>
          <div className="text-xl font-bold font-mono">{prOpenCount}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <GitPullRequestIcon className="w-3.5 h-3.5 text-success" /> PR đã merge
          </div>
          <div className="text-xl font-bold text-success font-mono">{prMergedCount}</div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <CodeIcon className="w-3.5 h-3.5" /> Dòng code (+/-)
          </div>
          <div className="text-xl font-bold font-mono">
            <span className="text-success">+{totalAdditions}</span> <span className="text-muted-foreground/40 font-normal mx-0.5">/</span> <span className="text-danger">-{totalDeletions}</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/60 flex flex-col justify-center shadow-saga-xs">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Hoạt động cuối
          </div>
          <div className="text-base font-bold truncate" title="2 giờ trước">2 giờ trước</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm message hoặc mã SHA..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              value={memberFilter}
              onChange={setMemberFilter}
              options={[
                { value: "all-members", label: "Tất cả thành viên" },
                ...project.members.map(m => ({ value: m.id, label: m.fullName }))
              ]}
            />
          </div>
          
          <div className="w-full sm:w-40">
            <CustomSelect
              value={branchFilter}
              onChange={setBranchFilter}
              options={[
                { value: "all-branches", label: "Tất cả branch" },
                { value: "main", label: "main" },
                { value: "develop", label: "develop" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Commit List */}
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border/50 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3">Commit Message</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCommits.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">Không có commit nào phù hợp.</td>
                 </tr>
              ) : (
                filteredCommits.map(commit => (
                  <tr key={commit.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
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
                            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 shadow-none">
                              {commit.jiraIssueKey}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal font-mono text-[10px] bg-muted/50">
                        {commit.branch}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(commit.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      <span className="text-success font-medium font-mono">+{commit.additions}</span>
                      <span className="text-muted-foreground/40 mx-1">/</span>
                      <span className="text-danger font-medium font-mono">-{commit.deletions}</span>
                      <span className="text-muted-foreground ml-2">({commit.filesChanged} files)</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
