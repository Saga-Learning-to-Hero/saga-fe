
const congNghe = [
  { ten: "Next.js 16", nhom: "Frontend" },
  { ten: "Tailwind CSS v4", nhom: "Frontend" },
  { ten: "shadcn/ui", nhom: "Frontend" },
  { ten: "Cytoscape.js", nhom: "Graph" },
  { ten: "Spring Boot 3", nhom: "Backend" },
  { ten: "Neo4j", nhom: "Graph DB" },
  { ten: "PostgreSQL", nhom: "Database" },
  { ten: "Docker", nhom: "DevOps" },
  { ten: "OpenAI / Gemini", nhom: "AI" },
  { ten: "GitHub Actions", nhom: "CI/CD" },
  { ten: "Redis", nhom: "Cache" },
  { ten: "JWT / OAuth2", nhom: "Auth" },
];

const mauNhom: Record<string, string> = {
  Frontend: "text-[var(--node-student)]",
  Graph: "text-[var(--node-criterion)]",
  Backend: "text-[var(--node-activity)]",
  "Graph DB": "text-[var(--node-outcome)]",
  Database: "text-[var(--node-group)]",
  DevOps: "text-[var(--saga-info)]",
  AI: "text-[var(--saga-warning)]",
  "CI/CD": "text-[var(--saga-success)]",
  Cache: "text-[var(--saga-danger)]",
  Auth: "text-[var(--saga-accent)]",
};

export function TechStackSection() {
  return (
    <section id="cong-nghe" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Xây dựng bằng công nghệ Enterprise
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hệ thống được thiết kế theo kiến trúc microservice, sẵn sàng mở rộng quy mô
            cho toàn trường đại học.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {congNghe.map((item) => (
            <div
              key={item.ten}
              className="surface-raised rounded-xl px-5 py-3 flex flex-col items-center gap-1 min-w-[110px] transition-normal hover:shadow-saga-md hover:border-primary/20 group"
            >
              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-fast">
                {item.ten}
              </span>
              <span className={`text-xs font-medium ${mauNhom[item.nhom] ?? "text-muted-foreground"}`}>
                {item.nhom}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
