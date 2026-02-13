/**
 * Modern Mobile Music Player Module
 * Non-destructive, isolated enhancement to existing audio player
 */

(function () {
  'use strict';

  // ============ PLAYLIST DATA ============
  const PLAYLIST = [
    { id: 0, title: 'Song 1', src: 'Song1.mp3', cover: 'Image1.jpg' },
    { id: 1, title: 'Song 2', src: 'Song2.mp3', cover: 'Image2.jpg' },
    { id: 2, title: 'Song 3', src: 'Song3.mp3', cover: 'Image3.jpg' },
    { id: 3, title: 'Song 4', src: 'Song4.mp3', cover: 'Image4.jpg' },
    { id: 4, title: 'Song 5', src: 'Song5.mp3', cover: 'Image5.jpg' },
    { id: 5, title: 'Song 6', src: 'Song6.mp3', cover: 'Image6.jpg' },
  ];

  // ============ STATE MANAGEMENT ============
  const player = {
    audio: null,
    currentIndex: 0,
    isLooping: false,
    isAutoPlay: true,
  };

  // ============ UTILITY FUNCTIONS ============
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function loadSong(index) {
    if (index < 0 || index >= PLAYLIST.length) return;
    player.currentIndex = index;
    const song = PLAYLIST[index];
    
    if (player.audio) {
      player.audio.src = song.src;
      player.audio.load();
    }
    updatePlayerUI();
  }

  function playSong() {
    if (!player.audio) return;
    if (!player.audio.src) {
      loadSong(player.currentIndex);
    }
    player.audio.play().catch(() => {
      console.log('Auto-play prevented by browser');
    });
    updatePlayerUI();
  }

  function pauseSong() {
    if (player.audio) {
      player.audio.pause();
    }
    updatePlayerUI();
  }

  function togglePlayPause() {
    if (!player.audio.src) {
      loadSong(player.currentIndex);
      playSong();
    } else if (player.audio.paused) {
      playSong();
    } else {
      pauseSong();
    }
  }

  function nextSong() {
    const nextIndex = (player.currentIndex + 1) % PLAYLIST.length;
    loadSong(nextIndex);
    playSong();
  }

  function previousSong() {
    const prevIndex = (player.currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadSong(prevIndex);
    playSong();
  }

  function toggleLoop() {
    player.isLooping = !player.isLooping;
    if (player.audio) {
      player.audio.loop = player.isLooping;
    }
    updateLoopButton();
  }

  function seekTo(percentage) {
    if (!player.audio || !player.audio.duration) return;
    const time = (percentage / 100) * player.audio.duration;
    player.audio.currentTime = time;
  }

  // ============ UI UPDATE FUNCTIONS ============
  function updatePlayerUI() {
    updatePlayButton();
    updateSongInfo();
    updateProgressBar();
    updateTimeDisplay();
  }

  function updatePlayButton() {
    const playBtn = document.getElementById('mp-play-btn');
    if (!playBtn) return;
    const isPlaying = player.audio && !player.audio.paused;
    playBtn.innerHTML = isPlaying ? '⏸' : '▶';
    playBtn.setAttribute('title', isPlaying ? 'Pause' : 'Play');
    playBtn.classList.toggle('playing', isPlaying);
  }

  function updateSongInfo() {
    const titleElem = document.getElementById('mp-current-song');
    const coverElem = document.getElementById('mp-cover');
    
    if (titleElem) {
      titleElem.textContent = PLAYLIST[player.currentIndex].title;
    }
    if (coverElem) {
      coverElem.src = PLAYLIST[player.currentIndex].cover;
      coverElem.alt = PLAYLIST[player.currentIndex].title;
    }
  }

  function updateProgressBar() {
    const progressBar = document.getElementById('mp-progress-fill');
    if (!progressBar || !player.audio) return;
    const percent = player.audio.duration 
      ? (player.audio.currentTime / player.audio.duration) * 100 
      : 0;
    progressBar.style.width = percent + '%';
  }

  function updateTimeDisplay() {
    const currentTimeElem = document.getElementById('mp-current-time');
    const totalTimeElem = document.getElementById('mp-total-time');
    const remainingTimeElem = document.getElementById('mp-remaining-time');

    if (!player.audio) return;

    const current = formatTime(player.audio.currentTime);
    const total = formatTime(player.audio.duration);
    const remaining = formatTime(
      Math.max(0, player.audio.duration - player.audio.currentTime)
    );

    if (currentTimeElem) currentTimeElem.textContent = current;
    if (totalTimeElem) totalTimeElem.textContent = total;
    if (remainingTimeElem) remainingTimeElem.textContent = remaining;
  }

  function updateLoopButton() {
    const loopBtn = document.getElementById('mp-loop-btn');
    if (loopBtn) {
      loopBtn.classList.toggle('active', player.isLooping);
    }
  }

  // ============ EVENT LISTENERS SETUP ============
  function setupEventListeners() {
    const playBtn = document.getElementById('mp-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', togglePlayPause);
    }

    const nextBtn = document.getElementById('mp-next-btn');
    const prevBtn = document.getElementById('mp-prev-btn');
    if (nextBtn) nextBtn.addEventListener('click', nextSong);
    if (prevBtn) prevBtn.addEventListener('click', previousSong);

    const loopBtn = document.getElementById('mp-loop-btn');
    if (loopBtn) {
      loopBtn.addEventListener('click', toggleLoop);
    }

    const progressContainer = document.getElementById('mp-progress-container');
    if (progressContainer) {
      progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        seekTo(Math.max(0, Math.min(100, percent)));
      });
    }

    if (player.audio) {
      player.audio.addEventListener('timeupdate', () => {
        updateProgressBar();
        updateTimeDisplay();
      });

      player.audio.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
      });

      player.audio.addEventListener('ended', () => {
        if (player.isAutoPlay && !player.isLooping) {
          nextSong();
        }
      });

      player.audio.addEventListener('play', updatePlayButton);
      player.audio.addEventListener('pause', updatePlayButton);
    }
  }

  // ============ INITIALIZATION ============
  function init() {
    player.audio = document.getElementById('bg-audio');
    
    if (!player.audio) {
      console.warn('Modern Music Player: bg-audio element not found');
      return;
    }

    player.audio.loop = player.isLooping;
    setupEventListeners();
    updatePlayerUI();
  }

  // ============ EXPORT PUBLIC API ============
  window.ModernMusicPlayer = {
    play: playSong,
    pause: pauseSong,
    togglePlayPause,
    next: nextSong,
    prev: previousSong,
    toggleLoop,
    seekTo,
    getPlaylist: () => PLAYLIST,
    getCurrentIndex: () => player.currentIndex,
    getCurrentSong: () => PLAYLIST[player.currentIndex],
    isPlaying: () => player.audio && !player.audio.paused,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
