import { marked } from "marked";
import { createHighlighter } from "shiki";
import { watch } from "fs";
import { join } from "path";
import { generateJsonSchemas } from "./schemas";

const isDevMode = process.argv.includes("--dev");

console.log("Ai Humarizer Engine initializing...");
const highlighter = await createHighlighter({ themes: ["github-light", "github-dark"], langs: ["typescript", "javascript"] });

const getScripts = () => `
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></` + `script>
<script>
  const sentient = {
    text: (text, tone, intensity) => {
      const lvl = intensity || 0.5;
      // Phase 1: Strip AI-telltale phrases (more patterns)
      const aiPhrases = [
        "In conclusion,","Furthermore,","Moreover,","It is important to note that","As an AI language model,",
        "Certainly,","However,","Additionally,","Consequently,","Nevertheless,","Notwithstanding,",
        "In summary,","To summarize,","It should be noted that","It is worth mentioning that",
        "As previously mentioned,","In light of the above,","It's worth noting that",
        "Delving into","It's important to understand that","This is a testament to",
        "In the realm of","At the end of the day,","When it comes to","In terms of",
        "It goes without saying that","Needless to say,","Without a doubt,","By and large,",
        "For all intents and purposes,","As a matter of fact,","To put it simply,",
        "In essence,","All things considered,","Taking into account","With that being said,",
        "On the other hand,","That said,","Having said that,","Be that as it may,"
      ];
      aiPhrases.forEach(p => text = text.replace(new RegExp(p.replace(/[.*+?^\${}()|[\\\\]\\\\]/g,'\\\\\\\\\\$&')+'\\\\s*','gi'),''));

      // Phase 2: Expanded word swaps (80+)
      const swaps = {
        "utilize":"use","implement":"set up","facilitate":"help","demonstrate":"show",
        "subsequently":"then","optimum":"best","verify":"check","ensure":"make sure",
        "commence":"start","terminate":"end","endeavor":"try","assist":"help",
        "paradigm":"model","leverage":"use","synergy":"teamwork","disseminate":"share",
        "methodology":"method","functionality":"feature","optimization":"improvement",
        "parameters":"settings","configuration":"setup","initialization":"startup",
        "comprehensive":"complete","predominantly":"mostly","approximately":"about",
        "significantly":"a lot","consequently":"so","nevertheless":"still",
        "aforementioned":"previous","allocate":"set aside","ameliorate":"improve",
        "ascertain":"find out","benchmark":"standard","bifurcate":"split",
        "cognizant":"aware","concatenate":"join","constituents":"parts",
        "delineate":"outline","dichotomy":"split","elucidate":"explain",
        "enumerate":"list","expedite":"speed up","extrapolate":"estimate",
        "formulate":"create","heuristic":"rule of thumb","hypothesize":"guess",
        "incentivize":"motivate","juxtapose":"compare","mitigate":"reduce",
        "necessitate":"need","nomenclature":"naming","obfuscate":"confuse",
        "perpetuate":"continue","predicated":"based","proliferate":"spread",
        "promulgate":"announce","quintessential":"classic","ramification":"effect",
        "recapitulate":"recap","remuneration":"pay","scrutinize":"examine",
        "stipulate":"require","substantiate":"prove","superfluous":"extra",
        "ubiquitous":"common","unilateral":"one-sided","viable":"workable",
        "aggregate":"total","analogous":"similar","arbitrary":"random",
        "augment":"boost","conducive":"helpful","contingent":"dependent",
        "correlate":"connect","detriment":"harm","disparate":"different",
        "efficacy":"effectiveness","empirical":"tested","exacerbate":"worsen",
        "holistic":"overall","inherent":"built-in","multifaceted":"complex",
        "nuanced":"subtle","paramount":"key","pertinent":"relevant",
        "propagate":"spread","resilient":"tough","salient":"important",
        "tangible":"real","transparent":"clear","warranted":"justified"
      };
      Object.keys(swaps).forEach(k => {
        if (Math.random() < lvl) text = text.replace(new RegExp('\\\\\\\\b'+k+'\\\\\\\\b','gi'), swaps[k]);
      });

      // Phase 3: Sentence variation
      const sentences = text.split(/(?<=\\\\.)\\\\s+/);
      text = sentences.map((s,i) => {
        if (s.length > 160 && Math.random() < lvl) {
          const mid = s.indexOf(', ',40);
          if (mid > 0) s = s.slice(0,mid)+'. '+s.charAt(mid+2).toUpperCase()+s.slice(mid+3);
        }
        return s;
      }).join(' ');

      if (tone === 'casual') {
        text = text.replace(/\\\\b(cannot|do not|will not|is not|are not|would not|should not|could not|has not|have not|did not)\\\\b/gi, (m) => ({"cannot":"can't","do not":"don't","will not":"won't","is not":"isn't","are not":"aren't","would not":"wouldn't","should not":"shouldn't","could not":"couldn't","has not":"hasn't","have not":"haven't","did not":"didn't"}[m.toLowerCase()]||m));
        const starters = ["Basically, ","So, ","Honestly, ","Look, ","Here's the deal: ","Real talk, ","Okay so, ","Alright, ","Thing is, ","Not gonna lie, "];
        if (Math.random() < lvl*1.3) text = starters[Math.floor(Math.random()*starters.length)] + text.charAt(0).toLowerCase() + text.slice(1);
        const connectors = [" And "," Plus "," Also "];
        text = text.replace(/\\\\. ([A-Z])/g, (m,c) => Math.random() > (1-lvl*0.8) ? "."+connectors[Math.floor(Math.random()*connectors.length)]+c.toLowerCase() : m);
        if (lvl > 0.6) {
          const fillers = [" honestly","  — you know?"," tbh"," basically"," right?"];
          const sArr = text.split('. ');
          text = sArr.map((s,i) => i > 0 && Math.random() > 0.7 ? s + fillers[Math.floor(Math.random()*fillers.length)] : s).join('. ');
        }
      } else if (tone === 'professional') {
        const proSwaps = {"very":"quite","big":"substantial","small":"modest","good":"strong","bad":"suboptimal","thing":"element","stuff":"material","got":"obtained","a lot of":"considerable"};
        Object.keys(proSwaps).forEach(k => { if(Math.random()<lvl) text = text.replace(new RegExp('\\\\\\\\b'+k+'\\\\\\\\b','gi'), proSwaps[k]); });
      } else if (tone === 'story') {
        const openers = ["Picture this — ","Imagine this: ","So here's what happened — ","Let me set the scene — ","Here's the thing — "];
        text = openers[Math.floor(Math.random()*openers.length)] + text.charAt(0).toLowerCase() + text.slice(1);
        const transitions = [". Then ",". After that, ",". Next thing you know, ",". And — get this — "];
        text = text.replace(/\\\\. ([A-Z])/g, (m,c) => Math.random() < lvl*0.7 ? transitions[Math.floor(Math.random()*transitions.length)]+c.toLowerCase() : m);
      } else if (tone === 'academic') {
        const acSwaps = {"show":"illustrate","think":"posit","use":"employ","help":"facilitate","start":"initiate","part":"component","check":"evaluate"};
        Object.keys(acSwaps).forEach(k => { if(Math.random()<lvl) text = text.replace(new RegExp('\\\\\\\\b'+k+'\\\\\\\\b','gi'), acSwaps[k]); });
        if (Math.random() < lvl) text = text.replace(/\\\\. ([A-Z])/g, (m,c) => Math.random()>0.6 ? ". As such, "+c.toLowerCase() : m);
      }
      return text.trim();
    },
    code: (code, style, intensity) => {
      const lvl = intensity || 0.5;
      if (style === 'debug') {
        const logs = ['console.log("DEBUG:",{data})','console.trace("stack")','console.time("perf")','debugger;','console.warn("check this")','console.log(">>> here <<<")','console.table({data})'];
        return code.replace(/{/g, m => Math.random() < lvl ? \`{\\\\n  \${logs[Math.floor(Math.random()*logs.length)]};\` : m);
      } else if (style === 'commented') {
        const comments = ["// TODO: needs review","// FIXME: edge case","// NOTE: temp solution","// HACK: works for now","// OPTIMIZE: refactor later","// XXX: revisit this","// ?: why does this work","// CHANGED: was different before"];
        return code.split('\\\\n').map(line => Math.random() < lvl*0.75 && line.trim().length > 3 ? \`\${line}  \${comments[Math.floor(Math.random()*comments.length)]}\` : line).join('\\\\n');
      } else if (style === 'minified') {
        return code.replace(/\\\\/\\\\/.*$/gm,'').replace(/\\\\/\\\\*[\\\\s\\\\S]*?\\\\*\\\\//g,'').split('\\\\n').map(l=>l.trim()).filter(l=>l.length>0).join(lvl>0.7?'':' ');
      } else {
        code = code.replace(/const /g, () => Math.random() < lvl*0.5 ? "let " : "const ");
        const names = {"result":"res","index":"idx","element":"el","value":"val","temporary":"tmp","error":"err","response":"resp","callback":"cb","function":"fn","parameter":"param"};
        if (lvl > 0.4) Object.keys(names).forEach(k => { if(Math.random()<lvl*0.4) code = code.replace(new RegExp('\\\\\\\\b'+k+'\\\\\\\\b','g'), names[k]); });
        if (Math.random() < lvl) code = "// TODO: clean this up\\\\n" + code;
        return code;
      }
    }
  };

  const history = { items: JSON.parse(localStorage.getItem('sentient_history')||'[]'), save(entry) { this.items.unshift(entry); if(this.items.length>20)this.items.pop(); localStorage.setItem('sentient_history',JSON.stringify(this.items)); }, clear() { this.items=[]; localStorage.removeItem('sentient_history'); } };

  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.particles = []; this.mouse = {x:0,y:0};
      this.resize(); window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', e => { this.mouse.x=e.clientX; this.mouse.y=e.clientY; });
      for (let i = 0; i < 60; i++) this.particles.push(this.create());
      this.animate();
    }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }
    create() { return { x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, size: Math.random()*2+0.5, opacity: Math.random()*0.4+0.1 }; }
    animate() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.particles.forEach(p => {
        const dx = this.mouse.x-p.x, dy = this.mouse.y-p.y, md = Math.sqrt(dx*dx+dy*dy);
        if (md < 180) { p.vx += dx*0.00008; p.vy += dy*0.00008; }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.999; p.vy *= 0.999;
        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        this.ctx.fillStyle = 'rgba(99,102,241,'+p.opacity+')'; this.ctx.fill();
      });
      for (let i=0; i<this.particles.length; i++) for (let j=i+1; j<this.particles.length; j++) {
        const dx = this.particles[i].x-this.particles[j].x, dy = this.particles[i].y-this.particles[j].y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 140) { this.ctx.beginPath(); this.ctx.moveTo(this.particles[i].x,this.particles[i].y); this.ctx.lineTo(this.particles[j].x,this.particles[j].y); this.ctx.strokeStyle='rgba(99,102,241,'+(0.06*(1-dist/140))+')'; this.ctx.lineWidth=0.5; this.ctx.stroke(); }
      }
      requestAnimationFrame(() => this.animate());
    }
  }

  const updateStats = (inp,out) => {
    const wc = s => s.trim() ? s.trim().split(/\\\\s+/).length : 0;
    const cc = s => s.length;
    document.getElementById('stats-in').textContent = wc(inp)+' words / '+cc(inp)+' chars';
    document.getElementById('stats-out').textContent = out ? wc(out)+' words / '+cc(out)+' chars' : '—';
  };

  const renderHistory = () => {
    const panel = document.getElementById('history-list');
    if (!panel) return;
    if (history.items.length === 0) { panel.innerHTML = '<div class="history-empty">No conversions yet</div>'; return; }
    panel.innerHTML = history.items.map((h,i) => '<div class="history-item" data-idx="'+i+'"><div class="history-meta"><span class="history-mode">'+h.mode+'</span><span class="history-option">'+h.option+'</span><span class="history-time">'+new Date(h.time).toLocaleTimeString()+'</span></div><div class="history-preview">'+h.input.slice(0,80)+(h.input.length>80?'...':'')+'</div></div>').join('');
    panel.querySelectorAll('.history-item').forEach(el => el.onclick = () => {
      const h = history.items[parseInt(el.dataset.idx)];
      document.getElementById('engine-input').value = h.input;
      document.getElementById('engine-output').value = h.output;
      updateStats(h.input, h.output);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    new ParticleSystem(document.getElementById('particles'));
    const input = document.getElementById('engine-input'), output = document.getElementById('engine-output');
    const btnText = document.getElementById('btn-mode-text'), btnCode = document.getElementById('btn-mode-code');
    const optionsContainer = document.getElementById('options-container');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityVal = document.getElementById('intensity-val');
    let mode = 'text';

    intensitySlider.oninput = () => { intensityVal.textContent = Math.round(intensitySlider.value*100)+'%'; };

    input.oninput = () => updateStats(input.value, output.value);

    const renderOptions = (m) => {
      if (m === 'text') {
        optionsContainer.innerHTML = '<select id="tone-select" class="option-select"><option value="casual">Casual</option><option value="professional">Professional</option><option value="story">Storytelling</option><option value="academic">Academic</option></select>';
      } else {
        optionsContainer.innerHTML = '<select id="style-select" class="option-select"><option value="standard">Standard</option><option value="debug">Debug</option><option value="commented">Commented</option><option value="minified">Minified</option></select>';
      }
    };
    const setMode = (m) => { mode = m; renderOptions(m); btnText.classList.toggle('active', m==='text'); btnCode.classList.toggle('active', m==='code'); input.placeholder = m==='text' ? 'Paste AI-generated text here...' : 'Paste AI-generated code here...'; };
    btnText.onclick = () => setMode('text'); btnCode.onclick = () => setMode('code'); setMode('text');

    const doConvert = () => {
      if(!input.value) return;
      const btn = document.getElementById('btn-convert');
      const scanLine = document.getElementById('scan-line');
      btn.classList.add('processing'); btn.innerHTML = '<span class="btn-loader"></span> Processing...';
      statusDot.className = 'status-dot processing'; statusText.textContent = 'Processing';
      scanLine.classList.add('active'); output.value = "";
      const option = mode === 'text' ? document.getElementById('tone-select').value : document.getElementById('style-select').value;
      const intensity = parseFloat(intensitySlider.value);
      setTimeout(() => {
        const result = sentient[mode](input.value, option, intensity);
        history.save({mode,option,intensity,input:input.value,output:result,time:Date.now()});
        renderHistory();
        let i = 0;
        const tw = () => { if (i < result.length) { output.value += result.charAt(i); i++; updateStats(input.value,output.value); setTimeout(tw, Math.random()*6+1); } else { btn.classList.remove('processing'); btn.innerHTML = '<i data-lucide="zap" class="icon-sm"></i> Humanize'; lucide.createIcons(); statusDot.className='status-dot online'; statusText.textContent='Complete'; scanLine.classList.remove('active'); updateStats(input.value,output.value); setTimeout(()=>{statusText.textContent='Ready';},2000); } };
        tw();
      }, 800);
    };
    document.getElementById('btn-convert').onclick = doConvert;

    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doConvert(); }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); document.getElementById('btn-copy').click(); }
    });

    document.getElementById('btn-copy').onclick = function() { if(!output.value) return; navigator.clipboard.writeText(output.value); this.innerHTML='<i data-lucide="check" class="icon-sm"></i> Copied!'; lucide.createIcons(); setTimeout(()=>{this.innerHTML='<i data-lucide="clipboard" class="icon-sm"></i> Copy'; lucide.createIcons();},2000); };
    document.getElementById('btn-clear').onclick = function() { input.value=''; output.value=''; statusText.textContent='Ready'; updateStats('',''); };
    document.getElementById('btn-history-toggle').onclick = function() { document.getElementById('history-panel').classList.toggle('open'); this.classList.toggle('active'); };
    document.getElementById('btn-history-clear').onclick = function() { history.clear(); renderHistory(); };

    renderHistory();
    updateStats('','');
  });
</` + `script>
`;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-primary: #030712; --bg-secondary: #0a0f1e; --bg-card: rgba(15, 23, 42, 0.55);
  --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
  --accent: #6366f1; --accent-cyan: #06b6d4; --accent-emerald: #10b981;
  --border: rgba(99, 102, 241, 0.12); --border-hover: rgba(99, 102, 241, 0.25);
  --font-sans: 'Inter', system-ui, sans-serif; --font-mono: 'JetBrains Mono', monospace;
}
body { font-family: var(--font-sans); background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }
#particles { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.icon-sm { width: 16px; height: 16px; display: inline-block; vertical-align: middle; }

