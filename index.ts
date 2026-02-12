import { marked } from "marked";
import { createHighlighter } from "shiki";
import { watch } from "fs";
import { join } from "path";
import { generateJsonSchemas } from "./schemas";

const isDevMode = process.argv.includes("--dev");

console.log("Ai Humarizer Engine initializing...");
const highlighter = await createHighlighter({ themes: ["github-light", "github-dark"], langs: ["typescript", "javascript"] });

const getScripts = () => `
<script>
  const sentient = {
    text: (text, tone) => {
      text = text.replace(/(In conclusion,|Furthermore,|Moreover,|It is important to note that|As an AI language model,|Certainly,|However,|Additionally,|Consequently,|Nevertheless,|Notwithstanding,|In summary,|To summarize,|It should be noted that|It is worth mentioning that|As previously mentioned,|In light of the above,)\\s*/gi, "");
      
      const swaps = {
        "utilize": "use", "implement": "set up", "facilitate": "help", "demonstrate": "show",
        "subsequently": "then", "optimum": "best", "verify": "check", "ensure": "make sure",
        "commence": "start", "terminate": "end", "endeavor": "try", "assist": "help",
        "paradigm": "model", "leverage": "use", "synergy": "teamwork", "disseminate": "share",
        "methodology": "method", "functionality": "feature", "optimization": "improvement",
        "parameters": "settings", "configuration": "setup", "initialization": "startup",
        "authentication": "login", "authorization": "permission", "implementation": "setup",
        "comprehensive": "complete", "predominantly": "mostly", "approximately": "about",
        "significantly": "a lot", "consequently": "so", "nevertheless": "still"
      };

      if (tone === 'casual') {
        Object.keys(swaps).forEach(k => text = text.replace(new RegExp("\\\\b"+k+"\\\\b", "gi"), swaps[k]));
        text = text.replace(/\\b(cannot|do not|will not|is not|are not|would not|should not|could not|has not|have not)\\b/gi, (m) => ({"cannot":"can't","do not":"don't","will not":"won't","is not":"isn't","are not":"aren't","would not":"wouldn't","should not":"shouldn't","could not":"couldn't","has not":"hasn't","have not":"haven't"}[m.toLowerCase()] || m));
        const starters = ["Basically, ", "So, ", "Honestly, ", "Look, ", "Here's the deal: ", "Real talk, ", "Okay so, "];
        if (Math.random() > 0.3) text = starters[Math.floor(Math.random()*starters.length)] + text.charAt(0).toLowerCase() + text.slice(1);
        text = text.replace(/\\. ([A-Z])/g, (m, c) => Math.random() > 0.6 ? ". And " + c.toLowerCase() : m);
      } else if (tone === 'professional') {
        Object.keys(swaps).forEach(k => text = text.replace(new RegExp("\\\\b"+k+"\\\\b", "gi"), swaps[k]));
      } else if (tone === 'story') {
        text = "Picture this — " + text.charAt(0).toLowerCase() + text.slice(1);
        text = text.replace(/\\. ([A-Z])/g, (m, c) => Math.random() > 0.5 ? ". Then " + c.toLowerCase() : m);
      }
      return text.trim();
    },
    code: (code, style) => {
      if (style === 'debug') {
        const logs = ['console.log("DEBUG:", {data})', 'console.trace("stack")', 'console.time("perf")', 'debugger;'];
        return code.replace(/{/g, m => Math.random() > 0.5 ? \`{\\n  \${logs[Math.floor(Math.random()*logs.length)]};\` : m);
      } else if (style === 'commented') {
        const comments = ["// TODO: needs review", "// FIXME: edge case", "// NOTE: temp solution", "// HACK: works for now", "// OPTIMIZE: refactor later"];
        return code.split('\\n').map(line => Math.random() > 0.65 && line.trim().length > 3 ? \`\${line}  \${comments[Math.floor(Math.random()*comments.length)]}\` : line).join('\\n');
      } else {
        code = code.replace(/const /g, () => Math.random() > 0.7 ? "let " : "const ");
        if (Math.random() > 0.4) code = "// TODO: clean this up\\n" + code;
        return code;
      }
    }
  };

  // Particle system
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.connections = [];
      this.resize();
      window.addEventListener('resize', () => this.resize());
      for (let i = 0; i < 60; i++) this.particles.push(this.createParticle());
      this.animate();
    }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
    createParticle() {
      return { x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, size: Math.random()*2+1, opacity: Math.random()*0.5+0.1 };
    }
    animate() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        this.ctx.fillStyle = 'rgba(99,102,241,'+p.opacity+')'; this.ctx.fill();
      });
      for (let i=0; i<this.particles.length; i++) {
        for (let j=i+1; j<this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 150) {
            this.ctx.beginPath(); this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.strokeStyle = 'rgba(99,102,241,'+(0.08*(1-dist/150))+')'; this.ctx.lineWidth=0.5; this.ctx.stroke();
          }
        }
      }
      requestAnimationFrame(() => this.animate());
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem(document.getElementById('particles'));

    const input = document.getElementById('engine-input'), output = document.getElementById('engine-output');
    const btnText = document.getElementById('btn-mode-text'), btnCode = document.getElementById('btn-mode-code');
    const optionsContainer = document.getElementById('options-container');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    let mode = 'text';

    const renderOptions = (m) => {
      if (m === 'text') {
        optionsContainer.innerHTML = \`<select id="tone-select" class="option-select"><option value="casual">☕ Casual</option><option value="professional">💼 Professional</option><option value="story">📖 Storytelling</option></select>\`;
      } else {
        optionsContainer.innerHTML = \`<select id="style-select" class="option-select"><option value="standard">🔧 Standard</option><option value="debug">🐛 Debug</option><option value="commented">📝 Commented</option></select>\`;
      }
    };

    const setMode = (m) => { 
      mode = m; renderOptions(m);
      if(m==='text'){ btnText.classList.add('active'); btnCode.classList.remove('active'); input.placeholder='Paste AI-generated text here...'; } 
      else { btnCode.classList.add('active'); btnText.classList.remove('active'); input.placeholder='Paste AI-generated code here...'; } 
    };

    btnText.onclick = () => setMode('text'); 
    btnCode.onclick = () => setMode('code');
    setMode('text');

    document.getElementById('btn-convert').onclick = () => { 
      if(!input.value) return;
      const btn = document.getElementById('btn-convert');
      const scanLine = document.getElementById('scan-line');
      
      btn.classList.add('processing');
      btn.innerHTML = '<span class="btn-loader"></span> Processing...';
      statusDot.className = 'status-dot processing';
      statusText.textContent = 'Processing';
      scanLine.classList.add('active');
      output.value = "";
      
      const option = mode === 'text' ? document.getElementById('tone-select').value : document.getElementById('style-select').value;
      
      setTimeout(() => {
        const result = sentient[mode](input.value, option);
        let i = 0;
        const typeWriter = () => {
          if (i < result.length) {
            output.value += result.charAt(i); i++;
            setTimeout(typeWriter, Math.random()*8+2);
          } else {
            btn.classList.remove('processing');
            btn.innerHTML = '⚡ Humanize';
            statusDot.className = 'status-dot online';
            statusText.textContent = 'Complete';
            scanLine.classList.remove('active');
            setTimeout(() => { statusText.textContent = 'Ready'; }, 2000);
          }
        };
        typeWriter();
      }, 800);
    };
    
    document.getElementById('btn-copy').onclick = function() { 
      if (!output.value) return;
      navigator.clipboard.writeText(output.value); 
      this.innerHTML = '✅ Copied!';
      setTimeout(()=> this.innerHTML = '📋 Copy', 2000); 
    };

    document.getElementById('btn-clear').onclick = function() {
      input.value = ''; output.value = '';
      statusText.textContent = 'Ready';
    };
  });
<` + `/script>
`;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #030712; --bg-secondary: #0f1629; --bg-card: rgba(15, 23, 42, 0.6);
  --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
  --accent: #6366f1; --accent-cyan: #06b6d4; --accent-pink: #ec4899;
  --border: rgba(99, 102, 241, 0.15); --border-hover: rgba(99, 102, 241, 0.3);
  --glow: 0 0 30px rgba(99, 102, 241, 0.15);
  --font-sans: 'Inter', system-ui, sans-serif; --font-mono: 'JetBrains Mono', monospace;
}

