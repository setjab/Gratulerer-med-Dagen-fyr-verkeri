class Firework {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }

  reset() {
    // Launch point
    this.x = Math.random() * this.canvasWidth;
    this.y = this.canvasHeight;

    // Vibrant, random color
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;

    // Randomized launch trajectory
    this.dx = (Math.random() - 0.5) * 3;
    this.dy = -(Math.random() * 10 + 10);

    this.exploded = false;
    this.particles = [];
    this.age = 0;
  }

  launch() {
    this.x += this.dx;
    this.y += this.dy;

    // Draw launch trail
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.dx, this.y - this.dy);
    this.ctx.lineTo(this.x, this.y);
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();

    // Check for explosion
    if (this.y <= this.canvasHeight * Math.random() * 0.5) {
      this.explode();
    }
  }

  explode() {
    const particleCount = Math.floor(Math.random() * 50 + 50);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;

      this.particles.push({
        x: this.x,
        y: this.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        alpha: 1,
        color: this.color,
        trail: [{ x: this.x, y: this.y }],
        maxTrailLength: 10
      });
    }
    this.exploded = true;
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Mouvement de particule
      particle.x += particle.dx;
      particle.y += particle.dy;

      // Ajouter le point actuel à la traînée
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > particle.maxTrailLength) {
        particle.trail.shift();
      }

      // Gravité et friction
      particle.dy += 0.15;
      particle.dx *= 0.99;

      // Dessiner la traînée
      if (particle.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let j = 1; j < particle.trail.length; j++) {
          this.ctx.lineTo(particle.trail[j].x, particle.trail[j].y);
        }
        this.ctx.strokeStyle = `rgba(${this.getRGB(particle.color)}, ${
          particle.alpha
        })`;
        this.ctx.lineWidth = particle.size / 2;
        this.ctx.stroke();
      }

      // Dessiner la particule
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.getRGB(particle.color)}, ${
        particle.alpha
      })`;
      this.ctx.fill();

      // Diminution de l'alpha
      particle.alpha -= 0.01;

      if (
        particle.alpha <= 0 ||
        particle.x < 0 ||
        particle.x > this.canvasWidth ||
        particle.y > this.canvasHeight
      ) {
        this.particles.splice(i, 1);
      }
    }
  }

  update() {
    this.age++;

    if (!this.exploded) {
      this.launch();
    } else {
      this.updateParticles();
    }

    // Reset if all particles are gone
    if (this.exploded && this.particles.length === 0) {
      this.reset();
    }
  }

  // Fonction utilitaire pour convertir HSL en RGB
  getRGB(hslColor) {
    const match = hslColor.match(/hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [_, h, s, l] = match;
      const rgb = this.hslToRgb(parseFloat(h), parseInt(s), parseInt(l));
      return rgb.join(",");
    }
    return "255,255,255"; // Couleur par défaut si la conversion échoue
  }

  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }
}

class FireworksDisplay {
  constructor() {
    this.canvas = document.getElementById("fireworks-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();

    this.fireworks = [];
    for (let i = 0; i < 8; i++) {
      this.fireworks.push(
        new Firework(this.ctx, this.canvas.width, this.canvas.height)
      );
    }

    window.addEventListener("resize", () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {
    // Effet de fondu plus subtil
    this.ctx.fillStyle = "rgba(7, 7, 48, 0.15)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw fireworks
    this.fireworks.forEach((firework) => firework.update());

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize on page load
new FireworksDisplay();
