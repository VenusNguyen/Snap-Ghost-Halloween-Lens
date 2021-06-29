let video;
let latestPrediction = null;
let crownImage;
let modelIsLoading = true;

const FOREHEAD_POINT = 151;

//p5 function
function preload() {
    crownImage = loadImage("assets/crown.png");
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
        // console.log(results[0]); //results is an array but we only care about the first one
        latestPrediction = results[0];
    });

    video.hide();
}

//p5 function
function draw() {
    // if (modelIsLoading) {
    //     //show a loading screen
    // }

    //draw webcam video
    image(video, 0, 0, width, height);

    
    if (latestPrediction == null) return;
    //get forehead location
    let foreheadPos = latestPrediction.scaledMesh[FOREHEAD_POINT];
    // console.log(foreheadPos);
    
    image(crownImage, foreheadPos[0] - 50, foreheadPos[1] - 100, 100, 100);

}