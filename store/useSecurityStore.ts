import { create } from 'zustand';

export interface Repository {
  id: string;
  name: string;
  url: string;
  language: string;
  status: 'Clean' | 'Alert' | 'Scanning' | 'Queued';
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  lastScanned: string;
  filesCount: number;
  linesCount: number;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  affectedFile: string;
  lineNumber: number;
  codeSnippet: string;
  verifiedByLlm: boolean;
  llmConfidence?: number;
  status: 'Open' | 'In Progress' | 'Resolved' | 'False Positive';
  source: string;
  sink: string;
  recommendation: string;
  timeline: { time: string; stage: string; status: 'completed' | 'running' | 'pending'; description: string }[];
  ruleId: string;
  repoId: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'command';
  message: string;
}

export interface Rule {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  status: 'Enabled' | 'Disabled';
  pattern: string;
  description: string;
  recommendation: string;
}

export interface McpClient {
  name: string;
  status: 'Connected' | 'Disconnected';
  lastSeen: string;
  tools: { name: string; description: string; parameters: string }[];
}

interface SecurityState {
  repositories: Repository[];
  selectedRepoId: string;
  findings: Finding[];
  terminalLogs: TerminalLog[];
  rules: Rule[];
  mcpClients: McpClient[];
  pipelineState: {
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    currentStage: number;
    activeRepoId: string | null;
  };
  settings: {
    theme: string;
    apiKey: string;
    llmProvider: string;
    workers: number;
    timeout: number;
    cacheEnabled: boolean;
    visualGlow: boolean;
  };
  
  // Actions
  selectRepo: (id: string) => void;
  addTerminalLog: (message: string, type?: TerminalLog['type']) => void;
  clearTerminalLogs: () => void;
  startAnalysis: (repoUrl: string) => void;
  updateFindingStatus: (id: string, status: Finding['status']) => void;
  updateRuleStatus: (id: string, status: Rule['status']) => void;
  updateSettings: (settings: Partial<SecurityState['settings']>) => void;
}

// Initial Mock Repositories
const initialRepos: Repository[] = [
  { id: '1', name: 'financial-api-gateway', url: 'github.com/ultron-sec/financial-api-gateway', language: 'TypeScript', status: 'Alert', score: 62, criticalCount: 2, highCount: 5, mediumCount: 8, lowCount: 12, lastScanned: '2026-07-25 10:32', filesCount: 142, linesCount: 28430 },
  { id: '2', name: 'auth-server-oauth', url: 'github.com/ultron-sec/auth-server-oauth', language: 'Go', status: 'Clean', score: 94, criticalCount: 0, highCount: 0, mediumCount: 1, lowCount: 4, lastScanned: '2026-07-24 18:15', filesCount: 68, linesCount: 12150 },
  { id: '3', name: 'ecommerce-cart-service', url: 'github.com/ultron-sec/ecommerce-cart-service', language: 'JavaScript', status: 'Alert', score: 71, criticalCount: 1, highCount: 3, mediumCount: 5, lowCount: 9, lastScanned: '2026-07-25 08:00', filesCount: 98, linesCount: 18740 },
  { id: '4', name: 'data-analytics-pipeline', url: 'github.com/ultron-sec/data-analytics-pipeline', language: 'Python', status: 'Scanning', score: 85, criticalCount: 0, highCount: 1, mediumCount: 4, lowCount: 8, lastScanned: 'Scanning Now', filesCount: 245, linesCount: 54100 },
  { id: '5', name: 'kubernetes-operator-core', url: 'github.com/ultron-sec/kubernetes-operator-core', language: 'Go', status: 'Clean', score: 98, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 2, lastScanned: '2026-07-23 11:45', filesCount: 120, linesCount: 31200 }
];

