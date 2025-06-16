// === GLOBAL VARIABLES ===
let gameState = "start";
let scaleFactor = 700 / 2400;
let database;

let gamenameImg, playBtnImg, makeupBtnImg;
let wardrobeImg;
let clothes = [
  "blackboots", "blackhoodie", "blackshoes", "blackskirt", "blacktop",
  "bluehoodie", "shorts", "dress", "furryboots", "jeans",
  "redshoes", "redskirt", "redtop", "sweatpants", "trousers",
  "whiteboots", "whitetop", "yellowshoes"
];

let wardrobeItems = {};
let bodyItems = {};
let commentImgs = {};
let activeComments = [];

let selectedClothing = {
  top: null,
  bottom: null,
  shoes: null
};

let clothingCategories = {
  blacktop: "top", redtop: "top", whitetop: "top",
  blackhoodie: "top", bluehoodie: "top", dress: "top",
  blackskirt: "bottom", redskirt: "bottom", jeans: "bottom",
  shorts: "bottom", sweatpants: "bottom", trousers: "bottom",
  blackboots: "shoes", blackshoes: "shoes", redshoes: "shoes",
  whiteboots: "shoes", furryboots: "shoes", yellowshoes: "shoes"
};

// === LOAD IMAGES ===
function preload() {
  gamenameImg = loadImage("gamename.png");
  playBtnImg = loadImage("play.png");
  makeupBtnImg = loadImage("makeupbutton.png");
  wardrobeImg = loadImage("WARDROBE.PNG");

  for (let item of clothes) {
    wardrobeItems[item] = loadImage("1_" + item + ".PNG");
    bodyItems[item] = loadImage("1B_" + item + ".PNG");
    commentImgs[item] = loadImage("C_" + item + ".png");
  }
}

// === SETUP ===
function setup() {
  createCanvas(700, 500);
  imageMode(CORNER);
  noSmooth();

  if (typeof firebase !== "undefined" && !database) {
    database = firebase.database();
  }
}

// === DRAW ===
function draw() {
  background(230,140,180);
  push();
  scale(scaleFactor);

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "wardrobe") {
    drawWardrobeScreen();
  }

  pop();

  // === Draw comment bubbles following the mouse with fixed offsets ===
  for (let cmt of activeComments) {
    let img = commentImgs[cmt.name];
    if (img) {
      let displayWidth = img.width * 0.15;
      let displayHeight = img.height * 0.15;
      let cx = mouseX + cmt.dx;
      let cy = mouseY + cmt.dy;
      image(img, cx, cy, displayWidth, displayHeight);
    }
  }
}

// === START SCREEN ===
function drawStartScreen() {
  image(gamenameImg, 0, 0);
  image(playBtnImg, 0, 0);
}

// === WARDROBE SCREEN ===
function drawWardrobeScreen() {
  image(wardrobeImg, 0, 0);

  // ✅ NEW ORDER: shoes (bottom layer), then bottoms, then tops (top layer)
  if (selectedClothing["shoes"]) {
    image(bodyItems[selectedClothing["shoes"]], 0, 0);
  }

  if (selectedClothing["bottom"]) {
    image(bodyItems[selectedClothing["bottom"]], 0, 0);
  }

  if (selectedClothing["top"]) {
    image(bodyItems[selectedClothing["top"]], 0, 0);
  }

  // Draw wardrobe icons
  for (let item of clothes) {
    image(wardrobeItems[item], 0, 0);
  }

  image(makeupBtnImg, 0, 0);
}

// === CLICK HANDLING ===
function mousePressed() {
  let mx = mouseX / scaleFactor;
  let my = mouseY / scaleFactor;

  if (gameState === "start") {
    let pbX = 0, pbY = 0, pbW = playBtnImg.width, pbH = playBtnImg.height;
    if (mx >= pbX && mx <= pbX + pbW && my >= pbY && my <= pbY + pbH) {
      gameState = "wardrobe";
    }
  } else if (gameState === "wardrobe") {
    makeupBtnImg.loadPixels();
    let px = floor(mx);
    let py = floor(my);
    if (
      px >= 0 && px < makeupBtnImg.width &&
      py >= 0 && py < makeupBtnImg.height
    ) {
      let idx = 4 * (py * makeupBtnImg.width + px);
      let alpha = makeupBtnImg.pixels[idx + 3];
      if (alpha > 10) {
        if (typeof database !== 'undefined') {
          database.ref("arrays").set({
            selectedClothing: selectedClothing
          });
        }
        window.location.href = "https://klaronator.github.io/GSWM2/"; 
        return;
      }
    }

    for (let item of clothes) {
      let img = wardrobeItems[item];
      if (!img) continue;

      if (mx >= 0 && mx < img.width && my >= 0 && my < img.height) {
        img.loadPixels();
        let px = floor(mx);
        let py = floor(my);
        let idx = 4 * (py * img.width + px);
        let alpha = img.pixels[idx + 3];

        if (alpha > 10) {
          let cat = clothingCategories[item];
          if (!cat) continue;

          if (selectedClothing[cat] === item) {
            selectedClothing[cat] = null;
          } else {
            selectedClothing[cat] = item;
          }

          // Random offset around mouse in all directions
          let angle = random(TWO_PI);
          let radius = random(60, 120);
          let dx = cos(angle) * radius;
          let dy = sin(angle) * radius;

          activeComments.push({
            name: item,
            dx: dx,
            dy: dy
          });

          break;
        }
      }
    }
  }
}
