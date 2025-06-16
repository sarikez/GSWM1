// --- VARIABLES ---
let clothingImg;
let shoesImg;
let eyeshadowImg, hairImg, lipsImg;
let finalLookImg, finishBtnImg, restartBtnImg;

let dataLoaded = false;
let imagesToLoad = 0;

const SCALE = 500 / 1800;
const CENTER_X = 700 / 2;
const CENTER_Y = 500 / 2;

let showFinishBtn = false;
let showRestartBtn = false;

let glitchActive = false;
let glitchStartTime = 0;
let glitchDuration = 800;

const glitchSquareSize = 15;
let glitchGrid = [];
let revealedSquares = 0;

let notifImg;
let fullEmailImg;
let againImg, closeImg;

let state = "finalLook";

function preload() {
  finalLookImg = loadImage("FINALLOOK.PNG");
  finishBtnImg = loadImage("C_letsgotouni.png");
  restartBtnImg = loadImage("B_letsgotouni.png");

  notifImg = loadImage("E_notification1.png");
  fullEmailImg = loadImage("E_full.png");
  againImg = loadImage("again.png");
  closeImg = loadImage("close.png");
}

function setup() {
  createCanvas(700, 500);
  imageMode(CENTER);

  if (state === "finalLook") {
    fetchUserChoices();

    let cols = ceil(width / glitchSquareSize);
    let rows = ceil(height / glitchSquareSize);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        glitchGrid.push({ x: x * glitchSquareSize, y: y * glitchSquareSize });
      }
    }
    shuffle(glitchGrid, true);

    setTimeout(() => { showFinishBtn = true; }, 2000);
    setTimeout(() => { showRestartBtn = true; }, 4000);
  }
}

function fetchUserChoices() {
  const userId = "user123";

  db.ref("/").once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      const top = data.arrays?.selectedClothing?.top;
      const shoes = data.arrays?.selectedClothing?.shoes;
      const eyeshadow = data.makeupChoices?.eyeshadow;
      const hair = data.makeupChoices?.hair;
      const lips = data.makeupChoices?.lips;

      if (top) loadAndCount(`1B_${top}.PNG`, img => clothingImg = img);
      if (shoes) loadAndCount(`1B_${shoes}.PNG`, img => shoesImg = img);
      if (eyeshadow) loadAndCount(`3_${eyeshadow}ES.PNG`, img => eyeshadowImg = img);
      if (hair) loadAndCount(`3_${hair}.PNG`, img => hairImg = img);
      if (lips) loadAndCount(`3_${lips}lips.PNG`, img => lipsImg = img);
    });
}

function loadAndCount(path, assignCallback) {
  imagesToLoad++;
  loadImage(path, img => {
    assignCallback(img);
    imagesToLoad--;
    if (imagesToLoad === 0) dataLoaded = true;
  }, err => {
    imagesToLoad--;
    if (imagesToLoad === 0) dataLoaded = true;
  });
}

function draw() {
  if (state === "finalLook") {
    drawFinalLook();
  } else if (state === "notification") {
    drawNotification();
  } else if (state === "email") {
    drawEmail();
  } else if (state === "options") {
    drawOptions();
  }
}

function drawFinalLook() {
  background("#FFC0EC");

  if (!dataLoaded) {
    fill(50);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Loading final look...", CENTER_X, CENTER_Y);
    return;
  }

  drawScaledImage(finalLookImg);
  if (clothingImg) drawScaledImage(clothingImg);
  if (shoesImg) drawScaledImage(shoesImg);
  if (eyeshadowImg) drawScaledImage(eyeshadowImg);
  if (hairImg) drawScaledImage(hairImg);
  if (lipsImg) drawScaledImage(lipsImg);
  if (showRestartBtn && restartBtnImg) drawScaledImage(restartBtnImg);
  if (showFinishBtn && finishBtnImg) drawScaledImage(finishBtnImg);

  if (glitchActive) drawGlitch();
}

function drawScaledImage(img) {
  imageMode(CENTER);
  image(img, CENTER_X, CENTER_Y, img.width * SCALE, img.height * SCALE);
  imageMode(CORNER);
}