/* App Layout */
.app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2rem 2rem 1rem; }

/* Top Bar */
.top-bar { width: 100%; max-width: 1100px; display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; margin-bottom: 1.5rem; animation: slideDown 0.6s ease; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand-icon { width: 46px; height: 46px; border-radius: 14px; background: linear-gradient(135deg, var(--accent), var(--accent-cyan)); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(99, 102, 241, 0.35); animation: pulse-glow 3s ease-in-out infinite; color: white; }
.brand-icon svg { width: 24px; height: 24px; }
.brand-name { font-size: 1.6rem; font-weight: 800; background: linear-gradient(135deg, #c7d2fe, #818cf8, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
.brand-tag { font-size: 0.65rem; background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 3px 10px; border-radius: 20px; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.2); text-transform: uppercase; letter-spacing: 0.5px; }
.status-bar { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 20px; font-size: 0.8rem; color: var(--accent-emerald); font-weight: 500; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-emerald); animation: blink 2s ease-in-out infinite; flex-shrink: 0; }
.status-dot.processing { background: #f59e0b; animation: blink 0.4s ease-in-out infinite; }

/* Engine Card */
.engine-card { width: 100%; max-width: 1100px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; backdrop-filter: blur(24px); box-shadow: 0 0 40px rgba(99, 102, 241, 0.08), 0 25px 50px -12px rgba(0,0,0,0.4); animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1); position: relative; }
.engine-card::before { content: ''; position: absolute; inset: -1px; border-radius: 25px; padding: 1px; background: linear-gradient(160deg, rgba(99,102,241,0.4), transparent 35%, transparent 65%, rgba(6,182,212,0.3)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 2; }
.engine-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.5), transparent); z-index: 3; }

