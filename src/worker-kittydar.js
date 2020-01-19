import { expose } from "threads/worker";
import resizeImageData from "resize-image-data";

importScripts("./kittydar-0.1.6.js");


function getAllSizes(imageData, width, height) {
    const minSize = 48; // starting window size
    const resize = 360; // initial image resize size in px
    const scaleStep = 6; // scaling step size in px

    // resize canvas to cut down on number of windows to check
    const max = Math.max(width, height)
    const scale = Math.min(max, resize) / max;

    const resizes = [];
    for (let size = minSize; size < max; size += scaleStep) {
        let winScale = (minSize / size) * scale;
        let resizeWidth = Math.floor(width * winScale);
        let resizeHeight = Math.floor(height * winScale);
        let resizedImageData = resizeImageData(imageData, resizeWidth, resizeHeight);
        resizes.push({
            imagedata: resizedImageData,
            scale: winScale,
            size: size
        });
    }
    return resizes;
}

expose(async function handleCatImage(objData) {
    let cats = [];
    let imageData = new ImageData(
        new Uint8ClampedArray(objData.pixels),
        objData.width,
        objData.height
    );
    const resizes = getAllSizes(imageData, objData.width, objData.height);
    resizes.forEach(function(resize) {
        const detected = kittydar.detectAtScale(resize.imagedata, resize.scale);
        cats = cats.concat(detected);
    });

    cats = kittydar.combineOverlaps(cats, 0.25, 4);
    return new Promise((resolve, reject) => {
        resolve(cats);
    });
}
);