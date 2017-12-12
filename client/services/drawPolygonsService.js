export class DrawPolygons {

    static drawPolygon(data, container, color, deClass, fillOrStroke) {
        var pol = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        var str = '';
        str += data.map(function (point) {
            return point.x + ',' + point.y;
        }).join(' ');
        pol.setAttribute('points', str);
        pol.setAttribute("class", deClass)
        const style = "stroke: " + color + ";" + "fill: transparent;";
        fillOrStroke? pol.style.fill = color : pol.setAttribute("style", style)
        container.appendChild(pol);
    }

}