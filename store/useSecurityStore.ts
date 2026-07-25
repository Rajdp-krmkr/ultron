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

export interface McpTool {
  name: string;
  description: string;
  category: 'Repository' | 'Analysis' | 'Results' | 'Configuration';
  parameters: string;
}

export interface McpClient {
  name: string;
  status: 'Connected' | 'Disconnected';
  lastSeen: string;
  tools: McpTool[];
}

export interface UltronConfig {
  llm_mode: 'local' | 'cloud';
  use_llm: boolean;
  verbose: boolean;
  visualise: boolean;
  temperature: number;
  max_tokens: number;
  timeout: number;
  num_workers: number;
  llm_url: string;
  enable_cache: boolean;
  cache_only: boolean;
  models: {
    detector: string;
    exploiter: string;
    reporter: string;
    default: string;
  };
  api_keys: {
    groq: string;
    gemini: string;
    nvidia: string;
  };
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
  settings: UltronConfig;
  
  // Actions
  selectRepo: (id: string) => void;
  addTerminalLog: (message: string, type?: TerminalLog['type']) => void;
  clearTerminalLogs: () => void;
  startAnalysis: (repoUrl: string) => void;
  updateFindingStatus: (id: string, status: Finding['status']) => void;
  updateRuleStatus: (id: string, status: Rule['status']) => void;
  updateSettings: (settings: Partial<UltronConfig>) => void;
  resetSettings: () => void;
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
      { time: '13:02:11', stage: 'READ_FILE', status: 'completed', description: 'Read target file transactionController.ts' },
      { time: '13:02:12', stage: 'READ_FUNCTION', status: 'completed', description: 'Extracted getTransactions function scope and call bindings' },
      { time: '13:02:13', stage: 'RECORD_FACT', status: 'completed', description: 'Confirmed unparameterized DB call mapping to Express query argument' },
      { time: '13:02:14', stage: 'FINISH', status: 'completed', description: 'Confirmed SQL Injection finding via agentic detector verification pass' }
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
      { time: '13:03:01', stage: 'READ_FILE', status: 'completed', description: 'Read ProfileComments.tsx' },
      { time: '13:03:02', stage: 'RECORD_FACT', status: 'completed', description: 'Confirmed dangerouslySetInnerHTML is used without sanitization checks' },
      { time: '13:03:03', stage: 'FINISH', status: 'completed', description: 'Verified Stored XSS vulnerability vector' }
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
      { time: '10:01:05', stage: 'READ_FILE', status: 'completed', description: 'ULTRON credentials scanner read src/config/aws.ts' },
      { time: '10:01:06', stage: 'RECORD_FACT', status: 'completed', description: 'Matched high entropy credentials sequence matching IAM format' },
      { time: '10:01:07', stage: 'FINISH', status: 'completed', description: 'Confirmed secret leakage in repository config' }
    ]
  }
];

// Initial Rules matching Ultron Engine
const initialRules: Rule[] = [
  { id: 'SEC-SQL-01', name: 'SQL Injection Prevention', severity: 'Critical', confidence: 'High', status: 'Enabled', pattern: 'db\\.query\\(.*?\\+.*?\\)', description: 'Matches dynamic SQL queries concatenated directly with variable parameters.', recommendation: 'Use parameterized binding values instead.' },
  { id: 'SEC-XSS-02', name: 'Stored and Reflected XSS', severity: 'High', confidence: 'High', status: 'Enabled', pattern: 'dangerouslySetInnerHTML\\(.*?\\)', description: 'Matches direct HTML injection vectors that bypass React default escaping.', recommendation: 'Apply strict HTML sanitizers like DOMPurify.' },
  { id: 'SEC-AUTH-09', name: 'Leakage of Hardcoded Secrets', severity: 'Critical', confidence: 'High', status: 'Enabled', pattern: '([A-Z0-9]{20})|([a-zA-Z0-9/+=]{40})', description: 'Scans files for patterns matching AWS keys, Slack Webhooks, or private keys.', recommendation: 'Use environment configuration tools.' },
  { id: 'SEC-CSRF-05', name: 'Missing Anti-CSRF Guard', severity: 'Medium', confidence: 'Medium', status: 'Enabled', pattern: 'router\\.post\\(.*?\\)', description: 'Audits router POST routes to ensure security headers or CSRF tokens are injected.', recommendation: 'Deploy global protection middleware.' },
  { id: 'SEC-LFI-12', name: 'Local File Inclusion (LFI)', severity: 'High', confidence: 'Medium', status: 'Enabled', pattern: 'fs\\.readFile\\(.*?req\\..*?\\)', description: 'Checks for reading files from dynamic request parameters without path validation.', recommendation: 'Apply strict whitelist of target filenames.' }
];

