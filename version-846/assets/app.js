(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterClear = document.querySelector('[data-filter-clear]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(filterInput ? filterInput.value : '');
    var year = normalize(filterYear ? filterYear.value : '');

    filterCards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var passQuery = !query || haystack.indexOf(query) !== -1;
      var passYear = !year || normalize(card.getAttribute('data-year')) === year;
      card.classList.toggle('hidden', !(passQuery && passYear));
    });
  }

  if (filterInput || filterYear) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && filterInput) {
      filterInput.value = initialQuery;
    }

    applyFilter();

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterYear) {
      filterYear.addEventListener('change', applyFilter);
    }

    if (filterClear) {
      filterClear.addEventListener('click', function () {
        if (filterInput) {
          filterInput.value = '';
        }

        if (filterYear) {
          filterYear.value = '';
        }

        applyFilter();
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var loaded = false;

    function loadVideo() {
      if (!video || loaded) {
        return;
      }

      loaded = true;
      var url = video.getAttribute('data-video-url');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function startVideo() {
      loadVideo();

      if (button) {
        button.classList.add('hidden');
      }

      if (video) {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
  }
})();
