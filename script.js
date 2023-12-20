class BeatBeat {

    isPlaying = false

    offlineContext
    buffer
    songData = []

    constructor(
        context = new AudioContext(),
        filterFrequency = 100,
        peakGain = 15,
        threshold = 0.8,
        sampleSkip = 350,
        minAnimationTime = 0.4
    ) {
        this.context = context
        this.filterFrequency = filterFrequency
        this.peakGain = peakGain
        this.threshold = threshold
        this.sampleSkip = sampleSkip
        this.minAnimationTime = 0.4
    }

    load() {
        return new Promise(async resolve => {
            const resp = await fetch("aud.wav")
            const file = await resp.arrayBuffer()
            this.context.decodeAudioData(file, async (buffer) => {
                console.log(buffer)
                this.buffer = buffer
                await this.analyze()
                resolve()
            })
        })
    }

    play(cb) {
        const source = this.context.createBufferSource()
        source.buffer = this.buffer
        source.connect(this.context.destination)
        source.start()
        this.animate(cb)
    }

    async analyze() {
        this.offlineContext = new OfflineAudioContext(1, this.buffer.length, this.buffer.sampleRate)
        const source = this.offlineContext.createBufferSource()
        source.buffer = this.buffer

        const filter = this.offlineContext.createBiquadFilter()
        filter.type = "bandpass"
        filter.frequency.value = this.filterFrequency
        filter.Q.value = 1

        const filter2 = this.offlineContext.createBiquadFilter()
        filter2.type = "peaking"
        filter2.frequency.value = this.filterFrequency
        filter2.Q.value = 1
        filter2.gain.value = this.peakGain

        source.connect(filter2)
        filter2.connect(filter)
        filter.connect(this.offlineContext.destination)
        source.start()
        const buffer = await this.offlineContext.startRendering()

        const data = buffer.getChannelData(0)

        this.songData = []
        for (let i = 0; i < data.length; ++i) {
            if (data[i] > this.threshold) {
                const time = i / buffer.sampleRate
                const previousTime = this.songData.length
                    ? this.songData[this.songData.length - 1].time
                    : 0
                if (time - previousTime > this.minAnimationTime) {
                    this.songData.push({
                        data: data[i],
                        time
                    })
                }
            }
            i += this.sampleSkip
        }
    }

    animate(cb) {
        this.songData.forEach((d, i) => {
            const time = i === this.songData.length - 1
                ? d.time
                : this.songData[i + 1].time - d.time
            setTimeout(() => cb(time), d.time * 1000)
        })
    }
}

/** @type {HTMLVideoElement} */
const el = document.getElementById("video");
const div = document.querySelector("div");
let source = el.querySelector("source")
const flicks = ["maw.webm", "OIIAOIIA.webm", "PHONK2.webm", "skate.mp4", "yum.webm"]

const randomFlick = () => {
    let currentFlick = (source.src ?? "").replace("flicks/", "")
    while (true) {
        let flick = flicks[Math.floor(Math.random() * flicks.length)]
        if (flick != currentFlick) return flick
    }
}


let first = true
const funni = async () => {
    el.style.display = "none"
    source.src = "flicks/" + randomFlick()
    el.load()
    setTimeout(() => {
        el.style.display = "initial"
        el.play()
    }, 1000)
    if (first != true) {
        const sound = new BeatBeat()
        await sound.load()
        sound.play(() => {
            console.log("call")
            div.classList.add("pulse")
            console.log("wow")
            setTimeout(() => {
                div.classList.remove("pulse")
            }, 0.3)
        })
    }
    first = false
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

    div.style.transform = "rotateX(" + calcX + "deg) "
        + "rotateY(" + calcY + "deg)";
}

addEventListener("mousemove", (e) => {
    let xy = [e.clientX, e.clientY];
    div.style.transform = transformElement(e.clientX, e.clientY)
});

document.addEventListener("mouseenter", (e) => {
    isIn = true
})

document.addEventListener("mouseleave", (e) => {
    console.log("oo")
    isIn = false
    div.style.transform = "rotateX(0deg) rotateY(0deg)";
})

div.addEventListener("click", () => {
    if (el.muted == false) {
        funni()
    }
    el.muted = false
})
