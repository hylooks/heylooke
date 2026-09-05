/* =====================================================
   HYLOOKS v1.3 FINAL PRODUCTION
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

    try{

        const res = await fetch("assets/data/videos.json", {
            cache: "no-store"
        });

        const json = await res.json();

        database = json.videos || [];

        window.hylooksJSON = {
            version: json.version || "1.3",
            updated: json.updated || new Date().toISOString(),
            videos: database
        };

    }catch(err){

        database = [];

        window.hylooksJSON = {
            version: "1.3",
            updated: new Date().toISOString(),
            videos: []
        };

        console.warn("videos.json belum ditemukan.");
    }

    renderDatabase();

}

loadDatabase();

/* ================= THUMB PREVIEW ================= */

thumbInput.addEventListener("change", () => {

    const file = thumbInput.files[0];

    if (!file) return;

    // Simpan file thumbnail untuk proses submit
    thumbnailFile = file;

    const reader = new FileReader();

    reader.onload = (e) => {

        thumbnailData = e.target.result;

        preview.innerHTML = `<img src="${thumbnailData}" alt="Thumbnail Preview">`;

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

    // Cari nomor ID terbesar agar tidak bentrok jika ada video yang dihapus
    const lastNumber = Math.max(
        ...database.map(video =>
            parseInt(video.id.replace("video",""), 10)
        )
    );

    const next = lastNumber + 1;
    const num = String(next).padStart(3, "0");

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

            if(!blob){
                alert("Gagal membuat thumbnail WEBP.");
                return;
            }

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

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = name;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(()=>{
        URL.revokeObjectURL(url);
    },100);

}

/* ================= SUBMIT ================= */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!thumbnailFile) {
        alert("Pilih thumbnail terlebih dahulu.");
        return;
    }

    const ids = nextID();

    const encoded = encodeVidey(
        urlInput.value.trim(),
        ids.id
    );

    // Convert thumbnail menjadi WEBP
    const thumbWebp = await convertThumbnail(thumbnailFile, ids.id);

    const item = {
        id: ids.id,
        title: titleInput.value.trim(),
        thumb: ids.thumb,
        views: viewsInput.value.trim(),
        duration: durationInput.value.trim(),
        video: encoded
    };

    // Tambah ke database
    database.push(item);

    // Simpan database terbaru (untuk tombol Download videos.json)
    window.hylooksJSON = {
        version: "1.3",
        updated: new Date().toISOString(),
        videos: database
    };

    // Tampilkan JSON hasil generate
    output.value = JSON.stringify(item, null, 2);

    // Refresh preview
    renderDatabase();

    // WAJIB download thumbnail agar file videoXXX.webp ada
    downloadFile(thumbWebp, thumbWebp.name);

    // TIDAK download videos.json di sini

    form.reset();
    preview.innerHTML = "";
    thumbnailData = "";
    thumbnailFile = null;

    titleInput.focus();

    alert(`${ids.id} berhasil di-generate.\nThumbnail ${thumbWebp.name} sudah di-download.`);
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

videoList.addEventListener("click", (e) => {

    if (!e.target.classList.contains("delete-btn")) return;

    const index = Number(e.target.dataset.index);

    database.splice(index, 1);

    // Update database JSON setelah delete
    window.hylooksJSON = {
        version: "1.3",
        updated: new Date().toISOString(),
        videos: database
    };

    renderDatabase();

});

/* ================= DOWNLOAD JSON ================= */

downloadBtn.addEventListener("click", () => {

    const json = window.hylooksJSON || {
        version: "1.3",
        updated: new Date().toISOString(),
        videos: database
    };

    const blob = new Blob(
        [JSON.stringify(json, null, 2)],
        { type: "application/json" }
    );

    downloadFile(blob, "videos.json");

    alert("videos.json berhasil di-download.");

});

/* ================= COPY JSON ================= */

copyBtn.addEventListener("click", async () => {

    if (!output.value) {
        alert("Belum ada JSON.");
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        alert("JSON berhasil disalin.");
    } catch (err) {
        output.select();
        document.execCommand("copy");
        alert("JSON berhasil disalin.");
    }

});