.card-header { padding: 2rem 2.5rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; animation: fadeInUp 0.8s 0.1s both; }
.card-title { font-size: 2rem; font-weight: 900; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; }
.card-title span { background: linear-gradient(135deg, var(--accent), var(--accent-cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.card-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px; font-weight: 400; }

/* Controls */
.controls { padding: 1rem 2.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 1rem; background: rgba(0,0,0,0.15); animation: fadeInUp 0.8s 0.2s both; }
.mode-tabs { display: flex; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 4px; border: 1px solid rgba(255,255,255,0.04); }
.mode-tab { padding: 10px 24px; border-radius: 10px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 600; font-size: 0.9rem; font-family: var(--font-sans); transition: all 0.25s ease; display: flex; align-items: center; gap: 8px; }
.mode-tab:hover { color: var(--text-primary); }
.mode-tab.active { background: var(--accent); color: white; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
.mode-tab svg { width: 16px; height: 16px; }
.option-select { padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border); background: rgba(0,0,0,0.35); color: var(--text-primary); font-family: var(--font-sans); font-size: 0.85rem; font-weight: 500; cursor: pointer; outline: none; transition: border-color 0.2s; -webkit-appearance: none; }
.option-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

/* Work Area */
.work-area { display: grid; grid-template-columns: 1fr 1fr; position: relative; }
.work-panel { padding: 1.75rem 2.5rem 2rem; }
.work-panel:first-child { border-right: 1px solid var(--border); }
.io-label { display: flex; align-items: center; gap: 10px; margin-bottom: 0.85rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); }
.io-label .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.io-label .dot.input { background: #ec4899; box-shadow: 0 0 10px rgba(236, 72, 153, 0.5); }
.io-label .dot.output { background: var(--accent-emerald); box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
.text-input { width: 100%; min-height: 360px; padding: 1.25rem; border-radius: 16px; border: 1px solid var(--border); background: rgba(0,0,0,0.2); color: var(--text-primary); font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.75; resize: none; outline: none; transition: all 0.3s ease; }
.text-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.08), inset 0 0 40px rgba(99,102,241,0.02); }
.text-input::placeholder { color: var(--text-muted); font-style: italic; }

/* Scan Line */
.scan-line { position: absolute; top: 0; left: 50%; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent); opacity: 0; pointer-events: none; z-index: 5; }
.scan-line.active { opacity: 1; animation: scan 1.5s linear infinite; }

