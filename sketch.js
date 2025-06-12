let gamenameImg, playBtnImg;
let wardrobeBg;

let clothes = [
  "blackboots", "blackhoodie", "blackshoes", "blackskirt", "blacktop",
  "bluehoodie", "shorts", "dress", "furryboots", "jeans", "redshoes",
  "redskirt", "redtop", "sweatpants", "trousers", "whiteboots", "whitetop", "yellowshoes"
];

let wardrobeClothesImgs = {};
let bodyClothesImgs = {};
let commentImgs = {};

let scaleFactor = 500 / 1800; // scale from 1800 width to 500 width

let gameState = "start"; // 'start' or 'wardrobe'
let clothesWorn = {}; // track worn clothes
let commentsOnScreen = []; // {name, x, y} in scaled coords

function preload() {
  gamenameImg = loadImage("gamename.png");
  playBtnImg = loadImage("play.png");
  wardrobeBg = loadImage("WARDROBE.PNG");  // uppercase PNG here
  
  for (let c of clothes) {
    wardrobeClothesImgs[c] = loadImage(`1_${c}.PNG`);     // uppercase PNG extension
    bodyClothesImgs[c] = loadImage(`1B_${c}.PNG`);        // uppercase PNG extension
    commentImgs[c] = loadImage(`C_${c}.png`);             // lowercase png extension
  }
}

function setup() {
  createCanvas(700, 500);
  imageMode(CORNER);
  for (let c of clothes) {
    clothesWorn[c] = false;
  }
}

function draw() {
  background(220);
  scale(scaleFactor);
  
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "wardrobe") {
    drawWardrobeScreen();
  }
}

function drawStartScreen() {
  let gnX = (1800 - gamenameImg.width) / 2;
  let gnY = 300;
  image(gamenameImg, gnX, gnY);
  
  let pbX = (1800 - playBtnImg.width) / 2;
  let pbY = 1400;
  image(playBtnImg, pbX, pbY);
}

function drawWardrobeScreen() {
  image(wardrobeBg, 0, 0);
  
  for (let c of clothes) {
    image(wardrobeClothesImgs[c], 0, 0);
  }
  
  for (let c of clothes) {
    if (clothesWorn[c]) {
      image(bodyClothesImgs[c], 0, 0);
    }
  }
  
  resetMatrix();
  
  for (let i = 0; i < commentsOnScreen.length; i++) {
    let cmt = commentsOnScreen[i];
    let cmtImg = commentImgs[cmt.name];
    let w = cmtImg.width * scaleFactor;
    let h = cmtImg.height * scaleFactor;
    image(cmtImg, cmt.x, cmt.y + i * (h * 0.8), w, h);
  }
}

function mousePressed() {
  if (gameState === "start") {
    let mx = mouseX / scaleFactor;
    let my = mouseY / scaleFactor;
    
    let pbX = (1800 - playBtnImg.width) / 2;
    let pbY = 1400;
    let pbW = playBtnImg.width;
    let pbH = playBtnImg.height;
    
    if (mx > pbX && mx < pbX + pbW && my > pbY && my < pbY + pbH) {
      gameState = "wardrobe";
    }
  } else if (gameState === "wardrobe") {
    let mx = mouseX / scaleFactor;
    let my = mouseY / scaleFactor;
    
    for (let c of clothes) {
      if (isPixelOpaque(wardrobeClothesImgs[c], mx, my)) {
        clothesWorn[c] = true;
        
        let scaledX = mouseX + 5;
        let scaledY = mouseY + 5;
        commentsOnScreen.push({name: c, x: scaledX, y: scaledY});
        break;
      }
    }
  }
}

function isPixelOpaque(img, mx, my) {
  if (mx < 0 || my < 0 || mx >= img.width || my >= img.height) return false;
  
  img.loadPixels();
  let px = floor(mx);
  let py = floor(my);
  let idx = 4 * (py * img.width + px);
  let alpha = img.pixels[idx + 3];
  return alpha > 10;
}
