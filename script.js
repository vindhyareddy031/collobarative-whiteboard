const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();
const room = "default_room";

socket.emit("join_room", { room: room });

let drawing = false;
let lastX = 0;
let lastY = 0;

const colorPicker = document.getElementById("color");

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const x = e.clientX;
    const y = e.clientY;

    drawLine(lastX, lastY, x, y, colorPicker.value);

    socket.emit("drawing_event", {
        room: room,
        x1: lastX,
        y1: lastY,
        x2: x,
        y2: y,
        color: colorPicker.value
    });

    lastX = x;
    lastY = y;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

socket.on("drawing_event", (data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2, data.color);
});

socket.on("drawing_history", (history) => {
    history.forEach(data => {
        drawLine(data.x1, data.y1, data.x2, data.y2, data.color);
    });
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear_canvas", { room: room });
}

socket.on("clear_canvas", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});