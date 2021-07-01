let video;
let latestPrediction = null;

let snapGhostImage;
let deco1;

const CHIN_POINT = 152;
const LEFT_FOREHEAD = 104;
const RIGHT_FOREHEAD = 333;


// ------------------------------------------------------------------ //


function preload() {
    snapGhostImage = loadImage("assets/snap-ghost-1.png");
    deco1 = loadImage("assets/decoration-1.png");
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

    //cover the video
    fill ('#FFFC00');
    rect (0, 0, width, height);

    //cover the face with Snap Ghost logo
    drawSnapGhost();
    
    //draw the left eye on the Snap Ghost logo
    drawLeftEyehole();
    drawRightEyehole();
    drawMouthHoleMask();
    
    //draw the decorations
    image(deco1, 0, 0, width, deco1.height);
}

function drawSnapGhost() {
    //get chin position
    let chinPos = latestPrediction.scaledMesh[CHIN_POINT];

    
    let leftForeheadPos = latestPrediction.scaledMesh[LEFT_FOREHEAD];
    let rightForeheadPos = latestPrediction.scaledMesh[RIGHT_FOREHEAD];

    let foreheadWidth = dist (
      leftForeheadPos[0],
      leftForeheadPos[1],
      rightForeheadPos[0],
      rightForeheadPos[1]
    );

    //calculate the dimension of the image according to users' position change
    let snapGhostDimension = foreheadWidth * 4;

    //draw Snap ghost according to users' chin pos
    imageMode(CENTER);
    image(snapGhostImage, chinPos[0], chinPos[1], snapGhostDimension, snapGhostDimension);
}

// source: ASHWIN (https://github.com/Snap-Engineering-Academy-2021/ml5-template)
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

// source: ASHWIN (https://github.com/Snap-Engineering-Academy-2021/ml5-template)
function drawLeftEyehole() {
    let eyeholeMask = createLeftEyeholeMask();

    let webcamCopy = video.get(); // get a new copy of the webcam image
    webcamCopy.mask(eyeholeMask); // apply the eyehole mask
    imageMode(CORNER);
    image(webcamCopy, 0, 0, width, height); // draw eye on top of the full face covering
}
  
function createRightEyeholeMask() {
    //create a graphics object to draw on
    let eyeholeMask = createGraphics(width, height);
    eyeholeMask.background("rgba(255,255,255,0)");
    eyeholeMask.noStroke();

    // get the eyehole points from the facemesh
    let leftEyeUpper = latestPrediction.annotations.leftEyeUpper1;
    let leftEyeLower = [
      ...latestPrediction.annotations.leftEyeLower1,
    ].reverse();

    //draw the eye shape according to the eyehole points received from the facemesh
    eyeholeMask.beginShape();
    // draw from left to right along the top of the eye
    leftEyeUpper.forEach((point) => {
        //curveVertex helps connect those points and smooth the curve
        eyeholeMask.curveVertex(point[0], point[1]);
    });
    // draw back from right to left along the bottom of the eye
    leftEyeLower.forEach((point) => {
        eyeholeMask.curveVertex(point[0], point[1]);
    });
    eyeholeMask.endShape(CLOSE);

    return eyeholeMask;
}

function drawRightEyehole() {
    let eyeholeMask = createRightEyeholeMask();

    //get a copy of the webcam image
    let webcamCopy = video.get();
    //apply the eyehole mask on that webcam image
    webcamCopy.mask(eyeholeMask); 
    imageMode(CORNER);
    image(webcamCopy, 0, 0, width, height);
}

function drawMouthHoleMask() {
    //create a graphics object to draw on
    let mouthHoleMask = createGraphics(width, height);
    mouthHoleMask.background("rgba(255,255,255,0)");
    mouthHoleMask.noStroke();

    // get the eyehole points from the facemesh
    let upperLip = latestPrediction.annotations.lipsUpperOuter;
    let lowerLip = [
      ...latestPrediction.annotations.lipsLowerOuter,
    ].reverse();

    //draw the eye shape according to the eyehole points received from the facemesh
    mouthHoleMask.beginShape();
    // draw from left to right along the top of the eye
    upperLip.forEach((point) => {
        //curveVertex helps connect those points and smooth the curve
        mouthHoleMask.curveVertex(point[0], point[1]);
    });
    // draw back from right to left along the bottom of the eye
    lowerLip.forEach((point) => {
        mouthHoleMask.curveVertex(point[0], point[1]);
    });
    mouthHoleMask.endShape(CLOSE);

    //get a copy of the webcam image
    let webcamCopy = video.get();
    //apply the eyehole mask on that webcam image
    webcamCopy.mask(mouthHoleMask); 
    imageMode(CORNER);
    image(webcamCopy, 0, 0, width, height);
}