body { font-family: var(--font-sans); background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }

#particles { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

.app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2rem; }

/* Top Bar */
.top-bar { width: 100%; max-width: 1100px; display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; margin-bottom: 2rem; animation: slideDown 0.6s ease; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand-icon { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, var(--accent), var(--accent-cyan)); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3); animation: pulse-glow 3s ease-in-out infinite; }
.brand-name { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #c7d2fe, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
.brand-tag { font-size: 0.7rem; background: rgba(99, 102, 241, 0.15); color: var(--accent); padding: 3px 10px; border-radius: 20px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.2); }
.status-bar { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; font-size: 0.8rem; color: #10b981; font-weight: 500; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: blink 2s ease-in-out infinite; }
.status-dot.processing { background: #f59e0b; animation: blink 0.5s ease-in-out infinite; }

/* Main Card */
.engine-card { width: 100%; max-width: 1100px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 0; overflow: hidden; backdrop-filter: blur(20px); box-shadow: var(--glow); animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; }
.engine-card::before { content: ''; position: absolute; inset: -1px; border-radius: 25px; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,0.3), transparent 40%, transparent 60%, rgba(6,182,212,0.3)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 2; }

.card-header { padding: 2rem 2.5rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; animation: fadeInUp 0.8s 0.1s both; }
.card-title { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; }
.card-title span { background: linear-gradient(135deg, var(--accent), var(--accent-cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.card-subtitle { color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px; }

/* Controls */
.controls { padding: 1.25rem 2.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 1rem; animation: fadeInUp 0.8s 0.2s both; }
.mode-tabs { display: flex; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 4px; border: 1px solid rgba(255,255,255,0.05); }
.mode-tab { padding: 10px 24px; border-radius: 10px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 600; font-size: 0.95rem; font-family: var(--font-sans); transition: all 0.25s ease; }
.mode-tab:hover { color: var(--text-primary); }
.mode-tab.active { background: var(--accent); color: white; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
.option-select { padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border); background: rgba(0,0,0,0.3); color: var(--text-primary); font-family: var(--font-sans); font-size: 0.9rem; font-weight: 500; cursor: pointer; outline: none; transition: border-color 0.2s; }
.option-select:focus { border-color: var(--accent); }

/* Work Area */
.work-area { display: grid; grid-template-columns: 1fr 1fr; position: relative; }
.work-area > div { padding: 2rem 2.5rem 2rem; }
.work-area > div:first-child { border-right: 1px solid var(--border); }
.io-label { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); }
.io-label .dot { width: 6px; height: 6px; border-radius: 50%; }
.io-label .dot.input { background: var(--accent-pink); box-shadow: 0 0 8px rgba(236, 72, 153, 0.5); }
.io-label .dot.output { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
.text-input { width: 100%; min-height: 380px; padding: 1.25rem; border-radius: 16px; border: 1px solid var(--border); background: rgba(0,0,0,0.25); color: var(--text-primary); font-family: var(--font-mono); font-size: 1rem; line-height: 1.7; resize: none; outline: none; transition: all 0.3s ease; }
.text-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.1), inset 0 0 30px rgba(99,102,241,0.03); }
.text-input::placeholder { color: var(--text-muted); }

/* Scan Line */
.scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent); opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 5; }
.scan-line.active { opacity: 1; animation: scan 1.5s linear infinite; }

