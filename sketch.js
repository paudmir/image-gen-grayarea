let generatedImage = null;
let isLoading = false;
let loadingAngle = 0;
let statusText = '';

// Pixelate animation
let pixelateProgress = 0; // 0 = normal, 1 = fully pixelated
let targetProgress = 0; // What we're animating towards
let animating = false;
let animationStartTime = 0;
const ANIMATION_DURATION = 2000; // 2 seconds

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');

  // Set up button click handlers
  const generateBtn = document.getElementById('generateBtn');
  const pixelateBtn = document.getElementById('pixelateBtn');
  const promptInput = document.getElementById('promptInput');

  generateBtn.addEventListener('click', () => generateImage());
  pixelateBtn.addEventListener('click', () => togglePixelate());

  // Allow Enter key to trigger generation
  promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateImage();
    }
  });
}

function draw() {
  background(240);

  if (isLoading) {
    drawLoadingSpinner();
  } else if (generatedImage) {
    drawGeneratedImage();
  } else {
    drawPlaceholder();
  }
}

function drawPlaceholder() {
  push();
  fill(200);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text('Enter a prompt and click Generate', width / 2, height / 2);
  pop();
}

function drawLoadingSpinner() {
  push();
  translate(width / 2, height / 2);

  // Animated rotating arcs
  strokeWeight(8);
  noFill();

  // Outer arc
  stroke(100, 150, 255);
  arc(0, 0, 120, 120, loadingAngle, loadingAngle + PI);

  // Inner arc (rotating opposite direction)
  stroke(150, 100, 255);
  arc(0, 0, 80, 80, -loadingAngle * 1.5, -loadingAngle * 1.5 + PI);

  // Center circle
  fill(100, 150, 255);
  noStroke();
  circle(0, 0, 20);

  pop();

  // Increment rotation
  loadingAngle += 0.05;

  // Loading text
  push();
  fill(100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text('Generating image...', width / 2, height / 2 + 100);
  pop();
}

function drawGeneratedImage() {
  push();

  // Update animation
  if (animating) {
    let elapsed = millis() - animationStartTime;
    let t = constrain(elapsed / ANIMATION_DURATION, 0, 1);
    // Ease in-out cubic for smooth animation
    let eased = t < 0.5
      ? 4 * t * t * t
      : 1 - pow(-2 * t + 2, 3) / 2;

    // Interpolate between current and target
    let startProgress = targetProgress === 1 ? 0 : 1;
    pixelateProgress = lerp(startProgress, targetProgress, eased);

    if (t >= 1) {
      animating = false;
      pixelateProgress = targetProgress;
    }
  }

  // Calculate scaling to fit nicely in canvas while maintaining aspect ratio
  let imgWidth = generatedImage.width;
  let imgHeight = generatedImage.height;
  let maxSize = min(width, height) * 0.85;

  let scale = min(maxSize / imgWidth, maxSize / imgHeight);
  let displayWidth = imgWidth * scale;
  let displayHeight = imgHeight * scale;

  // Apply pixelate effect
  if (pixelateProgress > 0) {
    // Pixel size ranges from 1 (normal) to 20 (very pixelated)
    let pixelSize = floor(1 + pixelateProgress * 19);

    // Create a temporary graphics buffer for the effect
    let pg = createGraphics(floor(displayWidth / pixelSize), floor(displayHeight / pixelSize));
    pg.image(generatedImage, 0, 0, pg.width, pg.height);

    imageMode(CENTER);
    image(pg, width / 2, height / 2, displayWidth, displayHeight);
    pg.remove(); // Clean up
  } else {
    // Draw normal image
    imageMode(CENTER);
    image(generatedImage, width / 2, height / 2, displayWidth, displayHeight);
  }

  pop();
}

async function generateImage() {
  const promptInput = document.getElementById('promptInput');
  const prompt = promptInput.value.trim();

  if (!prompt) {
    updateStatus('Please enter a prompt first!', 'error');
    return;
  }

  // Start loading
  isLoading = true;
  generatedImage = null;
  loadingAngle = 0;
  updateStatus('Generating your image...', 'info');

  try {
    const response = await fetch('http://localhost:3000/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate image');
    }

    // Load the base64 image into p5.js
    loadImage(data.image, (img) => {
      generatedImage = img;
      isLoading = false;
      updateStatus(`Image generated successfully! Prompt: "${prompt}"`, 'success');
    }, (err) => {
      console.error('Error loading image:', err);
      isLoading = false;
      updateStatus('Error loading the generated image', 'error');
    });

  } catch (error) {
    console.error('Error:', error);
    isLoading = false;
    updateStatus(`Error: ${error.message}`, 'error');
  }
}

function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('statusText');
  statusElement.textContent = message;
  statusElement.className = `info ${type}`;
}

function togglePixelate() {
  if (!generatedImage) {
    updateStatus('Generate an image first!', 'error');
    return;
  }

  // Toggle between pixelated and normal
  if (pixelateProgress < 0.5) {
    // Animate to pixelated
    targetProgress = 1;
  } else {
    // Animate back to normal
    targetProgress = 0;
  }

  animating = true;
  animationStartTime = millis();
}
