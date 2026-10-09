// ==============================
// マップ設定
// ==============================

const mapHint = document.getElementById("map-hint");

const MAP_WIDTH = 2000;   // 横幅
const MAP_HEIGHT = 1500;  // 縦幅

const MIN_ZOOM = 0.3;     // 最小ズーム
const MAX_ZOOM = 3;       // 最大ズーム
const ZOOM_SPEED = 1.1;   // ズーム速度

// ========================================
// TEXT SETTINGS
// ========================================

//const TEXT_SIZE = 40;
//const TEXT_COLOR = "#751c75";
//const TEXT_FONT = "Noto Serif Japanese,serif";

const categories = {
    big: {
        size: 40,
        color: "#751c75",
        font: "Noto Serif Japanese,serif"
    },

    small: {
        size: 30,
        color: "#252525",
        font: "Noto Serif Japanese,serif"
    },

    person: {
        size: 16,
        color: "#333333",
        font: "Noto Serif Japanese,serif"
    }
};

// ==============================
// キーワードのデータ
// ==============================

const keywords = [
    {
        id: "h-vrchat",
        name: "住むということ",
        x: 6,
        y: 9,
        url: "./vrchat.html",
        category: "big"
    },

    {
        id: "achievement",
        name: "大きな足跡",
        x: 62,
        y: 13,
        url: "./achievements.html",
        category: "big"
    },

    {
        id: "profile",
        name: "生きている証明",
        x: 57,
        y: 43,
        url: "./profile.html",
        category: "big"
    },

    {
        id: "haru-board",
        name: "HARUボード",
        x: 6,
        y: 60,
        url: "https://harunami-0819.booth.pm/items/7774956",
        category: "small"
    },

    {
        id: "booth",
        name: "小さなアイデア、物売り",
        x: 52,
        y: 32,
        url: "https://harunami-0819.booth.pm/",
        category: "big"
    },

    {
        id: "note",
        name: "文字で伝える、残す",
        x: 27,
        y: 12,
        url: "https://harunami-0819.booth.pm/",
        category: "big"
    },

    {
        id: "twitter-VR",
        name: "日常の記録、ぼやき",
        x: 20,
        y: 40,
        url: "https://x.com/Harunami_VRC",
        category: "small"
    },

    {
        id: "twitter-Re",
        name: "現実的な世界",
        x: 43,
        y: 4,
        url: "https://x.com/Harunami_0819",
        category: "small"
    }


];


// ==============================
// キーワード同士の関連
// ==============================

const connections = [
    ["h-vrchat", "twitter-VR"],
    ["h-vrchat", "profile"],
    ["twitter-Re", "twitter-VR"],
    ["twitter-Re", "profile"],
    ["profile", "twitter-VR"],
    ["achievement", "note"],
    ["haru-board", "achievement"],
    ["note", "twitter-VR"],
    ["h-vrchat", "note"],
    ["haru-board", "booth"],
];


// ==============================
// HTML要素を取得
// ==============================

const map = document.getElementById("map");
const keywordContainer = document.getElementById("keywords");
const svg = document.getElementById("connections");


// ==============================
// キーワードを生成
// ==============================

const elements = {};

keywords.forEach(keyword => {

    const element = document.createElement("a");

    element.className = "keyword";
    element.dataset.id = keyword.id;

    element.textContent = keyword.name;

    const style = categories[keyword.category];

    element.style.fontSize = `${style.size}px`;
    element.style.color = style.color;
    element.style.fontFamily = style.font;
    
    element.href = keyword.url;

    element.style.left = `${keyword.x}%`;
    element.style.top = `${keyword.y}%`;

//    element.style.fontSize = `${TEXT_SIZE}px`;
//    element.style.color = TEXT_COLOR;
//    element.style.fontFamily = TEXT_FONT;

    keywordContainer.appendChild(element);

    elements[keyword.id] = element;

});


// ==============================
// 線を生成
// ==============================

const lines = [];

connections.forEach(([from, to]) => {

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.classList.add("connection");

    line.dataset.from = from;
    line.dataset.to = to;

    svg.appendChild(line);

    lines.push(line);
});


// ==============================
// 線の位置を計算
// ==============================

function updateLines() {

    const mapRect = map.getBoundingClientRect();

    lines.forEach(line => {

        const from = elements[line.dataset.from];
        const to = elements[line.dataset.to];

        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();

        const x1 =
            fromRect.left +
            fromRect.width / 2 -
            mapRect.left;

        const y1 =
            fromRect.top +
            fromRect.height / 2 -
            mapRect.top;

        const x2 =
            toRect.left +
            toRect.width / 2 -
            mapRect.left;

        const y2 =
            toRect.top +
            toRect.height / 2 -
            mapRect.top;

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);

        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
    });
}


// ==============================
// ホバー処理
// ==============================

Object.values(elements).forEach(element => {

    element.addEventListener("mouseenter", () => {

        const id = element.dataset.id;

        lines.forEach(line => {

            if (
                line.dataset.from === id ||
                line.dataset.to === id
            ) {
                line.classList.add("active");
            }

        });
    });


    element.addEventListener("mouseleave", () => {

        lines.forEach(line => {
            line.classList.remove("active");
        });

    });

});


// ==============================
// 初期位置
// ==============================

updateLines();


// ==============================
// ウィンドウサイズ変更
// ==============================

window.addEventListener("resize", updateLines);

// ==============================
// 地図の移動・ズーム
// ==============================

let offsetX = 0;
let offsetY = 0;

let scale = 1;

let isDragging = false;

let startX = 0;
let startY = 0;

const world = document.getElementById("world");


// ------------------------------
// 地図を更新
// ------------------------------

function updateWorld() {

    world.style.transform =
        `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

}


// ------------------------------
// ドラッグ開始
// ------------------------------

map.addEventListener("pointerdown", (event) => {

    if (event.target.closest(".keyword")) {
        return;
    }

    isDragging = true;

    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;

    map.setPointerCapture(event.pointerId);

    // ヒントを消す
    mapHint.classList.add("hidden");
});



// ------------------------------
// ドラッグ中
// ------------------------------
map.addEventListener("pointermove", (event) => {


    if (!isDragging) return;

    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;

    // 地図の大きさ
    const worldWidth = MAP_WIDTH * scale;
    const worldHeight = MAP_HEIGHT * scale;

    // 表示領域の大きさ
    const mapWidth = map.clientWidth;
    const mapHeight = map.clientHeight;

    // 横方向の移動範囲
    const minX = mapWidth - worldWidth;
    const maxX = 0;

    // 縦方向の移動範囲
    const minY = mapHeight - worldHeight;
    const maxY = 0;

    // 範囲内に収める
    offsetX = Math.max(minX, Math.min(offsetX, maxX));
    offsetY = Math.max(minY, Math.min(offsetY, maxY));

    updateWorld();

});


// ------------------------------
// ドラッグ終了
// ------------------------------

map.addEventListener("pointerup", () => {
    isDragging = false;
});


// ------------------------------
// マウスホイールでズーム
// ------------------------------

//map.addEventListener("wheel", (event) => {
//
//    event.preventDefault();
//
//    if (event.deltaY < 0) {
//
//        scale *= ZOOM_SPEED;
//
//    } else {
//
//        scale /= ZOOM_SPEED;
//
//    }
//
    // ズームしすぎ防止
//    scale = Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM));
//
//    updateWorld();
//
//}, { passive: false });


// 初期状態
map.style.cursor = "grab";

updateWorld();