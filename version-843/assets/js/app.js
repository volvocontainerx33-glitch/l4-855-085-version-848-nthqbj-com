(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = $all('[data-filter-panel]');

    panels.forEach(function (panel) {
      var searchInput = $('[data-movie-search]', panel);
      var categorySelect = $('[data-category-filter]', panel);
      var yearSelect = $('[data-year-filter]', panel);
      var typeSelect = $('[data-type-filter]', panel);
      var countNode = $('[data-visible-count]', panel);
      var grid = $('[data-movie-grid]');
      var cards = grid ? $all('.movie-card', grid) : [];

      function applyQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && searchInput) {
          searchInput.value = q;
        }
      }

      function update() {
        var query = (searchInput && searchInput.value || '').trim().toLowerCase();
        var category = categorySelect && categorySelect.value || '';
        var year = yearSelect && yearSelect.value || '';
        var type = typeSelect && typeSelect.value || '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-title') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchCategory = !category || cardCategory === category;
          var matchYear = !year || cardYear === year;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var shouldShow = matchQuery && matchCategory && matchYear && matchType;

          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
      }

      [searchInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      applyQueryFromUrl();
      update();
    });
  }

  function setupPlayers() {
    var players = $all('.js-hls-player');

    players.forEach(function (video) {
      var src = video.getAttribute('data-video-src');
      var shell = video.closest('[data-player-shell]');
      var button = shell ? $('[data-play-button]', shell) : null;
      var hlsInstance = null;
      var isReady = false;

      function prepare() {
        if (!src || isReady) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          isReady = true;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          isReady = true;
        } else {
          video.src = src;
          isReady = true;
        }
      }

      function play() {
        prepare();

        if (button) {
          button.classList.add('hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (button) {
              button.classList.remove('hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });

      video.addEventListener('click', function () {
        if (!isReady) {
          play();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupScrollPlayer() {
    $all('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var frame = $('.video-frame');

        if (!frame) {
          return;
        }

        event.preventDefault();
        frame.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupScrollPlayer();
  });
})();
