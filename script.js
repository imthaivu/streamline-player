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

async function playAudio(index) {
    if (currentIndex === index && !audio.paused) return;

    currentIndex = index;
    const file = audioFiles[currentBook][index];

    // Reset tốc độ
    audio.playbackRate = 1;
    speedIcon.textContent = "🐇";
    speedValue.textContent = "1x";


    audio.load();
    audio.play();

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
        id: row.c[0]?.v || "",
        classId: (row.c[0]?.v || "").substring(0, 6), // 6 ký tự đầu
        name: row.c[1]?.v || "",
        balanceOfWeek: parseFloat(row.c[2]?.v || 0),
        totalBalance: parseFloat(row.c[3]?.v || 0),
    }));

    return rows;
}

async function renderClassOptions(users) {
    const select = document.querySelector("select");
    select.innerHTML = '<option value="">-- Chọn lớp --</option>';

    // Lấy danh sách classId duy nhất
    const classes = [...new Set(users.map(u => u.classId))].sort();

    classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = cls;
        select.appendChild(option);
    });

    // Khi chọn lớp, gọi hàm render bảng xếp hạng theo lớp
    select.onchange = () => {
        const selectedClass = select.value;
        if (selectedClass) {
            renderLeaderboardFromSheet(users.filter(u => u.classId === selectedClass));
        } else {
            renderLeaderboardFromSheet(users);
        }
    };
}

// Sửa hàm render để nhận mảng users đã lọc
function renderLeaderboardFromSheet(users) {
    const lb = document.getElementById("leaderboard");
    lb.innerHTML = "";

    // Thêm dòng tiêu đề
    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";
    headerRow.style.marginBottom = "12px";
    headerRow.style.fontWeight = "bold";
    headerRow.style.fontSize = "14px";
    headerRow.style.color = "#2d3436";

    const leftHeader = document.createElement("div");
    leftHeader.textContent = "Rank of week";

    const rightHeader = document.createElement("div");
    rightHeader.textContent = "Total Coins";

    headerRow.appendChild(leftHeader);
    headerRow.appendChild(rightHeader);
    lb.appendChild(headerRow);

    if (users.every(u => u.balanceOfWeek === 0)) {
        users.sort(() => Math.random() - 0.5);
    } else {
        users.sort((a, b) => b.balanceOfWeek - a.balanceOfWeek);
    }

    users.forEach((user, index) => {
        const slugName = toSlug(user.name);
        const avatarSrc = `img-user/${slugName}.jpg`;

        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "12px";

        const avatarWrapper = document.createElement("div");
        avatarWrapper.style.position = "relative";
        avatarWrapper.style.width = "40px";
        avatarWrapper.style.height = "40px";
        avatarWrapper.style.marginRight = "5px";

        const avatar = document.createElement("img");
        avatar.src = avatarSrc;
        avatar.alt = user.name;
        avatar.style.width = "40px";
        avatar.style.height = "40px";
        avatar.style.borderRadius = "50%";
        if (index <= 2) {
            avatar.style.boxShadow = "0 0 4px 2px rgba(255, 204, 0, 0.6)";
        }

        avatar.style.objectFit = "cover";
        avatar.style.display = "block";

        if (index === 0) {
            const crown = document.createElement("div");
            crown.textContent = "👑";
            crown.style.position = "absolute";
            crown.style.top = "-12px";
            crown.style.left = "50%";
            crown.style.transform = "translateX(-50%)";
            crown.style.color = "#ffd700";
            crown.style.fontSize = "16px";
            avatarWrapper.appendChild(crown);
        } else if (index === 1 || index === 2) {
            const medal = document.createElement("div");
            medal.textContent = index === 1 ? "🥈" : "🥉";
            medal.style.position = "absolute";
            medal.style.bottom = "-12px";
            medal.style.left = "50%";
            medal.style.transform = "translateX(-50%)";
            medal.style.fontSize = "16px";
            avatarWrapper.appendChild(medal);
        }

        avatarWrapper.appendChild(avatar);
        container.appendChild(avatarWrapper);

        const content = document.createElement("div");
        content.style.flexGrow = "1";

        const nameDiv = document.createElement("div");
        nameDiv.style.display = "flex";
        nameDiv.style.justifyContent = "space-between";
        nameDiv.style.alignItems = "center";
        nameDiv.style.fontSize = "14px";
        nameDiv.style.marginBottom = "4px";

        const nameLeft = document.createElement("div");
        nameLeft.innerHTML = `<strong>${user.name}</strong> `;

        const nameRight = document.createElement("div");
        nameRight.innerHTML = `${user.totalBalance} 💰`;
        nameRight.style.color = "#ffcc00ff";
        nameRight.style.fontWeight = "bold";

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
        const percent = Math.min((user.balanceOfWeek / 150) * 100, 100);
        barFill.style.width = `${percent}%`;
        barFill.style.height = "100%";
        barFill.style.background =
            index === 0 ? "linear-gradient(to right, gold, orange)" :
                index === 1 ? "linear-gradient(to right, silver, gray)" :
                    index === 2 ? "linear-gradient(to right, #cd7f32, #8e44ad)" :
                        "linear-gradient(to right, #74b9ff, #0984e3)";

        barFill.style.transition = "width 0.3s";

        const barValue = document.createElement("div");
        barValue.textContent = `${user.balanceOfWeek}`;
        barValue.style.position = "absolute";
        barValue.style.left = `calc(${percent}% + 4px)`;
        barValue.style.top = "50%";
        barValue.style.transform = "translateY(-50%)";
        barValue.style.fontSize = "12px";
        barValue.style.color = "#ff5e00ff";
        barValue.style.fontWeight = "bold";

        const label = document.createElement("div");
        label.innerHTML = `🔥 ${user.totalBalance}`;
        label.style.position = "absolute";
        label.style.left = "5px";
        label.style.top = "-18px";
        label.style.fontSize = "12px";
        label.style.color = "#ff5e00ff";
        label.style.fontWeight = "600";

        barContainer.appendChild(barFill);
        barContainer.appendChild(barValue);
        barContainer.appendChild(label);

        content.appendChild(nameDiv);
        content.appendChild(barContainer);

        container.appendChild(content);

        lb.appendChild(container);
    });
}

async function main() {
    const users = await fetchSheetData();
    await renderClassOptions(users); // tạo dropdown chọn lớp
    renderLeaderboardFromSheet(users); // mặc định hiện toàn bộ
}

main();



