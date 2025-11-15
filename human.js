let images = [];
let generatedImage = null;
let isLoading = false;
let loadingProgress = 0;
let totalImages = 9;
let gridPositions = [];
let selectedImages = [];
let testComplete = false;
let resultMessage = '';

// Images with holes/bumps (trypophobia triggers)
const trypophobiaPrompts = [
  "macro photograph of a honeycomb with hexagonal holes, natural lighting, well defined, very clustered, lots of holes",
  "close up photo of empty lotus seed pod with multiple holes",
  "coral formation with multiple clustered circular holes, underwater photography"
];

// Normal nature images
const normalPrompts = [
  "close up macro photograph of green leaf veins and texture",
  "detailed texture of animal fur with natural lighting",
  "macro photograph of colorful bird feathers",
  "close up of tree bark texture with moss",
  "vibrant tropical flower petals macro shot",
  "ocean waves crashing into rocks"
];

// Track which images are trypophobia images
let trypophobiaIndices = [];

function setup() {
  let canvas = createCanvas(900, 900);
  canvas.parent('canvas-container');

  // Calculate grid positions (3x3 grid)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      gridPositions.push({
        x: col * 300,
        y: row * 300,
        width: 300,
        height: 300,
        index: row * 3 + col
      });
    }
  }

  // Start button handler
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => startTest());
  }

  // Submit button handler
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => submitTest());
  }
}

function draw() {
  background(240);

  if (isLoading) {
    drawLoadingState();
  } else if (images.length === totalImages) {
    drawImageGrid();
    if (testComplete) {
      drawResult();
    }
  } else {
    drawStartPrompt();
  }
}

function drawStartPrompt() {
  push();
  fill(100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text('Click "Start Test" to begin', width / 2, height / 2);
  textSize(16);
  fill(150);
  text('Select all images that make you uncomfortable', width / 2, height / 2 + 40);
  pop();
}

function drawLoadingState() {
  push();
  fill(100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Generating images...', width / 2, height / 2 - 40);

  // Progress bar
  let barWidth = 400;
  let barHeight = 30;
  let barX = width / 2 - barWidth / 2;
  let barY = height / 2;

  // Background
  fill(200);
  rect(barX, barY, barWidth, barHeight, 5);

  // Progress
  fill(100, 150, 255);
  let progress = loadingProgress / totalImages;
  rect(barX, barY, barWidth * progress, barHeight, 5);

  // Text
  fill(100);
  textSize(16);
  text(`${loadingProgress} / ${totalImages}`, width / 2, barY + barHeight + 30);
  pop();
}

function drawImageGrid() {
  for (let i = 0; i < images.length; i++) {
    if (images[i]) {
      let pos = gridPositions[i];

      push();
      // Highlight if selected
      if (selectedImages.includes(i)) {
        stroke(100, 200, 100);
        strokeWeight(6);
        fill(100, 200, 100, 50);
        rect(pos.x, pos.y, pos.width, pos.height);
      }

      // Draw image
      imageMode(CORNER);
      image(images[i], pos.x, pos.y, pos.width, pos.height);

      // Hover effect
      if (isMouseOverImage(i) && !testComplete) {
        noFill();
        stroke(255, 200, 0);
        strokeWeight(4);
        rect(pos.x, pos.y, pos.width, pos.height);
      }

      pop();
    }
  }

  // Show/hide submit button based on selection
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    if (selectedImages.length > 0 && !testComplete) {
      submitBtn.classList.add('visible');
    } else {
      submitBtn.classList.remove('visible');
    }
  }
}


function drawResult() {
  push();
  // Semi-transparent overlay
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  // Result box
  fill(255);
  noStroke();
  let boxW = 500;
  let boxH = 300;
  rect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 10);

  // Result text
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(32);
  let isHuman = checkIfHuman();
  text(isHuman ? 'HUMAN ' : 'MACHINE ', width / 2, height / 2 - 60);

  textSize(16);
  fill(100);
  text(resultMessage, width / 2, height / 2, boxW - 40);

  // Restart button
  let btnY = height / 2 + 80;
  let btnW = 150;
  let btnH = 40;
  let btnX = width / 2 - btnW / 2;

  let isHover = mouseX > btnX && mouseX < btnX + btnW &&
                mouseY > btnY && mouseY < btnY + btnH;

  fill(isHover ? 80 : 100, 150, 255);
  rect(btnX, btnY, btnW, btnH, 5);

  fill(255);
  textSize(18);
  text('Try Again', width / 2, btnY + btnH / 2);
  pop();
}

function isMouseOverImage(index) {
  let pos = gridPositions[index];
  return mouseX > pos.x && mouseX < pos.x + pos.width &&
         mouseY > pos.y && mouseY < pos.y + pos.height;
}

function mousePressed() {
  if (isLoading || images.length !== totalImages) return;

  if (testComplete) {
    // Check restart button click
    let btnY = height / 2 + 80;
    let btnW = 150;
    let btnH = 40;
    let btnX = width / 2 - btnW / 2;

    if (mouseX > btnX && mouseX < btnX + btnW &&
        mouseY > btnY && mouseY < btnY + btnH) {
      restartTest();
    }
    return;
  }

  // Check image clicks
  for (let i = 0; i < images.length; i++) {
    if (isMouseOverImage(i)) {
      toggleImageSelection(i);
      break;
    }
  }
}

