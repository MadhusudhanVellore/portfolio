document.addEventListener('DOMContentLoaded', () => {
    // Update year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }

    // Scroll reveal logic
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeResumeModal();
            closeTerminalModal();
            const logoModal = document.getElementById('logo-modal');
            if (logoModal) {
                logoModal.classList.add('hidden');
                logoModal.classList.remove('flex');
            }
        }
    });

    // Initialize Terminal input listener
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', handleTerminalKeydown);
    }
});

function openResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
}

function closeResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
}

// ----------------------------------------------------
// Interactive Terminal Logic (Ticket & Parchment Theme)
// ----------------------------------------------------

let commandHistory = [];
let historyIndex = -1;
const AVAILABLE_COMMANDS = ['help', 'skills', 'education', 'experience', 'who', 'whoami', 'contact', 'resume', 'clear', 'date', 'pwd', 'uname', 'exit'];

// Detailed telemetry & descriptions for skills
const SKILLS_DETAILS = {
    'linux': {
        name: 'Linux Administration',
        category: 'Operating Systems & Kernel',
        tag: 'CORE SYSADMIN',
        proficiency: 'Advanced / Enterprise Production Ready (7+ Months at Mavenir VMAS)',
        points: [
            'Enterprise distribution administration across Red Hat Enterprise Linux (RHEL), CentOS, and Ubuntu Server.',
            'Systemd service unit lifecycle, daemon supervision, cgroups, target levels, and boot sequence troubleshooting.',
            'Storage management: Logical Volume Manager (LVM), disk partitioning, file system integrity (ext4, xfs), and mount topologies.',
            'Security hardening: file permissions (chmod, chown, sticky bits), PAM authentication, sudoers configuration, and SSH key management.',
            'Performance tuning: load average diagnostics, kernel parameters (/etc/sysctl.conf), swap optimization, and OOM killer triage.'
        ]
    },
    'github-actions': {
        name: 'GitHub Actions',
        category: 'Continuous Integration & Continuous Delivery (CI/CD)',
        tag: 'CI/CD AUTOMATION',
        proficiency: 'Pipeline Governance & Automated Workflows',
        points: [
            'Authoring event-driven workflow YAML definitions (push, pull_request, workflow_dispatch, schedules).',
            'Automated build, test, lint, and deployment pipelines targeting staging and production clusters.',
            'Multi-stage jobs, workflow artifact archiving, matrix builds across operating systems and runtimes.',
            'GitHub Secrets management, environment protection rules, and OIDC federated deployment credentials.',
            'Integration with container registries (GHCR, Docker Hub, AWS ECR) and automated Helm release deployments.'
        ]
    },
    'kubernetes': {
        name: 'Kubernetes & Helm',
        category: 'Container Orchestration & Package Management',
        tag: 'ORCHESTRATION',
        proficiency: 'Cluster Operations & Release Packaging',
        points: [
            'Managing Kubernetes resources: Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, and CronJobs.',
            'Service discovery & traffic routing: ClusterIP, NodePort, LoadBalancer, and Ingress controllers.',
            'ConfigMaps and Secrets separation for secure, decoupled environment configuration injection.',
            'Helm chart packaging, release templating, values overriding, versioned rollouts, and deterministic rollbacks.',
            'Troubleshooting pod crash loops (CrashLoopBackOff), OOMKilled events, resource quotas, and liveness/readiness probes.'
        ]
    },
    'aws': {
        name: 'Amazon Web Services (AWS)',
        category: 'Cloud Infrastructure & Networking',
        tag: 'CLOUD INFRASTRUCTURE',
        proficiency: 'Cloud Operations & Systems Administration',
        points: [
            'Compute & Scaling: Amazon EC2 instance provisioning, AMI lifecycle, user-data automation, and Auto Scaling Groups.',
            'Networking & Security: VPC design, public/private subnets, Internet Gateways, NAT Gateways, Route Tables, and Security Groups.',
            'Identity & Access Management (IAM): Least-privilege IAM policies, instance profiles, roles, and MFA security enforcement.',
            'Storage & Databases: EBS volume types, snapshots, S3 bucket policies, lifecycle rules, and RDS instance operations.',
            'Monitoring & Telemetry: AWS CloudWatch metric alarms, dashboarding, and CloudTrail auditing.'
        ]
    },
    'terraform': {
        name: 'Terraform (IaC)',
        category: 'Infrastructure as Code',
        tag: 'DECLARATIVE IaC',
        proficiency: 'Declarative Provisioning & State Governance',
        points: [
            'Declarative HCL (HashiCorp Configuration Language) architecture for reproducible multi-tier infrastructure.',
            'State management: remote state backends (S3 with DynamoDB state locking), state migration, and drift detection.',
            'Modular architecture: reusable Terraform modules with strict input variables, locals, and structured outputs.',
            'Execution workflow mastery: plan dry-runs, targeted apply runs (-target), taint lifecycles, and destroy safety controls.',
            'Provider orchestration across AWS cloud resources, DNS routing, and security groups.'
        ]
    },
    'docker': {
        name: 'Docker',
        category: 'Containerization & Runtime',
        tag: 'CONTAINERS',
        proficiency: 'Container Lifecycle & Image Optimization',
        points: [
            'Multi-stage Dockerfile engineering to minimize image surface area and optimize layer cache utilization.',
            'Container runtime lifecycle management, health check directives, entrypoint scripts, and signal handling (SIGTERM).',
            'Docker networking: bridge networks, host networking, container port mapping, and DNS resolution.',
            'Persistent storage: bind mounts vs named volumes, volume backups, and container permission isolation.',
            'Docker Compose orchestration for multi-container development and local staging simulation.'
        ]
    },
    'nginx': {
        name: 'Nginx Web Server',
        category: 'Web Serving & Edge Reverse Proxy',
        tag: 'WEB & REVERSE PROXY',
        proficiency: 'High-Concurrency Ingress & Traffic Management',
        points: [
            'Reverse proxy and load balancing: upstream clusters, round-robin, least-conn, and failover algorithms.',
            'SSL/TLS termination: modern cipher suites, HTTP/2 enforcement, and Let\'s Encrypt automated certificate renewals.',
            'Virtual host configuration (server blocks), location regex routing, rewrite directives, and custom error pages.',
            'Performance tuning: worker_processes, worker_connections, epoll event model, keepalive timeouts, and gzip compression.',
            'Security controls: rate limiting, IP whitelisting/blacklisting, DDoS mitigation, and security response headers.'
        ]
    },
    'python': {
        name: 'Python Scripting',
        category: 'Automation & Systems Tooling',
        tag: 'SCRIPTING & AUTOMATION',
        proficiency: 'Sysadmin Automation & Telemetry Parsing',
        points: [
            'Automation scripts for server health audits, system metrics collection, and disk space monitoring.',
            'Log parsing & aggregation: regex log filtering, error extraction, JSON/CSV structured report generation.',
            'CLI utilities and operational tooling utilizing standard libraries (os, sys, subprocess, argparse, requests).',
            'REST API interactions for ticketing integrations, Slack alerts, and external monitoring webhook triggers.',
            'Automated maintenance scripts for backups, log rotation cleanup, and remote task execution.'
        ]
    },
    'wireshark': {
        name: 'Wireshark & Tshark',
        category: 'Network Packet Inspection & Troubleshooting',
        tag: 'PACKET ANALYSIS',
        proficiency: 'Network Diagnostics & Root Cause Analysis',
        points: [
            'Deep packet inspection (DPI) of TCP/IP stack layers: Ethernet, IP, TCP, UDP, DNS, HTTP, and VoIP protocols.',
            'Command-line capture using Tshark and tcpdump on headless Linux servers for remote traffic triage.',
            'Diagnosing network latency, TCP retransmissions, duplicate ACKs, window scaling, and connection resets (RST).',
            'Applying display and capture filters to isolate suspicious traffic, protocol anomalies, and handshake failures.',
            'Production root cause analysis (RCA) on distributed server network communication bottlenecks.'
        ]
    },
    'git': {
        name: 'Git & GitHub',
        category: 'Distributed Version Control & Collaboration',
        tag: 'VERSION CONTROL',
        proficiency: 'Branching Strategy, GitOps & Code Governance',
        points: [
            'Distributed version control workflows: Git Flow, trunk-based development, feature branching, and pull requests.',
            'Advanced Git operations: interactive rebase, cherry-pick, merge conflict resolution, reflog recovery, and stash management.',
            'Repository administration: branch protection rules, code review enforcement, status checks, and tag releases.',
            'Git hooks and automation integration for pre-commit linting, security scans, and conventional commit adherence.',
            'Infrastructure repository management for Terraform configurations and Kubernetes manifests.'
        ]
    }
};