/* Actions */
.actions-bar { padding: 1.25rem 2.5rem; border-top: 1px solid var(--border); display: flex; justify-content: center; gap: 0.75rem; background: rgba(0,0,0,0.1); animation: fadeInUp 0.8s 0.4s both; }
.action-btn { padding: 12px 32px; border-radius: 12px; border: none; font-weight: 600; font-size: 0.95rem; font-family: var(--font-sans); cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; align-items: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, var(--accent), #4f46e5); color: white; box-shadow: 0 6px 20px -4px rgba(99,102,241,0.5); }
.btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 30px -4px rgba(99,102,241,0.55); }
.btn-primary:active { transform: translateY(0) scale(0.97); }
.btn-primary.processing { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 6px 20px -4px rgba(245,158,11,0.4); pointer-events: none; }
.btn-secondary { background: rgba(255,255,255,0.03); color: var(--text-secondary); border: 1px solid var(--border); }
.btn-secondary:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); border-color: var(--border-hover); transform: translateY(-2px); }
.btn-loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

/* Footer */
.footer { margin-top: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.75rem; animation: fadeInUp 0.8s 0.6s both; display: flex; align-items: center; justify-content: center; gap: 6px; }
.footer a { color: #818cf8; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.footer a:hover { color: var(--accent-cyan); }
.footer .shortcuts { margin-left: 12px; font-size: 0.65rem; color: var(--text-muted); opacity: 0.7; }
.footer kbd { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); font-family: var(--font-mono); font-size: 0.6rem; }

