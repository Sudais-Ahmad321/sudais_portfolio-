/**
 * ShapeGrid - Vanilla JS port of React Bits <ShapeGrid /> component
 * Features: Infinite moving grid, hover trails, shape types (square/hex/tri/circle),
 * automatic resize handling, radial vignette and visibility throttling.
 */
class ShapeGrid {
  constructor(canvas, options = {}) {
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.direction = options.direction || 'diagonal';
    this.speed = typeof options.speed === 'number' ? options.speed : 0.5;
    this.squareSize = options.squareSize || 40;
    this.borderColor = options.borderColor || 'rgba(255, 255, 255, 0.08)';
    this.hoverFillColor = options.hoverFillColor || 'rgba(29, 78, 216, 0.35)';
    this.shape = options.shape || 'square';
    this.hoverTrailAmount = typeof options.hoverTrailAmount === 'number' ? options.hoverTrailAmount : 5;

    this.gridOffset = { x: 0, y: 0 };
    this.hoveredSquare = null;
    this.trailCells = [];
    this.cellOpacities = new Map();
    this.requestRef = null;
    this.isVisible = true;
    this.isPageVisible = !document.hidden;

    this.isHex = this.shape === 'hexagon';
    this.isTri = this.shape === 'triangle';
    this.hexHoriz = this.squareSize * 1.5;
    this.hexVert = this.squareSize * Math.sqrt(3);

    this.init();
  }

  init() {
    this.resize = this.resize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.onVisibility = this.onVisibility.bind(this);

    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);

    this.resize();