function resolveSkillKey(input) {
    if (!input) return null;
    const clean = input.toLowerCase().replace(/[\s\+_\-\/]+/g, '');
    
    if (clean.includes('linux') || clean.includes('rhel') || clean.includes('ubuntu') || clean.includes('sysadmin')) return 'linux';
    if (clean.includes('action') || clean.includes('cicd') || clean.includes('githubaction')) return 'github-actions';
    if (clean.includes('kuber') || clean.includes('k8s') || clean.includes('helm')) return 'kubernetes';
    if (clean.includes('aws') || clean.includes('amazon') || clean.includes('cloud')) return 'aws';
    if (clean.includes('terra') || clean.includes('iac')) return 'terraform';
    if (clean.includes('dock') || clean.includes('container')) return 'docker';
    if (clean.includes('nginx') || clean.includes('proxy') || clean.includes('webserver')) return 'nginx';
    if (clean.includes('py') || clean.includes('script')) return 'python';
    if (clean.includes('wire') || clean.includes('tshark') || clean.includes('packet')) return 'wireshark';
    if (clean.includes('git')) return 'git';
    
    return null;
}

// Reset terminal to a completely fresh interface (no previous commands or output history)
function resetTerminalToFreshState() {
    commandHistory = [];
    historyIndex = -1;
    const input = document.getElementById('terminal-input');
    if (input) input.value = '';

    const output = document.getElementById('terminal-output');
    if (output) {
        output.innerHTML = `
            <div class="text-[#524c44] space-y-1 pb-3 border-b border-[#dfd5c4]">
                <div class="text-[#c85a2d] font-bold text-sm tracking-wide font-mono flex items-center gap-2">
                    <span>✈</span> <span>MADHUSUDHAN VELLORE // LINUX SYSADMIN TERMINAL</span>
                </div>
                <div class="text-[#0d1b2a] text-xs font-sans font-medium">
                    Linux Systems Administration • Cloud Infrastructure • Automation • CI/CD
                </div>
                <div class="text-[#524c44] text-[11px] pt-0.5 font-mono">
                    Session: flight-deck-tty1 | Verified OK 2026
                </div>
                <div class="text-[#c85a2d] text-xs pt-1 font-mono font-semibold">
                    ➜ Type <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('help')">'help'</span> to view commands or tap the quick pills above.
                </div>
            </div>
        `;
    }

    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
        terminalBody.scrollTop = 0;
    }
}

