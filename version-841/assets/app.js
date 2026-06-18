(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    function filterCards(query, group) {
        var grid = document.querySelector("[data-movie-grid]");
        if (!grid) {
            return false;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var q = normalize(query);
        var g = normalize(group || "all");
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var cardGroup = normalize(card.getAttribute("data-group"));
            var matchText = !q || haystack.indexOf(q) !== -1;
            var matchGroup = g === "all" || cardGroup === g;
            var show = matchText && matchGroup;
            card.classList.toggle("is-hidden", !show);
            card.setAttribute("aria-hidden", show ? "false" : "true");
            if (show) {
                visible += 1;
            }
        });
        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
        return true;
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("form.site-search"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var query = input ? input.value : "";
                if (!filterCards(query, document.body.getAttribute("data-active-group") || "all")) {
                    var target = "index.html";
                    if (query.trim()) {
                        target += "?search=" + encodeURIComponent(query.trim());
                    }
                    window.location.href = target;
                }
            });
        });

        var filterInput = document.querySelector("[data-filter-input]");
        if (filterInput) {
            filterInput.addEventListener("input", function () {
                filterCards(filterInput.value, document.body.getAttribute("data-active-group") || "all");
            });
        }

        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                var group = chip.getAttribute("data-filter-group") || "all";
                document.body.setAttribute("data-active-group", group);
                filterCards(filterInput ? filterInput.value : "", group);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("search") || "";
        if (query) {
            if (filterInput) {
                filterInput.value = query;
            }
            var headerInputs = Array.prototype.slice.call(document.querySelectorAll(".search-input"));
            headerInputs.forEach(function (input) {
                input.value = query;
            });
            filterCards(query, document.body.getAttribute("data-active-group") || "all");
        }
    }

    window.initPlayer = function (src) {
        var video = document.querySelector("[data-player]");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-player-button]");
        if (!video || !src) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            loaded = true;
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });
})();