/* Actions */
.actions-bar { padding: 1.5rem 2.5rem; border-top: 1px solid var(--border); display: flex; justify-content: center; gap: 1rem; animation: fadeInUp 0.8s 0.4s both; }
.action-btn { padding: 14px 36px; border-radius: 14px; border: none; font-weight: 700; font-size: 1.05rem; font-family: var(--font-sans); cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; align-items: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, var(--accent), #4f46e5); color: white; box-shadow: 0 8px 25px -5px rgba(99,102,241,0.5); }
.btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px -5px rgba(99,102,241,0.6); }
.btn-primary:active { transform: translateY(0) scale(0.98); }
.btn-primary.processing { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 8px 25px -5px rgba(245,158,11,0.4); pointer-events: none; }
.btn-secondary { background: rgba(255,255,255,0.04); color: var(--text-secondary); border: 1px solid var(--border); }
.btn-secondary:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); border-color: var(--border-hover); transform: translateY(-2px); }
.btn-loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

/* Footer */
.footer { margin-top: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; animation: fadeInUp 0.8s 0.6s both; }
.footer a { color: var(--accent); text-decoration: none; }

/* Animations */
@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 4px 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 4px 30px rgba(99,102,241,0.6); } }
@keyframes scan { 0% { top:0; } 100% { top:100%; } }
@keyframes spin { to { transform:rotate(360deg); } }

