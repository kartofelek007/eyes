//tylko inspiracja
//https://www.youtube.com/watch?v=52rKp7P3gIs

const eyeMinR = 10;
const eyeMaxR = 120;
const count = 400;
const margin = 3;
const retina = 2;

// angle in radians
const get2PointsRadians = function(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth * retina;
canvas.height = window.innerHeight * retina;
const ctx = canvas.getContext("2d");

const pubsub = {
    subscribers : [],
    on(fn) {
        this.subscribers.push(fn)
    },
    off(fn) {
        this.subscribers = this.subscribers.filter(el => el !== fn);
    },
    emit(data) {
        this.subscribers.forEach(fn => fn(data));
    }
}

class Eye {
    constructor(radius, x, y) {
        this.r = radius * retina;
        this.x = x * retina;
        this.y = y * retina;
        this.alert = false;

        pubsub.on(alert => {
            this.alert = alert;
        })
    }

    draw() {
        //czyszczę
        ctx.clearRect(this.x - this.r / 2, this.y - this.r / 2, this.r, this.r);

        //big white
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.fillStyle = !this.alert ? "#ddd": "#F20A0A";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.1)"
        ctx.stroke();
        ctx.closePath();


        const theta = get2PointsRadians(this.x, this.y, mouseX * retina, mouseY * retina);
        const rS = this.r / 2;
        const rM = this.r / 1.1;
        const rX = rS / 2;
        const rXX = rX / 3;

        {
            //medium gold
            const x = this.x + ((this.r - rM) * Math.cos(theta));
            const y = this.y + ((this.r - rM) * Math.sin(theta));
            ctx.beginPath()
            ctx.fillStyle = !this.alert ? "#fff" : "#000";
            ctx.arc(x, y, rM, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        {
            //small black
            const x = this.x + ((this.r - rS) * Math.cos(theta));
            const y = this.y + ((this.r - rS) * Math.sin(theta));
            ctx.beginPath()
            ctx.fillStyle = !this.alert ? "#000" : "#F20A0A";
            ctx.arc(x, y, rS, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        {
            //light on black
            const x = this.x + ((this.r - rS) * Math.cos(theta));
            const y = this.y + ((this.r - rS) * Math.sin(theta));

            const theta2 = get2PointsRadians(x, y, this.x - 200, 0);
            const x2 = x + ((rS - rX - 3) * Math.cos(theta2));
            const y2 = y + ((rS - rX - 3) * Math.sin(theta2));
            ctx.beginPath()
            ctx.fillStyle = !this.alert ? "rgba(255,255,255,0.1)" : "#FF4343";
            ctx.arc(x2, y2, rX, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        {
            //light on black
            const x = this.x + ((this.r - rS) * Math.cos(theta));
            const y = this.y + ((this.r - rS) * Math.sin(theta));

            const theta2 = get2PointsRadians(x, y, this.x - 200, 0);
            const x2 = x + ((rS - rXX - 3) * Math.cos(theta2));
            const y2 = y + ((rS - rXX - 3) * Math.sin(theta2));
            ctx.beginPath()
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.arc(x2, y2, rXX + 1, 0, Math.PI * 2, true);
            ctx.fillStyle = "#fff";
            ctx.arc(x2, y2, rXX, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    }
}

const randomBetween = function(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

let eyes = [];

function generateEyes() {
    canvas.width = window.innerWidth * retina;
    canvas.height = window.innerHeight * retina;

    //generate eyes not overlaping
    let circles = [];
    let protection = 0;

    while (circles.length < count) {
        let circle = {
            r : randomBetween(eyeMinR, eyeMaxR),
            x : randomBetween(10, window.innerWidth - 20),
            y : randomBetween(10, window.innerHeight - 20),
        }

        let overlaping = false;

        for (let i=0; i<circles.length; i++) {
            const other = circles[i];
            const a = circle.x - other.x;
            const b = circle.y - other.y;
            const dist = Math.sqrt( a*a + b*b ) - margin;
            if (dist < circle.r + other.r) {
                //overlaping
                overlaping = true;
                break;
            }
        }
        if (!overlaping) {
            circles.push(circle);
        }

        protection++;
        if (protection > 10000) {
            break;
        }

    }

    eyes = [];

    circles.forEach((el, i) => {
        const {x, y, r} = circles[i];
        eyes.push(new Eye(r, x, y));
    })
}

generateEyes();

window.addEventListener("resize", generateEyes);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener("mousemove", e => {
    mouseX = e.pageX;
    mouseY = e.pageY;
})

document.addEventListener("mousedown", e => {
    document.body.classList.add("alert");
    pubsub.emit(true);
})

document.addEventListener("mouseup", e => {
    document.body.classList.remove("alert");
    pubsub.emit(false);
})

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    eyes.forEach(el => el.draw())
    if (document.body.classList.contains("alert")) {
        ctx.save();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#fff"
        ctx.beginPath();
        ctx.arc(mouseX * retina, mouseY * retina, 10, 0, Math.PI * 2, true);
        ctx.stroke();
    }
}, 1000 / 100)