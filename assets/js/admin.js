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
let thumbnailFile = null;

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

    thumbnailFile = file;

    const reader = new FileReader();

    reader.onload = e=>{

        thumbnailData = e.target.result;

        preview.innerHTML = `<img src="${thumbnailData}">`;

    };

    reader.readAsDataURL(file);

});

/* ================= GENERATE ID ================= */

function nextID(){

    if(database.length === 0){
        return {
            id: "video001",
            thumb: "assets/thumb/video001.webp"
        };
    }

    const lastID = database[database.length - 1].id;
    const next = parseInt(lastID.replace("video",""),10) + 1;
    const num = String(next).padStart(3,"0");

    return {
        id: `video${num}`,
        thumb: `assets/thumb/video${num}.webp`
    };

} // <-- PENUTUP nextID() WAJIB ADA


/* ================= AUTO CONVERT THUMBNAIL ================= */

async function convertThumbnail(file,id){

    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap,0,0,1280,720);

    return new Promise(resolve=>{

        canvas.toBlob(blob=>{

            resolve(new File(
                [blob],
                `${id}.webp`,
                {type:"image/webp"}
            ));

        },"image/webp",0.90);

    });

}


/* ================= DOWNLOAD FILE ================= */

function downloadFile(file,name){

    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = name;
    link.click();

    URL.revokeObjectURL(link.href);

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

downloadBtn.addEventListener("click",()=>{

    const json = {

        version:"1.3",

        updated:new Date().toISOString(),

        videos:database

    };

    const blob = new Blob(
        [JSON.stringify(json,null,2)],
        {type:"application/json"}
    );

    downloadFile(blob,"videos.json");

    alert("videos.json berhasil diperbarui.");

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
