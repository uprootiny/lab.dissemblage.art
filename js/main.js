window.addEventListener('load', function() {
    initChaoticFields();
    initVoronoiGrowth();
    initWaveInterference();
});

/* =======================================================
   Chaotic Fields Demo
   ======================================================= */
function initChaoticFields() {
    const canvas = document.getElementById('fields');
    const ctx = canvas.getContext('2d');
    // Set canvas dimensions (you can adjust as needed)
    canvas.width = canvas.clientWidth = canvas.offsetWidth;
    canvas.height = canvas.clientHeight = canvas.offsetHeight;

    const numParticles = 200;
    const particles = [];

    // Initialize particles with random positions and velocities
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }

    let lastTime = performance.now();

    function update() {
        const now = performance.now();
        const dt = (now - lastTime) / 1000; // seconds
        lastTime = now;
        const timeFactor = now * 0.001;

        // Draw a semi-transparent rectangle to fade previous frames
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';

        particles.forEach(p => {
            // Compute acceleration based on a dynamic, “chaotic” function
            let ax = Math.sin(p.y * 0.05 + timeFactor);
            let ay = Math.cos(p.x * 0.05 + timeFactor);

            p.vx += ax * dt * 50;
            p.vy += ay * dt * 50;

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Wrap around edges
            if (p.x < 0) p.x += canvas.width;
            if (p.x > canvas.width) p.x -= canvas.width;
            if (p.y < 0) p.y += canvas.height;
            if (p.y > canvas.height) p.y -= canvas.height;

            // Draw the particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(update);
    }
    update();
}

/* =======================================================
   Voronoi Growth Demo
   (Simulated by expanding circles that stop growing on contact)
   ======================================================= */
function initVoronoiGrowth() {
    const canvas = document.getElementById('voronoi');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth = canvas.offsetWidth;
    canvas.height = canvas.clientHeight = canvas.offsetHeight;

    const numSeeds = 20;
    const seeds = [];

    // Initialize seeds with random positions, a starting radius, and a random color
    for (let i = 0; i < numSeeds; i++) {
        seeds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 1,
            growing: true,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`
        });
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        seeds.forEach(seed => {
            if (seed.growing) {
                // Stop growing if touching canvas edge
                if (seed.x - seed.r <= 0 || seed.x + seed.r >= canvas.width ||
                    seed.y - seed.r <= 0 || seed.y + seed.r >= canvas.height) {
                    seed.growing = false;
                } else {
                    // Stop growing if touching another seed
                    for (let other of seeds) {
                        if (other === seed) continue;
                        const dx = seed.x - other.x;
                        const dy = seed.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < seed.r + other.r + 2) { // adding a small gap
                            seed.growing = false;
                            break;
                        }
                    }
                }
            }
            if (seed.growing) {
                seed.r += 0.5;
            }
            // Draw the growing circle
            ctx.fillStyle = seed.color;
            ctx.beginPath();
            ctx.arc(seed.x, seed.y, seed.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(update);
    }
    update();
}

/* =======================================================
   Wave Interference Demo
   (Using two wave sources to create an interference pattern)
   ======================================================= */
function initWaveInterference() {
    const canvas = document.getElementById('waves');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth = canvas.offsetWidth;
    canvas.height = canvas.clientHeight = canvas.offsetHeight;

    // Define two wave sources within the canvas
    const source1 = { x: canvas.width * 0.3, y: canvas.height * 0.5 };
    const source2 = { x: canvas.width * 0.7, y: canvas.height * 0.5 };
    const wavelength = 20;
    let time = 0;

    function update() {
        time += 0.1;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                // Calculate distances from pixel to each wave source
                const d1 = Math.hypot(x - source1.x, y - source1.y);
                const d2 = Math.hypot(x - source2.x, y - source2.y);

                // Calculate wave contributions (cosine waves) and sum them
                const wave1 = Math.cos((d1 / wavelength) * 2 * Math.PI - time);
                const wave2 = Math.cos((d2 / wavelength) * 2 * Math.PI - time);
                const intensity = (wave1 + wave2) / 2; // Range from -1 to 1

                // Map intensity to grayscale (0-255)
                const color = Math.floor((intensity + 1) * 127.5);
                data[index] = color;      // Red
                data[index + 1] = color;  // Green
                data[index + 2] = color;  // Blue
                data[index + 3] = 255;    // Alpha (fully opaque)
            }
        }
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(update);
    }
    update();
}