// Initial MCP Client Information reflecting Ultron 18 Tools
const ultronToolsList: McpTool[] = [
  { name: 'ultron_list_repos', description: 'List all cloned repositories with analysis status', category: 'Repository', parameters: '{}' },
  { name: 'ultron_clone_repo', description: 'Clone a Git repo and run full security analysis', category: 'Repository', parameters: '{\n  "url": "string"\n}' },
  { name: 'ultron_scan_repo', description: 'Re-run full analysis on an existing clone', category: 'Repository', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_get_repo_status', description: 'Detailed status: workspace, AST, graphs, remote URL', category: 'Repository', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_delete_repo', description: 'Delete a cloned repository and its workspace', category: 'Repository', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_visualise_repo', description: 'Regenerate dependency/taint/security SVGs from cached AST', category: 'Repository', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_run_detection', description: 'Detect languages and frameworks in repository', category: 'Analysis', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_run_ast_parse', description: 'Parse all source files into an AST using tree-sitter', category: 'Analysis', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_run_rules', description: 'Run deterministic rules (SQLi, path traversal, SSRF, etc.)', category: 'Analysis', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_run_llm_detection', description: 'Run LLM-powered vulnerability detection (agentic loop)', category: 'Analysis', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_run_full_analysis', description: 'Full pipeline: detection -> AST -> IR -> taint -> rules -> LLM', category: 'Analysis', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_get_findings', description: 'Get cached security findings from a previous scan', category: 'Results', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_get_security_graph', description: 'Get full cached security graph (flows, subgraphs, summary)', category: 'Results', parameters: '{\n  "name": "string"\n}' },
  { name: 'ultron_get_config', description: 'Show full configuration (ultron_config.json)', category: 'Configuration', parameters: '{}' },
  { name: 'ultron_set_config_value', description: 'Set a configuration value in ultron_config.json', category: 'Configuration', parameters: '{\n  "key": "string",\n  "value": "any"\n}' },
  { name: 'ultron_set_model_override', description: 'Set LLM model for a specific agent role (detector/exploiter/reporter/default)', category: 'Configuration', parameters: '{\n  "role": "detector" | "exploiter" | "reporter" | "default",\n  "model": "string"\n}' },
  { name: 'ultron_get_api_keys_status', description: 'Check which cloud API keys are configured (groq, gemini, nvidia)', category: 'Configuration', parameters: '{}' },
  { name: 'ultron_reset_config', description: 'Reset configuration to factory defaults', category: 'Configuration', parameters: '{}' }
];

const initialMcpClients: McpClient[] = [
  {
    name: 'opencode',
    status: 'Connected',
    lastSeen: 'Just now',
    tools: ultronToolsList
  },
  {
    name: 'Claude Desktop',
    status: 'Connected',
    lastSeen: '2 minutes ago',
    tools: ultronToolsList
  },
  {
    name: 'Cursor Editor',
    status: 'Connected',
    lastSeen: '1 minute ago',
    tools: ultronToolsList
  },
  {
    name: 'VS Code (Copilot Agent)',
    status: 'Connected',
    lastSeen: '5 minutes ago',
    tools: ultronToolsList
  }
];

