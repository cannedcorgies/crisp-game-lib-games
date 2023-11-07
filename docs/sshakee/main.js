title = "S SHAKE 2";

description = `
[Tap] Shake
`;

characters = [
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7,
};

/** @type {{pos: Vector, angle: number, height: number}[]} */
let grounds;
let heightRatio;
/** @type {{pos: Vector, vel: Vector, isOnGround: boolean, ticks: number}[]} */
let enemies;
let nextEnemyTicks;
let multiplier;

function update() {

//// START-UP

  if (!ticks) {   // happens once - is the set up

      // hills set-up
    let angle = 0;  // first part of mound is flat - is the hilltop

    grounds = times(22, (i) => {                      // how long the mound is
      angle += (PI * 4) / 20;                         // setting up angle for next piece
      return { pos: vec(i * 10), angle, height: 9 };  // but remember: all of this is data being stored in an array for now
    });

    heightRatio = 50;     // starting height


      // enemies set-up
    enemies = [];         // enemy bank
    nextEnemyTicks = 0;
    multiplier = 10;     // come back to it - might affect amount spawned

  }


  let scr = difficulty * 0.3;   // screen speed


//// BUTTON PRESSED

  if (input.isJustPressed) {    // height changed when pressed - will apply later

    play("jump");
    heightRatio = 3;
    multiplier = 1;             // ??

  }


//// HILL MORPH

  heightRatio += (1 - heightRatio) * 0.05;  // hill descent
  let maxY = 0;                             // hill top border

  grounds.forEach((g, i) => {       // for each hill...

    g.pos.x += scr;       // simulated movement - move hill right by screen scroll amount

    if (g.pos.x > 210) {    // if reached right border...

      g.pos.x -= 220;     // reset position to left border

      const ng = grounds[wrap(i + 1, 0, 22)];                 // basically, get next hill - if i+1 is 23, gets 0
      g.angle = ng.angle - ((PI * 4) / 20) * rnd(0.5, 1.5);   // set to match angle, with some randomness to the slope
      g.height = ng.height + rnds(1);                         // same-ish height as next hill, too
      g.height += (9 - g.height) * 0.05;                      // done to keep hills under thresh - so that they don't keep getting bigger forever

    }

    g.pos.y = sin(g.angle) * g.height;    // ahhh, so the position is the very top of the hill

    if (g.pos.y > maxY) {     // if the calculated height exceeds invisible ceiling...

      maxY = g.pos.y;           // set the top TO the invisible ceiling

    }

  });
  

//// HILLTOP GENERATION

  let pp;   // temp

  grounds.forEach((g) => {        // for each hill...

    g.pos.y = (g.pos.y - maxY) * heightRatio + 99;  // remember that the pos is the peak of the hill...
                                                        // scale the peak of hill to height ratio
    if (pp != null && pp.x < g.pos.x) {       // if saved hilltop exists AND if it's to the LEFT of current hilltop...
                                                  // i guess logic is that hills indexed lower are to the left
      line(pp, g.pos);    // draw line between saved hilltop and current one

    }

    pp = g.pos;   // save hilltop

  });

  // draw VERY FIRST hilltop
  const fp = grounds[0].pos;
  const lp = grounds[grounds.length - 1].pos;

  if (lp.x < fp.x) {
    line(lp, fp);     // draws VERY first line
  }


//// ENEMY GENERATION

  nextEnemyTicks--;   // decrease cooldown by one

  if (nextEnemyTicks < 0) {       // if cooldown depleted...

    enemies.push({                                                    // ..push a new enemy onto the bank
      pos: vec(203, 50),                                              //  ..at the far right side
      vel: vec(-rnd(1, sqrt(difficulty)) * 0.3 * sqrt(difficulty)),   //  .. with a random velocity based on curr difficulty - negative as to go left
      isOnGround: true,                                               //  .. with ground detection at true
      ticks: 0,                                                       //  ..  and with 0 ticks
    });

    nextEnemyTicks = rnd(120) / difficulty / difficulty;              // ..and set timer for next enemy to spawn

  }


//// ENEMY BEHAVIOR

  remove(enemies, (e) => {

    e.pos.add(e.vel);     // REMEMBER THIS FUNCTION FERNIE REMEMBERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
    e.ticks -= e.vel.x;   // ticks reduced based on movement left?

    color("transparent");

    //// BOUNCE

      //// IF ON GROUND
    if (e.isOnGround) {       // if grounded...

      if (input.isJustPressed) {        // if button pressed...

        let vy = 0;   // reset pseudo y velocity

        for (let i = 0; i < 99; i++) {        // somehow allows smooth launching

          e.pos.y--;    // reduce y pos by 1 - but what is the purpose? OH!! to get it off the ground for sure!
          vy--;         // y velocity also "reduced" by 1 - remember that the top is 0

          if (box(e.pos, 6).isColliding.rect.black) {   // first, creates box of size 6 around enemy - then, tests if it is colliding with a rect of color black

            e.vel.y = vy * sqrt(difficulty) * 0.3;   // how heavy they are
            e.isOnGround = false;                     // officially off the ground
            break;

          }
        }
      }

      if (box(e.pos, 6).isColliding.rect.black) {       // if grounded but no button pressed and also it's colliding with a hill

        for (let i = 0; i < 99; i++) {

          e.pos.y--;    // go up?

          if (!box(e.pos, 6).isColliding.rect.black) {        // until it's not colliding? i guess the rightmost slope of a hill does not count as collision <- WRONG ABOUT HILLS, FERN
            break;                                                // GAH, I GET IT! if it lifts up from the hill, you start descent!!
          }

        }

      } else {    // if grounded but not colliding with hill...

        for (let i = 0; i < 99; i++) {

          e.pos.y++;  // that is, if the thing starts to float, bring that twerp back DOWN

          if (box(e.pos, 6).isColliding.rect.black) {

            e.pos.y--;
            break;

          }

        }

      }

    } 

        // IF IN THE AIR

      else {

      e.vel.y += 0.03 * difficulty;   // change velocity! go UPPPPPPP

      if (box(e.pos, 6).isColliding.rect.black) {       // if touching hill...

        e.isOnGround = true;        // grounded
        e.vel.y = 0;                // y velocity back to 0

      } else if (e.vel.y > 0) {       // if velocity NOT at 0 (off the ground)...

        let ey = e.pos.y;       // saved y velocity

        for (let i = 0; i < 9; i++) {   // actually, im not sure what anything around this area does

          ey -= 3;    // go HIGHER

          if (box(e.pos.x, ey, 6).isColliding.rect.black) {       // back down on ground u_u

            e.pos.y = ey - 5;
            e.isOnGround = true;
            e.vel.y = 0;
            break;

          }

        }

      }

    }

  
  //// EFFECTS
    color("black");
    char(addWithCharCode("a", floor(e.ticks / 9) % 2), e.pos, {
      mirror: { x: -1 },
    });
    if (e.pos.y < -3) {
      play("coin");
      addScore(multiplier, e.pos.x, clamp(9 + multiplier * 3, 9, 60));
      multiplier++;
      return true;
    }
    if (e.pos.x < 3) {
      play("explosion");
      end();
    }
    return e.pos.y > 103;
  });
}