function drawGlitch() {
  let elapsed = millis() - glitchStartTime;
  let progress = constrain(elapsed / glitchDuration, 0, 1);
  let totalSquares = glitchGrid.length;
  revealedSquares = floor(progress * totalSquares);

  fill(0);
  noStroke();
  for (let i = 0; i < revealedSquares; i++) {
    let sq = glitchGrid[i];
    rect(sq.x, sq.y, glitchSquareSize, glitchSquareSize);
  }

  if (progress >= 1) {
    fill(0);
    rect(0, 0, width, height);
    if (state === "finalLook") {
      state = "notification";
    }
  }
}

function drawNotification() {
  background(0);
  imageMode(CENTER);
  let scaleFactor = min(width / notifImg.width, height / notifImg.height);
  image(notifImg, width / 2, height / 2, notifImg.width * scaleFactor, notifImg.height * scaleFactor);
}

function drawEmail() {
  background(0);
  imageMode(CENTER);
  let scaleFactor = min(width / fullEmailImg.width, height / fullEmailImg.height);
  image(fullEmailImg, width / 2, height / 2, fullEmailImg.width * scaleFactor, fullEmailImg.height * scaleFactor);
}

function drawOptions() {
  background("#FFC0EC");
  if (againImg) drawScaledImage(againImg);
  if (closeImg) drawScaledImage(closeImg);
}

function mousePressed() {
  if (state === "finalLook") {
    if (showRestartBtn && restartBtnImg) {
      let btnW = restartBtnImg.width * SCALE;
      let btnH = restartBtnImg.height * SCALE;
      let btnX = CENTER_X - btnW / 2;
      let btnY = CENTER_Y - btnH / 2;

      let relativeX = floor((mouseX - btnX) / SCALE);
      let relativeY = floor((mouseY - btnY) / SCALE);

      restartBtnImg.loadPixels();
      let idx = 4 * (relativeY * restartBtnImg.width + relativeX);
      let alpha = restartBtnImg.pixels[idx + 3];

      if (alpha > 0) {
        glitchActive = true;
        glitchStartTime = millis();
        revealedSquares = 0;
        shuffle(glitchGrid, true);
      }
    }
  } else if (state === "notification") {
    let scaleFactor = min(width / notifImg.width, height / notifImg.height);
    let imgW = notifImg.width * scaleFactor;
    let imgH = notifImg.height * scaleFactor;
    let imgX = width / 2 - imgW / 2;
    let imgY = height / 2 - imgH / 2;

    if (mouseX >= imgX && mouseX <= imgX + imgW && mouseY >= imgY && mouseY <= imgY + imgH) {
      let relX = floor((mouseX - imgX) / scaleFactor);
      let relY = floor((mouseY - imgY) / scaleFactor);

      notifImg.loadPixels();
      let idx = 4 * (relY * notifImg.width + relX);
      let alpha = notifImg.pixels[idx + 3];

      if (alpha > 0) {
        state = "email";
      }
    }
  } else if (state === "email") {
    state = "options";
  } else if (state === "options") {
    // Again button
    if (againImg) {
      let w = againImg.width * SCALE;
      let h = againImg.height * SCALE;
      let x = CENTER_X - w / 2;
      let y = CENTER_Y - h / 2;
      let relX = floor((mouseX - x) / SCALE);
      let relY = floor((mouseY - y) / SCALE);
      if (relX >= 0 && relX < againImg.width && relY >= 0 && relY < againImg.height) {
        againImg.loadPixels();
        let idx = 4 * (relY * againImg.width + relX);
        let alpha = againImg.pixels[idx + 3];
        if (alpha > 0) {
          window.location.href = "sketch.js"; // Change as needed
        }
      }
    }

    // Close button
    if (closeImg) {
      let w = closeImg.width * SCALE;
      let h = closeImg.height * SCALE;
      let x = CENTER_X - w / 2;
      let y = CENTER_Y - h / 2;
      let relX = floor((mouseX - x) / SCALE);
      let relY = floor((mouseY - y) / SCALE);
      if (relX >= 0 && relX < closeImg.width && relY >= 0 && relY < closeImg.height) {
        closeImg.loadPixels();
        let idx = 4 * (relY * closeImg.width + relX);
        let alpha = closeImg.pixels[idx + 3];
        if (alpha > 0) {
          window.location.href = "https://your-final-page.com"; // Change as needed
        }
      }
    }
  }
}
