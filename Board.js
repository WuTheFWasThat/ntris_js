var Board = (function() {
"use strict";

var Board = function(graphics, target) {
  this.graphics = graphics;
  this.target = target;

  this.repeater = new KeyRepeater(Constants.PAUSE, Constants.REPEAT, target);
  this.setFocusHandlers(target);

  this.data = [];
  for (var i = 0; i < Constants.ROWS; i++) {
    var row = [];
    for (var j = 0; j < Constants.COLS; j++) {
      row.push(0);
    }
    this.data.push(row);
  }

  this.reset();

  this.afterTime = (new Date).getTime();
  this.sleepTime = Constants.FRAMEDELAY;
  setTimeout(this.gameLoop.bind(this), this.sleepTime);
}

Board.prototype.setFocusHandlers = function() {
  this.target.focus(this.gainFocus.bind(this));
  this.target.focusout(this.loseFocus.bind(this));
  $(window).blur(this.loseFocus.bind(this));
  this.target.focus();
}

Board.prototype.loseFocus = function(e) {
  if (this.state === Constants.PLAYING) {
    this.state = Constants.PAUSED;
    this.pauseReason = 'focus';
  }
}

Board.prototype.gainFocus = function(e) {
  if (this.state === Constants.PAUSED && this.pauseReason === 'focus') {
    this.state = Constants.PLAYING;
  }
}

Board.prototype.reset = function() {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.data[i][j] = 0;
    }
  }

  this.frame = 0;
  this.held = false;
  this.heldBlockType = -1;
  this.score = 0;
  this.state = Constants.PLAYING;

  this.preview = [];
  for (var i = 0; i < Constants.PREVIEW; i++) {
    this.preview.push(this.playTetrisGod(0));
  }
  this.blockIndex = 0;
  this.block = this.nextBlock();

  this.graphics.reset(this);
}

Board.prototype.gameLoop = function() {
  this.beforeTime = (new Date).getTime();
  var extraTime = (this.beforeTime - this.afterTime) - this.sleepTime;

  var frames = Math.floor(extraTime/Constants.FRAMEDELAY) + 1;
  for (var i = 0; i < frames; i++) {
    this.update();
  }
  this.graphics.drawUI(this);
  this.graphics.flip();

  this.afterTime = (new Date).getTime();
  var sleepTime =
      Constants.FRAMEDELAY - (this.afterTime - this.beforeTime) - extraTime;
  setTimeout(this.gameLoop.bind(this), sleepTime);
}

Board.prototype.update = function() {
  var keys = this.repeater.query();

  if (keys.indexOf(Action.START) >= 0) {
    if (this.state === Constants.PLAYING) {
      this.state = Constants.PAUSED;
      this.pauseReason = 'manual';
    } else if (this.state === Constants.PAUSED) {
      this.state = Constants.PLAYING;
    } else {
      this.reset();
    }
    return;
  }

  if (this.state === Constants.PLAYING) {
    this.frame = (this.frame + 1) % Constants.MAXFRAME;

    this.graphics.eraseBlock(this.block);
    if (!this.held && keys.indexOf(Action.HOLD) >= 0) {
      this.block = this.nextBlock(this.block);
    } else {
      var result = Physics.moveBlock(this.block, this.data, this.frame, keys);
      if (result.place) {
        this.score += result.score;
        this.redraw();
        this.block = this.nextBlock();
      }
    }
    this.graphics.drawBlock(this.block);

    if (this.block.rowsFree < 0) {
      this.state = Constants.GAMEOVER;
    }
  }
}

Board.prototype.redraw = function() {
  for (var i = 0; i < Constants.ROWS; i++) {
    for (var j = 0; j < Constants.COLS; j++) {
      this.graphics.drawBoardSquare(i, j, this.data[i][j]);
    }
  }
}

Board.prototype.nextBlock = function(swap) {
  var type = -1;
  if (swap) {
    type = this.heldBlockType;
    this.heldBlockType = swap.type;
  }
  if (type < 0) {
    this.blockIndex += 1;
    this.preview.push(this.playTetrisGod(this.score));
    type = this.preview.shift();
  }

  this.held = (swap ? true : false);
  var result = new Block(type);
  result.rowsFree = Physics.calculateRowsFree(result, this.data);
  return result;
}

Board.prototype.playTetrisGod = function(score) {
  var level = this.difficultyLevel(score);
  var leveli = Block.TYPES[level];
  var nleveli = Block.TYPES[level + 1];
  return Math.floor(leveli + (nleveli - leveli) * Math.random());
}

Board.prototype.difficultyLevel = function(score) {
  // numSlots = number of slots for appending blocks (to 1 initial block)
  // p = probability of appending each slot

  // Scores 0 - 100:
  //   Starts at 4 slots, probability 75% (3)
  //   Ends at 4 slots, probability 80% (3.2)
  // Scores 100 - 200
  //   Starts at 5 slots, probability 64% (3.2)
  //   Ends at 5 slots, probability 68% (3.4)
  // Scores 200 - 300
  //   Starts at 5 slots, probability 64% (3.4)
  //   Ends at 5 slots, probability 68% (3.6)

  // number of points before we increment a level
  var levelIncrement = 50;
  var normalizedScore = score / levelIncrement;

  var level = Math.min( Math.floor(normalizedScore), Block.LEVELS - 5 );
  var progress = normalizedScore - level;

  var numSlots = level + 4;
  // interpolate between having average 3 + (level/5) and 3 + (level + 1)/5
  // so,
  // p interpolates between (15 + level) / (numSlots * 5) and (16 + level) / (numSlots * 5)
  // so,
  // p = (15 + level + progress) / (numSlots * 5)
  var p = (15 + level + progress ) / (numSlots * 5)
  console.log(numSlots, p, numSlots * p);

  // Calculate the ratio r between the probability of different levels.
  var difficulty = 0;
  for (var i = 0; i < numSlots; i++) {
    if (Math.random() < p) {
      difficulty++;
    }
  }
  console.log('difficulty', difficulty)
  return difficulty;
}

Board.prototype.sigmoid = function(x) {
  return (x/Math.sqrt(1 + x*x) + 1)/2;
}

return Board;
})();
