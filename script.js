let vid = "APk4mLodk88"
let streams
/** @type {HTMLVideoElement} */
const el = document.getElementById("video");
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!mediaQuery.matches) {
    fetch("https://images" + ~~(Math.random() * 33) + "-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=" + encodeURIComponent("https://www.youtube.com/watch?hl=en&v=" + vid)).then(response => response.text()).then(function (data) {
        if (data) {
            streams = parseYoutubeMeta(data);
            el.src = streams['hls'] || /* streams['720pna'] || streams['480pna'] ||  streams['720p'] ||*/ streams['480p'] || streams['360p'] || streams['240p'];
            el.play()
        }
    });
}

function parseYoutubeMeta(rawdata) {

    const regex = /(?:ytplayer\.config\s*=\s*|ytInitialPlayerResponse\s?=\s?)(.+?)(?:;var|;\(function|\)?;\s*if|;\s*if|;\s*ytplayer\.|;\s*<\/script)/gmsu

    rawdata = rawdata
        .split('window.getPageData')[0]
        .replace('ytInitialPlayerResponse = null', '')
        .replace('ytInitialPlayerResponse=window.ytInitialPlayerResponse', '')
        .replace('ytplayer.config={args:{raw_player_response:ytInitialPlayerResponse}};', '')


    const matches = regex.exec(rawdata);
    const data = matches && matches.length > 1 ? JSON.parse(matches[1]) : false;

    var streams = [],
        result = {};

    if (data.streamingData) {

        if (data.streamingData.adaptiveFormats) {
            streams = streams.concat(data.streamingData.adaptiveFormats);
        }

        if (data.streamingData.formats) {
            streams = streams.concat(data.streamingData.formats);
        }

        if (data.streamingData.hlsManifestUrl) {
            result.hls = data.streamingData.hlsManifestUrl;
        }
    }

    streams.forEach(function (stream, n) {
        const itag = stream.itag * 1,
            quality = false,
            itag_map = {
                18: '360p',
                22: '720p',
                37: '1080p',
                38: '3072p',
                82: '360p3d',
                83: '480p3d',
                84: '720p3d',
                85: '1080p3d',
                133: '240pna',
                134: '360pna',
                135: '480pna',
                136: '720pna',
                137: '1080pna',
                264: '1440pna',
                298: '720p60',
                299: '1080p60na',
                160: '144pna',
                139: "48kbps",
                140: "128kbps",
                141: "256kbps"
            };
        if (itag_map[itag]) result[itag_map[itag]] = stream.url;
    });

    return result;
};

const multiple = 10;
let isIn = false

function transformElement(x, y) {
    if (!isIn) {
        return
    }
    let box = el.getBoundingClientRect();
    let calcX = -((y/window.innerHeight-0.5))*multiple;
    let calcY = ((x/window.innerWidth)-0.5)*multiple;

    el.style.transform  = "rotateX("+ calcX +"deg) "
                          + "rotateY("+ calcY +"deg)";
  }

addEventListener("mousemove", (e) => {
    let xy = [e.clientX, e.clientY];
    el.style.transform = transformElement(e.clientX, e.clientY)
});

document.addEventListener("mouseenter", (e) => {
    isIn = true
})

document.addEventListener("mouseleave", (e) => {
    console.log("oo")
    isIn = false
    el.style.transform  = "rotateX(0deg) rotateY(0deg)";
})
