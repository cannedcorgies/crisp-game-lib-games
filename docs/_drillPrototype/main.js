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
description = ` HOLD [ SPACE ] TO 

 DRILL UP IN SAND 

  OR DIVE DOWN IN AIR
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
    captureCanvasScale: 2,
    isReplayEnabled: true
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

/** @type {{pos: Vector, width: number, height: number, radius: number, type: number}[]} */
let floors;
let nextFloorDist;

let radians;
let angle;
let rotateRate;

let scr;
let speedBoost_max;
let speedBoos_rem
let level;
let intervalID;

let screenShake;
let screenShake_range;

let tip;

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

      { pos: vec(70, 100), width: 90, height: 90, radius: 0, type: 1},
      { pos: vec(170, 80), width: 130, height: 110, radius: 0, type: 1},
      { pos: vec(300, 80), width: 500, height: 110, radius: 0, type: 1},
      { pos: vec(800, 80), width: 400, height: 90, radius: 0, type: 1},
      { pos: vec(1200, 80), width: 300, height: 70, radius: 0, type: 1},
      { pos: vec(1500, 80), width: 275, height: 45, radius: 0, type: 1},
      { pos: vec(1650, 60), width: 50, height: 75, radius: 0, type: 1},
      { pos: vec(335 + 1470, 35), width: 90, height: 100, radius: 0, type: 1},
      { pos: vec(350 + 1470, 120), width: 90, height: 150, radius: 0, type: 1},
      { pos: vec(460 + 1470, 80), width: 120, height: 100, radius: 0, type: 1}

    ];

    nextFloorDist = 0;

    rotateRate = 0.05;

    scr = 1;
    speedBoost_max = 1;
    speedBoos_rem = 0;

    screenShake = vec(0, 0);
    screenShake_range = 1;

	}

  scr = (((2 - (abs(player.angle/100))) * (2 - (abs(player.angle/100)))) + (score/10000)) * .6;
  addScore(scr);

  //// FLOOOOOORS

  nextFloorDist -= scr;   // next floor cooldown reduced by movement left

  if (nextFloorDist < 0) {    // if cooldown through,

    const width = rnd(40, 150);                    // get semi random width
    const height = rnd(40, 100);
    const radius = Math.trunc(Math.random()*21) + 15;

    const type = Math.trunc(Math.random()*12) + 0;

    floors.push({                                 // and push a new floor with semi random width

      pos: vec(G.WIDTH + width + 1600, rndi(30, 90)),    // offset horizontally, random vertically
      width,
      height,
      radius,
      type
    });

    nextFloorDist += width + rnd(10, 30);         // cooldown based on the currently generated floor ( as to not overlap )

  }
  
  remove(floors, (f) => {
  
  ////MOVEMENT
    f.pos.x -= scr;         // move platform left'
    f.pos.add(screenShake);

    color("light_yellow");

    if (f.type <=8) {

      const c = box(f.pos, f.width, f.height).isColliding.rect;

    } else {
      const c = arc(f.pos, f.width/3, f.radius).isColliding.rect;
    }
    
    return f.pos.x < -f.width / 2;    // returns true if the position of platform is all the way to the left (past the screen border, even)

  });

  // Update for Star
  stars.forEach((s) => {
    
    //// MOVEMENT
      s.pos.x -= s.speed * scr;
      s.pos.add(screenShake);
      
      if (s.pos.x < 0) s.pos.x = G.WIDTH;
  
      color("yellow");
      
      if (box(s.pos, rnd(1,3)).isColliding.rect.light_yellow) {
  
        color ("light_yellow");
        particle(s.pos, 10, 0.2);
  
      }
  
    });

  ////  PHYSICS  ////
	
  // angle
	radians = (player.rotation - 1) * (Math.PI/2);
  angle = radians * 180/Math.PI;

  if (angle) {
    rotateRate *= abs(angle);
  }

  // PARTICLE angle

  player.angle = 90 - 90 * (2 - player.rotation);

  // dirt collision
  if (char("a", player.pos, {rotation: player.rotation}).isColliding.rect.light_yellow) {

    play("explosion");

    if (!enteredDirt_trigger) {   // on entering dirt...

      play("explosion");
      color ("yellow");
      particle(player.pos, 20, 2, radians + PI, 1);
      
      enteredDirt_trigger = true;

    }

    color ("yellow");
    particle(player.pos, 20, 0.5, radians);

    color ("light_yellow");
    particle(player.pos, 50, 1, radians);

    enteredDirt = true;

  } else {

    if (enteredDirt_trigger) {    // on exiting dirt...

      play("explosion");
      color ("yellow");
      particle(player.pos.x, player.pos.y, 100, 3, radians, 1);

      console.log("out " + player.angle);

    }

    enteredDirt = false;
    enteredDirt_trigger = false;

  }


  // input
  if (input.isPressed) {            // button pressed


    if (enteredDirt) {                // rotate up, if in dirt

      //play("laser");
      play("hit");
      
      screenShake = vec(rnd(-screenShake_range, screenShake_range), rnd(-screenShake_range, screenShake_range));
      screenShake.x *= 0.3;
      screenShake.y *= 0.3;

      player.rotation -= 0.03775;

    }

    else {    // rotate down if in air

      play("powerUp");
      color("light_red");
      particle(player.pos, 10, 1, radians);
      color("light_black");
      particle(player.pos, 50, 3, radians + PI, 1);
      color("red");
      particle(player.pos, 20, 0.5, radians + PI, 1);

      screenShake = vec(rnd(-screenShake_range, screenShake_range), rnd(-screenShake_range, screenShake_range));
      screenShake.x *= 4;
      screenShake.y *= 4;

      if (player.pos.x < G.WIDTH/3) {

        player.pos.x += 0.045 * (1 - abs(angle));
    
      }

      if (player.rotation < 1.8 ) {
        player.rotation += 0.02 * 2;
      }

    }

  } else {                          // rotate down

    screenShake = vec(0, 0);

    if (player.rotation < 1.8 ) {
      player.rotation += 0.02;
    }

  }

  if (input.isJustPressed) {

    if (angle < -20) {

      color ("light_red");
      particle(player.pos.x, player.pos.y, 50, 4, radians, 1);
      player.vel.y = (0.04 * angle * scr);
  
    } else if (angle > 45 && !enteredDirt){
  
      player.vel.y = (0.04 * angle * scr);
  
    }

  } else {
  
    player.vel.y = (0.04 * angle);

  }

////MOVEMENT
  player.pos.add(player.vel);
  player.pos.add(screenShake);
  console.log(radians);
  
  if (player.pos.x < G.WIDTH/3) {

    player.pos.x -= 0.0075 * (1 - abs(angle));

  }
	
	color ("black");
  char("a", player.pos, {rotation: player.rotation});

  if (player.pos.y > G.HEIGHT + 50 || player.pos.x < - 50) {

    window.clearInterval(intervalID);
  
    play("select")

    tip = Math.trunc(Math.random()*7) + 0;
    
    if (tip == 0) {

      text("try letting go of [space]", G.WIDTH/5, G.HEIGHT/2 + 50)
      text("    RIGHT before exiting sand!!", G.WIDTH/4, G.HEIGHT/2 + 60)

    } else if (tip == 1) {

      text("an alarm will sound when you're", G.WIDTH/5, G.HEIGHT/2 + 50)
      text("    nose diving!!", G.WIDTH/4, G.HEIGHT/2 + 60)

    } else if (tip == 2) {

      text("holding [space] in the air ", G.WIDTH/5, G.HEIGHT/2 + 50)
      text("      will", G.WIDTH/4, G.HEIGHT/2 + 60)
      text("  send you crashing!!", G.WIDTH/4, G.HEIGHT/2 + 70)

    } else if (tip == 3) {

      text("hold [space] while in yellow sand", G.WIDTH/5, G.HEIGHT/2 + 50)
      text("      to ascend!!", G.WIDTH/4, G.HEIGHT/2 + 60)

    } else if (tip == 4) {

      text("flying straight means you fly faster!", G.WIDTH/4, G.HEIGHT/2 + 50)

    } else if (tip == 5) {

      text("use momentum to", G.WIDTH/4, G.HEIGHT/2 + 50)
      text("    jump across large gaps!!", G.WIDTH/4, G.HEIGHT/2 + 60)

    } else if (tip == 6) {

      text("if the alarm is sounding,", G.WIDTH/4, G.HEIGHT/2 + 45)
      color("red");
      text("    LET GO OF [SPACE]!!", G.WIDTH/4, G.HEIGHT/2 + 55)

    }

    console.log(tip);
    end();

  }

}
