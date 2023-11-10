title = "-- ripple --";

description = ` 2 PLAYER - P1 CYAN, P2 YELLOW

- PRESS [SPACE] WHEN CIRCLES OVERLAP

    - YOUR TURN WHEN OUTER CIRCLE IS YOUR COLOR

  - FIRST PLAYER TO MISS LOSES

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
    captureCanvasScale: 2,
    isReplayEnabled: true
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
  console.log(firstHit);
  if (firstHit == 0){
    color("light_black");
  } else if (colorTick_prev == 1) {
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

  // attempted to press first chance
  if (input.isJustPressed) {

    // if two rings are colliding...
    if ( playerRing.radius > targetRing.radius * 0.75
      && playerRing.radius < targetRing.radius * 1.25) {

      particle(targetRing.pos, 1000, 5);  // JUICE

      resetCircle();                      // and reset circle

    } 
  
  }

  // attempted to press second chance
  if (input.isJustPressed) {

    // if two rings are colliding...
    if ( bloingRing.radius > targetRing.radius * 0.5
      && bloingRing.radius < targetRing.radius * 1.25) {

      particle(targetRing.pos, 1000, 5);  // JUICE

      resetCircle();                      // and reset circle

    } 
  
  }

  overlapJuice();

  arc(playerRing.pos, playerRing.radius, playerRing.thickness);

  // draw outer circle
  if (firstHit == 0){
    color("light_black");
  } else if (colorTick_prev == 1) {
    color("cyan");
  } else if (colorTick_prev == 0){
    color("yellow");
  }

  overlapJuice();

  arc(targetRing.pos, targetRing.radius, targetRing.thickness);

  // game over - you miss
  if (playerRing.radius <= 0) {

    if (colorTick) {

      color("yellow");
      text("YELLOW WINS!", vec(G.WIDTH/2 + 50, G.HEIGHT/2 + 20));

      arc(playerRing.pos, playerRing.radius, playerRing.thickness);
      arc(targetRing.pos, targetRing.radius, targetRing.thickness);
      arc(bloingRing.pos, bloingRing.radius, bloingRing.thickness);

    } else {

      color("cyan");
      text("CYAN WINS!", vec(G.WIDTH/2 + 50, G.HEIGHT/2 + 20));

      arc(playerRing.pos, playerRing.radius, playerRing.thickness);
      arc(targetRing.pos, targetRing.radius, targetRing.thickness);
      arc(bloingRing.pos, bloingRing.radius, bloingRing.thickness);

    }

    end();

  }

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

  addScore(1);

  if (hits >= 5 && level > 0.4) {

    hits = 0;
    level -= 0.1;

    console.log("FASTER");

  }

}

function overlapJuice() {

  if ( playerRing.radius > targetRing.radius * 0.75

    && playerRing.radius < targetRing.radius * 1.25) {
  
    if (colorTick) {
      color("cyan");
    } else {
      color("yellow");
    }
    
    text("[SPACE]", G.WIDTH/2 - 20, G.HEIGHT/2);
    
    color("light_red");
  
  } 
  
  if ( bloingRing.radius > targetRing.radius * 0.5
  
    && bloingRing.radius < targetRing.radius * 1.25) {
  
    color("light_red");
  
  } 

}