// Initial Mock Findings
const initialFindings: Finding[] = [
  {
    id: 'f-101',
    repoId: '1',
    ruleId: 'SEC-SQL-01',
    title: 'SQL Injection in transaction search endpoint',
    severity: 'Critical',
    confidence: 'High',
    description: 'User input from query parameter `searchTerm` is concatenated directly into a database query expression, allowing remote SQL command execution.',
    affectedFile: 'src/controllers/transactionController.ts',
    lineNumber: 42,
    codeSnippet: `import { db } from "../config/db";\n\nexport async function getTransactions(req: any, res: any) {\n  const searchTerm = req.query.searchTerm;\n  // VULNERABLE: Direct concatenation of user input\n  const query = "SELECT * FROM transactions WHERE description LIKE '%" + searchTerm + "%'";\n  \n  try {\n    const results = await db.query(query);\n    res.json(results);\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n}`,
    verifiedByLlm: true,
    llmConfidence: 97,
    status: 'Open',
    source: 'req.query.searchTerm (line 4)',
    sink: 'db.query(query) (line 9)',
    recommendation: 'Use parameterized queries or ORM syntax to avoid SQL injection vulnerability:\n\n```typescript\nconst query = "SELECT * FROM transactions WHERE description LIKE ?";\nconst results = await db.query(query, [`%${searchTerm}%`]);\n```',
    timeline: [
      { time: '13:02:11', stage: 'AGENT_INIT', status: 'completed', description: 'ULTRON Security Agent spawned to verify SQL injection finding' },
      { time: '13:02:12', stage: 'READ_FILE', status: 'completed', description: 'Read file transactionController.ts' },
      { time: '13:02:13', stage: 'AST_SCAN', status: 'completed', description: 'Detected unparameterized DB call mapping back to Express Route parameter' },
      { time: '13:02:14', stage: 'LLM_PROMPT', status: 'completed', description: 'Evaluating vulnerability context via GPT-4o Security Expert model' },
      { time: '13:02:15', stage: 'FINISH', status: 'completed', description: 'Confirmed SQL Injection. Exploitation vector: Request parameters bypass sanitization.' }
    ]
  },
  {
    id: 'f-102',
    repoId: '1',
    ruleId: 'SEC-XSS-02',
    title: 'Stored XSS in user profile comment box',
    severity: 'High',
    confidence: 'Medium',
    description: 'User input in profile remarks is not sanitized before rendering in DOM, leading to possible scripting execution.',
    affectedFile: 'src/components/profile/ProfileComments.tsx',
    lineNumber: 88,
    codeSnippet: `export function ProfileComments({ comments }) {\n  return (\n    <div className="comments-list">\n      {comments.map((comment) => (\n        <div key={comment.id} className="comment-card">\n          {/* VULNERABLE: Direct rendering of unsanitized HTML */}\n          <div dangerouslySetInnerHTML={{ __html: comment.text }} />\n        </div>\n      ))}\n    </div>\n  );\n}`,
    verifiedByLlm: true,
    llmConfidence: 89,
    status: 'In Progress',
    source: 'comment.text (line 7)',
    sink: 'dangerouslySetInnerHTML (line 7)',
    recommendation: 'Sanitize comment input text before insertion using a library like DOMPurify, or avoid dangerouslySetInnerHTML entirely.',
    timeline: [
      { time: '13:03:01', stage: 'AGENT_INIT', status: 'completed', description: 'ULTRON Security Agent spawned' },
      { time: '13:03:02', stage: 'READ_FILE', status: 'completed', description: 'Read ProfileComments.tsx' },
      { time: '13:03:03', stage: 'VERIFY', status: 'completed', description: 'Confirmed dangerouslySetInnerHTML is used without sanitization checks' }
    ]
  },
  {
    id: 'f-103',
    repoId: '1',
    ruleId: 'SEC-CSRF-05',
    title: 'Missing CSRF protection on critical state modifying routes',
    severity: 'Medium',
    confidence: 'Low',
    description: 'State modifying HTTP endpoints (POST, PUT, DELETE) lack token validation or samesite cookie enforcement, making them vulnerable to cross-site request forgery.',
    affectedFile: 'src/routes/api.ts',
    lineNumber: 14,
    codeSnippet: `import { Router } from "express";\nimport { updateSettings } from "../controllers/userController";\n\nconst router = Router();\n\n// VULNERABLE: Lacks CSRF middleware validation before setting values\nrouter.post("/user/settings", updateSettings);`,
    verifiedByLlm: false,
    status: 'Open',
    source: 'POST /user/settings endpoint route definition (line 7)',
    sink: 'updateSettings controller mapping (line 7)',
    recommendation: 'Implement standard CSRF token validation middleware (e.g. csurf) on all write endpoints.',
    timeline: []
  },
  {
    id: 'f-104',
    repoId: '3',
    ruleId: 'SEC-AUTH-09',
    title: 'Hardcoded API secret key in configurations',
    severity: 'Critical',
    confidence: 'High',
    description: 'A plain-text authorization credentials token was discovered directly in the production config script.',
    affectedFile: 'src/config/aws.ts',
    lineNumber: 5,
    codeSnippet: `export const awsConfig = {\n  region: "us-east-1",\n  // VULNERABLE: Hardcoded credential token\n  accessKeyId: "AKIAIOSFODNN7EXAMPLE",\n  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\n};`,
    verifiedByLlm: true,
    llmConfidence: 100,
    status: 'Open',
    source: 'AWS Access Key configurations (line 4)',
    sink: 'Hardcoded config file definitions (line 5)',
    recommendation: 'Inject credentials at runtime using system environment variables (`process.env.AWS_SECRET_ACCESS_KEY`).',
    timeline: [
      { time: '10:01:05', stage: 'AGENT_INIT', status: 'completed', description: 'ULTRON credentials scanner activated' },
      { time: '10:01:06', stage: 'MATCH_ENTROPY', status: 'completed', description: 'Matched high entropy credentials sequence' },
      { time: '10:01:07', stage: 'FINISH', status: 'completed', description: 'Confirmed secret leakage. Key structure matches IAM format.' }
    ]
  }
];

