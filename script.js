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

// Authoritative 3-line Google/industry definitions for technologies (not personal resume results)
const SKILLS_DEFINITIONS = {
    'linux': {
        name: 'Linux',
        tag: 'OPERATING SYSTEM',
        lines: [
            'Linux is an open-source, Unix-like operating system kernel that manages computer hardware and coordinates system processes.',
            'It provides a modular, multi-user, and multi-tasking architecture powered by command-line shells, systemd, and monolithic kernel services.',
            'Widely used across global cloud servers, container runtimes, mainframe enterprise systems, and embedded devices.'
        ]
    },
    'github-actions': {
        name: 'GitHub Actions',
        tag: 'CI/CD PLATFORM',
        lines: [
            'GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform integrated natively within GitHub repositories.',
            'It automates software development workflows—including building, testing, linting, packaging, and deploying code—using event-driven YAML pipelines.',
            'Enables developers to execute matrix builds, manage environment secrets, and deploy software across multi-cloud environments.'
        ]
    },
    'kubernetes': {
        name: 'Kubernetes & Helm',
        tag: 'CONTAINER ORCHESTRATION',
        lines: [
            'Kubernetes is an open-source container orchestration platform designed to automate the deployment, scaling, and management of containerized applications.',
            'Helm is the dedicated package manager for Kubernetes that defines, versions, installs, and manages complex cluster applications using charts.',
            'Together they deliver automated self-healing, horizontal autoscaling, service discovery, declarative rollouts, and deterministic rollbacks.'
        ]
    },
    'aws': {
        name: 'Amazon Web Services (AWS)',
        tag: 'CLOUD COMPUTING',
        lines: [
            'Amazon Web Services (AWS) is a comprehensive, globally distributed cloud computing platform offering on-demand infrastructure and APIs.',
            'It supplies core building blocks such as elastic virtual servers (EC2), scalable object storage (S3), and isolated virtual private clouds (VPC).',
            'Adopted worldwide to host scalable web services, enterprise databases, big data pipelines, and mission-critical cloud solutions.'
        ]
    },
    'terraform': {
        name: 'Terraform',
        tag: 'INFRASTRUCTURE AS CODE',
        lines: [
            'Terraform is an open-source Infrastructure as Code (IaC) tool created by HashiCorp for provisioning and managing multi-cloud resources.',
            'It utilizes declarative HashiCorp Configuration Language (HCL) to generate deterministic execution plans and track state across cloud providers.',
            'Ensures reproducible infrastructure lifecycle management, automated drift detection, and modular, collaborative infrastructure engineering.'
        ]
    },
    'docker': {
        name: 'Docker',
        tag: 'CONTAINERIZATION',
        lines: [
            'Docker is an open-source platform that packages applications and their complete runtime dependencies into portable, isolated containers.',
            'It shares the host operating system kernel to achieve rapid startup times, minimal resource overhead, and strict environment parity.',
            'Standardizes development-to-production lifecycles, microservices architecture, and modern cloud-native software delivery.'
        ]
    },
    'nginx': {
        name: 'Nginx',
        tag: 'WEB SERVER & REVERSE PROXY',
        lines: [
            'Nginx is an open-source, high-performance HTTP web server, reverse proxy, mail proxy, and generic TCP/UDP load balancer.',
            'It employs an asynchronous, event-driven, non-blocking architecture capable of handling tens of thousands of concurrent connections with minimal memory.',
            'Routinely deployed at the network edge for SSL/TLS termination, static content acceleration, caching, and upstream traffic routing.'
        ]
    },
    'python': {
        name: 'Python Scripting',
        tag: 'PROGRAMMING & SCRIPTING',
        lines: [
            'Python is a high-level, general-purpose interpreted programming language recognized for its clear syntax, readability, and versatile standard library.',
            'It offers powerful built-in modules for operating system interactions, process automation, regex parsing, network requests, and data manipulation.',
            'Globally adopted for systems administration scripts, DevOps automation, cloud tooling, backend web APIs, and data science workflows.'
        ]
    },
    'wireshark': {
        name: 'Wireshark & Tshark',
        tag: 'NETWORK PROTOCOL ANALYZER',
        lines: [
            'Wireshark is the world\'s leading open-source network protocol packet analyzer used for real-time traffic capture and network troubleshooting.',
            'It captures packets passing through network interfaces and decodes hundreds of transport, internet, and application layer protocols in microscopic detail.',
            'Essential for diagnosing network latency, dropped packets, TCP retransmissions, handshake failures, and communication bottlenecks.'
        ]
    },
    'git': {
        name: 'Git & GitHub',
        tag: 'VERSION CONTROL & COLLABORATION',
        lines: [
            'Git is an open-source distributed version control system engineered for speed, data integrity, and support for non-linear distributed workflows.',
            'GitHub is a web-based hosting platform providing Git repository management, pull request code reviews, issue tracking, and team collaboration.',
            'Forms the foundational backbone of modern software engineering, branch management, release tagging, and GitOps deployments.'
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
                    ➜ Type <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('help')">'help'</span>, <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('skills')">'skills'</span>, or <span class="text-[#0d1b2a] font-bold underline cursor-pointer hover:text-[#c85a2d]" onclick="executeTerminalCommand('skills linux')">'skills linux'</span> for details.
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

// Renders the authoritative 3-line Google/industry definition for a technology
function renderSkillDetailCard(skillKey) {
    const skill = SKILLS_DEFINITIONS[skillKey];
    if (!skill) return '';

    return `
        <div class="bg-[#f4ece0] border-2 border-[#dfd5c4] p-4 sm:p-5 rounded-2xl font-mono space-y-3 shadow-xs">
            <div class="flex items-center justify-between pb-2 border-b border-[#dfd5c4]">
                <div class="flex items-center gap-2">
                    <span class="text-base sm:text-lg font-black text-[#0d1b2a]">${skill.name}</span>
                    <span class="text-[10px] bg-[#c85a2d]/10 text-[#c85a2d] border border-[#c85a2d]/30 font-bold px-2 py-0.5 rounded uppercase tracking-wider">${skill.tag}</span>
                </div>
                <span class="text-[10px] text-[#524c44] font-bold uppercase bg-white px-2 py-0.5 rounded border border-[#dfd5c4]">3-LINE DEFINITION</span>
            </div>

            <!-- 3 Lines Google Definition -->
            <div class="space-y-2 text-xs sm:text-sm text-[#0d1b2a]">
                <div class="p-3 bg-white rounded-xl border border-[#dfd5c4] flex items-start gap-2.5 shadow-xs leading-relaxed">
                    <span class="text-[#c85a2d] font-bold text-xs shrink-0 select-none">[1]</span>
                    <span>${skill.lines[0]}</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-[#dfd5c4] flex items-start gap-2.5 shadow-xs leading-relaxed">
                    <span class="text-[#c85a2d] font-bold text-xs shrink-0 select-none">[2]</span>
                    <span>${skill.lines[1]}</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-[#dfd5c4] flex items-start gap-2.5 shadow-xs leading-relaxed">
                    <span class="text-[#c85a2d] font-bold text-xs shrink-0 select-none">[3]</span>
                    <span>${skill.lines[2]}</span>
                </div>
            </div>

            <div class="pt-2 border-t border-[#dfd5c4] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#524c44]">
                <span>Type <code class="text-[#c85a2d] font-bold cursor-pointer underline" onclick="executeTerminalCommand('skills')">skills</code> to view all skill names</span>
                <span class="text-[#c85a2d] font-bold uppercase">STANDARD GOOGLE DEFINITION</span>
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
                            <p class="text-[#524c44] mt-0.5">List skill names or get 3-line Google definition (e.g. <code class="text-[#0d1b2a] font-bold cursor-pointer" onclick="executeTerminalCommand('skills linux')">skills linux</code>)</p>
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
            // If argument is passed: "skills skill_name gives 3 lines Google definition"
            if (arg) {
                const resolvedKey = resolveSkillKey(arg);
                if (resolvedKey && SKILLS_DEFINITIONS[resolvedKey]) {
                    resultBox.innerHTML = renderSkillDetailCard(resolvedKey);
                } else {
                    resultBox.innerHTML = `
                        <div class="bg-[#f4ece0] border border-[#dfd5c4] p-3.5 rounded-2xl font-mono text-xs space-y-2 shadow-xs">
                            <div class="text-[#c85a2d] font-bold">Skill '${escapeHtml(arg)}' not recognized.</div>
                            <div class="text-[#524c44] text-[11px] leading-relaxed">
                                Available skills for 3-line definitions:
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
                            <span>💡 Tip: Click any skill above or type <code class="text-[#c85a2d] font-bold">skills &lt;name&gt;</code> (e.g. <span class="underline cursor-pointer text-[#0d1b2a] font-bold" onclick="executeTerminalCommand('skills linux')">skills linux</span>) for 3-line Google definitions.</span>
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
            // Check if user directly typed a skill name as a command (e.g. 'linux', 'aws', 'docker')
            const directSkillKey = resolveSkillKey(command);
            if (directSkillKey && SKILLS_DEFINITIONS[directSkillKey]) {
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