    // IntersectionObserver to pause render when off-screen
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(([entry]) => {
        this.isVisible = entry.isIntersecting;
        this.isVisible ? this.start() : this.stop();
      }, { threshold: 0 });
      this.io.observe(this.canvas);
    }

    this.start();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
    this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
    this.numSquaresX = Math.ceil(this.canvas.width / this.squareSize) + 1;
    this.numSquaresY = Math.ceil(this.canvas.height / this.squareSize) + 1;
  }

  start() {
    if (this.isVisible && this.isPageVisible && !this.requestRef) {
      this.requestRef = requestAnimationFrame(this.updateAnimation);
    }
  }

  stop() {
    if (this.requestRef) {
      cancelAnimationFrame(this.requestRef);
      this.requestRef = null;
    }
  }

  onVisibility() {
    this.isPageVisible = !document.hidden;
    this.isPageVisible ? this.start() : this.stop();
  }

  drawHex(cx, cy, size) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const vx = cx + size * Math.cos(angle);
      const vy = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
  }

  drawCircle(cx, cy, size) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.closePath();
  }

  drawTriangle(cx, cy, size, flip) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (flip) {
      ctx.moveTo(cx, cy + size / 2);
      ctx.lineTo(cx + size / 2, cy - size / 2);
      ctx.lineTo(cx - size / 2, cy - size / 2);
    } else {
      ctx.moveTo(cx, cy - size / 2);
      ctx.lineTo(cx + size / 2, cy + size / 2);
      ctx.lineTo(cx - size / 2, cy + size / 2);
    }
    ctx.closePath();
  }

  drawGrid() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const squareSize = this.squareSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.isHex) {
      const colShift = Math.floor(this.gridOffset.x / this.hexHoriz);
      const offsetX = ((this.gridOffset.x % this.hexHoriz) + this.hexHoriz) % this.hexHoriz;
      const offsetY = ((this.gridOffset.y % this.hexVert) + this.hexVert) % this.hexVert;

      const cols = Math.ceil(canvas.width / this.hexHoriz) + 3;
      const rows = Math.ceil(canvas.height / this.hexVert) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * this.hexHoriz + offsetX;
          const cy = row * this.hexVert + ((col + colShift) % 2 !== 0 ? this.hexVert / 2 : 0) + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            this.drawHex(cx, cy, squareSize);
            ctx.fillStyle = this.hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          this.drawHex(cx, cy, squareSize);
          ctx.strokeStyle = this.borderColor;
          ctx.stroke();
        }
      }
    } else if (this.isTri) {
      const halfW = squareSize / 2;
      const colShift = Math.floor(this.gridOffset.x / halfW);
      const rowShift = Math.floor(this.gridOffset.y / squareSize);
      const offsetX = ((this.gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const cols = Math.ceil(canvas.width / halfW) + 4;
      const rows = Math.ceil(canvas.height / squareSize) + 4;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * halfW + offsetX;
          const cy = row * squareSize + squareSize / 2 + offsetY;
          const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            this.drawTriangle(cx, cy, squareSize, flip);
            ctx.fillStyle = this.hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          this.drawTriangle(cx, cy, squareSize, flip);
          ctx.strokeStyle = this.borderColor;
          ctx.stroke();
        }
      }
    } else if (this.shape === 'circle') {
      const offsetX = ((this.gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * squareSize + squareSize / 2 + offsetX;
          const cy = row * squareSize + squareSize / 2 + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            this.drawCircle(cx, cy, squareSize);
            ctx.fillStyle = this.hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          this.drawCircle(cx, cy, squareSize);
          ctx.strokeStyle = this.borderColor;
          ctx.stroke();
        }
      }
    } else {
      // Default: square
      const offsetX = ((this.gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.hoverFillColor;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }

          ctx.strokeStyle = this.borderColor;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }
    }

    // Radial gradient dark vignette to blend edges softly into the background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
    );
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0.15)');
    gradient.addColorStop(0.7, 'rgba(10, 10, 10, 0.7)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.95)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  updateAnimation() {
    const effectiveSpeed = Math.max(this.speed, 0.1);
    const wrapX = this.isHex ? this.hexHoriz * 2 : this.squareSize;
    const wrapY = this.isHex ? this.hexVert : this.isTri ? this.squareSize * 2 : this.squareSize;

    switch (this.direction) {
      case 'right':
        this.gridOffset.x = (this.gridOffset.x - effectiveSpeed + wrapX) % wrapX;
        break;
      case 'left':
        this.gridOffset.x = (this.gridOffset.x + effectiveSpeed + wrapX) % wrapX;
        break;
      case 'up':
        this.gridOffset.y = (this.gridOffset.y + effectiveSpeed + wrapY) % wrapY;
        break;
      case 'down':
        this.gridOffset.y = (this.gridOffset.y - effectiveSpeed + wrapY) % wrapY;
        break;
      case 'diagonal':
        this.gridOffset.x = (this.gridOffset.x - effectiveSpeed + wrapX) % wrapX;
        this.gridOffset.y = (this.gridOffset.y - effectiveSpeed + wrapY) % wrapY;
        break;
      default:
        break;
    }

    this.updateCellOpacities();
    this.drawGrid();
    this.requestRef = requestAnimationFrame(this.updateAnimation);
  }

  updateCellOpacities() {
    const targets = new Map();

    if (this.hoveredSquare) {
      targets.set(`${this.hoveredSquare.x},${this.hoveredSquare.y}`, 1);
    }

    if (this.hoverTrailAmount > 0) {
      for (let i = 0; i < this.trailCells.length; i++) {
        const t = this.trailCells[i];
        const key = `${t.x},${t.y}`;
        if (!targets.has(key)) {
          targets.set(key, (this.trailCells.length - i) / (this.trailCells.length + 1));
        }
      }
    }

    for (const [key] of targets) {
      if (!this.cellOpacities.has(key)) {
        this.cellOpacities.set(key, 0);
      }
    }

    for (const [key, opacity] of this.cellOpacities) {
      const target = targets.get(key) || 0;
      const next = opacity + (target - opacity) * 0.15;
      if (next < 0.005) {
        this.cellOpacities.delete(key);
      } else {
        this.cellOpacities.set(key, next);
      }
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const squareSize = this.squareSize;

    if (this.isHex) {
      const colShift = Math.floor(this.gridOffset.x / this.hexHoriz);
      const offsetX = ((this.gridOffset.x % this.hexHoriz) + this.hexHoriz) % this.hexHoriz;
      const offsetY = ((this.gridOffset.y % this.hexVert) + this.hexVert) % this.hexVert;
      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      const col = Math.round(adjustedX / this.hexHoriz);
      const rowOffset = (col + colShift) % 2 !== 0 ? this.hexVert / 2 : 0;
      const row = Math.round((adjustedY - rowOffset) / this.hexVert);

      if (
        !this.hoveredSquare ||
        this.hoveredSquare.x !== col ||
        this.hoveredSquare.y !== row
      ) {
        if (this.hoveredSquare && this.hoverTrailAmount > 0) {
          this.trailCells.unshift({ ...this.hoveredSquare });
          if (this.trailCells.length > this.hoverTrailAmount) this.trailCells.length = this.hoverTrailAmount;
        }
        this.hoveredSquare = { x: col, y: row };
      }
    } else if (this.isTri) {
      const halfW = squareSize / 2;
      const offsetX = ((this.gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      const col = Math.round(adjustedX / halfW);
      const row = Math.floor(adjustedY / squareSize);

      if (
        !this.hoveredSquare ||
        this.hoveredSquare.x !== col ||
        this.hoveredSquare.y !== row
      ) {
        if (this.hoveredSquare && this.hoverTrailAmount > 0) {
          this.trailCells.unshift({ ...this.hoveredSquare });
          if (this.trailCells.length > this.hoverTrailAmount) this.trailCells.length = this.hoverTrailAmount;
        }
        this.hoveredSquare = { x: col, y: row };
      }
    } else if (this.shape === 'circle') {
      const offsetX = ((this.gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      const col = Math.round(adjustedX / squareSize);
      const row = Math.round(adjustedY / squareSize);

      if (
        !this.hoveredSquare ||
        this.hoveredSquare.x !== col ||
        this.hoveredSquare.y !== row
      ) {
        if (this.hoveredSquare && this.hoverTrailAmount > 0) {
          this.trailCells.unshift({ ...this.hoveredSquare });
          if (this.trailCells.length > this.hoverTrailAmount) this.trailCells.length = this.hoverTrailAmount;
        }
        this.hoveredSquare = { x: col, y: row };
      }
    } else {
      const offsetX = ((this.gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((this.gridOffset.y % squareSize) + squareSize) % squareSize;

      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      const col = Math.floor(adjustedX / squareSize);
      const row = Math.floor(adjustedY / squareSize);

      if (
        !this.hoveredSquare ||
        this.hoveredSquare.x !== col ||
        this.hoveredSquare.y !== row
      ) {
        if (this.hoveredSquare && this.hoverTrailAmount > 0) {
          this.trailCells.unshift({ ...this.hoveredSquare });
          if (this.trailCells.length > this.hoverTrailAmount) this.trailCells.length = this.hoverTrailAmount;
        }
        this.hoveredSquare = { x: col, y: row };
      }
    }
  }

  handleMouseLeave() {
    if (this.hoveredSquare && this.hoverTrailAmount > 0) {
      this.trailCells.unshift({ ...this.hoveredSquare });
      if (this.trailCells.length > this.hoverTrailAmount) this.trailCells.length = this.hoverTrailAmount;
    }
    this.hoveredSquare = null;
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    if (this.io) this.io.disconnect();
    this.stop();
  }
}

if (typeof window !== 'undefined') {
  window.ShapeGrid = ShapeGrid;
}