// Initial Mock Rules
const initialRules: Rule[] = [
  { id: 'SEC-SQL-01', name: 'SQL Injection Prevention', severity: 'Critical', confidence: 'High', status: 'Enabled', pattern: 'db\\.query\\(.*?\\+.*?\\)', description: 'Matches dynamic SQL queries concatenated directly with variable parameters.', recommendation: 'Use parameterized binding values instead.' },
  { id: 'SEC-XSS-02', name: 'Stored and Reflected XSS', severity: 'High', confidence: 'High', status: 'Enabled', pattern: 'dangerouslySetInnerHTML\\(.*?\\)', description: 'Matches direct HTML injection vectors that bypass React default escaping.', recommendation: 'Apply strict HTML sanitizers like DOMPurify.' },
  { id: 'SEC-AUTH-09', name: 'Leakage of Hardcoded Secrets', severity: 'Critical', confidence: 'High', status: 'Enabled', pattern: '([A-Z0-9]{20})|([a-zA-Z0-9/+=]{40})', description: 'Scans files for patterns matching AWS keys, Slack Webhooks, or private keys.', recommendation: 'Use environment configuration tools.' },
  { id: 'SEC-CSRF-05', name: 'Missing Anti-CSRF Guard', severity: 'Medium', confidence: 'Medium', status: 'Enabled', pattern: 'router\\.post\\(.*?\\)', description: 'Audits router POST routes to ensure security headers or CSRF tokens are injected.', recommendation: 'Deploy global protection middleware.' },
  { id: 'SEC-LFI-12', name: 'Local File Inclusion (LFI)', severity: 'High', confidence: 'Medium', status: 'Enabled', pattern: 'fs\\.readFile\\(.*?req\\..*?\\)', description: 'Checks for reading files from dynamic request parameters without path validation.', recommendation: 'Apply strict whitelist of target filenames.' }
];

// Initial MCP Client Information
const initialMcpClients: McpClient[] = [
  {
    name: 'Claude Desktop',
    status: 'Connected',
    lastSeen: '1 minute ago',
    tools: [
      { name: 'analyze_repository', description: 'Triggers Ultron AST & Taint engine to scan a repository', parameters: '{\n  "repo_url": "string"\n}' },
      { name: 'get_findings', description: 'Retrieve findings matching target severity', parameters: '{\n  "severity": "Critical" | "High" | "Medium"\n}' }
    ]
  },
  {
    name: 'Cursor Editor',
    status: 'Connected',
    lastSeen: 'Just now',
    tools: [
      { name: 'get_taint_path', description: 'Fetch React Flow node mappings for an active issue', parameters: '{\n  "finding_id": "string"\n}' },
      { name: 'patch_vulnerability', description: 'Uses LLM to recommend a PR script fixing the issue', parameters: '{\n  "finding_id": "string"\n}' }
    ]
  }
];

