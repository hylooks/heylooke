/* =====================================================
   HYLOOKS v1.1 FINAL PRODUCTION
   CMS Controller
   MASTER LOCKED
===================================================== */

const form = document.getElementById("videoForm");

const titleInput = document.getElementById("title");
const urlInput = document.getElementById("videyUrl");
const viewsInput = document.getElementById("views");
const durationInput = document.getElementById("duration");
const thumbInput = document.getElementById("thumbnail");

const preview = document.getElementById("thumbPreview");
const output = document.getElementById("jsonOutput");

const copyBtn = document.getElementById("copyJson");
const downloadBtn = document.getElementById("downloadJson");
const videoList = document.getElementById("videoList");

let database = [];
let thumbnailData = "";

/* ================= LOAD DATABASE ================= */

async function loadDatabase(){

    const res = await fetch("assets/data/videos.json",{cache:"no-store"});
    const json = await res.json();

    database = json.videos || [];

    renderDatabase();

}

loadDatabase();

/* ================= THUMB PREVIEW ================= */

thumbInput.addEventListener("change",()=>{

    const file = thumbInput.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = e=>{

        thumbnailData = e.target.result;

        preview.innerHTML = `<img src="${thumbnailData}">`;

    };

    reader.readAsDataURL(file);

});

/* ================= GENERATE ID ================= */

function nextID(){

    const number = String(database.length + 1).padStart(3,"0");

    return {
        id:`video${number}`,
        thumb:`assets/thumb/video${number}.webp`
    };

}

/* ================= SUBMIT ================= */

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const ids = nextID();

    const encoded = encodeVidey(urlInput.value.trim(), ids.id);

    const item = {

        id: ids.id,

        title: titleInput.value.trim(),

        thumb: ids.thumb,

        views: viewsInput.value.trim(),

        duration: durationInput.value.trim(),

        video: encoded

    };

    output.value = JSON.stringify(item,null,2);

    database.push(item);

    renderDatabase();

    form.reset();

    preview.innerHTML = "";

    thumbnailData = "";

});

/* ================= DATABASE PREVIEW ================= */

function renderDatabase(){

    videoList.innerHTML = "";

    database.forEach((video,index)=>{

        const card = document.createElement("div");
        card.className = "video-item";

        card.innerHTML = `

            <img src="${video.thumb}" alt="">

            <div class="video-info">

                <h3>${video.title}</h3>

                <p>${video.views} Views</p>

                <p>${video.duration}</p>

                <p>${video.id}</p>

            </div>

            <div class="video-actions">

                <button class="delete-btn" data-index="${index}">🗑</button>

            </div>

        `;

        videoList.appendChild(card);

    });

}

/* ================= DELETE ================= */

videoList.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("delete-btn")) return;

    const index = Number(e.target.dataset.index);

    database.splice(index,1);

    renderDatabase();

});

/* ================= COPY JSON ================= */

copyBtn.addEventListener("click",()=>{

    if(!output.value) return;

    navigator.clipboard.writeText(output.value);

    copyBtn.textContent = "Copied!";

    setTimeout(()=>{

        copyBtn.textContent = "Copy";

    },1500);

});

/* ================= DOWNLOAD DATABASE ================= */

downloadBtn.addEventListener("click",()=>{

    const json = {

        version:"1.1",

        updated:new Date().toISOString(),

        videos:database

    };

    const blob = new Blob(
        [JSON.stringify(json,null,2)],
        {type:"application/json"}
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "videos.json";

    link.click();

    URL.revokeObjectURL(link.href);

});