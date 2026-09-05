/* =====================================================
   HYLOOKS v1.1 FINAL PRODUCTION
   Watch Page Controller
   MASTER LOCKED
===================================================== */

const player = document.getElementById("videoPlayer");
const loading = document.getElementById("playerLoading");

const titleEl = document.getElementById("videoTitle");
const viewsEl = document.getElementById("videoViews");

const sidebar = document.getElementById("sidebarVideos");
const template = document.getElementById("sidebarTemplate");

const likeBtn = document.getElementById("likeBtn");
const likeCount = document.getElementById("likeCount");
const shareBtn = document.getElementById("shareBtn");
const copyBtn = document.getElementById("copyBtn");

let database = [];
let currentVideo = null;

/* ================= GET ID ================= */

const params = new URLSearchParams(window.location.search);
const videoID = params.get("id");

/* ================= LOAD JSON ================= */

async function initWatchPage(){

    const res = await fetch("assets/data/videos.json",{
        cache:"no-store"
    });

    const json = await res.json();

    database = json.videos || [];

    currentVideo =
        database.find(v=>v.id===videoID) ||
        database[0];

    renderPlayer(currentVideo);

    renderSidebar();

    loadLike();

}

initWatchPage();

/* ================= PLAYER ================= */

function renderPlayer(video){

    titleEl.textContent = video.title;

    viewsEl.textContent = `${video.views} Views`;

    player.poster = video.thumb;

    loading.classList.remove("hide");

    const videoURL = HyLooksLoader.decode(video.video);

    player.src = videoURL;

    player.load();

}

/* Loading Spinner */

player.addEventListener("loadeddata",()=>{

    loading.classList.add("hide");

});

player.addEventListener("waiting",()=>{

    loading.classList.remove("hide");

});

player.addEventListener("playing",()=>{

    loading.classList.add("hide");

});

/* ================= SIDEBAR ================= */

function renderSidebar(){

    sidebar.innerHTML = "";

    database.forEach(video=>{

        const clone = template.content.cloneNode(true);

        clone.querySelector(".side-thumb").src = video.thumb;

        clone.querySelector(".side-duration").textContent = video.duration;

        clone.querySelector(".side-title").textContent = video.title;

        clone.querySelector(".side-views").textContent =
            `${video.views} Views`;

        const card = clone.querySelector(".side-card");

        card.href = `watch.html?id=${video.id}`;

        if(video.id===currentVideo.id){
            card.classList.add("active");
        }

        sidebar.appendChild(clone);

    });

}

/* ================= LIKE ================= */

function loadLike(){

    const key = `like_${currentVideo.id}`;

    const count = Number(localStorage.getItem(key) || 0);

    likeCount.textContent = count;

    if(localStorage.getItem(`${key}_liked`)==="1"){
        likeBtn.classList.add("active");
    }

}

likeBtn.addEventListener("click",()=>{

    const key = `like_${currentVideo.id}`;

    let count = Number(localStorage.getItem(key) || 0);

    const liked = localStorage.getItem(`${key}_liked`);

    if(liked==="1"){

        count--;

        localStorage.removeItem(`${key}_liked`);

        likeBtn.classList.remove("active");

    }else{

        count++;

        localStorage.setItem(`${key}_liked`,"1");

        likeBtn.classList.add("active");

    }

    if(count<0) count=0;

    localStorage.setItem(key,count);

    likeCount.textContent = count;

});

/* ================= SHARE ================= */

shareBtn.addEventListener("click",async()=>{

    const url = window.location.href;

    if(navigator.share){

        try{

            await navigator.share({
                title:currentVideo.title,
                url:url
            });

        }catch(e){}

    }else{

        navigator.clipboard.writeText(url);

        shareBtn.textContent = "Copied!";

        setTimeout(()=>{
            shareBtn.textContent = "Share";
        },1500);

    }

});

/* ================= COPY ================= */

copyBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(window.location.href);

    copyBtn.textContent = "Copied!";

    setTimeout(()=>{
        copyBtn.textContent = "Copy Link";
    },1500);

});

/* ================= AUTOPLAY NEXT ================= */

player.addEventListener("ended",()=>{

    const index = database.findIndex(v=>v.id===currentVideo.id);

    if(index===-1) return;

    const next = database[index+1];

    if(next){

        window.location.href =
            `watch.html?id=${next.id}`;

    }

});