/* Intensity Slider */
.intensity-group { display: flex; align-items: center; gap: 10px; }
.intensity-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
.intensity-slider { -webkit-appearance: none; appearance: none; width: 100px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); outline: none; cursor: pointer; }
.intensity-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-cyan)); cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.4); transition: transform 0.2s; }
.intensity-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.intensity-val { font-size: 0.8rem; font-weight: 700; color: var(--accent); min-width: 36px; text-align: center; font-family: var(--font-mono); }

/* Stats Bar */
.stats-bar { padding: 0.6rem 2.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); background: rgba(0,0,0,0.08); }
.stats-item { display: flex; align-items: center; gap: 6px; }
.stats-item .dot { width: 5px; height: 5px; border-radius: 50%; }
.stats-item .dot.pink { background: #ec4899; }
.stats-item .dot.green { background: var(--accent-emerald); }

/* History Panel */
.history-panel { position: fixed; top: 0; right: -380px; width: 360px; height: 100vh; background: rgba(10, 15, 30, 0.95); backdrop-filter: blur(20px); border-left: 1px solid var(--border); z-index: 100; transition: right 0.4s cubic-bezier(0.16,1,0.3,1); display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.5); }
.history-panel.open { right: 0; }
.history-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.history-header h3 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.history-clear-btn { font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.08); color: #f87171; cursor: pointer; font-family: var(--font-sans); font-weight: 500; transition: all 0.2s; }
.history-clear-btn:hover { background: rgba(239,68,68,0.15); }
.history-list { flex: 1; overflow-y: auto; padding: 0.75rem; }
.history-item { padding: 0.85rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(0,0,0,0.15); margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s; }
.history-item:hover { background: rgba(99,102,241,0.06); border-color: var(--border-hover); transform: translateX(-3px); }
.history-meta { display: flex; gap: 6px; margin-bottom: 4px; align-items: center; flex-wrap: wrap; }
.history-mode { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 2px 8px; border-radius: 4px; background: rgba(99,102,241,0.15); color: #818cf8; }
.history-option { font-size: 0.6rem; padding: 2px 8px; border-radius: 4px; background: rgba(6,182,212,0.1); color: var(--accent-cyan); }
.history-time { font-size: 0.6rem; color: var(--text-muted); margin-left: auto; font-family: var(--font-mono); }
.history-preview { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-empty { text-align: center; color: var(--text-muted); padding: 3rem 1rem; font-size: 0.85rem; }

/* Animations */
@keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 4px 24px rgba(99,102,241,0.35); } 50% { box-shadow: 0 4px 36px rgba(99,102,241,0.6), 0 0 60px rgba(99,102,241,0.15); } }
@keyframes scan { 0% { top:0; } 100% { top:100%; } }
@keyframes spin { to { transform:rotate(360deg); } }

