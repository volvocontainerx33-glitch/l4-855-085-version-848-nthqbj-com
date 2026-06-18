document.addEventListener("DOMContentLoaded", function() {
  var menuButton = document.querySelector(".menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      var open = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector(".hero-carousel");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });

    setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  var filterScope = document.querySelector("[data-filter-scope]");

  if (filterScope) {
    var input = filterScope.querySelector(".movie-filter-input");
    var selects = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var active = {};

      selects.forEach(function(select) {
        var key = select.getAttribute("data-filter-key");
        active[key] = select.value;
      });

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchText = !query || text.indexOf(query) !== -1;
        var matchSelects = selects.every(function(select) {
          var key = select.getAttribute("data-filter-key");
          var value = active[key];
          return !value || card.getAttribute("data-" + key) === value;
        });

        card.classList.toggle("is-hidden", !(matchText && matchSelects));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    selects.forEach(function(select) {
      select.addEventListener("change", applyFilter);
    });

    applyFilter();
  }
});
