const RSVP_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx1317B1SDtFFmswaSD9y_Oh-CHuyVoxeF2tzur2JtvCYV65jP_UHxxukXduK9w6hJ0OA/exec';
const WEDDING_DATE = new Date('2026-10-17T17:30:00');

/* ---------- Apertura del sobre ---------- */

const envelope = document.getElementById('envelope');
const flap = document.getElementById('envelopeFlap');
const card = document.getElementById('card');
const tapHint = document.getElementById('tapHint');
const envelopeSender = document.querySelector('.envelope-sender');
const scrollHint = document.getElementById('scrollHint');
const overlay = document.getElementById('envelopeOverlay');
const sectionTitle = document.querySelector('.section-title');

let opened = false;

function openEnvelope() {
  if (opened) return;
  opened = true;
  envelope.classList.add('opened');
  flap.classList.add('open');
  tapHint.classList.add('hidden');
  envelopeSender.classList.add('hidden');
  playMusic();
  document.body.classList.remove('no-scroll');

  setTimeout(() => card.classList.add('revealed'), 550);
  setTimeout(() => scrollHint.classList.remove('hidden'), 1700);
}

/* ---------- Música de fondo ---------- */

let ytPlayer = null;
let ytReady = false;
let musicRequested = false;

function initYouTubePlayer() {
  if (ytPlayer) return;
  ytPlayer = new YT.Player('ytPlayer', {
    videoId: 'ecb51btpfDo',
    playerVars: {
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      loop: 1,
      playlist: 'ecb51btpfDo',
      mute: 1,
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (musicRequested) startMusicPlayback();
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          ytPlayer.seekTo(0);
          ytPlayer.playVideo();
        }
      },
    },
  });
}

window.onYouTubeIframeAPIReady = initYouTubePlayer;

setTimeout(() => {
  if (!ytPlayer && window.YT && window.YT.Player) initYouTubePlayer();
}, 2000);

function startMusicPlayback() {
  ytPlayer.playVideo();
  ytPlayer.unMute();
  ytPlayer.setVolume(100);
}

function playMusic() {
  musicRequested = true;
  if (ytReady) startMusicPlayback();
}

function revealContent() {
  if (!opened) return;
  overlay.classList.add('dismissed');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateReveal();
}

function handleScroll() {
  overlay.classList.toggle('dismissed', window.scrollY > 0);
}

envelope.addEventListener('click', openEnvelope);
scrollHint.addEventListener('click', revealContent);
window.addEventListener('scroll', handleScroll, { passive: true });

/* ---------- Animaciones al hacer scroll ---------- */

const revealEls = document.querySelectorAll('.reveal');

function updateReveal() {
  const viewportHeight = window.innerHeight;
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const visible = rect.top < viewportHeight * 0.9 && rect.bottom > viewportHeight * 0.1;
    el.classList.toggle('in-view', visible);
  });
}

window.addEventListener('scroll', updateReveal, { passive: true });
window.addEventListener('resize', updateReveal);

/* ---------- Cuenta atrás ---------- */

const cdDias = document.getElementById('cd-dias');
const cdHoras = document.getElementById('cd-horas');
const cdMin = document.getElementById('cd-min');
const cdSeg = document.getElementById('cd-seg');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();

  if (diff <= 0) {
    cdDias.textContent = cdHoras.textContent = cdMin.textContent = cdSeg.textContent = '00';
    return;
  }

  cdDias.textContent = pad(Math.floor(diff / 86400000));
  cdHoras.textContent = pad(Math.floor((diff % 86400000) / 3600000));
  cdMin.textContent = pad(Math.floor((diff % 3600000) / 60000));
  cdSeg.textContent = pad(Math.floor((diff % 60000) / 1000));
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Formulario RSVP ---------- */

const rsvpForm = document.getElementById('rsvpForm');
const campoAcompanante = document.getElementById('campoAcompanante');
const campoAutobus = document.getElementById('campoAutobus');
const rsvpConfirm = document.getElementById('rsvpConfirm');

rsvpForm.querySelectorAll('input[name="acompanado"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    campoAcompanante.classList.toggle('hidden', radio.value !== 'si');
  });
});

rsvpForm.querySelectorAll('input[name="autobus"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    campoAutobus.classList.toggle('hidden', radio.value !== 'si');
  });
});

rsvpForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});

let rsvpEnviando = false;

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (rsvpEnviando) return;
  rsvpEnviando = true;

  const data = new FormData(rsvpForm);
  const payload = {
    nombre: data.get('nombre') || '',
    asistencia: data.get('asistencia') === 'si' ? 'Sí' : 'No',
    acompanado: data.get('acompanado') === 'si' ? 'Sí' : 'No',
    acompanante: data.get('acompanado') === 'si' ? (data.get('acompanante') || '') : '',
    autobus: data.get('autobus') === 'si' ? 'Sí' : 'No',
    plazasAutobus: data.get('autobus') === 'si' ? (data.get('plazasAutobus') || '') : '',
    intolerancias: data.get('intolerancias') || '',
    cancion: data.get('cancion') || '',
    nota: data.get('nota') || '',
  };

  fetch(RSVP_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).finally(() => {
    rsvpForm.classList.add('hidden');
    rsvpConfirm.classList.remove('hidden');
  });
});

/* ---------- Contacto ---------- */

const contactToggle = document.getElementById('contactToggle');
const contactPanelWrap = document.getElementById('contactPanelWrap');

contactToggle.addEventListener('click', () => {
  const isOpen = contactPanelWrap.classList.toggle('open');
  contactToggle.classList.toggle('open', isOpen);
  contactToggle.setAttribute('aria-expanded', String(isOpen));
  contactToggle.querySelector('span').textContent = isOpen ? 'Ocultar teléfonos' : 'Ver teléfonos';
});
