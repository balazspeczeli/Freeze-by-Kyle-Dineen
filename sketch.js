var amplitude;
var beatHoldFrames = 30;
var beatThreshold = 0.11;
var beatCutoff = 0;
var beatDecayRate = 0.98;
var framesSinceLastBeat = 0;

var source;
var fft;
var level;

var colors;
var center;
var pointCoordinates = [];
var rotation = 0;

var radius = [
  [ 0.935, 0.83, 0.76, 0.71 ],
  [ 0.645, 0.68, 0.57, 0.535 ],
  [ 0.57,  0.51, 0.51, 0.475 ]
];

var angles = [
  [  8, 32, 12 ],
  [ 30, 39,  8 ],
  [  7, 29, 21.5 ]
];

function preload() {
  source = loadSound('bassnectar-im-up.mp3');
}

function setup() {
  colors = [
    color(200, 200, 200), // background
    color(0, 0, 0), // dark
    color(245, 245, 245), // light
    color(125, 147, 161), // color #1
    color(145, 171, 172), // color #2
    color(160, 192, 203), // color #3
    color(210, 221, 223), // color #4
  ];

  center = { x: windowWidth / 2, y: windowHeight / 2 };

  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  fft = new p5.FFT();

  //source = new p5.AudioIn();
	//source.start();
	//fft.setInput(source);

  source.play();

	amplitude = new p5.Amplitude();
	amplitude.setInput(source);
  amplitude.smooth(0.9);
}

