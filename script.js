// CrisálidA — interações do site
document.addEventListener('DOMContentLoaded', () => {

  // Ano no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav: fundo sólido ao rolar
  const nav = document.getElementById('siteNav');
  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // Nav: menu mobile
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Barra de progresso "fita" no topo
  const tapeFill = document.getElementById('tapeFill');
  const onScrollProgress = () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (tapeFill) tapeFill.style.width = pct + '%';
  };
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  // Reveal on scroll
  const revealTargets = document.querySelectorAll(
    '.sobre__col, .timeline__item, .ep__inner > *, .repertorio__grid li, .credits-card, .letras__inner > *, .downloads__inner > *, .download'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => io.observe(el));
});


// Player com onda sonora (áudio vem do Internet Archive)
(function(){
  var tracks = Array.prototype.slice.call(document.querySelectorAll('.track'));
  if (!tracks.length) return;
  var current = null;
  var BAR = 3, GAP = 2;
  var PLAYED = '#d9243f', BASE = 'rgba(236,228,216,0.30)';

  function fmt(s){
    if (!isFinite(s)) return '0:00';
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  tracks.forEach(function(el, idx){
    var btn = el.querySelector('.track__btn');
    var canvas = el.querySelector('.track__wave');
    var timeEl = el.querySelector('.track__time');
    var msg = el.querySelector('.track__msg');
    var ctx = canvas.getContext('2d');
    var src = el.getAttribute('data-src');
    var fallbackDur = parseFloat(el.getAttribute('data-duration')) || 0;
    var audio = null, peaks = null, raf = null, decoding = false, pending = null;
    var W = 1, H = 1, dpr = 1;

    function dur(){
      return (audio && isFinite(audio.duration) && audio.duration > 0) ? audio.duration : fallbackDur;
    }
    function progress(){
      var d = dur();
      return (audio && d) ? Math.min(1, audio.currentTime / d) : 0;
    }
    function updateTime(){
      timeEl.textContent = (audio && !audio.paused) || (audio && audio.currentTime > 0)
        ? fmt(audio.currentTime) + ' / ' + fmt(dur())
        : fmt(dur());
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      var bw = BAR * dpr, gap = GAP * dpr;
      var n = Math.max(1, Math.floor((W + gap) / (bw + gap)));
      var p = progress(), mid = H / 2;
      for (var i = 0; i < n; i++){
        var amp = peaks ? peaks[Math.min(peaks.length - 1, Math.floor(i * peaks.length / n))] : 0.05;
        var h = Math.max(2 * dpr, amp * H * 0.92);
        ctx.fillStyle = (i / n) < p ? PLAYED : BASE;
        ctx.fillRect(i * (bw + gap), mid - h / 2, bw, h);
      }
    }

    function size(){
      dpr = window.devicePixelRatio || 1;
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W; canvas.height = H;
      draw();
    }

    // Gera a onda: baixa o áudio, decodifica em baixa resolução e mede o volume
    function loadWave(){
      if (decoding || peaks) return;
      decoding = true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !window.fetch){ decoding = false; return; }
      fetch(src, { mode: 'cors' })
        .then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
        .then(function(buf){
          var ac;
          try { ac = new AC({ sampleRate: 8000 }); } catch (e) { ac = new AC(); }
          return new Promise(function(res, rej){ ac.decodeAudioData(buf, res, rej); })
            .then(function(ab){ try { ac.close(); } catch (e) {} return ab; });
        })
        .then(function(ab){
          var N = 240, ch = ab.numberOfChannels, len = ab.length;
          var step = Math.max(1, Math.floor(len / N)), out = [], max = 0, data = [];
          for (var c = 0; c < ch; c++) data.push(ab.getChannelData(c));
          for (var i = 0; i < N; i++){
            var a = i * step, b = Math.min(len, a + step), sum = 0, cnt = 0;
            for (var j = a; j < b; j += 4){
              var v = 0;
              for (var k = 0; k < ch; k++) v += Math.abs(data[k][j]);
              sum += v / ch; cnt++;
            }
            var m = cnt ? sum / cnt : 0;
            out.push(m); if (m > max) max = m;
          }
          peaks = out.map(function(v){ return max ? Math.pow(v / max, 0.75) : 0; });
          draw();
        })
        .catch(function(){ decoding = false; });
    }

    function setPlaying(on){
      el.classList.toggle('is-playing', on);
      btn.setAttribute('aria-label', (on ? 'Pausar ' : 'Tocar ') + el.querySelector('.track__title').textContent);
    }
    function showError(){ if (msg) msg.hidden = false; }

    function loop(){
      draw(); updateTime();
      if (audio && !audio.paused) raf = requestAnimationFrame(loop);
    }

    function ensureAudio(){
      if (audio) return audio;
      audio = new Audio();
      audio.preload = 'none';
      audio.src = src;
      audio.addEventListener('loadedmetadata', function(){
        if (pending !== null){ audio.currentTime = pending * audio.duration; pending = null; }
        updateTime();
      });
      audio.addEventListener('ended', function(){
        setPlaying(false); audio.currentTime = 0; draw(); updateTime();
        var next = tracks[idx + 1];
        if (next && next._play) next._play();
      });
      audio.addEventListener('error', function(){ setPlaying(false); showError(); });
      return audio;
    }

    function play(){
      if (current && current !== api) current.pause();
      var a = ensureAudio();
      if (msg) msg.hidden = true;
      var p = a.play();
      if (p && p.catch) p.catch(function(){ setPlaying(false); showError(); });
      current = api;
      setPlaying(true);
      loadWave();
      cancelAnimationFrame(raf);
      loop();
    }
    function pause(){
      if (audio) audio.pause();
      setPlaying(false);
      cancelAnimationFrame(raf);
      draw(); updateTime();
    }
    var api = { play: play, pause: pause };
    el._play = play;

    btn.addEventListener('click', function(){
      if (audio && !audio.paused) pause(); else play();
    });

    function seek(ratio){
      ratio = Math.min(1, Math.max(0, ratio));
      var a = ensureAudio();
      if (isFinite(a.duration) && a.duration > 0){
        a.currentTime = ratio * a.duration;
        draw(); updateTime();
        if (a.paused) play();
      } else {
        pending = ratio;
        play();
      }
    }
    canvas.addEventListener('click', function(e){
      var r = canvas.getBoundingClientRect();
      seek((e.clientX - r.left) / r.width);
    });
    canvas.addEventListener('keydown', function(e){
      if (!audio) return;
      if (e.key === 'ArrowRight'){ audio.currentTime = Math.min(dur(), audio.currentTime + 5); draw(); e.preventDefault(); }
      if (e.key === 'ArrowLeft'){ audio.currentTime = Math.max(0, audio.currentTime - 5); draw(); e.preventDefault(); }
    });

    if (window.ResizeObserver) new ResizeObserver(size).observe(canvas);
    else window.addEventListener('resize', size);
    size();
    updateTime();
  });
})();
