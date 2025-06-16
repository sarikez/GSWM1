let bg;
let hairOptions = {};
let eyeshadowOptions = {};
let lipsOptions = {};

let hairOverlays = {};
let eyeshadowOverlays = {};
let lipsOverlays = {};

let selectedHair = null;
let selectedEyeshadow = null;
let selectedLips = null;

let showTimer = false;
let timerStarted = false;
let timerDuration = 0;
let timerStartTime = 0;

let clickableImages = [];

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

let timerX = 0;
let timerY = 0;
let lastMoveTime = 0;
let moveInterval = 200;
let lastSecondDisplayed = null;

function preload() {
  bg = loadImage("2FACE.PNG");

  hairOptions = {
    black: loadImage("2_black.PNG"),
    blonde: loadImage("2_blonde.PNG"),
    brown: loadImage("2_brown.PNG"),
    red: loadImage("2_red.PNG")
  };
  hairOverlays = {
    black: loadImage("2F_black.PNG"),
    blonde: loadImage("2F_blonde.PNG"),
    brown: loadImage("2F_brown.PNG"),
    red: loadImage("2F_red.PNG")
  };

  eyeshadowOptions = {
    black: loadImage("2_blackES.PNG"),
    purple: loadImage("2_purpleES.PNG"),
    orange: loadImage("2_orangeES.PNG"),
    pink: loadImage("2_pinkES.PNG")
  };
  eyeshadowOverlays = {
    black: loadImage("2F_blackES.PNG"),
    purple: loadImage("2F_purpleES.PNG"),
    orange: loadImage("2F_orangeES.PNG"),
    pink: loadImage("2F_pinkES.PNG")
  };

  lipsOptions = {
    brown: loadImage("2_brownlips.PNG"),
    pink: loadImage("2_pinklips.PNG"),
    red: loadImage("2_redlips.PNG"),
    orange: loadImage("2_orangelips.PNG")
  };
  lipsOverlays = {
    brown: loadImage("2F_brownlips.PNG"),
    pink: loadImage("2F_pinklips.PNG"),
    red: loadImage("2F_redlips.PNG"),
    orange: loadImage("2F_orangelips.PNG")
  };
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  pixelDensity(1);

  for (let key in hairOptions) clickableImages.push({ img: hairOptions[key], key, type: 'hair' });
  for (let key in eyeshadowOptions) clickableImages.push({ img: eyeshadowOptions[key], key, type: 'eyeshadow' });
  for (let key in lipsOptions) clickableImages.push({ img: lipsOptions[key], key, type: 'lips' });
}

function draw() {
  background(255);
  image(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let item of clickableImages) {
    image(item.img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  if (selectedHair) image(hairOverlays[selectedHair], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (selectedEyeshadow) image(eyeshadowOverlays[selectedEyeshadow], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (selectedLips) image(lipsOverlays[selectedLips], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  stroke(0);
  noFill();
  rect(0, 0, width - 1, height - 1);

  if (showTimer && timerStarted) {
    let elapsed = millis() - timerStartTime;
    let remaining = max(0, timerDuration - elapsed);
    let secondsLeft = ceil(remaining / 1000);

    if (millis() - lastMoveTime > moveInterval) {
      timerX = random(60, width - 60);
      timerY = random(60, height - 60);
      lastMoveTime = millis();
    }

    fill(255, 255, 0);
    noStroke();
    textSize(120);
    textAlign(CENTER, CENTER);
    text(secondsLeft + 's', timerX, timerY);

    if (remaining <= 0) {
      timerStarted = false;

      // ✅ REDIRECT TO FINAL.JS
      window.location.href = "final.js";
    }
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height) return;

  loadPixels();

  for (let item of clickableImages) {
    let x = int(map(mouseX, 0, CANVAS_WIDTH, 0, item.img.width));
    let y = int(map(mouseY, 0, CANVAS_HEIGHT, 0, item.img.height));

    if (x < 0 || x >= item.img.width || y < 0 || y >= item.img.height) continue;

    let px = item.img.get(x, y);
    if (px && px[3] > 5) {
      if (item.type === 'hair') selectedHair = item.key;
      else if (item.type === 'eyeshadow') selectedEyeshadow = item.key;
      else if (item.type === 'lips') selectedLips = item.key;

      if (typeof database !== 'undefined') {
        database.ref("makeupChoices").set({
          hair: selectedHair,
          eyeshadow: selectedEyeshadow,
          lips: selectedLips
        });
      }

      startTimer();
      break;
    }
  }
}

function startTimer() {
  if (!timerStarted) {
    timerDuration = int(random(10000, 20000));
    timerStartTime = millis();
    timerStarted = true;
    showTimer = true;
    lastMoveTime = 0;
  }
}
