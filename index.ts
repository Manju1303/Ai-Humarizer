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
      // Common cleanups to remove robotic phrases
      text = text.replace(/(In conclusion,|Furthermore,|Moreover,|It is important to note that|As an AI language model,|Certainly,|However,)\\s*/gi, "");
      
      const swaps = {
        "utilize": "use", "implement": "set up", "facilitate": "help", "demonstrate": "show",
        "subsequently": "then", "optimum": "best", "verify": "check", "ensure": "make sure",
        "commence": "start", "terminate": "end", "endeavor": "try", "assist": "help",
        "paradigm": "model", "leverage": "use", "synergy": "teamwork", "disseminate": "share"
      };

      if (tone === 'casual') {
        Object.keys(swaps).forEach(k => text = text.replace(new RegExp("\\\\b"+k+"\\\\b", "gi"), swaps[k]));
        text = text.replace(/\\b(cannot|do not|will not|is not|are not)\\b/gi, (m) => ({"cannot":"can't","do not":"don't","will not":"won't","is not":"isn't","are not":"aren't"}[m.toLowerCase()] || m));
        
        const starters = ["Basically, ", "So, ", "Honestly, ", "Look, ", "Here's the deal: "];
        if (Math.random() > 0.3) text = starters[Math.floor(Math.random()*starters.length)] + text.charAt(0).toLowerCase() + text.slice(1);
        
        if (Math.random() > 0.5) text = text.replace(/\\. /g, ". ... ");
      } else if (tone === 'professional') {
        Object.keys(swaps).forEach(k => text = text.replace(new RegExp("\\\\b"+k+"\\\\b", "gi"), swaps[k]));
        // Keep clear structure but smoother
      } else if (tone === 'story') {
        text = "Picture this: " + text.charAt(0).toLowerCase() + text.slice(1);
        text = text.replace(/\\. /g, "—and ");
      }
      return text.trim();
    },
    code: (code, style) => {
      if (style === 'debug') {
        const logs = ['console.log("DEBUG: check point 1")', 'console.dir(data)', 'console.error(err)', 'debugger;'];
        return code.replace(/{/g, m => Math.random() > 0.6 ? \`{\\n  \${logs[Math.floor(Math.random()*logs.length)]};\` : m);
      } else if (style === 'commented') {
        const comments = ["// Logic needs review", "// Optimization needed here", "// Handling edge case", "// Temporary fix for race condition"];
        return code.split('\\n').map(line => Math.random() > 0.7 && line.trim().length > 5 ? \`\${line} \${comments[Math.floor(Math.random()*comments.length)]}\` : line).join('\\n');
      } else {
        // Standard Chaos
        code = code.replace(/const /g, () => Math.random() > 0.8 ? "let " : "const ");
        if (Math.random() > 0.5) code = "// TODO: Refactor\\n" + code;
        return code;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('sentient-input'), output = document.getElementById('sentient-output');
    const btnText = document.getElementById('btn-mode-text'), btnCode = document.getElementById('btn-mode-code');
    const optionsContainer = document.getElementById('options-container');
    let mode = 'text';

    const renderOptions = (m) => {
      if (m === 'text') {
        optionsContainer.innerHTML = \`<select id="tone-select" class="mode-select animate-in delay-2"><option value="casual">Casual Tone</option><option value="professional">Professional Tone</option><option value="story">Storytelling</option></select>\`;
      } else {
        optionsContainer.innerHTML = \`<select id="style-select" class="mode-select animate-in delay-2"><option value="standard">Standard Refactor</option><option value="debug">Debug Mode (Logs)</option><option value="commented">Heavily Commented</option></select>\`;
      }
    };

    const setMode = (m) => { 
      mode = m; 
      renderOptions(m);
      if(m==='text'){ 
        btnText.classList.add('active'); btnCode.classList.remove('active'); 
        input.placeholder='Paste AI Text here...'; 
      } else { 
        btnCode.classList.add('active'); btnText.classList.remove('active'); 
        input.placeholder='Paste AI Code here...'; 
      } 
    };

    btnText.onclick = () => setMode('text'); 
    btnCode.onclick = () => setMode('code');
    setMode('text'); // Init

    document.getElementById('btn-convert').onclick = () => { 
      if(!input.value) return; 
      output.value = "Thinking..."; 
      const option = mode === 'text' ? document.getElementById('tone-select').value : document.getElementById('style-select').value;
      setTimeout(() => output.value = sentient[mode](input.value, option), 600); 
    };
    
    document.getElementById('btn-copy').onclick = function() { 
      navigator.clipboard.writeText(output.value); 
      const originalText = this.innerText;
      this.innerText="Copied!"; 
      setTimeout(()=>this.innerText=originalText, 2000); 
    };
  });
</script>
`;

const styles = `
@font-face { font-family: 'Inter'; src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2') format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; src: url('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn54W4E.woff2') format('woff2'); }

:root {
  --font-sans: 'Inter', system-ui, sans-serif; --font-mono: 'JetBrains Mono', monospace;
  --color-bg: #0f172a; --color-fg: #f8fafc; --color-accent: #6366f1; --color-accent-2: #0ea5e9; --color-card: #1e293b; --color-border: rgba(148, 163, 184, 0.15);
  --gradient: linear-gradient(135deg, #6366f1, #0ea5e9);
  --gradient-text: linear-gradient(135deg, #818cf8, #38bdf8);
}
body { font-family: var(--font-sans); margin: 0; background: var(--color-bg); color: var(--color-fg); display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; }
.container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; position: relative; z-index: 1; }
.container::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100vw; height: 100vh; background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 60%); z-index: -1; pointer-events: none; animation: pulseGlow 8s ease-in-out infinite alternate; }

@keyframes pulseGlow { 0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

.header { position: absolute; top: 0; width: 100%; padding: 2rem; text-align: center; display: flex; justify-content: center; align-items: center; gap: 1rem; z-index: 10; }
.logo-light, .logo-dark { height: 40px; filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.6)); animation: float 6s ease-in-out infinite; }
.logo-light { display: none; } .logo-dark { display: none; }
@media (prefers-color-scheme: light) { :root { --color-bg: #f8fafc; --color-fg: #0f172a; --color-card: #ffffff; --color-border: rgba(15, 23, 42, 0.1); } .logo-light { display: block; } } 
@media (prefers-color-scheme: dark) { .logo-dark { display: block; } }

.sentient-section { width: 100%; max-width: 1000px; padding: 3.5rem; background: rgba(30, 41, 59, 0.7); border: 1px solid var(--color-border); border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center; position: relative; overflow: hidden; backdrop-filter: blur(20px); animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.sentient-section::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: var(--gradient); }

.sentient-title { font-size: 5rem; font-weight: 800; background: var(--gradient-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 1.5rem 0; letter-spacing: -2px; line-height: 1.1; animation: fadeInUp 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.sentient-desc { margin-bottom: 3rem; opacity: 0.8; font-size: 1.35rem; font-weight: 500; animation: fadeInUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

.controls-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 16px; border: 1px solid var(--color-border); animation: fadeInUp 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.mode-toggles { display: flex; gap: 0.5rem; }
.mode-btn { padding: 10px 24px; border-radius: 12px; border: none; background: transparent; color: var(--color-fg); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 600; font-size: 1.05rem; opacity: 0.7; }
.mode-btn:hover { opacity: 1; transform: translateY(-1px); }
.mode-btn.active { background: var(--color-bg); opacity: 1; box-shadow: 0 4px 12px rgba(0,0,0,0.1); color: var(--color-accent); }
.mode-select { padding: 10px 20px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-fg); font-family: var(--font-sans); cursor: pointer; outline: none; font-size: 1rem; transition: border-color 0.2s; }
.mode-select:focus { border-color: var(--color-accent); }

.work-area { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: left; animation: fadeInUp 0.8s 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.io-box { display: flex; flex-direction: column; height: 100%; }
.io-label { margin-bottom: 1rem; font-weight: 700; font-size: 1rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 1.5px; }
.text-input { flex: 1; min-height: 450px; padding: 1.75rem; border-radius: 20px; border: 1px solid var(--color-border); background: rgba(15, 23, 42, 0.6); color: var(--color-fg); font-family: var(--font-mono); resize: none; line-height: 1.7; font-size: 1.1rem; transition: all 0.3s ease; }
.text-input:focus { border-color: var(--color-accent); outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15); background: rgba(15, 23, 42, 0.8); transform: translateY(-2px); }

.actions { display: flex; justify-content: center; gap: 1.5rem; margin-top: 3rem; animation: fadeInUp 0.8s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.action-btn { padding: 18px 56px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 1.2rem; letter-spacing: -0.01em; }
.btn-primary { background: var(--gradient); color: white; box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.5); } 
.btn-primary:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 20px 40px -5px rgba(99, 102, 241, 0.6); }
.btn-primary:active { transform: translateY(-1px) scale(0.98); }
.btn-secondary { background: transparent; color: var(--color-fg); border: 2px solid var(--color-border); font-weight: 600; }
.btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: var(--color-accent-2); transform: translateY(-2px); }

@media (max-width: 768px) { .work-area { grid-template-columns: 1fr; } .container { padding: 1rem; } .sentient-section { padding: 2rem; } .controls-row { flex-direction: column; gap: 1rem; } .sentient-title { font-size: 3rem; } .text-input { min-height: 300px; } }
`;

const getTemplate = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ai Humarizer</title>
  <style>${styles}</style>
</head>
<body>

  <main class="container">
    <section class="sentient-section">
      <h2 class="sentient-title">Ai Humarizer</h2>
      <p class="sentient-desc">Breathing life into artificial intelligence.</p>
      
      <div class="controls-row">
        <div class="mode-toggles">
          <button class="mode-btn active" id="btn-mode-text">Text Mode</button>
          <button class="mode-btn" id="btn-mode-code">Code Mode</button>
        </div>
        <div id="options-container">
          <!-- Options injected via JS -->
        </div>
      </div>

      <div class="work-area">
        <div class="io-box">
          <label class="io-label">Artificial Input</label>
          <textarea class="text-input" id="sentient-input" placeholder="Paste AI text here..."></textarea>
        </div>
        <div class="io-box">
          <label class="io-label">Human Output</label>
          <textarea class="text-input" id="sentient-output" readonly placeholder="Enhanced result will appear here..."></textarea>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn btn-primary" id="btn-convert">✨ Humanize</button>
        <button class="action-btn btn-secondary" id="btn-copy">Copy Result</button>
      </div>
    </section>
  </main>
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

    try { await Bun.write("dist/favicon.svg", await Bun.file(join(assetsDir, "images", "favicon-light.svg")).text()); } catch { }

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
    if (filename && !filename.startsWith("dist") && !filename.startsWith("node_modules")) {
      console.log(`Change: ${filename}`);
      await build();
    }
  });
}

await build();

if (isDevMode) {
  await startDevServer();
}
