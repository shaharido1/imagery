
function findPolar(isMin, isX, rect) {
    let value;
    let coord;
    let maxOrMin = isMin ? "min" : "max";
    if (isX) {
        value = rect1[0].x;
        coord = "x"
    }
    else {
        value = rect1[0].y;
        coord = "y"
    }
    rect.forEach(pos => {
        if (isMin) {
            value = pos[coord] < value ? pos[coord] : value;
        }
        else {
            value = pos[coord] > value ? pos[coord] : value;

        }
    })
    rect[coord] = rect[coord] ? rect[coord] : {};
    rect[coord][maxOrMin] = value

}

function isIntersecting(rect1, rect2, intersectRect) {
    intersectRect.x.max<Math.max(rect1.x.min, rect2.x.min)
}

function rectIntersection(rect1, rect2) {
    const intersectRect = {
        x: {
            min: Math.max(findPolar(true, true, rect1), findPolar(true, true, rect2)),
            max: Math.min(findPolar(false, true, rect1), findPolar(false, true, rect2))
        },
        y: {
            min: Math.max(findPolar(true, false, rect1), findPolar(true, false, rect2)),
            max: Math.min(findPolar(false, false, rect1), findPolar(false, false, rect2))
        }
    }
    isIntersecting(rect1, rect2, intersectRect)

}