function draw() {
  background(colors[0]);

  level = amplitude.getLevel();
  detectBeat(level);
  distortion = map(level, 0, 1, 0, 0.2);

  calculatePointCoordinates();

  drawOuterShape(0);
  drawLayers();
  drawOuterShape(1);

  drawInnerShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  center = { x: windowWidth / 2, y: windowHeight / 2 };
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function calculateDistance(x1, y1, x2, y2, k) {
  return [ x1 + k * (x2 - x1), y1 + k * (y2 - y1) ];
}

function calculatePointCoordinates() {
  // outer shapes
  for(var s = 0; s < 2; s++) {
    var factor = s == 0 ? (1+distortion) : (1-distortion);
    pointCoordinates[s] = [];
    for(var i = 0; i < 3; i++) {
      pointCoordinates[s].push(calcRotated(0 - angles[s][1] + 120*i,  factor * radius[s][0])); // 23
      pointCoordinates[s].push(calcRotated(0 - angles[s][0] + 120*i,  factor * radius[s][2])); // 24
      pointCoordinates[s].push(calcRotated(120*i,                     factor * radius[s][1])); // 1
      pointCoordinates[s].push(calcRotated(angles[s][0] + 120*i,      factor * radius[s][2])); // 2
      pointCoordinates[s].push(calcRotated(angles[s][1] + 120*i,      factor * radius[s][0])); // 3
      pointCoordinates[s].push(calcRotated(60 - angles[s][2] + 120*i, factor * radius[s][3])); // 4
      pointCoordinates[s].push(calcRotated(60 + 120*i,                factor * radius[s][2])); // 5
      pointCoordinates[s].push(calcRotated(60 + angles[s][2] + 120*i, factor * radius[s][3])); // 6
    }
  }

  // inner shapes
  pointCoordinates[2] = [];
  for(var i = 0; i < 3; i++) {
    pointCoordinates[2].push(calcRotated(60 + 120*i,                 0.025       )); // 0 (origo)
    pointCoordinates[2].push(calcRotated(angles[2][0] + 120*i,       (1-distortion) * radius[2][0])); // 1
    pointCoordinates[2].push(calcRotated(60 - angles[2][1] + 120*i,  (1-distortion) * radius[2][2])); // 2
    pointCoordinates[2].push(calcRotated(60 - angles[2][2] + 120*i,  (1-distortion) * radius[2][0])); // 3
    pointCoordinates[2].push(calcRotated(60 - angles[2][0] + 120*i,  (1-distortion) * radius[2][3])); // 4
    pointCoordinates[2].push(calcRotated(60 + 120*i,                 (1-distortion) * radius[2][1])); // 5
    pointCoordinates[2].push(calcRotated(60 + angles[2][0] + 120*i,  (1-distortion) * radius[2][3])); // 6
    pointCoordinates[2].push(calcRotated(60 + angles[2][2] + 120*i,  (1-distortion) * radius[2][0])); // 7
    pointCoordinates[2].push(calcRotated(60 + angles[2][1] + 120*i,  (1-distortion) * radius[2][2])); // 8
    pointCoordinates[2].push(calcRotated(120 - angles[2][0] + 120*i, (1-distortion) * radius[2][0])); // 9
  }
}

function calcRotated(angle, radius) {
  return [
    -Math.sin(toRadians(angle + rotation)) * ((center.y - windowHeight * radius/2) - center.y) + center.x,
     Math.cos(toRadians(angle + rotation)) * ((center.y - windowHeight * radius/2) - center.y) + center.y
  ];
}

function drawOuterShape(which) {
  fill(colors[which+1]);
  strokeWeight(0);

  beginShape();
  for(var i = 0; i < pointCoordinates[which].length; i++) {
    vertex(pointCoordinates[which][i][0], pointCoordinates[which][i][1]);
  }
  endShape(CLOSE);
}

function drawLayers() {
  for(var i = 1; i < 9; i++) {
    beginShape();

    switch(i) {
      case 1:
        fill(colors[3]);
        break;
      case 3:
        fill(colors[4]);
        break;
      case 5:
        fill(colors[5]);
        break;
      case 7:
        fill(colors[6]);
        break;
      default:
        fill(colors[1]);
    }

    for(var p = 0; p < pointCoordinates[0].length; p++) {
      newpoint = calculateDistance(
        pointCoordinates[0][p][0], pointCoordinates[0][p][1],
        pointCoordinates[1][p][0], pointCoordinates[1][p][1],
      i/9);
      vertex(newpoint[0], newpoint[1]);
    }

    endShape(CLOSE);
  }
}

function drawInnerShape() {
  for(var i = 0; i < 3; i++) {
    noStroke();

    // A
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][1+i*10][0], pointCoordinates[2][1+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][1+i*10][0], pointCoordinates[2][1+i*10][1],
      pointCoordinates[2][2+i*10][0], pointCoordinates[2][2+i*10][1],
    1/3);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // B
    fill(colors[6]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][1+i*10][0], pointCoordinates[2][1+i*10][1],
      pointCoordinates[2][2+i*10][0], pointCoordinates[2][2+i*10][1],
    1/3);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][2+i*10][0], pointCoordinates[2][2+i*10][1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // C
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][2+i*10][0], pointCoordinates[2][2+i*10][1]);
    vertex(pointCoordinates[2][3+i*10][0], pointCoordinates[2][3+i*10][1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // D
    fill(colors[5]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][3+i*10][0], pointCoordinates[2][3+i*10][1]);
    vertex(pointCoordinates[2][4+i*10][0], pointCoordinates[2][4+i*10][1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // E
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][4+i*10][0], pointCoordinates[2][4+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][4+i*10][0], pointCoordinates[2][4+i*10][1],
      pointCoordinates[2][5+i*10][0], pointCoordinates[2][5+i*10][1],
    1/1.75);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // F
    fill(colors[4]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][4+i*10][0], pointCoordinates[2][4+i*10][1],
      pointCoordinates[2][5+i*10][0], pointCoordinates[2][5+i*10][1],
    1/1.75);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][5+i*10][0], pointCoordinates[2][5+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][6+i*10][0], pointCoordinates[2][6+i*10][1],
      pointCoordinates[2][5+i*10][0], pointCoordinates[2][5+i*10][1],
    1/1.75);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // G
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][6+i*10][0], pointCoordinates[2][6+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][6+i*10][0], pointCoordinates[2][6+i*10][1],
      pointCoordinates[2][5+i*10][0], pointCoordinates[2][5+i*10][1],
    1/1.75);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // H
    fill(colors[5]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][6+i*10][0], pointCoordinates[2][6+i*10][1]);
    vertex(pointCoordinates[2][7+i*10][0], pointCoordinates[2][7+i*10][1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // I
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][7+i*10][0], pointCoordinates[2][7+i*10][1]);
    vertex(pointCoordinates[2][8+i*10][0], pointCoordinates[2][8+i*10][1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // J
    fill(colors[6]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][8+i*10][0], pointCoordinates[2][8+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][9+i*10][0], pointCoordinates[2][9+i*10][1],
      pointCoordinates[2][8+i*10][0], pointCoordinates[2][8+i*10][1],
    1/3);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    // K
    fill(colors[1]);
    beginShape();
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    vertex(pointCoordinates[2][9+i*10][0], pointCoordinates[2][9+i*10][1]);
    newpoint = calculateDistance(
      pointCoordinates[2][9+i*10][0], pointCoordinates[2][9+i*10][1],
      pointCoordinates[2][8+i*10][0], pointCoordinates[2][8+i*10][1],
    1/3);
    vertex(newpoint[0], newpoint[1]);
    vertex(pointCoordinates[2][0+i*10][0], pointCoordinates[2][0+i*10][1]);
    endShape(CLOSE);

    stroke(colors[1]);
    strokeWeight(1.5);
    for(var j = 1; j < 9; j++) {
      line(
        pointCoordinates[2][j+i*10][0], pointCoordinates[2][j+i*10][1],
        pointCoordinates[2][j+1+i*10][0], pointCoordinates[2][j+1+i*10][1]
      );
    }
  }
}

function detectBeat(level) {
  if (level > beatCutoff && level > beatThreshold) {
    rotation += random(0, 25);
    beatCutoff = level * 1.2;
    framesSinceLastBeat = 0;
  }
  else {
    if (framesSinceLastBeat <= beatHoldFrames) {
      framesSinceLastBeat++;
    }
    else {
      beatCutoff *= beatDecayRate;
      beatCutoff = Math.max(beatCutoff, beatThreshold);
    }
  }
}