export const useSecurityStore = create<SecurityState>((set, get) => ({
  repositories: initialRepos,
  selectedRepoId: '1',
  findings: initialFindings,
  terminalLogs: [
    { id: 'l1', timestamp: '12:58:47', type: 'info', message: 'ULTRON multi-agent platform initialized successfully.' },
    { id: 'l2', timestamp: '12:58:50', type: 'success', message: 'Connected to local MCP daemon at http://localhost:8000.' },
    { id: 'l3', timestamp: '12:58:52', type: 'info', message: 'Syncing repositories data... 5 workspaces indexed.' }
  ],
  rules: initialRules,
  mcpClients: initialMcpClients,
  pipelineState: {
    status: 'idle',
    progress: 0,
    currentStage: 0,
    activeRepoId: null
  },
  settings: {
    theme: 'cyberpunk',
    apiKey: 'ultron_sec_********e5a2',
    llmProvider: 'Google Gemini 1.5 Pro',
    workers: 4,
    timeout: 180,
    cacheEnabled: true,
    visualGlow: true
  },

  selectRepo: (id) => set({ selectedRepoId: id }),

  addTerminalLog: (message, type = 'info') => {
    const time = new Date();
    const timestamp = time.toTimeString().split(' ')[0];
    const newLog: TerminalLog = {
      id: Math.random().toString(36).substring(7),
      timestamp,
      type,
      message
    };
    set((state) => ({ terminalLogs: [...state.terminalLogs, newLog].slice(-250) }));
  },

  clearTerminalLogs: () => set({ terminalLogs: [] }),

  startAnalysis: (repoUrl) => {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    const repoId = Math.random().toString(36).substring(7);
    
    // Create new repo item
    const newRepo: Repository = {
      id: repoId,
      name: repoName,
      url: repoUrl,
      language: 'TypeScript',
      status: 'Scanning',
      score: 100,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      lastScanned: 'Scanning Now',
      filesCount: 12,
      linesCount: 1540
    };

    set((state) => ({
      repositories: [newRepo, ...state.repositories],
      selectedRepoId: repoId,
      pipelineState: {
        status: 'running',
        progress: 0,
        currentStage: 0,
        activeRepoId: repoId
      }
    }));

    get().addTerminalLog(`Initiated analysis on repo: ${repoUrl}`, 'command');
    get().addTerminalLog(`Step 1/10: Cloning target repository ...`, 'info');

    // Simulate analysis timeline pipeline
    const pipelineStages = [
      'Cloning target repository: github.com/ultron-sec/' + repoName,
      'Executing Language Detection: TypeScript codebase resolved',
      'AST Parsing initialized: compiling AST mappings in Monaco format',
      'Intermediate Representation (IR) Pipeline: SSA statements generated',
      'Building Call Graph: Resolving call boundaries and dependencies',
      'Backward Taint Analysis: tracking user inputs propagation',
      'Constructing Security Graph: Route-to-database interfaces loaded',
      'Applying Rule Engine: Checking 5 active vulnerability signatures',
      'LLM Verification initiated: analyzing suspicious sinks via agent',
      'Report Generation: compilation complete.'
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < 10) {
        set((state) => ({
          pipelineState: {
            ...state.pipelineState,
            currentStage,
            progress: currentStage * 10
          }
        }));
        
        const type = currentStage === 8 ? 'warning' : 'info';
        get().addTerminalLog(`Step ${currentStage + 1}/10: ${pipelineStages[currentStage]}`, type);
      } else {
        clearInterval(interval);
        
        // Add dynamic mock finding to make it interactive!
        const newFindingId = 'f-' + Math.random().toString(36).substring(7);
        const generatedFinding: Finding = {
          id: newFindingId,
          repoId: repoId,
          ruleId: 'SEC-SQL-01',
          title: `SQL Injection in database query route`,
          severity: 'Critical',
          confidence: 'High',
          description: 'A dynamic database execution sequence was detected parsing requests inputs without escaping sequences.',
          affectedFile: 'src/lib/database.ts',
          lineNumber: 19,
          codeSnippet: `import { client } from "./client";\n\nexport async function runQuery(req: any) {\n  const id = req.query.id;\n  // VULNERABLE\n  const sql = \`SELECT * FROM users WHERE id = \${id}\`;\n  return await client.execute(sql);\n}`,
          verifiedByLlm: true,
          llmConfidence: 94,
          status: 'Open',
          source: 'req.query.id (line 4)',
          sink: 'client.execute(sql) (line 7)',
          recommendation: 'Use prepared statements or parameterized templates:\n\n```typescript\nawait client.execute("SELECT * FROM users WHERE id = ?", [id]);\n```',
          timeline: [
            { time: '13:17:15', stage: 'AGENT_INIT', status: 'completed', description: 'Verification Agent started' },
            { time: '13:17:16', stage: 'READ_FILE', status: 'completed', description: 'Read database.ts' },
            { time: '13:17:17', stage: 'VERIFY', status: 'completed', description: 'Analyzed query parameter flow directly entering raw SQL execution.' }
          ]
        };

        set((state) => {
          const updatedRepos = state.repositories.map((r) => {
            if (r.id === repoId) {
              return {
                ...r,
                status: 'Alert' as const,
                score: 54,
                criticalCount: 1,
                lastScanned: new Date().toTimeString().split(' ')[0]
              };
            }
            return r;
          });

          return {
            repositories: updatedRepos,
            findings: [generatedFinding, ...state.findings],
            pipelineState: {
              status: 'completed',
              progress: 100,
              currentStage: 9,
              activeRepoId: repoId
            }
          };
        });

        get().addTerminalLog(`Analysis complete. Finding f-SQLInjection written to database. Security Score updated to 54.`, 'success');
      }
    }, 2000);
  },

  updateFindingStatus: (id, status) => set((state) => ({
    findings: state.findings.map((f) => f.id === id ? { ...f, status } : f)
  })),

  updateRuleStatus: (id, status) => set((state) => ({
    rules: state.rules.map((r) => r.id === id ? { ...r, status } : r)
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  }))
}));
