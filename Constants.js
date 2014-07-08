var Constants = (function() {
"use strict";

var Constants = {};

// Board size constants.
Constants.VISIBLEROWS = 24;
// ROWS = (VISIBLEROWS + Block.MAXBLOCKSIZE - 1)
Constants.ROWS = (Constants.VISIBLEROWS + 10 - 1);
Constants.COLS = 12;

// Screen size constants.
Constants.SQUAREWIDTH = 20;

// Game states.
Constants.PLAYING = 0;
Constants.PAUSED = 1;
Constants.GAMEOVER = 2;

// Game engine constants.
Constants.FRAMERATE = 48;
Constants.FRAMEDELAY = Math.floor(1000/Constants.FRAMERATE);
Constants.MAXFRAME = 3628800;
Constants.PAUSE = 3;
Constants.REPEAT = 0;

// Block movement constants, some of which are imported by Block.
Constants.GRAVITY = 3*Constants.FRAMERATE/4;
Constants.SHOVEAWAYS = 2;
Constants.LOCALSTICKFRAMES = Constants.FRAMERATE/2;
Constants.GLOBALSTICKFRAMES = 2*Constants.FRAMERATE;

// Block overlap codes, in order of priority.
Constants.LEFTEDGE = 0;
Constants.RIGHTEDGE = 1;
Constants.TOPEDGE = 2;
Constants.BOTTOMEDGE = 3;
Constants.OVERLAP = 4;
Constants.OK = 5;

// Preview size and animation speed.
Constants.PREVIEW = 5;
Constants.PREVIEWFRAMES = 3;

// Difficulty curve constants.
Constants.LEVELINTERVAL = 60;
Constants.MINR = 0.1;
Constants.MAXR = 0.9;
Constants.HALFRSCORE = 480;

// Points given for each number of rows cleared.
Constants.POINTS = function(x) {
  return x;
}

return Constants;
})();
