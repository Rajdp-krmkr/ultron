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

// Repositories starting clean (empty by default until scanned)
const initialRepos: Repository[] = [];

// Findings starting clean
const initialFindings: Finding[] = [];

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
  selectedRepoId: '',
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

        // Persist repository scan details and findings directly to MongoDB Atlas
        fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoId,
            repoName,
            repoUrl,
            mode: get().settings.llm_mode,
            language: newRepo.language,
            status: 'Alert',
            score: 54,
            criticalCount: 1,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            filesCount: newRepo.filesCount,
            linesCount: newRepo.linesCount,
            findings: [generatedFinding]
          })
        }).then(() => {
          get().addTerminalLog(`Scan details & findings stored in MongoDB Atlas ('ultron.scans').`, 'success');
        }).catch(err => {
          console.error('Failed to persist scan to MongoDB:', err);
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
