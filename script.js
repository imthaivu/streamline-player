const fileButtonsContainer = document.getElementById("fileButtons");
const audio = document.getElementById("audio");
const speedIcon = document.getElementById("speedIcon");
const speedValue = document.getElementById("speedValue");

let currentBook = 1;
let currentIndex = 0;

const audioFiles = {
    1: Array.from({ length: 80 }, (_, i) => i + 1)
        .filter((i) => ![3, 20, 40, 53, 60, 68, 70, 76, 78, 80].includes(i))
        .map((i) => `streamline1/${String(i).padStart(2, "0")}.mp3`),

    2: Array.from({ length: 80 }, (_, i) => i + 1)
        .filter((i) => ![8, 24, 45, 53, 59, 67, 72, 78, 80].includes(i))
        .map((i) => `streamline2/${String(i).padStart(2, "0")}.mp3`),

    3: Array.from({ length: 80 }, (_, i) => i + 1)
        .filter(
            (i) =>
                ![
                    6, 8, 14, 26, 30, 33, 41, 48, 49, 50, 55, 58, 61, 64, 66, 68,
                    69, 70, 73, 79,
                ].includes(i)
        )
        .map((i) => `streamline3/${String(i).padStart(2, "0")}.mp3`),

    4: Array.from({ length: 60 }, (_, i) => i + 1)
        .filter(
            (i) =>
                ![
                    5, 8, 9, 12, 14, 18, 23, 27, 29, 30, 32, 35, 37, 38, 41, 43, 44,
                    46, 48, 51, 53, 56, 60,
                ].includes(i)
        )
        .map((i) => `streamline4/${String(i).padStart(2, "0")}.mp3`),
};

function selectBook(bookNum) {
    currentBook = bookNum;
    localStorage.setItem("lastBook", bookNum);
    renderBookButtons(bookNum);
    renderFileButtons(bookNum);
    loadLastAudio();
}

function renderBookButtons(activeBook) {
    document
        .querySelectorAll(".book-buttons button")
        .forEach((btn, idx) => {
            btn.classList.toggle("active", idx + 1 === activeBook);
        });
}

function renderFileButtons(bookNumber) {
    fileButtonsContainer.innerHTML = "";
    const files = audioFiles[bookNumber];

    const row = document.createElement("div");
    row.className = "button-row";

    files.forEach((file, i) => {
        const btn = document.createElement("button");

        const labelMatch = file.match(/(\d{2})\.mp3$/);
        const label = labelMatch ? String(Number(labelMatch[1])) : i + 1;

        btn.textContent = label;
        btn.onclick = () => playAudio(i);
        row.appendChild(btn);
    });

    fileButtonsContainer.appendChild(row);
}

function updateActiveButton(index) {
    document.querySelectorAll(".button-row button").forEach((btn, idx) => {
        btn.classList.toggle("active", idx === index);
    });
}

function playAudio(index) {
    if (currentIndex === index && !audio.paused) return;

    currentIndex = index;
    const file = audioFiles[currentBook][index];

    // Reset tốc độ về 1x
    audio.playbackRate = 1;
    speedIcon.textContent = "🐇";
    speedValue.textContent = "1x";

    if (audio.src !== location.origin + "/" + file) {
        audio.src = file;
        audio.load(); // ép load lại nếu đổi file
    }

    audio.play(); // chỉ tải file khi thực sự play
    updateActiveButton(index);
    saveLastAudio();
}

function seekAudio(seconds) {
    audio.currentTime += seconds;
}

function toggleSpeed() {
    if (audio.playbackRate === 1) {
        audio.playbackRate = 0.75;
        speedIcon.textContent = "🐢";
        speedValue.textContent = "0.75x";
    } else {
        audio.playbackRate = 1;
        speedIcon.textContent = "🐇";
        speedValue.textContent = "1x";
    }
}

function saveLastAudio() {
    localStorage.setItem(
        "lastAudio",
        JSON.stringify({ book: currentBook, index: currentIndex })
    );
}

function loadLastAudio() {
    const saved = localStorage.getItem("lastAudio");
    if (saved) {
        const { book, index } = JSON.parse(saved);
        if (book === currentBook) playAudio(index);
    } else {
        playAudio(0);
    }
}

