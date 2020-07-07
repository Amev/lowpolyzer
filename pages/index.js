import React, { Component } from 'react';

import './index.less';


const TRIANGLE_SURFACE_LIMIT = 10000;
const TRIANGLE_EDGE_LENGTH_LIMIT = 50;


export default class Home extends Component {
    componentDidMount() {
        let startingTriangle = [{ x: 0, y: 0 }, { x: 0, y: 300 }, { x: 400, y: 0 }];
        let triangles = this.lowpolyze(startingTriangle);

        startingTriangle = [{ x: 0, y: 300 }, { x: 400, y: 300 }, { x: 400, y: 0 }];
        triangles = [...triangles, ...this.lowpolyze(startingTriangle)];

        const context = this.canvas.getContext('2d');

        triangles.forEach(triangle => {
            const r = this.getRandomInt(0, 255);
            const g = this.getRandomInt(0, 255);
            const b = this.getRandomInt(0, 255);

            context.fillStyle = `rgb(${r}, ${g}, ${b})`;
            context.beginPath();
            context.moveTo(triangle[0].x, triangle[0].y);
            context.lineTo(triangle[1].x, triangle[1].y);
            context.lineTo(triangle[2].x, triangle[2].y);
            context.fill();
            context.closePath();
        });
    }

    lowpolyze = (startTriangle) => {
        const triangleSurface = this.getTriangleSurface(startTriangle);
        const distAB = this.getDist(startTriangle[0], startTriangle[1]);
        const distAC = this.getDist(startTriangle[0], startTriangle[2]);
        const distBC = this.getDist(startTriangle[1], startTriangle[2]);

        if (
            triangleSurface < TRIANGLE_SURFACE_LIMIT
            || [distAB, distAC, distBC].find(dist => dist < TRIANGLE_EDGE_LENGTH_LIMIT)
        ) {
            return [startTriangle];
        }

        const newABPoint = this.getRandomPointOnLine(startTriangle[0], startTriangle[1]);
        const newACPoint = this.getRandomPointOnLine(startTriangle[0], startTriangle[2]);
        const newBCPoint = this.getRandomPointOnLine(startTriangle[1], startTriangle[2]);

        return [
            [startTriangle[0], newABPoint, newACPoint],
            [startTriangle[1], newABPoint, newBCPoint],
            [startTriangle[2], newACPoint, newBCPoint],
            [newABPoint, newACPoint, newBCPoint],
        ].reduce((triangles, newTriangle) => {
            return [...triangles, ...this.lowpolyze(newTriangle)];
        }, []);
    };

    getRandomPointOnLine = (a, b) => {
        const rand = this.getRandomFloat(0.2, 0.8);

        if (a.x === b.x) {
            return {
                x: a.x,
                y: (b.y - a.y) * rand + a.y,
            }
        }

        const coef = (b.y - a.y) / (b.x - a.x);
        const x = (b.x - a.x) * rand + a.x;
        const y = coef * (x - a.x) + a.y;

        return { x, y };
    };

    getTriangleIncircleRadius = ([a, b, c]) => {
        const distAB = this.getDist(a, b);
        const distAC = this.getDist(a, c);
        const distBC = this.getDist(b, c);
        const p = (distAB + distAC + distBC) / 2;

        return Math.round(Math.sqrt(p * (p - distAB) * (p - distAC) * (p - distBC)) / p);
    };

    getTriangleCentroid = ([a, b, c]) => {
        return {
            x: Math.round((a.x + b.x + c.x) / 3),
            y: Math.round((a.y + b.y + c.y) / 3),
        };
    };

    getTriangleSurface = ([a, b, c]) => {
        return (0.5 * Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)));
    };

    getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    getRandomFloat = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    getDist = (a, b) => {
        return Math.round(Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)));
    };

    onUploadImage = (event) => {
        const [file] = event.target.files;

        if (!file) {
            return;
        }

        const context = this.canvas.getContext('2d');
        const reader = new FileReader();
        const img = new Image();

        reader.readAsDataURL(file);
        reader.onload = (readerEvent) => {
            if (readerEvent.target.readyState === FileReader.DONE) {
                img.src = readerEvent.target.result;
                context.drawImage(img, 0, 0, 400, 300);
            }
        }
    };

    render() {
        return (
            <div className='Home'>
                <canvas
                    ref={(canvas) => this.canvas = canvas}
                    className='Home-canvas'
                    height={300}
                    width={400}
                />
                <input
                    onChange={this.onUploadImage}
                    accept='image/png, image/jpeg'
                    type='file'
                />
            </div>
        );
    }
}