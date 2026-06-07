const weddingDate = new Date("2026-07-19T15:30:00+04:00");
const counts = {
  days: document.querySelector('[data-count="days"]'),
  hours: document.querySelector('[data-count="hours"]'),
  minutes: document.querySelector('[data-count="minutes"]'),
  seconds: document.querySelector('[data-count="seconds"]'),
};
const scrollHint = document.querySelector(".scroll-hint");
let userStartedScroll = false;

function updateCountdown() {
  const diff = Math.max(0, weddingDate.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  counts.days.textContent = days;
  counts.hours.textContent = String(hours).padStart(2, "0");
  counts.minutes.textContent = String(minutes).padStart(2, "0");
  counts.seconds.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

let lastScrollY = window.scrollY;
let isScrollingDown = true;

function updateScrollDirection() {
  const currentScrollY = window.scrollY;
  isScrollingDown = currentScrollY >= lastScrollY;
  lastScrollY = currentScrollY;

  if (userStartedScroll && currentScrollY > 8) {
    scrollHint?.classList.add("is-hidden");
  }
}

window.addEventListener("scroll", updateScrollDirection, { passive: true });

function hideScrollHintOnUserScroll() {
  userStartedScroll = true;
  scrollHint?.classList.add("is-hidden");
}

window.addEventListener("wheel", hideScrollHintOnUserScroll, { passive: true });
window.addEventListener("touchmove", hideScrollHintOnUserScroll, { passive: true });
window.addEventListener("keydown", event => {
  const scrollKeys = ["ArrowDown", "PageDown", "Space", "End"];
  if (scrollKeys.includes(event.code)) {
    hideScrollHintOnUserScroll();
  }
});

scrollHint?.addEventListener("click", () => {
  userStartedScroll = true;
  window.scrollBy({
    top: window.innerHeight * 0.75,
    behavior: "smooth",
  });
  scrollHint.classList.add("is-hidden");
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && isScrollingDown) {
        entry.target.classList.add("is-visible");
      } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

const musicButtons = document.querySelectorAll(".music-start__button");
const musicLabel = document.querySelector(".music-start__label");
const weddingMusic = document.querySelector("#wedding-audio");
weddingMusic.loop = true;
weddingMusic.volume = 0.55;

function playWeddingMusic() {
  return weddingMusic.play().then(() => {
    musicButtons.forEach(button => button.classList.add("is-playing"));
    musicLabel.textContent = "Անջատել";
  });
}

function stopWeddingMusic() {
  weddingMusic.pause();
  weddingMusic.currentTime = 0;
  musicButtons.forEach(button => button.classList.remove("is-playing"));
  musicLabel.textContent = "Միացնել";
}

function enableMusicAfterFirstInteraction() {
  playWeddingMusic().catch(() => {});
  removeMusicFallbackListeners();
}

function removeMusicFallbackListeners() {
  document.removeEventListener("pointerdown", enableMusicAfterFirstInteraction, true);
  document.removeEventListener("touchstart", enableMusicAfterFirstInteraction, true);
  document.removeEventListener("click", enableMusicAfterFirstInteraction, true);
  document.removeEventListener("keydown", enableMusicAfterFirstInteraction, true);
}

playWeddingMusic().catch(() => {
  document.addEventListener("pointerdown", enableMusicAfterFirstInteraction, true);
  document.addEventListener("touchstart", enableMusicAfterFirstInteraction, true);
  document.addEventListener("click", enableMusicAfterFirstInteraction, true);
  document.addEventListener("keydown", enableMusicAfterFirstInteraction, true);
});

musicButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.classList.contains("is-playing")) {
      stopWeddingMusic();
      return;
    }

    playWeddingMusic().catch(() => {
      musicButtons.forEach(item => item.classList.remove("is-playing"));
      musicLabel.textContent = "Միացնել";
    });
  });
});
