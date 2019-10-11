import "./styles.css";

const raf = requestAnimationFrame;

let $$framesLeft = 100;

const draw = (ctx, fn) => {
  ctx.save();
  ctx.beginPath();
  fn(ctx);
  ctx.restore();
};

const RADIUS = 100;
const SCALE = 0.1;

const GRAVITY = 1000;

const dist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

const debugDrawQueue = [];

function render(ctx, state) {
  if ($$framesLeft-- === 0) return;
  const { width, height } = ctx.canvas;
  const midX = width / 2;
  const midY = height / 2;

  const headX = midX;
  const headY = midY - RADIUS - 30;
  const { velX, velY, posX, posY } = state;

  const distance = dist(posX, posY, midX, midY);
  const angle = Math.atan((posY - midY) / (posX - midX));
  const gravity = {
    x: (-GRAVITY * Math.cos(angle)) / distance,
    y: (-GRAVITY * Math.sin(angle)) / distance
  };

  if ($$framesLeft % 10 === 0) {
    console.log((angle * 180) / Math.PI);
    debugDrawQueue.push(() => {
      ctx.arc(posX, posY, 5, 0, Math.PI);
      ctx.stroke();
    });
  }

  debugDrawQueue.forEach(fn => draw(ctx, fn));

  const newState = {
    ...state,
    count: state.count + 1,
    velX: velX + gravity.x,
    velY: velY + gravity.y,
    posX: posX + velX * SCALE,
    posY: posY + velY * SCALE
  };

  raf(() => {
    ctx.clearRect(0, 0, width, height);

    // Planet
    draw(ctx, () => {
      ctx.fillStyle = "#5180e9";
      ctx.arc(midX, midY, RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shooter
    draw(ctx, () => {
      ctx.fillStyle = ctx.strokeStyle = "#333";
      ctx.lineWidth = 3;

      // HEAD
      ctx.arc(headX, headY, 6, 0, Math.PI * 2);
      ctx.fill();

      // BODY
      draw(ctx, () => {
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX, headY + 20);

        ctx.moveTo(headX, headY + 10);
        ctx.lineTo(headX + 10, headY + 10);

        ctx.moveTo(headX, headY + 20);
        ctx.lineTo(headX + 5, headY + 30);
        ctx.moveTo(headX, headY + 20);
        ctx.lineTo(headX - 5, headY + 30);
        ctx.stroke();
      });
    });

    // Bullet
    draw(ctx, () => {
      ctx.fillStyle = "#111";
      ctx.arc(posX, posY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    raf(() => render(ctx, newState));
  });
}

const $canvas = Object.assign(document.createElement("canvas"), {
  width: 500,
  height: 500
});
document.body.appendChild($canvas);

const ctx = $canvas.getContext("2d");

render(ctx, {
  count: 0,
  velX: 100,
  velY: 0,
  posX: $canvas.width / 2 + 10,
  posY: $canvas.height / 2 - RADIUS - 20
});
