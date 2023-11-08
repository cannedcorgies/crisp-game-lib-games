////  NOTES ////
//
//  - accomplished feeling of flight via radians
//    - the rotation of the object converted to radians
//      via an offset
//    - this radians quantity is converted to degrees
//      via the conversion formula
//    - finally, the degrees multiply the speed factor
//      for final velocity

// The title of the game to be displayed on the title screen
title = "DRILLDRILLDRILL";

// The description, which is also displayed on the title screen
description = ` HOLD [ SPACE ] TO DRILL IN SAND OR DIVE IN AIR
`;

// The array of custom sprites
characters = [
`
   r
   r
  rrr
  rrr
 rrrrr
 rrrrr
rrrrrrr
rrrrrrr
`
];

// Game design variable container
const G = {
	WIDTH: 300,
	HEIGHT: 150,

  STAR_SPEED_MIN: 2,
	STAR_SPEED_MAX: 5,

};

// Game runtime options
// Refer to the official documentation for all available options
options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2
};

// JSDoc comments for typing
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector,
 * angle: number,
 * rotation: number
 * }} Player
 */

/**
 * @type { Player }
 */
let player;
let enteredDirt;
let enteredDirt_trigger;

/** @type {{pos: Vector, width: number, height: number}[]} */
let floors;
let nextFloorDist;

let radians;
let angle;
let rotateRate;

let scr;
let speedBoost_max;
let speedBoos_rem

// The game loop function
function update() {
    // The init function running at startup
	if (!ticks) {
    
    stars = times(20, () => {

      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);

      return {
        pos: vec(posX, posY),
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };

    });

    player = {

      pos: vec(G.WIDTH * 0.1, G.HEIGHT * 0.5),
      vel: vec(0, 0),
      angle: 0,
			rotation: 1

    };

    floors = [

      { pos: vec(70, 100), width: 90, height: 90},
      { pos: vec(150, 80), width: 90, height: 90},
      { pos: vec(340, 20), width: 90, height: 90}

    ];

    nextFloorDist = 0;

    rotateRate = 0.05;

    scr = 1;
    speedBoost_max = 1;
    speedBoos_rem = 0;

	}

  scr = (1 * ((2 - (abs(player.angle/100)))));
  addScore(scr);

  console.log("scr: " + scr);
  console.log("-- " + (10 - (abs(player.angle/10))));
  console.log("-- remaining: " + speedBoos_rem);

  // Update for Star
  stars.forEach((s) => {
    
    s.pos.x -= s.speed * scr;
    
    if (s.pos.x < 0) s.pos.x = G.WIDTH;

    color("light_black");
    box(s.pos, rnd(1,5));

  });

  //// FLOOOOOORS

  nextFloorDist -= scr;   // next floor cooldown reduced by movement left

  if (nextFloorDist < 0) {    // if cooldown through,

    const width = rnd(40, 150);                    // get semi random width
    const height = rnd(40, 100);

    floors.push({                                 // and push a new floor with semi random width

      pos: vec(G.WIDTH + width + 50, rndi(30, 90)),    // offset horizontally, random vertically
      width,
      height,
    });

    nextFloorDist += width + rnd(10, 30);         // cooldown based on the currently generated floor ( as to not overlap )

  }
  
  remove(floors, (f) => {

    f.pos.x -= scr;         // move platform left
    color("light_yellow");


    const c = box(f.pos, f.width, f.height).isColliding.rect;
    
    return f.pos.x < -f.width / 2;    // returns true if the position of platform is all the way to the left (past the screen border, even)

  });

  ////  PHYSICS  ////
	
  // angle
	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

  radians = (player.rotation - 1) * (Math.PI/2);
  angle = radians * 180/Math.PI;

  if (angle) {
    rotateRate *= abs(angle);
  }

  // PARTICLE angle

  player.angle = 90 - 90 * (2 - player.rotation);

  // dirt collision
  if (char("a", player.pos, {rotation: player.rotation}).isColliding.rect.light_yellow) {

    if (!enteredDirt_trigger) {

      // particle(m.pos, 1, m.speed, m.angle + PI, 1);
      color ("yellow");
      particle(player.pos, 20, 2, player.angle - 180, 1);
      
      enteredDirt_trigger = true;

    }

    color ("yellow");
    particle(player.pos, 20, 0.5, player.angle - 180, 1);

    color ("light_yellow");
    particle(player.pos, 50, 0.5, player.angle - 180, 1);

    enteredDirt = true;

  } else {

    if (enteredDirt_trigger) {

      color ("yellow");
      particle(player.pos.x, player.pos.y, 100, 3, player.angle, 1);

    }

    enteredDirt = false;
    enteredDirt_trigger = false;

  }


  // input
  if (input.isPressed) {            // rotate up

    if (enteredDirt) {
      
      if (player.rotation > 0.2) {
        player.rotation -= 0.02;
      }

    }

    else {

      if (player.rotation < 1.8 ) {
        player.rotation += 0.02 * 2;
      }

    }

  } else {                          // rotate down

    if (player.rotation < 1.8 ) {
      player.rotation += 0.02;
    }

  }

  if (input.isJustPressed) {

    //speedBoos_rem = speedBoost_max - 0.1;

    if (angle < -20) {
      player.vel.y = (0.04 * angle * scr);
  
    } else if (angle > 45 && !enteredDirt){
  
      player.vel.y = (0.04 * angle * scr);
  
    }

  } else {
  
    player.vel.y = (0.04 * angle);

  }

  speedBoos_rem *= Math.sin((speedBoos_rem * Math.PI) / 2)// MAYBE: 1 - Math.pow(1 - speedBoos_rem, 3);
  console.log(Math.sin((speedBoos_rem * Math.PI) / 2));
  /*if (speedBoos_rem < 0) {

    speedBoos_rem = 0;

  }*/


  // MOVE

  player.pos.add(player.vel);

  
	
	color ("black");
  char("a", player.pos, {rotation: player.rotation});

  if (player.pos.y > G.HEIGHT) {
  
    end();

  }

}