/* Responsive */
@media (max-width: 768px) {
  .app { padding: 1rem; } .work-area { grid-template-columns: 1fr; }
  .work-panel:first-child { border-right: none; border-bottom: 1px solid var(--border); }
  .controls { flex-direction: column; } .top-bar { flex-direction: column; gap: 1rem; }
  .card-header { flex-direction: column; align-items: flex-start; } .card-title { font-size: 1.5rem; }
  .text-input { min-height: 220px; } .actions-bar { flex-wrap: wrap; }
  .intensity-group { width: 100%; justify-content: center; }
  .stats-bar { flex-direction: column; gap: 4px; text-align: center; }
  .history-panel { width: 100%; right: -100%; }
  .footer .shortcuts { display: none; }
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
        <div class="brand-icon"><i data-lucide="brain" style="width:24px;height:24px;color:white;"></i></div>
        <div>
          <div class="brand-name">Ai Humarizer</div>
        </div>
        <span class="brand-tag">v3.0</span>
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
          <button class="mode-tab active" id="btn-mode-text"><i data-lucide="file-text"></i> Text</button>
          <button class="mode-tab" id="btn-mode-code"><i data-lucide="code-2"></i> Code</button>
        </div>
        <div id="options-container"></div>
        <div class="intensity-group">
          <span class="intensity-label">Intensity</span>
          <input type="range" min="0.1" max="1" step="0.05" value="0.5" class="intensity-slider" id="intensity-slider">
          <span class="intensity-val" id="intensity-val">50%</span>
        </div>
      </div>

      <div class="work-area">
        <div class="work-panel">
          <label class="io-label"><span class="dot input"></span> Input Signal</label>
          <textarea class="text-input" id="engine-input" placeholder="Paste AI-generated text here..." spellcheck="false"></textarea>
        </div>
        <div class="work-panel" style="position:relative;">
          <div class="scan-line" id="scan-line"></div>
          <label class="io-label"><span class="dot output"></span> Human Output</label>
          <textarea class="text-input" id="engine-output" readonly placeholder="Humanized result appears here..." spellcheck="false"></textarea>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stats-item"><span class="dot pink"></span> Input: <span id="stats-in">0 words / 0 chars</span></div>
        <div class="stats-item"><span class="dot green"></span> Output: <span id="stats-out">—</span></div>
      </div>

      <div class="actions-bar">
        <button class="action-btn btn-primary" id="btn-convert"><i data-lucide="zap" class="icon-sm"></i> Humanize</button>
        <button class="action-btn btn-secondary" id="btn-copy"><i data-lucide="clipboard" class="icon-sm"></i> Copy</button>
        <button class="action-btn btn-secondary" id="btn-clear"><i data-lucide="trash-2" class="icon-sm"></i> Clear</button>
        <button class="action-btn btn-secondary" id="btn-history-toggle"><i data-lucide="clock" class="icon-sm"></i> History</button>
      </div>
    </main>

    <div class="history-panel" id="history-panel">
      <div class="history-header">
        <h3><i data-lucide="clock" class="icon-sm"></i> Conversion History</h3>
        <button class="history-clear-btn" id="btn-history-clear">Clear All</button>
      </div>
      <div class="history-list" id="history-list"></div>
    </div>

    <footer class="footer">
      Built by <a href="https://github.com/Manju1303" target="_blank">Manju1303</a>
      <span class="shortcuts"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Humanize &nbsp; <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> Copy</span>
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
      await Bun.write(distAssetsDir + "/logo/.gitkeep", "");
      for (const logo of ["humanizer-logo-light.svg", "humanizer-logo-dark.svg"]) {
        try { const f = await Bun.file(join(assetsDir, "logo", logo)).text(); await Bun.write(join(distAssetsDir, "logo", logo), f); } catch { }
      }
    } catch { }
    try {
      await Bun.write(distAssetsDir + "/fonts/.gitkeep", "");
      for (const font of ["CursorGothic-Regular.woff2", "CursorGothic-Bold.woff2", "BerkeleyMono-Regular.woff2"]) {
        try { const f = await Bun.file(join(assetsDir, "fonts", font)).arrayBuffer(); await Bun.write(join(distAssetsDir, "fonts", font), f); } catch { }
      }
    } catch { }

    console.log("Build complete!");
  } catch (error: any) {
    console.error("BUILD ERROR:", error);
    process.exit(1);
  }
}

async function startDevServer() {
  try {
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
    console.log("Dev server running at http://localhost:" + server.port);
    watch(".", { recursive: true }, async (event, filename) => {
      if (filename && !filename.startsWith("dist") && !filename.startsWith("node_modules") && !filename.startsWith(".git")) {
        console.log("Change: " + filename);
        await build();
      }
    });
  } catch (e: any) {
    if (e.message && e.message.includes("address already in use")) {
      console.log("Port 3000 in use, trying 3001...");
      const server = Bun.serve({
        port: 3001,
        async fetch(req) {
          const url = new URL(req.url);
          let path = url.pathname;
          if (path === "/") path = "/index.html";
          const filePath = join("dist", path);
          try { return new Response(Bun.file(filePath)); } catch { return new Response("Not Found", { status: 404 }); }
        },
      });
      console.log("Dev server running at http://localhost:" + server.port);
      watch(".", { recursive: true }, async (event, filename) => {
        if (filename && !filename.startsWith("dist") && !filename.startsWith("node_modules") && !filename.startsWith(".git")) {
          console.log("Change: " + filename);
          await build();
        }
      });
    } else { throw e; }
  }
}

await build();
if (isDevMode) { await startDevServer(); }