/* Responsive */
@media (max-width: 768px) {
  .app { padding: 1rem; }
  .work-area { grid-template-columns: 1fr; }
  .work-area > div:first-child { border-right: none; border-bottom: 1px solid var(--border); }
  .controls { flex-direction: column; }
  .top-bar { flex-direction: column; gap: 1rem; }
  .card-header { flex-direction: column; align-items: flex-start; }
  .card-title { font-size: 1.6rem; }
  .text-input { min-height: 250px; }
}
`;

const getTemplate = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ai Humarizer</title>
  <meta name="description" content="Transform AI-generated text and code into natural, human-like content.">
  <style>${styles}</style>
</head>
<body>
  <canvas id="particles"></canvas>
  <div class="app">
    <nav class="top-bar">
      <div class="brand">
        <div class="brand-icon">🧠</div>
        <div>
          <div class="brand-name">Ai Humarizer</div>
        </div>
        <span class="brand-tag">v2.0</span>
      </div>
      <div class="status-bar">
        <span class="status-dot online" id="status-dot"></span>
        <span id="status-text">Ready</span>
      </div>
    </nav>

    <main class="engine-card">
      <div class="card-header">
        <div>
          <h1 class="card-title">Humanize <span>Engine</span></h1>
          <p class="card-subtitle">Transform artificial outputs into authentic human expression</p>
        </div>
      </div>

      <div class="controls">
        <div class="mode-tabs">
          <button class="mode-tab active" id="btn-mode-text">📝 Text</button>
          <button class="mode-tab" id="btn-mode-code">💻 Code</button>
        </div>
        <div id="options-container"></div>
      </div>

      <div class="work-area">
        <div>
          <label class="io-label"><span class="dot input"></span> Input Signal</label>
          <textarea class="text-input" id="engine-input" placeholder="Paste AI-generated text here..." spellcheck="false"></textarea>
        </div>
        <div style="position:relative;">
          <div class="scan-line" id="scan-line"></div>
          <label class="io-label"><span class="dot output"></span> Human Output</label>
          <textarea class="text-input" id="engine-output" readonly placeholder="Humanized result appears here..." spellcheck="false"></textarea>
        </div>
      </div>

      <div class="actions-bar">
        <button class="action-btn btn-primary" id="btn-convert">⚡ Humanize</button>
        <button class="action-btn btn-secondary" id="btn-copy">📋 Copy</button>
        <button class="action-btn btn-secondary" id="btn-clear">🗑️ Clear</button>
      </div>
    </main>

    <footer class="footer">
      <p>Built by <a href="https://github.com/Manju1303" target="_blank">Manju1303</a></p>
    </footer>
  </div>
  ${getScripts()}
</body></html>`;

async function build() {
  console.log("Building Ai Humarizer...");
  try {
    const page = getTemplate();
    try { await Bun.write("dist/.gitkeep", ""); } catch { }
    await Bun.write("dist/index.html", page);

    const assetsDir = "assets";
    const distAssetsDir = "dist/assets";

    try {
      await Bun.write(`${distAssetsDir}/logo/.gitkeep`, "");
      const logos = ["humanizer-logo-light.svg", "humanizer-logo-dark.svg"];
      for (const logo of logos) {
        try {
          const f = await Bun.file(join(assetsDir, "logo", logo)).text();
          await Bun.write(join(distAssetsDir, "logo", logo), f);
        } catch { }
      }
    } catch { }

    try {
      await Bun.write(`${distAssetsDir}/fonts/.gitkeep`, "");
      const fonts = ["CursorGothic-Regular.woff2", "CursorGothic-Bold.woff2", "BerkeleyMono-Regular.woff2"];
      for (const font of fonts) {
        try {
          const f = await Bun.file(join(assetsDir, "fonts", font)).arrayBuffer();
          await Bun.write(join(distAssetsDir, "fonts", font), f);
        } catch { }
      }
    } catch { }

    console.log("✅ Build complete!");
  } catch (error: any) {
    console.log("ERROR:", error.message);
    process.exit(1);
  }
}

async function startDevServer() {
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      const url = new URL(req.url);
      let path = url.pathname;
      if (path === "/") path = "/index.html";
      const filePath = join("dist", path);
      try { return new Response(Bun.file(filePath)); } catch { return new Response("Not Found", { status: 404 }); }
    },
  });
  console.log(`🚀 Dev server running at http://localhost:${server.port}`);
  watch(".", { recursive: true }, async (event, filename) => {
    if (filename && !filename.startsWith("dist") && !filename.startsWith("node_modules") && !filename.startsWith(".git")) {
      console.log(`Change: ${filename}`);
      await build();
    }
  });
}

await build();

if (isDevMode) {
  await startDevServer();
}
