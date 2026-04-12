/* ============================================================
   KEY SYSTEM — script.js
   ============================================================ */

// ── ESTADO GLOBAL ──────────────────────────────────────────
const urlParams  = new URLSearchParams(window.location.search);
const userId     = urlParams.get('id');

const state = {
  resolvidos: { 1: false, 2: false, 3: false },
  p1Resposta:  null,
  // Puzzle 2 — cores
  sequenciaCorreta: [],
  sequenciaUsuario:  [],
  coresConfig: [
    { id: 'vermelho', emoji: '🔴', bg: '#cc2244' },
    { id: 'azul',     emoji: '🔵', bg: '#2244cc' },
    { id: 'verde',    emoji: '🟢', bg: '#22aa55' },
    { id: 'amarelo',  emoji: '🟡', bg: '#ccaa00' },
    { id: 'roxo',     emoji: '🟣', bg: '#7722cc' },
  ],
};

// ── UTILS ──────────────────────────────────────────────────
function toast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

function setInputState(id, s) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('error', 'ok');
  if (s) el.classList.add(s);
}

function atualizarProgresso() {
  const total = Object.values(state.resolvidos).filter(Boolean).length;
  document.getElementById('progressText').textContent = `${total} / 3`;
  document.getElementById('progressFill').style.width  = `${(total / 3) * 100}%`;
}

function marcarResolvido(num) {
  state.resolvidos[num] = true;
  const card = document.getElementById(`card${num}`);
  card.classList.add('solved');
  atualizarProgresso();

  // Desbloqueia próximo
  const proximo = document.getElementById(`card${num + 1}`);
  if (proximo) {
    setTimeout(() => proximo.classList.remove('locked'), 400);
  }
}

// ── PUZZLE 1: MATEMÁTICA ───────────────────────────────────
function initPuzzle1() {
  const hoje = new Date();
  const dia  = hoje.getDate();
  const mes  = hoje.getMonth() + 1;

  // Rotaciona operação baseado no dia
  const ops = [
    { texto: `${dia} × ${mes}`,           resp: dia * mes              },
    { texto: `${dia + mes} + ${dia}`,     resp: (dia + mes) + dia      },
    { texto: `${dia * mes} - ${mes}`,     resp: (dia * mes) - mes      },
    { texto: `${dia} + ${mes * 2}`,       resp: dia + (mes * 2)        },
    { texto: `${dia * 3} ÷ ${mes || 1}`,  resp: Math.floor((dia * 3) / (mes || 1)) },
  ];

  const op = ops[dia % ops.length];
  document.getElementById('p1Question').textContent = op.texto;
  state.p1Resposta = op.resp;

  // Enter no input
  document.getElementById('p1Answer').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkPuzzle(1);
  });
}

// ── PUZZLE 2: SEQUÊNCIA DE CORES ───────────────────────────
function initPuzzle2() {
  const hoje = new Date();
  const dia  = hoje.getDate();
  const mes  = hoje.getMonth() + 1;
  const cores = state.coresConfig;

  // Gera sequência de 3 cores baseada na data (muda todo dia)
  const seed = dia * mes;
  const seq  = [
    cores[seed % cores.length],
    cores[(seed + dia) % cores.length],
    cores[(seed + mes) % cores.length],
  ];
  // Evita repetição adjacente
  if (seq[0].id === seq[1].id) seq[1] = cores[(seq[1] === cores[cores.length-1] ? 0 : cores.indexOf(seq[1]) + 1)];
  state.sequenciaCorreta = seq.map(c => c.id);

  // Hint: mostra 1ª cor
  document.getElementById('colorHint').innerHTML =
    `Começa com ${seq[0].emoji} <span style="color:var(--text-dim)">(${seq.length} cliques no total)</span>`;

  // Renderiza botões (embaralhados)
  const embaralhados = [...cores].sort(() => Math.random() - 0.5);
  const wrap = document.getElementById('colorButtons');
  wrap.innerHTML = '';
  embaralhados.forEach(cor => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.dataset.cor = cor.id;
    btn.style.background = cor.bg;
    btn.textContent = cor.emoji;
    btn.title = cor.id.charAt(0).toUpperCase() + cor.id.slice(1);
    btn.addEventListener('click', () => clicarCor(cor));
    wrap.appendChild(btn);
  });
}

function clicarCor(cor) {
  if (state.resolvidos[2]) return;
  if (state.sequenciaUsuario.length >= state.sequenciaCorreta.length) return;

  state.sequenciaUsuario.push(cor.id);

  const display = document.getElementById('seqDisplay');
  if (state.sequenciaUsuario.length === 1) display.innerHTML = '';

  const dot = document.createElement('div');
  dot.className = 'seq-dot';
  dot.style.background = state.coresConfig.find(c => c.id === cor.id).bg;
  dot.title = cor.id;
  display.appendChild(dot);
}

function resetColors() {
  state.sequenciaUsuario = [];
  const display = document.getElementById('seqDisplay');
  display.innerHTML = '<span style="color:var(--text-dim);font-size:12px">Sua sequência vai aparecer aqui...</span>';
}

