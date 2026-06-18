(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var mobileToggle = $('.mobile-toggle');
  var mobilePanel = $('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = $('[data-hero]');

  if (hero) {
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(nextSlide, 5000);
    }

    var prev = $('.hero-prev', hero);
    var next = $('.hero-next', hero);

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    restart();
  }

  $all('.local-filter').forEach(function (input) {
    var targetId = input.getAttribute('data-filter-target');
    var list = targetId ? document.getElementById(targetId) : null;
    var chips = input.closest('.filter-box') ? $all('[data-filter-value]', input.closest('.filter-box')) : [];
    var chipValue = '';

    function applyFilter() {
      if (!list) {
        return;
      }
      var query = (input.value || '').trim().toLowerCase();
      var filter = chipValue.toLowerCase();
      $all('.movie-card', list).forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var ok = (!query || text.indexOf(query) !== -1) && (!filter || text.indexOf(filter) !== -1);
        item.classList.toggle('is-hidden', !ok);
      });
    }

    input.addEventListener('input', applyFilter);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipValue = chip.getAttribute('data-filter-value') || '';
        applyFilter();
      });
    });
  });

  $all('.player-shell').forEach(function (player) {
    var video = $('video', player);
    var cover = $('.player-cover', player);
    var source = player.getAttribute('data-video');
    var hls = null;

    function attachSource() {
      if (!video || !source || video.getAttribute('data-loaded') === '1') {
        return;
      }
      video.setAttribute('data-loaded', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      player.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (cover && video) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('emptied', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchSummary = document.getElementById('search-summary');

  if (searchInput && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<a class="movie-card" href="' + movie.url + '">' +
          '<span class="poster">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="play-dot">▶</span>' +
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
          '</span>' +
          '<span class="card-body">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
            '<span class="meta-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span></span>' +
            '<span class="tag-row">' + tags + '</span>' +
          '</span>' +
        '</a>';
    }

    function escapeHtml(text) {
      return String(text || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderSearch() {
      var query = (searchInput.value || '').trim().toLowerCase();
      if (!query) {
        searchSummary.textContent = '请输入关键词开始搜索。';
        searchResults.innerHTML = '';
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.year, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 240);
      searchSummary.textContent = matched.length ? '找到 ' + matched.length + ' 条相关结果。' : '未找到相关影片。';
      searchResults.innerHTML = matched.map(card).join('');
    }

    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }
})();
