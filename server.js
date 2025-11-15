require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname)) //Jeff/Claude said to add this one

// Cloudflare API configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Validate environment variables
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  console.error('❌ ERROR: Missing Cloudflare credentials!');
  console.error('Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env file');
  console.error('See SETUP.md for instructions');
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Image generation endpoint
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`📝 Generating image for prompt: "${prompt}"`);

    // Prepare the request to Cloudflare Workers AI
    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

    const response = await fetch(cloudflareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "nsfw, nude, naked, explicit, sexual, adult content, pornographic",
        width: 512,
        height: 512,
        num_steps: 20,
        guidance: 7.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudflare API error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to generate image',
        details: errorText
      });
    }

    // Get the image as a buffer
    const imageBuffer = await response.buffer();

    console.log('✅ Image generated successfully');

    // Send the image back as base64
    const base64Image = imageBuffer.toString('base64');
    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Image generation endpoint: http://localhost:${PORT}/generate-image`);
  console.log(`✅ Cloudflare Account ID: ${CLOUDFLARE_ACCOUNT_ID.substring(0, 8)}...`);
});
