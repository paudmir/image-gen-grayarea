# Cloudflare AI Image Generator with p5.js

A creative coding project that combines Cloudflare Workers AI with p5.js to generate images using Stable Diffusion XL. Enter a text prompt and watch AI create unique images in real-time.

## Features

- AI-powered image generation using Stable Diffusion XL
- Interactive p5.js canvas with loading animations
- Express backend server for secure API handling
- Simple, clean web interface
- Real-time status updates

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Cloudflare account (free tier works!)

## Quick Start

### 1. Clone or Download the Project

```bash
cd "Cloudflare Image Gen + p5"
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `node-fetch` - HTTP client for API requests
- `concurrently` - Run multiple commands simultaneously

### 3. Configure Cloudflare Credentials

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit [.env](.env) and add your Cloudflare credentials:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

Need help getting these credentials? See the detailed [SETUP.md](SETUP.md) guide.

### 4. Start the Application

```bash
npm start
```

This will:
1. Start the Express backend server on `http://localhost:3000`
2. Start a static file server on `http://localhost:8000`

You should see:
```
🚀 Server running on http://localhost:3000
📡 Image generation endpoint: http://localhost:3000/generate-image
✅ Cloudflare Account ID: a1b2c3d4...
```

### 5. Use the Application

1. Open your browser and go to [http://localhost:8000](http://localhost:8000)
2. Enter a text prompt (e.g., "a serene mountain landscape at sunset")
3. Click **"Generate Image"**
4. Wait ~10-20 seconds for the AI to generate your image
5. The image will appear on the canvas!

## Project Structure

```
├── index.html          # Main HTML interface
├── sketch.js           # p5.js sketch with canvas logic
├── style.css           # Styling
├── server.js           # Express backend server
├── package.json        # Project dependencies
├── .env                # Environment variables (DO NOT COMMIT)
├── .env.example        # Example environment file
├── SETUP.md            # Detailed setup instructions
└── libraries/          # p5.js library files
```

## Available Scripts

- `npm start` - Start both the backend server and frontend static server
- `npm run server` - Start only the backend server
- `npm run dev` - Start the backend server with nodemon (auto-restart on changes)

## How It Works

1. User enters a text prompt in the web interface
2. [sketch.js](sketch.js) sends the prompt to the Express backend
3. [server.js](server.js) forwards the request to Cloudflare Workers AI API
4. Cloudflare generates an image using Stable Diffusion XL
5. The server returns the image as base64 data
6. p5.js displays the image on the canvas

## Configuration

The image generation uses these parameters (in [server.js](server.js:50-56)):

- `width`: 512 pixels
- `height`: 512 pixels
- `num_steps`: 20 (quality vs. speed tradeoff)
- `guidance`: 7.5 (how closely to follow the prompt)
- `negative_prompt`: Filters out unwanted content

You can modify these values to customize the output.

## Troubleshooting

### "Missing Cloudflare credentials"
- Check that your [.env](.env) file has both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
- Make sure there are no extra spaces or quotes
- Restart the server after updating `.env`

### "Failed to generate image" (401/403 errors)
- Your API token may be invalid or lack permissions
- See [SETUP.md](SETUP.md) for detailed instructions on creating a token with the correct permissions

### Server won't start / Port already in use
- Another application is using port 3000 or 8000
- Stop other applications or change the port in [server.js](server.js:7) and [package.json](package.json:7)

### CORS errors
- Make sure both servers are running
- Access the app via `http://localhost:8000`, not by opening `index.html` directly

## Cost & Rate Limits

**Cloudflare Workers AI Pricing:**
- Free tier: 10,000 Neurons per day
- Each Stable Diffusion XL request consumes neurons
- Check current pricing: [Cloudflare Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

## Security Notes

- **NEVER** commit your `.env` file to version control
- **NEVER** share your API token publicly
- If you accidentally expose your token, revoke it immediately in the Cloudflare dashboard
- The [.gitignore](.gitignore) file is configured to prevent accidental commits

## Resources

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Stable Diffusion XL Model Details](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-base-1.0/)
- [p5.js Reference](https://p5js.org/reference/)
- [Detailed Setup Guide](SETUP.md)

## License

MIT

## Tips for Better Image Generation

- Be specific and descriptive in your prompts
- Include art style keywords (e.g., "oil painting", "photorealistic", "watercolor")
- Describe lighting, mood, and composition
- Experiment with different prompt variations

Example prompts:
- "a cozy coffee shop in Paris, warm lighting, impressionist style"
- "futuristic city skyline at night, neon lights, cyberpunk aesthetic"
- "peaceful zen garden with cherry blossoms, watercolor painting"