selectBook(Number(localStorage.getItem("lastBook") || 1));

const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");

const sheetId = "1Co3Z7cUfXhgWcmPcQYvzAfYPn8W9n5cOGIWFkRsZoK4";
const sheetName = "Sheet1";
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}`;

// Xóa dấu tiếng Việt, viết thường, không khoảng trắng
function toSlug(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .replace(/\s+/g, "");
}

async function fetchSheetData() {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const rows = json.table.rows.map((row) => ({
        name: row.c[1]?.v || "",
        streak: row.c[2]?.v || 0,
        coins: row.c[3]?.v || 0,
    }));

    return rows;
}

async function renderLeaderboardFromSheet() {
    const lb = document.getElementById("leaderboard");
    lb.innerHTML = "";

    const users = await fetchSheetData();
    // Sort theo coins giảm dần
    users.sort((a, b) => b.coins - a.coins);

    users.forEach((user) => {
        const slugName = toSlug(user.name);
        const avatarSrc = `img-user/${slugName}.jpg`;

        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "12px";

        const avatar = document.createElement("img");
        avatar.src = avatarSrc;
        avatar.alt = user.name;
        avatar.style.width = "40px";
        avatar.style.height = "40px";
        avatar.style.borderRadius = "50%";
        avatar.style.marginRight = "5px";
        avatar.style.objectFit = "cover";

        const content = document.createElement("div");
        content.style.flexGrow = "1";

        const nameDiv = document.createElement("div");
        nameDiv.style.display = "flex";
        nameDiv.style.justifyContent = "space-between";
        nameDiv.style.alignItems = "center";
        nameDiv.style.fontSize = "14px";
        nameDiv.style.marginBottom = "4px";

        // Bên trái: tên và coins
        const nameLeft = document.createElement("div");
        nameLeft.innerHTML = `<strong>${user.name}</strong> • 💰${user.coins}`;

        // Bên phải: chuỗi ngày 🔥
        const nameRight = document.createElement("div");
        nameRight.innerHTML = `chuỗi 🔥 ${user.streak}`;
        nameRight.style.color = "#e17055";
        nameRight.style.fontWeight = "600";

        nameDiv.appendChild(nameLeft);
        nameDiv.appendChild(nameRight);

        const barContainer = document.createElement("div");
        barContainer.style.background = "#eee";
        barContainer.style.height = "10px";
        barContainer.style.borderRadius = "5px";
        barContainer.style.overflow = "hidden";
        barContainer.style.position = "relative";
        barContainer.style.marginBottom = "4px";
        barContainer.style.width = "100%";

        const barFill = document.createElement("div");
        const percent = Math.min((user.coins / 250) * 100, 100);
        barFill.style.width = `${percent}%`;
        barFill.style.height = "100%";
        barFill.style.background = "linear-gradient(to right, orange, red)";
        barFill.style.transition = "width 0.3s";

        const label = document.createElement("div");
        label.innerHTML = `🔥 ${user.streak}`;
        label.style.position = "absolute";
        label.style.left = "5px";
        label.style.top = "-18px";
        label.style.fontSize = "12px";
        label.style.color = "#e17055";
        label.style.fontWeight = "600";

        barContainer.appendChild(barFill);
        barContainer.appendChild(label);

        content.appendChild(nameDiv);
        content.appendChild(barContainer);

        container.appendChild(avatar);
        container.appendChild(content);

        lb.appendChild(container);
    });
}

renderLeaderboardFromSheet();

playBtn.onclick = () => {
    if (audio.paused) audio.play();
    else audio.pause();
};
audio.addEventListener("play", () => {
    playBtn.textContent = "⏸️";
});
audio.addEventListener("pause", () => {
    playBtn.textContent = "▶️";
});

audio.addEventListener("timeupdate", () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.value = percent || 0;
});

progress.addEventListener("input", () => {
    const percent = progress.value;
    audio.currentTime = (percent / 100) * audio.duration;
});

audio.addEventListener("ended", () => {
    playBtn.textContent = "▶️";
});