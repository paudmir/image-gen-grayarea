let generatedImage = null;
let isLoading = false;
let loadingAngle = 0;
let statusText = '';

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent('canvas-container');

  // Set up button click handler
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('promptInput');

  generateBtn.addEventListener('click', () => generateImage());

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
  imageMode(CENTER);

  // Calculate scaling to fit nicely in canvas while maintaining aspect ratio
  let imgWidth = generatedImage.width;
  let imgHeight = generatedImage.height;
  let maxSize = min(width, height) * 0.85;

  let scale = min(maxSize / imgWidth, maxSize / imgHeight);
  let displayWidth = imgWidth * scale;
  let displayHeight = imgHeight * scale;

  // Draw image centered
  image(generatedImage, width / 2, height / 2, displayWidth, displayHeight);

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