function openTerminalModal() {
    const modal = document.getElementById('terminal-modal');
    if (modal) {
        // Every time terminal is opened, previous history is deleted and a fresh interface is displayed
        resetTerminalToFreshState();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
        focusTerminalInput();
    }
}

function closeTerminalModal() {
    const modal = document.getElementById('terminal-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
}

function focusTerminalInput() {
    const input = document.getElementById('terminal-input');
    if (input) {
        setTimeout(() => input.focus(), 50);
    }
}

function toggleTerminalFullscreen() {
    const modalBox = document.querySelector('#terminal-modal > div');
    if (!modalBox) return;
    modalBox.classList.toggle('max-w-3xl');
    modalBox.classList.toggle('max-w-[96vw]');
    modalBox.classList.toggle('h-[90vh]');
    const body = document.getElementById('terminal-body');
    if (body) {
        body.classList.toggle('h-[360px]');
        body.classList.toggle('sm:h-[420px]');
        body.classList.toggle('flex-grow');
    }
}

function handleTerminalKeydown(e) {
    const input = document.getElementById('terminal-input');
    if (!input) return;

    if (e.key === 'Enter') {
        const rawCmd = input.value.trim();
        input.value = '';
        if (rawCmd) {
            commandHistory.push(rawCmd);
            historyIndex = commandHistory.length;
            processTerminalCommand(rawCmd);
        } else {
            appendTerminalPromptLine('');
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        } else if (historyIndex === 0 && commandHistory.length > 0) {
            input.value = commandHistory[0];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentVal = input.value.trim().toLowerCase();
        if (!currentVal) return;
        const match = AVAILABLE_COMMANDS.find(cmd => cmd.startsWith(currentVal));
        if (match) {
            input.value = match;
        }
    }
}

function executeTerminalCommand(cmdName) {
    focusTerminalInput();
    const input = document.getElementById('terminal-input');
    if (input) input.value = '';
    commandHistory.push(cmdName);
    historyIndex = commandHistory.length;
    processTerminalCommand(cmdName);
}

function appendTerminalPromptLine(cmd) {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const line = document.createElement('div');
    line.className = 'flex items-center gap-2 text-xs sm:text-sm pt-2 font-mono';
    line.innerHTML = `<span class="text-[#c85a2d] font-bold shrink-0">madhu@sysadmin:~$</span> <span class="text-[#0d1b2a] font-bold">${escapeHtml(cmd)}</span>`;
    output.appendChild(line);
}

function renderSkillDetailCard(skillKey) {
    const skill = SKILLS_DETAILS[skillKey];
    if (!skill) return '';

    return `
        <div class="bg-[#f4ece0] border-2 border-[#dfd5c4] p-4 sm:p-5 rounded-2xl font-mono space-y-3 shadow-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#dfd5c4]">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-base sm:text-lg font-black text-[#0d1b2a]">${skill.name}</span>
                        <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] border border-[#c85a2d]/30 font-bold px-2 py-0.5 rounded uppercase tracking-wider">${skill.tag}</span>
                    </div>
                    <span class="text-xs text-[#524c44] font-medium block mt-0.5">${skill.category}</span>
                </div>
                <div class="text-[11px] font-bold text-[#c85a2d] bg-white px-2.5 py-1 rounded-lg border border-[#dfd5c4] whitespace-nowrap self-start">
                    VERIFIED CANDIDATE
                </div>
            </div>

            <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                <span class="text-[#524c44] text-[10px] uppercase font-bold block mb-1 tracking-wider">Proficiency Level</span>
                <span class="text-[#0d1b2a] text-xs font-bold">${skill.proficiency}</span>
            </div>

            <div class="space-y-2 pt-1">
                <span class="text-[#524c44] text-[10px] uppercase font-bold block tracking-wider">Key Directives & Production Competencies:</span>
                <div class="space-y-1.5 text-xs text-[#0d1b2a]">
                    ${skill.points.map(pt => `
                        <div class="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-[#dfd5c4]">
                            <span class="text-[#c85a2d] font-bold shrink-0">▸</span>
                            <span class="leading-relaxed">${pt}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="pt-2 border-t border-[#dfd5c4] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#524c44]">
                <span>Type <code class="text-[#c85a2d] font-bold cursor-pointer underline" onclick="executeTerminalCommand('skills')">skills</code> to return to skills overview</span>
                <span class="text-[#c85a2d] font-bold">STATUS: PRODUCTION TESTED</span>
            </div>
        </div>
    `;
}

function processTerminalCommand(rawCommand) {
    appendTerminalPromptLine(rawCommand);

    const output = document.getElementById('terminal-output');
    if (!output) return;

    const trimmed = rawCommand.trim();
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    const resultBox = document.createElement('div');
    resultBox.className = 'mt-1 mb-3 text-xs sm:text-sm text-[#0d1b2a]';

    switch (command) {
        case 'help':
            resultBox.innerHTML = `
                <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl space-y-2.5 font-mono shadow-xs">
                    <div class="text-[#c85a2d] font-bold uppercase tracking-wider text-xs flex items-center justify-between pb-1.5 border-b border-[#dfd5c4]">
                        <span>Sysadmin Flight Deck Shell • Available Commands</span>
                        <span class="text-[#524c44] text-[10px]">HELP MANUAL</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">skills [skill_name]</span>
                            <p class="text-[#524c44] mt-0.5">List skill names or inspect detailed info (e.g. <code class="text-[#0d1b2a] font-bold cursor-pointer" onclick="executeTerminalCommand('skills linux')">skills linux</code>)</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">education</span>
                            <p class="text-[#524c44] mt-0.5">Academic background, degree, college & branch</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">experience</span>
                            <p class="text-[#524c44] mt-0.5">Operations engineering background & directives</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">who</span> / <span class="text-[#c85a2d] font-mono font-bold">whoami</span>
                            <p class="text-[#524c44] mt-0.5">Candidate profile: Name, Age, Degree, Branch, Role</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">contact</span>
                            <p class="text-[#524c44] mt-0.5">Contact coordinates (Phone, Email, LinkedIn, GitHub)</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#c85a2d] font-bold font-mono">resume</span>
                            <p class="text-[#524c44] mt-0.5">Closes terminal and opens document resume viewer</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#0d1b2a] font-bold font-mono">clear</span>
                            <p class="text-[#524c44] mt-0.5">Clear terminal output buffer</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#0d1b2a] font-bold font-mono">exit</span>
                            <p class="text-[#524c44] mt-0.5">Close interactive terminal window</p>
                        </div>
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;

        case 'skills':
        case 'ls':
            // If argument is passed: "skills skill_name gives detailed information about that skills"
            if (arg) {
                const resolvedKey = resolveSkillKey(arg);
                if (resolvedKey && SKILLS_DETAILS[resolvedKey]) {
                    resultBox.innerHTML = renderSkillDetailCard(resolvedKey);
                } else {
                    resultBox.innerHTML = `
                        <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 rounded-2xl font-mono text-xs space-y-2 shadow-xs">
                            <div class="text-[#c85a2d] font-bold">Skill '${escapeHtml(arg)}' not recognized in registry.</div>
                            <div class="text-[#524c44] text-[11px] leading-relaxed">
                                Available skill profiles:
                                <div class="flex flex-wrap gap-1.5 mt-1.5">
                                    <button onclick="executeTerminalCommand('skills linux')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">linux</button>
                                    <button onclick="executeTerminalCommand('skills github-actions')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">github-actions</button>
                                    <button onclick="executeTerminalCommand('skills kubernetes')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">kubernetes</button>
                                    <button onclick="executeTerminalCommand('skills aws')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">aws</button>
                                    <button onclick="executeTerminalCommand('skills terraform')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">terraform</button>
                                    <button onclick="executeTerminalCommand('skills docker')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">docker</button>
                                    <button onclick="executeTerminalCommand('skills nginx')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">nginx</button>
                                    <button onclick="executeTerminalCommand('skills python')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">python</button>
                                    <button onclick="executeTerminalCommand('skills wireshark')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">wireshark</button>
                                    <button onclick="executeTerminalCommand('skills git')" class="px-2 py-0.5 bg-white border border-[#dfd5c4] rounded text-[#0d1b2a] font-bold hover:bg-[#c85a2d] hover:text-white cursor-pointer">git</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else {
                // "For skills command only give skills name" with click-to-inspect
                resultBox.innerHTML = `
                    <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl font-mono space-y-2.5 shadow-xs">
                        <div class="text-[#c85a2d] font-bold text-xs uppercase tracking-wider flex items-center justify-between pb-1.5 border-b border-[#dfd5c4]">
                            <span>$ ls ~/skills</span>
                            <span class="text-[#524c44] text-[10px]">10 SKILLS REGISTERED</span>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs pt-1">
                            <button type="button" onclick="executeTerminalCommand('skills linux')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Linux</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills github-actions')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>GitHub Actions</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills kubernetes')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Kubernetes + Helm</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills aws')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>AWS</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills terraform')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Terraform</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills docker')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Docker</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills nginx')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Nginx</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills python')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Python Scripting</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills wireshark')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Wireshark</span>
                            </button>
                            <button type="button" onclick="executeTerminalCommand('skills git')" class="px-2.5 py-2 bg-white hover:bg-[#c85a2d] hover:text-white rounded-xl border border-[#dfd5c4] text-[#0d1b2a] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group text-left">
                                <span class="text-[#c85a2d] group-hover:text-white">▸</span> <span>Git &amp; GitHub</span>
                            </button>
                        </div>
                        <div class="pt-2 border-t border-[#dfd5c4] text-[11px] text-[#524c44] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span>💡 Tip: Click any skill above or type <code class="text-[#c85a2d] font-bold">skills &lt;name&gt;</code> (e.g. <span class="underline cursor-pointer text-[#0d1b2a] font-bold" onclick="executeTerminalCommand('skills linux')">skills linux</span>) for details.</span>
                        </div>
                    </div>
                `;
            }
            output.appendChild(resultBox);
            break;

        case 'who':
        case 'whoami':
            resultBox.innerHTML = `
                <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl space-y-3 font-mono shadow-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-[#dfd5c4]">
                        <span class="text-[#c85a2d] font-bold tracking-wider text-xs uppercase">IDENTIFICATION CARD & DOSSIER</span>
                        <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] px-2 py-0.5 rounded border border-[#c85a2d]/30 font-bold">VERIFIED</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">Name</span>
                            <span class="text-[#0d1b2a] font-bold text-sm">Vellore Madhusudhan (Mannu)</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">Primary Role</span>
                            <span class="text-[#c85a2d] font-bold text-sm">Linux Administrator / DevOps</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">Age & Gender</span>
                            <span class="text-[#0d1b2a] font-bold">27 Years • Male</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">Degree & Branch</span>
                            <span class="text-[#0d1b2a] font-bold">B.Tech • Computer Science & Engineering</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">College & Batch</span>
                            <span class="text-[#0d1b2a] font-bold">SDTN (Class of 2022)</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-[#dfd5c4] shadow-xs">
                            <span class="text-[#524c44] uppercase text-[10px] block font-bold">Current Base</span>
                            <span class="text-[#0d1b2a] font-bold">BTM Layout, Bengaluru, India</span>
                        </div>
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;

        case 'education':
            resultBox.innerHTML = `
                <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl space-y-3 font-mono shadow-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-[#dfd5c4]">
                        <span class="text-[#c85a2d] font-bold tracking-wider text-xs uppercase">ACADEMIC QUALIFICATIONS</span>
                        <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] px-2 py-0.5 rounded border border-[#c85a2d]/30 font-bold">2018 - 2022</span>
                    </div>
                    <div class="p-3.5 bg-white rounded-xl border border-[#dfd5c4] space-y-1.5 shadow-xs text-xs">
                        <div class="text-[#c85a2d] font-bold text-sm">Bachelor of Technology (B.Tech)</div>
                        <div class="text-[#0d1b2a] font-bold">Branch: Computer Science & Engineering (CSE)</div>
                        <div class="text-[#524c44] text-xs">Institution: SDTN • Puttu, IN</div>
                        <div class="text-[#524c44] text-[11px] pt-2 border-t border-[#dfd5c4] leading-relaxed">
                            Foundations: Operating Systems, Computer Architecture, Data Structures, Computer Networks, Linux Internals, Systems Engineering.
                        </div>
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;

        case 'experience':
            resultBox.innerHTML = `
                <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl space-y-3 font-mono shadow-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-[#dfd5c4]">
                        <span class="text-[#c85a2d] font-bold tracking-wider text-xs uppercase">PRODUCTION OPERATIONS DEPLOYMENT</span>
                        <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] px-2 py-0.5 rounded border border-[#c85a2d]/30 font-bold">7 MONTHS</span>
                    </div>
                    <div class="p-3.5 bg-white rounded-xl border border-[#dfd5c4] space-y-2 shadow-xs text-xs">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#dfd5c4] pb-2">
                            <span class="text-[#0d1b2a] font-bold text-sm">Graduate Engineer, Operations</span>
                            <span class="text-[#c85a2d] font-bold text-[11px]">Aug 2024 – Feb 2025</span>
                        </div>
                        <div class="text-[#0d1b2a] font-bold">Mavenir Systems Private Limited • Bengaluru (MFAR-8)</div>
                        <div class="text-[#524c44] text-[11px]">Product: Voicemail Application Server (VMAS)</div>
                        <div class="space-y-1.5 pt-2 border-t border-[#dfd5c4] text-[#0d1b2a]">
                            <div class="flex items-start gap-2">
                                <span class="text-[#c85a2d] font-bold">▸</span>
                                <span><strong>Production Operations:</strong> Tier support for VMAS maintaining high availability.</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <span class="text-[#c85a2d] font-bold">▸</span>
                                <span><strong>RCA & Incident Triage:</strong> Investigated ticketing issues and root cause analysis.</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <span class="text-[#c85a2d] font-bold">▸</span>
                                <span><strong>Telemetry & Monitoring:</strong> Proactively monitored system health and alert thresholds.</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <span class="text-[#c85a2d] font-bold">▸</span>
                                <span><strong>Change Records (CRs):</strong> Maintained strict tracking for server activities and updates.</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;

        case 'contact':
            resultBox.innerHTML = `
                <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 sm:p-4 rounded-2xl space-y-3 font-mono shadow-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-[#dfd5c4]">
                        <span class="text-[#c85a2d] font-bold tracking-wider text-xs uppercase">DIRECT COMMUNICATION CHANNELS</span>
                        <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] px-2 py-0.5 rounded border border-[#c85a2d]/30 font-bold">ACTIVE</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <a href="tel:+917396302695" class="p-3 bg-white hover:bg-[#fbeee7] rounded-xl border border-[#dfd5c4] transition-colors flex items-center justify-between group shadow-xs">
                            <span class="text-[#524c44] font-semibold">Phone:</span>
                            <span class="text-[#0d1b2a] font-bold group-hover:text-[#c85a2d]">(91) 7396302695 ↗</span>
                        </a>
                        <a href="mailto:madhusudhan.vellore@gmail.com" class="p-3 bg-white hover:bg-[#fbeee7] rounded-xl border border-[#dfd5c4] transition-colors flex items-center justify-between group shadow-xs">
                            <span class="text-[#524c44] font-semibold">Email:</span>
                            <span class="text-[#0d1b2a] font-bold group-hover:text-[#c85a2d] truncate ml-2">madhusudhan.vellore@gmail.com ↗</span>
                        </a>
                        <a href="https://linkedin.com/in/v-madhusudhan-b1b403350" target="_blank" rel="noopener noreferrer" class="p-3 bg-white hover:bg-[#fbeee7] rounded-xl border border-[#dfd5c4] transition-colors flex items-center justify-between group shadow-xs">
                            <span class="text-[#524c44] font-semibold">LinkedIn:</span>
                            <span class="text-[#0d1b2a] font-bold group-hover:text-[#c85a2d] group-hover:underline">v-madhusudhan-b1b403350 ↗</span>
                        </a>
                        <a href="https://github.com/MadhusudhanVellore" target="_blank" rel="noopener noreferrer" class="p-3 bg-white hover:bg-[#fbeee7] rounded-xl border border-[#dfd5c4] transition-colors flex items-center justify-between group shadow-xs">
                            <span class="text-[#524c44] font-semibold">GitHub:</span>
                            <span class="text-[#0d1b2a] font-bold group-hover:text-[#c85a2d] group-hover:underline">MadhusudhanVellore ↗</span>
                        </a>
                        <div class="p-3 bg-white rounded-xl border border-[#dfd5c4] sm:col-span-2 flex items-center justify-between shadow-xs">
                            <span class="text-[#524c44] font-semibold">Address:</span>
                            <span class="text-[#0d1b2a] font-bold">BTM Layout, Bengaluru, Karnataka, India</span>
                        </div>
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;

        case 'resume':
            // Terminal should be closed before displaying the resume
            closeTerminalModal();
            setTimeout(() => {
                openResumeModal();
            }, 120);
            return;

        case 'clear':
            output.innerHTML = `
                <div class="text-[#524c44] space-y-1 pb-3 border-b border-[#dfd5c4]">
                    <div class="text-[#c85a2d] font-bold text-sm tracking-wide font-mono flex items-center gap-2">
                        <span>✈</span> <span>MADHUSUDHAN VELLORE // LINUX SYSADMIN TERMINAL</span>
                    </div>
                    <div class="text-[#c85a2d] text-xs pt-1 font-mono font-semibold">
                        Terminal buffer cleared. Type <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('help')">'help'</span> to view commands.
                    </div>
                </div>
            `;
            break;

        case 'pwd':
            resultBox.innerHTML = `<div class="font-mono text-[#0d1b2a] font-bold">/home/madhu/portfolio</div>`;
            output.appendChild(resultBox);
            break;

        case 'date':
            resultBox.innerHTML = `<div class="font-mono text-[#0d1b2a] font-bold">${new Date().toUTCString()}</div>`;
            output.appendChild(resultBox);
            break;

        case 'uname':
            resultBox.innerHTML = `<div class="font-mono text-[#0d1b2a] font-bold">Linux flight-deck 6.5.0-35-generic #36-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>`;
            output.appendChild(resultBox);
            break;

        case 'exit':
            closeTerminalModal();
            return;

        default:
            // Check if the user directly typed a skill name as a command (e.g. 'linux', 'aws', 'docker')
            const directSkillKey = resolveSkillKey(command);
            if (directSkillKey && SKILLS_DETAILS[directSkillKey]) {
                resultBox.innerHTML = renderSkillDetailCard(directSkillKey);
                output.appendChild(resultBox);
                break;
            }

            resultBox.innerHTML = `
                <div class="text-[#c85a2d] font-mono font-semibold">
                    bash: ${escapeHtml(command)}: command not found.
                    <div class="text-[#524c44] text-xs mt-1">
                        Type <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('help')">'help'</span> to inspect available commands or <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('skills')">'skills'</span> to list technical skills.
                    </div>
                </div>
            `;
            output.appendChild(resultBox);
            break;
    }

    // Auto scroll to bottom of terminal
    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}

function escapeHtml(string) {
    if (!string) return '';
    return String(string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
