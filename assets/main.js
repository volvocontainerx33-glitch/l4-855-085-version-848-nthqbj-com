(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('.mobile-menu-button');
    var panel = qs('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupCategoryFilters() {
    var panel = qs('[data-filter-panel]');
    var results = qs('[data-filter-results]');
    if (!panel || !results) return;
    var textInput = qs('[data-filter-text]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var cards = qsa('[data-card]', results);

    function apply() {
      var text = normalize(textInput && textInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-keywords')
        ].join(' '));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var show = matchText && matchYear && matchType;
        card.hidden = !show;
        if (show) visible += 1;
      });
      var empty = qs('.no-results', results);
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配影片';
        results.appendChild(empty);
      }
      empty.hidden = visible !== 0;
    }

    [textInput, yearSelect, typeSelect].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function setupSearchPage() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var results = qs('[data-search-results]');
    var typeSelect = qs('[data-search-type]');
    var yearSelect = qs('[data-search-year]');
    if (!form || !input || !results || !window.SEARCH_MOVIES) return;
    var label = qs('[data-search-label]');
    var title = qs('[data-search-title]');
    var movies = window.SEARCH_MOVIES;

    function fillSelects() {
      var types = Array.from(new Set(movies.map(function (movie) { return movie.type; }).filter(Boolean))).sort();
      var years = Array.from(new Set(movies.map(function (movie) { return movie.year; }).filter(Boolean))).sort(function (a, b) { return b - a; });
      types.forEach(function (item) {
        var option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        typeSelect.appendChild(option);
      });
      years.forEach(function (item) {
        var option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        yearSelect.appendChild(option);
      });
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '<a class="card-link" href="' + movie.url + '">',
        '<div class="card-cover">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-year">' + movie.year + '</span>',
        '<span class="card-play">▶</span>',
        '</div>',
        '<div class="card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + Number(movie.views || 0).toLocaleString() + '</span></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render() {
      var query = normalize(input.value);
      var type = typeSelect.value;
      var year = yearSelect.value;
      var matched = movies.filter(function (movie) {
        var haystack = normalize([movie.title, movie.region, movie.type, movie.category, movie.year, movie.tags, movie.oneLine].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || movie.type === type;
        var matchYear = !year || String(movie.year) === String(year);
        return matchQuery && matchType && matchYear;
      });
      if (label) label.textContent = query ? '搜索结果' : '推荐浏览';
      if (title) title.textContent = query ? '匹配影片' : '精选影片';
      results.innerHTML = matched.length ? matched.map(card).join('') : '<div class="no-results">没有找到匹配影片</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    [input, typeSelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    fillSelects();
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) input.value = q;
    render();
  }

  window.setupMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video) return;
    var shell = video.closest('.player-shell');
    var overlay = shell ? qs('.play-overlay', shell) : null;
    var error = shell ? qs('.player-error', shell) : null;
    var ready = false;

    function showError() {
      if (error) error.hidden = false;
    }

    function attach() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError();
          }
        });
      } else {
        showError();
      }
    }

    function start() {
      attach();
      if (overlay) overlay.classList.add('hidden');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          if (overlay) overlay.classList.remove('hidden');
        });
      }
    }

    attach();
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) overlay.classList.remove('hidden');
    });
    video.addEventListener('error', showError);
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
  });
})();
