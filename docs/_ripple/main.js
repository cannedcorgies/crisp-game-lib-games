title = "ripple prototype";

description = `
`;

characters = [];

// Game design variable container
const G = {

	WIDTH: 300,
	HEIGHT: 150,

};

options = {
  theme: "dark",
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2
};

// radius?: number, thickness?: number, angleFrom?: number, angleTo?: number)

/**
 * @typedef {{
* pos: Vector,
* radius: number,
* thickness: number
* }} ARC
*/

/**
* @type { ARC }
*/
let playerRing;
let targetRing;
let bloingRing;

let defSize;
let defSize_inner;
let defSize_bloing;
let maxSize_bloing

let savedTime;
let colorTick;
let colorTick_prev;
let colorPick;

let level;
let hits;
let level_time;
let firstHit;

function update() {

  if (!ticks) {

    defSize = 1.5 * G.HEIGHT;
    defSize_inner = defSize * 0.15;
    defSize_bloing = defSize_inner * 0.5;
    maxSize_bloing = defSize * 2;
    savedTime = ticks;

    level = 1;
    firstHit = 0;
    hits = 0;

    playerRing = {

      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      radius: defSize,
      thickness: 5

    };

    targetRing = {

      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      radius: defSize_inner,
      thickness: 10

    };

    bloingRing = {

      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      radius: maxSize_bloing,
      thickness: 3

    };

  }

  level_time = 60 * level;

//// INNER RING

  // color inner ring based on previous color
  if (colorTick_prev == 1) {
    color("cyan");
  } else if (colorTick_prev == 0){
    color("yellow");
  }

  // interpolate to small size
  targetRing.radius = defSize_inner + (defSize_inner * ((1 - Math.sin(((ticks - savedTime)/level_time * Math.PI) / 2)))) * 0.1;
  
  arc(targetRing.pos, targetRing.radius, targetRing.thickness);


//// BLOING RING

  // interpolate to small size
  bloingRing.radius = defSize_bloing + (maxSize_bloing * (Math.sin(((ticks - savedTime)/level_time * Math.PI) / 4)));
  
  if (firstHit) { arc(bloingRing.pos, bloingRing.radius, bloingRing.thickness); }

//// PLAYER RING

  // color outer ring
  if (colorTick) {
    color("cyan");
  } else {
    color("yellow");
  }

  // interpolate to small size
  playerRing.radius = defSize * ((1 - Math.sin(((ticks - savedTime)/level_time * Math.PI) / 8)));

  // game over - you miss
  if (playerRing.radius <= 0) {

    end();

  }

  // attempted to press
  if (input.isJustPressed) {

    // console.log("PRESSED");
    
    // if two rings are colliding...
    if ( playerRing.radius > targetRing.radius * 0.75
      && playerRing.radius < targetRing.radius * 1.25) {

      particle(targetRing.pos, 1000, 5);  // JUICE

      resetCircle();                      // and reset circle

    } else {

      color("light_red");

    }

  }

  // draw outer circle
  arc(playerRing.pos, playerRing.radius, playerRing.thickness);

}

function resetCircle() {

  // console.log("RESET");

  playerRing.radius = defSize;

  savedTime = ticks;
  colorTick_prev = colorTick;
  colorTick = Math.floor(Math.random() * (1 - 0 + 1));

  bloingRing.radius = defSize_bloing;

  firstHit ++;
  hits ++;

  if (hits >= 5 && level > 0.4) {

    hits = 0;
    level -= 0.1;

    console.log("FASTER");

  }

}