function toggleImageSelection(index) {
  let idx = selectedImages.indexOf(index);
  if (idx > -1) {
    selectedImages.splice(idx, 1);
  } else {
    selectedImages.push(index);
  }
}

async function startTest() {
  if (isLoading) return;

  isLoading = true;
  loadingProgress = 0;
  images = [];
  selectedImages = [];
  testComplete = false;
  trypophobiaIndices = [];

  // Create array of all prompts
  let allPrompts = [...trypophobiaPrompts, ...normalPrompts];

  // Shuffle array to randomize positions
  let shuffledPrompts = shuffleArray(allPrompts);

  // Track which indices are trypophobia images
  for (let i = 0; i < shuffledPrompts.length; i++) {
    if (trypophobiaPrompts.includes(shuffledPrompts[i])) {
      trypophobiaIndices.push(i);
    }
  }

  // Generate all images with delay to avoid rate limiting
  for (let i = 0; i < totalImages; i++) {
    try {
      updateStatus(`Generating image ${i + 1} of ${totalImages}...`, 'info');
      let img = await generateSingleImage(shuffledPrompts[i]);
      images[i] = img;
      loadingProgress++;

      // Add a delay between requests to avoid overwhelming the API
      if (i < totalImages - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
      updateStatus(`Error on image ${i + 1}, using placeholder...`, 'error');
      // Create placeholder on error
      images[i] = createPlaceholderImage(i, error.message);
      loadingProgress++;

      // Still add delay even on error
      if (i < totalImages - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }
  }

  isLoading = false;
  updateStatus('Select all images that make you feel uncomfortable, then click Submit', 'info');
}

async function generateSingleImage(promptParam) {
  let prompt;

  if (promptParam) {
    // Use the provided prompt (for automated test)
    prompt = promptParam;
  } else {
    // Read from input field (for manual image generation)
    const promptInput = document.getElementById('promptInput');
    if (!promptInput) {
      updateStatus('Prompt input not found!', 'error');
      return;
    }
    prompt = promptInput.value.trim();

    if (!prompt) {
      updateStatus('Please enter a prompt first!', 'error');
      return;
    }
  }

  // Start loading
  isLoading = true;
  generatedImage = null;
  loadingAngle = 0;
  updateStatus('Generating your image...', 'info');

  try {
    // Use environment-aware URL: relative path in production, localhost in development
    const apiUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000/generate-image'
      : '/generate-image';

    const response = await fetch(apiUrl, {
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

    // Load the base64 image into p5.js and return a Promise
    return new Promise((resolve, reject) => {
      loadImage(data.image, (img) => {
        generatedImage = img;
        isLoading = false;
        updateStatus(`Image generated successfully! Prompt: "${prompt}"`, 'success');
        resolve(img); // Return the image for use in startTest
      }, (err) => {
        console.error('Error loading image:', err);
        isLoading = false;
        updateStatus('Error loading the generated image', 'error');
        reject(err);
      });
    });

  } catch (error) {
    console.error('Error:', error);
    isLoading = false;
    updateStatus(`Error: ${error.message}`, 'error');
    throw error; // Re-throw so startTest can catch it
  }
}

function createPlaceholderImage(index = 0, errorMsg = '') {
  let pg = createGraphics(300, 300);
  pg.background(220, 100, 100);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(16);
  pg.text(`Error loading`, 150, 130);
  pg.text(`image ${index + 1}`, 150, 150);
  if (errorMsg) {
    pg.textSize(10);
    pg.fill(255, 200);
    pg.text(errorMsg.substring(0, 40), 150, 180, 280);
  }
  return pg;
}

function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function submitTest() {
  testComplete = true;

  let isHuman = checkIfHuman();

  if (isHuman) {
    resultMessage = 'You selected all the images with clustered holes or bumps. This suggests a natural human response to trypophobic patterns.';
  } else {
    resultMessage = 'Your selections don\'t match typical human responses to trypophobic imagery. Machines often struggle to identify uncomfortable visual patterns.';
  }
}

function checkIfHuman() {
  // Check if all trypophobia images were selected
  if (selectedImages.length !== trypophobiaIndices.length) {
    return false;
  }

  // Check if selected images match trypophobia indices
  let sortedSelected = [...selectedImages].sort((a, b) => a - b);
  let sortedTrypophobia = [...trypophobiaIndices].sort((a, b) => a - b);

  for (let i = 0; i < sortedSelected.length; i++) {
    if (sortedSelected[i] !== sortedTrypophobia[i]) {
      return false;
    }
  }

  return true;
}

function restartTest() {
  images = [];
  selectedImages = [];
  testComplete = false;
  trypophobiaIndices = [];
  loadingProgress = 0;
  resultMessage = '';
  updateStatus('', 'info');
}

function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('statusText');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `info ${type}`;
  }
}