// ── CHECK PUZZLES ──────────────────────────────────────────
function checkPuzzle(num) {
  if (state.resolvidos[num]) return;

  if (num === 1) {
    const val = parseInt(document.getElementById('p1Answer').value);
    if (isNaN(val)) { toast('⚠️ Digite um número!'); return; }

    if (val === state.p1Resposta) {
      setInputState('p1Answer', 'ok');
      marcarResolvido(1);
      toast('✅ Puzzle 1 resolvido!');
    } else {
      setInputState('p1Answer', 'error');
      toast('❌ Resposta errada. Tente de novo!');
    }
    return;
  }

  if (num === 2) {
    const usr = state.sequenciaUsuario;
    const cor = state.sequenciaCorreta;

    if (usr.length < cor.length) {
      toast(`⚠️ Selecione ${cor.length} cores! (${usr.length}/${cor.length})`);
      return;
    }

    const correto = cor.every((c, i) => c === usr[i]);
    if (correto) {
      marcarResolvido(2);
      toast('✅ Puzzle 2 resolvido!');
    } else {
      resetColors();
      toast('❌ Sequência errada! Tente novamente.');
    }
    return;
  }

  if (num === 3) {
    const val = document.getElementById('p3Answer').value.toLowerCase().trim();
    if (!val) { toast('⚠️ Digite a palavra!'); return; }

    if (val === 'sy' || val === 'sys' || val === 'syst' || val === 'syste') {
      toast('💡 Quase lá... a palavra completa!');
      setInputState('p3Answer', 'error');
      return;
    }

    if (val === 'system') {
      setInputState('p3Answer', 'ok');
      marcarResolvido(3);
      toast('✅ Puzzle 3 resolvido!');
      setTimeout(buscarEExibirKey, 600);
    } else {
      setInputState('p3Answer', 'error');
      toast('❌ Palavra incorreta. Dica: é inglês!');
    }
    return;
  }
}

// ── BUSCAR KEY DA API ──────────────────────────────────────
async function buscarEExibirKey() {
  if (!userId) return;

  const display = document.getElementById('keyDisplay');
  const meta    = document.getElementById('keyMeta');
  const area    = document.getElementById('keyArea');

  display.textContent = 'GERANDO...';
  area.style.display  = 'block';

  try {
    const res  = await fetch(`/api/generate-key?id=${userId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erro na API');

    display.textContent = data.key;
    meta.innerHTML = `
      Fórmula: <span style="color:var(--accent)">${data.formula}</span><br>
      Data: <span style="color:var(--accent)">${data.data}</span><br>
      Válida apenas hoje — renova à meia-noite
    `;

    enviarLogDiscord(userId, data.key);

  } catch (err) {
    display.textContent = 'ERRO AO GERAR KEY';
    meta.innerHTML = `<span style="color:var(--accent2)">${err.message}</span>`;
    console.error('[KEY-SYSTEM]', err);
  }
}

// ── COPIAR KEY ─────────────────────────────────────────────
function copyKey() {
  const key = document.getElementById('keyDisplay').textContent.trim();
  if (!key || key === 'GERANDO...' || key === 'ERRO AO GERAR KEY') return;

  navigator.clipboard.writeText(key)
    .then(() => toast('📋 KEY copiada!'))
    .catch(() => {
      // Fallback para mobile/executor sem clipboard API
      const ta = document.createElement('textarea');
      ta.value = key;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('📋 KEY copiada!');
    });
}

// ── LOG DISCORD (OPCIONAL) ─────────────────────────────────
async function enviarLogDiscord(uid, key) {
  const webhook = 'SEU_WEBHOOK_DISCORD_AQUI'; // substitua ou remova
  if (webhook.startsWith('SEU_')) return;

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Key System',
        embeds: [{
          title: '🔑 Nova KEY Gerada',
          color: 0x00d4ff,
          fields: [
            { name: 'User ID',  value: `\`${uid}\``,  inline: true },
            { name: 'KEY',      value: `\`${key}\``,  inline: false },
            { name: 'Horário',  value: new Date().toLocaleString('pt-BR'), inline: true },
          ]
        }]
      })
    });
  } catch (_) { /* webhook é opcional */ }
}

// ── INIT ───────────────────────────────────────────────────
window.addEventListener('load', () => {
  // Mostra info do usuário
  const infoEl = document.getElementById('userInfo');
  if (userId && !isNaN(userId)) {
    infoEl.innerHTML = `
      <div class="user-card">
        <span class="icon">👤</span>
        <div>
          <div class="uid-label">ROBLOX USER ID</div>
          <div class="uid-val">${userId}</div>
        </div>
      </div>
    `;
  } else {
    infoEl.innerHTML = `
      <div class="warn-card">
        ⚠️ Nenhum ID detectado na URL.<br>
        Execute o script no Roblox primeiro para obter o link correto.
      </div>
    `;
  }

  // Inicializa puzzles
  initPuzzle1();
  initPuzzle2();

  // Enter no puzzle 3
  document.getElementById('p3Answer').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkPuzzle(3);
  });
});
