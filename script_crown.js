let video;
let latestPrediction = null;

let crownImage;
let flowerCrownImage;
let modelIsLoading = true;

const FOREHEAD_POINT = 151;
const LEFT_FOREHEAD = 104;
const RIGHT_FOREHEAD = 333;

let poses = [];
// Storing the keypoint positions
let keypoints = [];
let interpolatedKeypoints = [];


// ------------------------------------------------------------------ //



//p5 function
function preload() {
    crownImage = loadImage("assets/crown.png");
    flowerCrownImage = loadImage("assets/flower-crown.png");
}

//p5 function
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



    let poseNet = ml5.poseNet(video, { flipHorizontal: true });
    poseNet.on("pose", function (results) {
        poses = results;
      });

    video.hide();

    createInitialKeypoints();
}

// source: Ashwin
function updateKeypoints() {
    // If there are no poses, ignore it.
    if (poses.length <= 0) {
      return;
    }
  
    // Otherwise, update the points;
    let pose = poses[0].pose;
    keypoints = pose.keypoints;
  
    for (let kp = 0; kp < keypoints.length; kp++) {
      let oldKeypoint = interpolatedKeypoints[kp];
      let newKeypoint = keypoints[kp].position;
  
      let interpX = lerp(oldKeypoint.x, newKeypoint.x, 0.3);
      let interpY = lerp(oldKeypoint.y, newKeypoint.y, 0.3);
  
      let interpolatedKeypoint = { x: interpX, y: interpY };
  
      interpolatedKeypoints[kp] = interpolatedKeypoint;
    }
  }

//p5 function
function draw() {
    // if (modelIsLoading) {
    //     //show a loading screen
    // }

    //draw webcam video
    imageMode(CORNER);
    image(video, 0, 0, width, height);

    updateKeypoints();
    
    if (latestPrediction == null) return;
    //get forehead location
    let foreheadPos = latestPrediction.scaledMesh[FOREHEAD_POINT];

    let leftForeheadPos = latestPrediction.scaledMesh[LEFT_FOREHEAD];
    let rightForeheadPos = latestPrediction.scaledMesh[RIGHT_FOREHEAD];

    let foreheadWidth = dist (
      leftForeheadPos[0],
      leftForeheadPos[1],
      rightForeheadPos[0],
      rightForeheadPos[1]
    );

    let crownWidth = foreheadWidth * 3;
    let crownHeight = (crownImage.height / crownImage.width) * crownWidth;

    let flowerCrownWidth = foreheadWidth * 1.5;
    let flowerCrownHeight = (flowerCrownImage.height / flowerCrownImage.width) * flowerCrownWidth;

    let leftWristPostion = interpolatedKeypoints[9];
    if (leftWristPostion.y < height) {
      imageMode(CENTER);
      image(flowerCrownImage, foreheadPos[0], foreheadPos[1] - flowerCrownHeight/4, flowerCrownWidth, flowerCrownHeight);
    } else {
      imageMode(CENTER);
      image(crownImage, foreheadPos[0], foreheadPos[1] - crownHeight/2, crownWidth, crownHeight);
    }

}

// Create default keypoints for interpolation easing
function createInitialKeypoints() {
  let numKeypoints = 17;
  for (let i = 0; i < numKeypoints; i++) {
    newKeypoint = { x: width / 2, y: height / 2 };

    interpolatedKeypoints.push(newKeypoint);
  }
}