(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-arrow.prev");
        var next = document.querySelector(".hero-arrow.next");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (slides.length) {
            showSlide(0);
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                });
            }
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-result");

        function filterCards(value) {
            var term = (value || "").trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var match = !term || haystack.indexOf(term) !== -1;
                card.classList.toggle("hidden-card", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            filterInput.value = query;
            filterCards(query);
            filterInput.addEventListener("input", function () {
                filterCards(filterInput.value);
            });
        }

        Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".play-overlay");
            var src = shell.getAttribute("data-src");
            var loaded = false;
            var loading = null;
            var hls = null;

            function loadVideo() {
                if (loaded) {
                    return Promise.resolve();
                }
                if (loading) {
                    return loading;
                }
                loading = new Promise(function (resolve, reject) {
                    loaded = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = src;
                        resolve();
                        return;
                    }
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal) {
                                return;
                            }
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                                return;
                            }
                            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                                return;
                            }
                            reject(new Error("playback"));
                        });
                        return;
                    }
                    video.src = src;
                    resolve();
                });
                return loading;
            }

            function startVideo() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                loadVideo().then(function () {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            if (overlay) {
                                overlay.classList.remove("is-hidden");
                            }
                        });
                    }
                }).catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", startVideo);
            }
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && !video.ended) {
                    overlay.classList.remove("is-hidden");
                }
            });
            video.addEventListener("ended", function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
