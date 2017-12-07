export class DrawPolygons {

    static drawPolygon(data, container, color) {
        var pol = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        var str = '';
        str += data.map(function (point) {
            return point.x + ',' + point.y;
        }).join(' ');
        pol.setAttribute('points', str);
        pol.style.fill = color;
        container.appendChild(pol);
    }

}