const defaultConfig: UltronConfig = {
  llm_mode: 'local',
  use_llm: true,
  verbose: false,
  visualise: false,
  temperature: 0.1,
  max_tokens: 512,
  timeout: 30,
  num_workers: 3,
  llm_url: 'http://localhost:11434',
  enable_cache: true,
  cache_only: false,
  models: {
    detector: 'llama3.1:8b',
    exploiter: 'llama3.1:8b',
    reporter: 'llama3.1:8b',
    default: 'llama3.1:8b'
  },
  api_keys: {
    groq: 'gsk_...',
    gemini: 'AI...',
    nvidia: 'nvapi-...'
  }
};

export const useSecurityStore = create<SecurityState>((set, get) => ({
  repositories: initialRepos,
  selectedRepoId: '1',
  findings: initialFindings,
  terminalLogs: [
    { id: 'l1', timestamp: '12:58:47', type: 'info', message: 'ULTRON security analysis engine initialized (v8b).' },
    { id: 'l2', timestamp: '12:58:50', type: 'success', message: 'Connected to local MCP daemon at stdio / port 8743 (18 tools active).' },
    { id: 'l3', timestamp: '12:58:52', type: 'info', message: 'Loaded ultron_config.json (mode: local, workers: 3).' }
  ],
  rules: initialRules,
  mcpClients: initialMcpClients,
  pipelineState: {
    status: 'idle',
    progress: 0,
    currentStage: 0,
    activeRepoId: null
  },
  settings: defaultConfig,

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

    get().addTerminalLog(`ultron ${repoUrl}`, 'command');
    get().addTerminalLog(`[1/6] Cloning repository...`, 'info');

    // Pipeline matching Ultron architecture steps
    const pipelineStages = [
      'Cloning repository via git subprocess',
      'Phase 1 — AST Parsing: tree-sitter walking detected languages',
      'Phase 2 — IR Pipeline: JS/TS CST -> IRModule with provenance edges',
      'Phase 2 — Symbol Resolver & Call Graph: inter-procedural call resolution',
      'Phase 2 — Taint Engine: backward propagation from sinks to sources',
      'Phase 3 — Rules Engine: deterministic signature checks',
      'Phase 3 — LLM Detector: agentic verification loop (READ_FILE/RECORD_FACT)',
      'Phase 3 — Zero-Flow Scan fallback pass',
      'Generating SVGs: dependency_graph.svg, taint_graph.svg, security_graph.svg',
      'Scan complete. Findings compiled.'
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
        
        const type = currentStage === 6 ? 'warning' : 'info';
        get().addTerminalLog(`[${currentStage + 1}/10] ${pipelineStages[currentStage]}`, type);
      } else {
        clearInterval(interval);
        
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
            { time: '13:17:15', stage: 'READ_FILE', status: 'completed', description: 'Read target file database.ts' },
            { time: '13:17:16', stage: 'READ_FUNCTION', status: 'completed', description: 'Read function scope runQuery' },
            { time: '13:17:17', stage: 'RECORD_FACT', status: 'completed', description: 'Confirmed unescaped query parameter flow entering raw SQL execution.' },
            { time: '13:17:18', stage: 'FINISH', status: 'completed', description: 'Confirmed vulnerability via LLM agentic verification pass.' }
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

        get().addTerminalLog(`Scan completed. Security score updated to 54. SVGs built successfully.`, 'success');
      }
    }, 1500);
  },

  updateFindingStatus: (id, status) => set((state) => ({
    findings: state.findings.map((f) => f.id === id ? { ...f, status } : f)
  })),

  updateRuleStatus: (id, status) => set((state) => ({
    rules: state.rules.map((r) => r.id === id ? { ...r, status } : r)
  })),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  resetSettings: () => set({ settings: defaultConfig })
}));
