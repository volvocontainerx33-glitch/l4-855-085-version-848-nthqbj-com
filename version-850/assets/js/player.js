(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var src = shell.getAttribute('data-src');
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        if (overlay) {
          overlay.innerHTML = '<strong>暂时无法播放</strong>';
        }
        return;
      }
      loaded = true;
      video.setAttribute('controls', 'controls');
    }

    function play() {
      load();
      if (!loaded) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.player-shell'), initPlayer);
  });
})();
