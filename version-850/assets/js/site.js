(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-scope]');
    var results = document.querySelector('.filter-results');
    if (!panel || !results) {
      return;
    }
    var search = panel.querySelector('.filter-search');
    var category = panel.querySelector('.filter-category');
    var year = panel.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(results.children).filter(function (item) {
      return item.matches('.movie-card, .rank-item');
    });
    var empty = document.querySelector('[data-empty-state]');
    var viewButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-view]'));

    function apply() {
      var keyword = normalize(search && search.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.category,
          card.dataset.year
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
        var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var show = matchesKeyword && matchesCategory && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        viewButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        results.classList.toggle('list-view', button.dataset.view === 'list');
      });
    });

    apply();
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('show', window.scrollY > 420);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
