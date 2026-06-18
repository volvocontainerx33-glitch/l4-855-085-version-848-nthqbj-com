(function () {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initMenu() {
    const button = qs('[data-menu-toggle]');
    const menu = qs('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    const hero = qs('[data-hero]');
    if (!hero) return;
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', function () { show(i); start(); }));
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function initForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        const input = qs('input[name="q"]', form);
        const value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) input.focus();
        }
      });
    });
  }

  function initLiveFilter() {
    const input = qs('[data-live-filter]');
    const list = qs('[data-filter-list]');
    if (!input || !list) return;
    const items = qsa('.movie-card, .rank-row', list);
    input.addEventListener('input', function () {
      const value = normalize(input.value);
      items.forEach(function (item) {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.year,
          item.textContent
        ].join(' '));
        item.classList.toggle('hidden-by-filter', value && !haystack.includes(value));
      });
    });
  }

  function initSearchPage() {
    const results = qs('[data-search-results]');
    const title = qs('[data-search-title]');
    const note = qs('[data-search-note]');
    const input = qs('[data-search-input]');
    if (!results || !window.movieSearchData) return;
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    if (input) input.value = query;
    if (!query) return;
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const matches = window.movieSearchData.filter(function (item) {
      const haystack = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' '));
      return terms.every(term => haystack.includes(term));
    });
    if (title) title.textContent = '搜索结果';
    if (note) note.textContent = matches.length ? '以下内容与关键词匹配。' : '暂未找到匹配内容，可尝试更换关键词。';
    results.innerHTML = matches.slice(0, 240).map(renderCard).join('');
  }

  function renderCard(item) {
    const tags = (item.tags || []).slice(0, 5).join(' ');
    return `
        <article class="movie-card compact" data-title="${escapeAttr(item.title)}" data-region="${escapeAttr(item.region)}" data-genre="${escapeAttr(item.genre)}" data-tags="${escapeAttr(tags)}" data-year="${escapeAttr(item.year)}">
          <a class="movie-cover" href="${escapeAttr(item.url)}" aria-label="${escapeAttr(item.title)}">
            <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}" loading="lazy" decoding="async">
            <span class="movie-year">${escapeHtml(item.year)}</span>
            <span class="movie-play">▶</span>
          </a>
          <div class="movie-body">
            <div class="movie-meta">
              <span>${escapeHtml(item.region)}</span>
              <span>${escapeHtml(item.type)}</span>
            </div>
            <h3><a href="${escapeAttr(item.url)}">${escapeHtml(item.title)}</a></h3>
            <p>${escapeHtml(item.oneLine)}</p>
            <div class="movie-foot">
              <span>${escapeHtml(item.genre)}</span>
              <a href="${escapeAttr(item.url)}">详情</a>
            </div>
          </div>
        </article>`;
  }

  function escapeHtml(value) {
    return (value || '').toString().replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  function initImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      const video = qs('video', player);
      const start = qs('[data-player-start]', player);
      const status = qs('[data-player-status]', player);
      const card = player.closest('.player-card');
      const buttons = card ? qsa('.source-button', card) : [];
      let hls = null;

      function setStatus(text) {
        if (status) status.textContent = text;
      }

      function destroy() {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      }

      function load(url, playNow) {
        if (!video || !url) return;
        destroy();
        player.classList.remove('playing');
        setStatus('正在准备播放');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('可以播放');
            if (playNow) {
              video.play().then(function () {
                player.classList.add('playing');
              }).catch(function () {
                setStatus('点击视频继续播放');
              });
            }
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放暂时中断，请切换线路或稍后再试');
            }
          });
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', function () {
            setStatus('可以播放');
            if (playNow) {
              video.play().then(function () {
                player.classList.add('playing');
              }).catch(function () {
                setStatus('点击视频继续播放');
              });
            }
          }, { once: true });
          return;
        }
        setStatus('当前环境无法播放该资源');
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(btn => btn.classList.toggle('active', btn === button));
          load(button.dataset.video, true);
        });
      });

      if (start) {
        start.addEventListener('click', function () {
          const active = buttons.find(button => button.classList.contains('active')) || buttons[0];
          if (active) load(active.dataset.video, true);
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('playing');
          setStatus('已暂停');
        });
      }
    });
  }

  function initShare() {
    qsa('[data-copy-link]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(window.location.href);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initForms();
    initLiveFilter();
    initSearchPage();
    initImages();
    initPlayers();
    initShare();
  });
})();
