/** @type {HTMLVideoElement} */
const el = document.getElementById("video");
const div = document.querySelector("div");
let source = el.querySelector("source")
let flicks = [["maw.webm"], ["OIIAOIIA.webm", 160, 6.65], ["PHONK2.webm", 130, 2.1], ["skate.mp4", 150, 6.5], ["yum.webm"], ["mwaa.webm", 5, 5.8]]

let burntFlicks = []

let flick, tm;
const randomFlick = () => {
    while (true) {
        let flick = flicks[Math.floor(Math.random() * flicks.length)]
        if (burntFlicks.length == flicks.length) {
            burntFlicks = [burntFlicks.pop()]
        }
        if (!burntFlicks.includes(flick[0])) {
            burntFlicks.push(flick[0])
            return flick
        }
    }
}

const funni = async () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.style.display = "none"
        flick = randomFlick()
        source.src = "flicks/" + flick[0]
        el.pause()
        el.load()
        div.style.animation = undefined
        setTimeout(() => {
            el.style.display = "initial"
            el.play()
            if (flick[1] != undefined) {
                clearTimeout(tm)
                tm = setTimeout(() => {
                    div.style.animation = `pulse ${60 / flick[1]}s linear infinite, rot ${60 / flick[1] * 2}s linear infinite`
                }, 1000 * flick[2]);
            } else {
                div.style.animation = undefined
            }
        }, 1000)
    }
}

funni()

el.addEventListener("ended", funni)

const multiple = 10;
let isIn = false

function transformElement(x, y) {
    if (!isIn) {
        return
    }
    let box = el.getBoundingClientRect();
    let calcX = -((y / window.innerHeight - 0.5)) * multiple;
    let calcY = ((x / window.innerWidth) - 0.5) * multiple;

    div.style.setProperty("--x", (calcX * 2) + "deg");
    div.style.setProperty("--y", (calcY * 2) + "deg");
}

addEventListener("mousemove", (e) => {
    let xy = [e.clientX, e.clientY];
    div.style.transform = transformElement(e.clientX, e.clientY)
});

document.addEventListener("mouseenter", (e) => {
    isIn = true
})

document.addEventListener("mouseleave", (e) => {
    //div.style.setProperty("--x", "0deg");
    //div.style.setProperty("--y", "0deg");
    isIn = false
})

div.addEventListener("click", () => {
    div.style.cursor = 'alias'
    if (el.muted == false) {
        funni()
    }
    el.muted = false
})
