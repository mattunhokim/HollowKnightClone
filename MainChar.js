class MainChar {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        this.game.MainChar = this;

        // Sprite Sheet
        //	this.spritesheet = ASSET_MANAGER.getAsset("./movement1.png");
        //	this.idle = ASSET_MANAGER.getAsset("./movement1.png");
        this.spritesheet = ASSET_MANAGER.getAsset("./knight.webp");
        this.idle = ASSET_MANAGER.getAsset("./knight.webp");
        //, 0, 0, 80, 90, 9, .2);

        // Main Char State
        this.facing = 0; // 0 = right, 1 = left
        this.state = 0; // 0 = idle, 1 = walking, 2 = running, 3 = jumping, 4 = falling, 5 = attacking, 6 = healing
        this.dead = false;
        this.height = 80*.5;
        this.width = 80*.5;

        this.velocity = { x: 0, y: 0 };
        this.fallAcc = 400;
        this.speed = 200;
        this.updateBB();
        this.win = false;
        this.lose = false;
        this.animator = [];
        this.loadAnimations();
        this.lastAttack = 0;
        this.canAttack = true;

    };
    // Matrix to store animations
    loadAnimations() { // not implemented yet
        // [state][facing]
        // state = standing = 0, walking = 1, running = 2 jumping = 3, etc.
        // size = version
        // direction 0 = right
        // this.animator[this.state][this.facing] = new Animator(this.spritesheet, this.x, this.y, this.height, this.width, 9, .2, 14, this.reverse, this.loop);

        // for loop goes here
        for (var i = 0; i < 6; i++) { // five states
            this.animator.push([i]);
            for (var j = 0; j < 2; j++) { // two directions
                this.animator[i].push([j]);
            }
        }

        //testing walking right

        // Facing right idle
        this.animator[0][0] = new Animator(this.spritesheet, 1024, 639, 80, 80, 1, 1, true, false);
        
        // Facing left idle
        this.animator[0][1] = new Animator(this.spritesheet, 1024, 639, -80, 80, 1, 1, true, true);

        //walking to the right
        this.animator[1][0] = new Animator(this.spritesheet, 1024, 0, 80, 80, 9, .1, true, false);

        //walking to the left
        this.animator[1][1] = new Animator(this.spritesheet, 1024, 0, -80, 80, 9, .1, true, true);

        // running to the right 
        this.animator[2][0] = new Animator(this.spritesheet, 1024, 320, 80, 80, 6, .1, true, false);
        
        // running to the left 
        this.animator[2][1] = new Animator(this.spritesheet, 1024, 320, -80, 80, 6, .1, true, true);

        // jumping to the right 
        this.animator[3][0] = new Animator(this.spritesheet, 1105, 716, 80, 80, 5, 1, true, false);
        
        // jumping to the left 
        this.animator[3][1] = new Animator(this.spritesheet, 1105, 716, -80, 80, 5, 1, true, true);

        // falling to the right 
        this.animator[4][0] = new Animator(this.spritesheet, 1745, 716, 80, 80, 3, .1, true, false);
        
        // falling to the left 
        this.animator[4][1] = new Animator(this.spritesheet, 1745, 716, -80, 80, 3, .1, true, true);

        // attacking to the right 
        this.animator[5][0] = new Animator(this.spritesheet, 1570, 320, 80, 80, 5, .1, true, false);
        
        // attacking to the left 
        this.animator[5][1] = new Animator(this.spritesheet, 1570, 320, -80, 80, 5, .1, true, true);






        //test jumping
        //    this.animator[2][0] = new Animator(this.spritesheet, 1024, 721, 80, 90, 9, .2, 14, false, true);
        //	this.animator[2][1] = new Animator(this.spritesheet, 1024, 721, 80, 90, 9, .2, 14, true, true);

        //test falling
        //this.animator[4][0] = new Animator(this.spritesheet, 1744, 721, -80, 80, 11, .1, false, true);
        //this.animator[4][1] = new Animator(this.spritesheet, 304, 721, -80, 80, 11, .1, true, true);

        //test attacking
        //	this.animator[4][0] = new Animator(this.spritesheet, 1024, 320, 80, 90, 9, .2, 14, false, true);
        //	this.animator[4][1] = new Animator(this.spritesheet, 1024, 320, 80, 90, 9, .2, 14, true, true);

        //test healing
        //  this.animator[5][0] = new Animator(this.spritesheet, 1264, 240, 80, 90, 9, .2, 14, false, true);
        //	this.animator[5][1] = new Animator(this.spritesheet, 784, 240, 80, 90, 9, .2, 14, true, true);


        //death animation
        this.deadAnim = new Animator(this.spritesheet, 1583, 640, 80, 90, 9, .2, 14, false, true);
    };

    updateBB() {
        if (this.facing === 0) {
            this.BB = new BoundingBox(this.x+10, this.y+10, this.width-20, this.height-10);
        } else {
            // Adjust bounding box position for left-facing character
            this.BB = new BoundingBox(this.x - this.width + 10, this.y+10, this.width-20, this.height-10);
        }    };

    updateLastBB() {
        this.lastBB = this.BB;
    };

    die() {
        this.dead = true;
    }

    update() { // must fix
        var TICK = this.game.clockTick;
        console.log("Clock tick:", TICK);
        const MIN_WALK = 5.453125*2;
        const MAX_WALK = 13.75*2;

        const MAX_RUN = 50.75*3;
        
        const ACC_WALK = 50.59375;
        const ACC_RUN = 100.390625;
        
        const DEC_REL = 182.8125;
        const DEC_SKID = 365.625;
        const MAX_FALL = 210;

        const PUSH_BACK = .31;



        this.attack = 0;
        if(this.attack > 1){
            this.canAttack = false;
        }
        if(this.game.attack && !this.game.run){
            this.velocity.x = 0;
            this.lastAttack += TICK;
            this.state = 5;
          if(this.facing === 0){
              if(this.velocity.x === 0){
                   this.x = this.x - PUSH_BACK;
                   
                }
            }
          else{
                if(this.velocity.x === 0){
                  this.x = this.x + PUSH_BACK;
              }
          }
        }         
        // Need to detect state and current user input
        // Ground physics
        // Jump Physics 
        // Not jumping  
        if (this.state !== 3){ // 0 = idle, 1 = walking, 2 = running, 3 = jumping, 4 = falling, 5 = attacking, 6 = healing
            if (Math.abs(this.velocity.x) < MIN_WALK) {  // idle
                this.velocity.x = 0;
                this.state = 0;
                if (this.game.left) {
                    this.velocity.x -= MIN_WALK;
                }
                if (this.game.right) {
                    this.velocity.x += MIN_WALK;
                }
            }
            else if (Math.abs(this.velocity.x) >= MIN_WALK) {  // faster than a walk // accelerating or decelerating
                if (this.facing === 0) {
                    if (this.game.right && !this.game.left) {
                        if (this.game.run) {
                            this.velocity.x += ACC_RUN * TICK;
                        } else {
                            this.velocity.x += ACC_WALK * TICK;
                        }
                    } else if (this.game.left && !this.game.right) {
                        this.velocity.x -= DEC_SKID * TICK;
                    } else {
                        this.velocity.x -= DEC_REL * TICK;
                    }
                }
                if (this.facing === 1) {
                    if (this.game.left && !this.game.right) {
                        if (this.game.run) {
                            this.velocity.x -= ACC_RUN * TICK;
                        } else {
                            this.velocity.x -= ACC_WALK * TICK;
                        }
                    } else if (this.game.right && !this.game.left) {
                        this.velocity.x += DEC_SKID * TICK;
                    } else {
                        this.velocity.x += DEC_REL * TICK;
                    }
                }
            } 
            this.velocity.y += this.fallAcc * TICK; // Apply gravity in the opposite direction to simulate falling back down

            ///Jumping physics<
            
            if (this.state !== 3 && this.velocity.y < 210 ) { // Not already jumping
                if (this.game.jump) {
                    // Check if conditions for initiating a jump are met
                    this.velocity.y = -220; // Adjust jump velocity
                    //this.fallAcc === STOP_FALL;
                    this.state = 3; // Set character state to jumping
                    if(this.velocity.x > 0){
                        this.facing = 0;
                    }
                    if(this.velocity.x < 0){
                        this.facing = 1;
                    }
                    this.velocity.y += this.fallAcc * TICK; // Apply gravity in the opposite direction to simulate falling back down
                }
            }
            //else {
            // // horizontal physics
            //if (this.game.right && !this.game.left) {
            //    if (Math.abs(this.velocity.x) > MAX_WALK) {
            //    this.velocity.x += ACC_RUN * TICK;
            //    } 
            //    else this.velocity.x += ACC_WALK * TICK;
            //    } 
            //    else if (this.game.left && !this.game.right) {
            //        if (Math.abs(this.velocity.x) > MAX_WALK) {
            //        this.velocity.x -= ACC_RUN * TICK;
            //    } 
            //    else this.velocity.x -= ACC_WALK * TICK;
            //    } 
            //    else {
            //    // do nothing
            //    }
            //    // air physics
            //    // vertical physics
            //if (this.velocity.y > 0 && this.game.A) { // holding A while jumping jumps higher
            //    if (this.fallAcc === STOP_FALL) this.velocity.y -= 1;
            //}
                  
               //}
        }
    this.velocity.y += this.fallAcc * TICK; // Apply gravity in the opposite direction to simulate falling back down
    // max speed calculation
    // -210 >= -210 this.velocity.y = 210 // go up
    // -210 <= -210 this.velocity.y = -210 // go down
    if (this.velocity.y >= MAX_FALL) this.velocity.y = MAX_FALL;
    if (this.velocity.y <= -MAX_FALL) this.velocity.y = -MAX_FALL;   
    
    if (this.velocity.x >= MAX_RUN) this.velocity.x = MAX_RUN;
    if (this.velocity.x <= -MAX_RUN) this.velocity.x = -MAX_RUN;
    if (this.velocity.x >= MAX_WALK && !this.game.run) this.velocity.x = MAX_WALK;
    if (this.velocity.x <= -MAX_WALK && !this.game.run) this.velocity.x = -MAX_WALK;
    console.log("Fall Acceleration:", this.fallAcc);
    console.log("Y Velocity:", this.velocity.y);

















    
    // update position
    this.x += this.velocity.x * TICK * PARAMS.SCALE;
    this.y += this.velocity.y * TICK * PARAMS.SCALE;
    this.updateLastBB();
    this.updateBB();

















    //collision detection
    var that = this;
    this.game.entities.forEach(function (entity) {
        if (entity != that && entity.BB && that.BB.collide(entity.BB))  {
            if (that.velocity.y > 0) { // falling
                if ((entity instanceof borders) && (that.lastBB.bottom <= entity.BB.top)) { // was above last tick
                        that.y = entity.BB.top - 80*.5;
                        that.velocity.y = 0;
                        if(that.state === 3)that.state = 0;
                    that.updateBB();
                }
                if ((entity instanceof spikes) && (that.lastBB.bottom <= entity.BB.top)) {
                    that.lose = true;
                    that.dead = true;
                }
                //if ((entity instanceof Dragon) && (that.lastBB.bottom <= entity.BB.top)) {
                //    that.lose = true;
                //    that.dead = true;
                //}
                if ((entity instanceof goal) && (that.lastBB.bottom <= entity.BB.top)) { 
                    that.win = true;
                }// was above last tick

            }
            else if (that.velocity.y < 0){ // jumping
                if ((entity instanceof borders) || (entity instanceof spikes) && (that.lastBB.top >= entity.BB.bottom)) { // was above last tick
                    that.velocity.y = 300;
                    that.state = 0;
                    that.updateBB();
                }
            }
            if(that.facing === 0){
                    if ((entity instanceof borders) && (that.lastBB.right <= entity.BB.left)) { 
                        that.x = entity.BB.left - 85*.5;
                        that.updateBB();
                    }
                    else if ((entity instanceof borders) && (that.lastBB.left >= entity.BB.right)) {
                        that.x = entity.BB.right;
                        that.updateBB();
                    }
                    
                    if ((entity instanceof goal) && (that.lastBB.right <= entity.BB.left)) { 
                        that.win = true;
                    }
                    else if ((entity instanceof goal) && (that.lastBB.left >= entity.BB.right)) { 
                        that.win = true;
                    }
            }
            if(that.facing === 1){
                    if ((entity instanceof borders) && (that.lastBB.left >= entity.BB.right)) { 
                        that.x = entity.BB.right + 85*.5;
                        that.velocity.x = 0;
                        that.updateBB();

                    }
                    else if ((entity instanceof borders) && (that.lastBB.right <= entity.BB.left)) {
                        that.x = entity.BB.left;
                        that.updateBB();

                    }

                    //if ((entity instanceof Dragon) && (that.lastBB.right <= entity.BB.left)) {
                    //   that.win = false;
                    //   that.dead = true;
                    //}
                    //else if ((entity instanceof Dragon) && (that.lastBB.left >= entity.BB.right)) {
                    //   that.win = false;
                   //    that.dead = true;
                    //}
                    if ((entity instanceof goal) && (that.lastBB.right <= entity.BB.right)) { 
                        that.win = true;
                    }
                    else if ((entity instanceof goal) && (that.lastBB.left >= entity.BB.left)) { 
                        that.win = true;
                    }
            }
            if (entity instanceof Dragon) {
                that.lose = true;
                that.dead = true;
            }
            //else if ((entity instanceof Dragon) && (that.lastBB.left >= entity.BB.right)) {
            //    that.lose = true;
            //    that.dead = true;
           // }

        }
    });



    // update state
    if (this.state !== 3 && this.state !== 6) {
        if (Math.abs(this.velocity.x) > MAX_WALK) this.state = 2;
        else if (Math.abs(this.velocity.x) >= MIN_WALK) this.state = 1;
        else this.state = 0;
        if (Math.abs(this.velocity.y) > 0 ) this.state = 4; 
        else if (Math.abs(this.velocity.y) < 0) this.state = 3;
    } 
    // update direction
    if (this.velocity.x < 0) this.facing = 1;
    if (this.velocity.x > 0) this.facing = 0;

    };

    draw(ctx) {
        if(!this.dead){
        this.animator[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x-this.game.camera.x, this.y-this.game.camera.y, .5);        }



    }


}










//class Nail {
//	constructor(game) {
//		this.game = game;
//		this.animator = new Animator(ASSET_MANAGER.getAsset("./movement1.png"), 0, 0, 80, 90, 9, .2);
//		this.x = 0;
//		this.y = 0;
//		this.speed = 200;
//	};
//
//	update() {
//		this.x += this.speed * this.game.clockTick;
//		if (this.x > 1024) this.x = 0;
//	};
//
//	draw(ctx) {
//		this.animator.drawFrame(this.game.clockTick, ctx, this.x, this.y);
//	};
//}