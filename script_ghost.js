let video;
let latestPrediction = null;

let snapGhostImage;

const CHIN_POINT = 152;
const LEFT_CHIN_POINT = 149;
const RIGHT_CHIN_POINT = 378;


// ------------------------------------------------------------------ //


function preload() {
    snapGhostImage = loadImage("assets/snap-ghost-1.png");
}

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);

    //ml5 function
    let facemesh;
    facemesh = ml5.facemesh(video, () => {
        console.log('Model is ready');
        modelIsLoading = false;
    });

    //ml5 function
    facemesh.on("predict", (results) => {
        //results is an array but we only care about the first one
        latestPrediction = results[0];
    });

    video.hide();
}

function draw() {
    //draw webcam video
    imageMode(CORNER);
    image(video, 0, 0, width, height);

    //not do anything else unless it finishes returning the needed point in setup()
    if (!latestPrediction) return;

    //cover the face with Snap Ghost logo
    drawSnapGhost();
    
    let eyeholeMask = createLeftEyeholeMask();

    let webcamCopy = video.get(); // get a new copy of the webcam image
    webcamCopy.mask(eyeholeMask); // apply the eyehole mask
    imageMode(CORNER);
    image(webcamCopy, 0, 0, width, height); // draw eye on top of the full face covering
}

function drawSnapGhost() {
    //get chin position
    let chinPos = latestPrediction.scaledMesh[CHIN_POINT];
    let leftChinPos = latestPrediction.scaledMesh[LEFT_CHIN_POINT];
    let rightChinPos = latestPrediction.scaledMesh[RIGHT_CHIN_POINT];

    let chinWidth = dist (
        leftChinPos[0],
        leftChinPos[1],
        rightChinPos[0],
        rightChinPos[1]
    );

    //calculate the dimension of the image according to users' position change
    let snapGhostDimension = chinWidth * 6;

    //draw Snap ghost according to users' chin pos
    imageMode(CENTER);
    image(snapGhostImage, chinPos[0], chinPos[1], snapGhostDimension, snapGhostDimension);
}

// source: ASHWIN
function createLeftEyeholeMask() {
    let eyeholeMask = createGraphics(width, height); // draw into a "graphics" object instead of the canvas directly
    eyeholeMask.background("rgba(255,255,255,0)"); // transparent background (zero alpha)
    eyeholeMask.noStroke();
  
    // get the eyehole points from the facemesh
    let rightEyeUpper = latestPrediction.annotations.rightEyeUpper1;
    let rightEyeLower = [
      ...latestPrediction.annotations.rightEyeLower1,
    ].reverse(); // note that we have to reverse one of the arrays so that the shape draws properly
  
    // draw the actual shape
    eyeholeMask.beginShape();
    // draw from left to right along the top of the eye
    rightEyeUpper.forEach((point) => {
      eyeholeMask.curveVertex(point[0 /* x */], point[1 /* y */]); // using curveVertex for smooth lines
    });
    // draw back from right to left along the bottom of the eye
    rightEyeLower.forEach((point) => {
      eyeholeMask.curveVertex(point[0 /* x */], point[1 /* y */]);
    });
    eyeholeMask.endShape(CLOSE); // CLOSE makes sure we join back to the beginning
  
    return eyeholeMask;
  }
  
function createRightEyeholeMask() {

}