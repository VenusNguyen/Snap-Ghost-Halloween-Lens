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

    //not do anything else til it finish returning the needed point in setup()
    if (latestPrediction == null) return;

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



    //draw Snap ghost according to users' chin pos
    imageMode(CENTER);
    image(snapGhostImage, chinPos[0], chinPos[1]);
}




