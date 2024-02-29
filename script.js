let asides = [...document.querySelectorAll("aside")];
if (asides.length > 0) {
  let withShadow = [2, 6, 8, 9, 11];
  let images = Array.from({ length: 10 }, (_, i) => i + 1)
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .map((image, i) => {
      const img = document.createElement("img");
      img.src = `/dog/Image ${image + 1}.webp`;
      if (!withShadow.includes(image + 1)) {
        img.classList.add("shadow");
      } else {
        img.classList.add("otherOtherShadow");
      }
      asides[i % asides.length].appendChild(img);
      return img;
    });
  images = asides.flatMap((aside) => [...aside.querySelectorAll("img")]);

  let n = 0;
  setInterval(() => {
    n++;
    images.forEach(
      (img, i) =>
        (img.style.transform = `rotate(${(i - n) % 2 == 0 ? -10 : 10}deg)`)
    );
  }, 500);
}

let catEmojis = "🐱,😹,😻,😽,😸,😺".split(",");
let catEls = document.querySelectorAll(".cat");
let emoji = catEmojis[Math.floor(Math.random() * catEmojis.length)];
catEls.forEach((el) => (el.textContent = emoji));
let particles = [];

function randompowerlaw(mini, maxi) {
  return Math.ceil(
    Math.exp(Math.random() * (Math.log(maxi) - Math.log(mini))) * mini
  );
}

const enterprise = document.querySelector("h1");
const eW = enterprise.offsetWidth;
const eH = enterprise.offsetHeight;

let timeTilNextSpawn = Math.random() * 4;
let step = -1;

let stars = "✦".split("");
let colors = [
  "ffe34d",
  "ffe766",
  "FFD700",
  "FFD700",
  "ffeb80",
  "ffef99",
  "ffef99",
];

function frame() {
  step++;
  if (step > timeTilNextSpawn) {
    step = -1;
    timeTilNextSpawn = Math.random() * 20 + 2;
    const star = document.createElement("span");
    star.className = "particle";
    star.style.setProperty(
      "color",
      colors[Math.floor(Math.random() * colors.length)]
    );
    star.innerText = stars[Math.floor(Math.random() * stars.length)];
    star.style.setProperty("--x", Math.round(Math.random() * eW) + "px");
    star.style.setProperty("--y", Math.round(Math.random() * eH - 10) + "px");
    let lifetime = Math.random() * 180 + 120;
    star.style.setProperty("--lifetime", lifetime * 15 + "ms");
    star.style.setProperty("--max-size", randompowerlaw(1, 1.3) - 0.4);
    enterprise.appendChild(star);
    particles.push({
      lifetime,
      currentLife: 0,
      boundElement: star,
    });
  }
  particles = particles.flatMap((particle) => {
    if (particle.currentLife > particle.lifetime) {
      particle.boundElement.remove();
      return [];
    }
    particle.currentLife = particle.currentLife + 1;
    return [particle];
  });
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);

document.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", (event) => {
    if (a.hasAttribute("new-color")) {
      event.preventDefault();
    } else {
      return true;
    }
    document.body.style.setProperty("--destColor", a.getAttribute("new-color"));
    document.body.classList.add("isNavigating");
    setTimeout(() => {
      window.location = a.href;
    }, 300);
  });
});

addEventListener("pageshow", (event) => {
  if (event.persisted) {
    document.body.classList.remove("isNavigating");
  }
});
