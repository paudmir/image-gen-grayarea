# Cloudflare AI Image Generator - Setup Guide

This guide will help you set up your Cloudflare account and configure the application to generate images using Stable Diffusion XL.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Cloudflare account (free tier works!)

---

## Step 1: Create a Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Create a free account
3. Verify your email address

---

## Step 2: Get Your Account ID

1. Log in to your Cloudflare dashboard: [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. In the right sidebar, look for **Account ID**
3. Click the copy icon to copy your Account ID
4. Save this for later - you'll need it in your `.env` file

**Alternative method:**
- Navigate to any section in the dashboard
- Look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
- The Account ID is the long string of characters after `dash.cloudflare.com/`

---

## Step 3: Create an API Token

1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. You have two options:

### Option A: Use a Template (Recommended)
- Look for a template related to Workers or AI
- Click **"Use template"**
- Make sure it has **Workers AI** permissions

### Option B: Create Custom Token
1. Click **"Create Custom Token"**
2. Give it a name like "Workers AI Image Generator"
3. Under **Permissions**, add:
   - Account → Workers AI → Edit
   - (or at minimum: Account → Workers AI → Read)
4. Under **Account Resources**, select:
   - Include → Your account name
5. Click **"Continue to summary"**
6. Review the token and click **"Create Token"**

4. **IMPORTANT:** Copy the token immediately! You won't be able to see it again
5. Save this token securely - you'll need it in your `.env` file

---

## Step 4: Configure the Application

1. Open the `.env` file in the project root directory
2. Replace the placeholder values with your actual credentials:

```env
CLOUDFLARE_ACCOUNT_ID=your_actual_account_id_here
CLOUDFLARE_API_TOKEN=your_actual_api_token_here
```

**Example:**
```env
CLOUDFLARE_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CLOUDFLARE_API_TOKEN=abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
```

3. Save the file

---

## Step 5: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `node-fetch` - HTTP client for API requests
- `concurrently` - Run multiple commands simultaneously

---

## Step 6: Start the Application

Run the following command:

```bash
npm start
```

This will:
1. Start the Express backend server on `http://localhost:3000`
2. Start a static file server on `http://localhost:8000`

You should see output like:
```
🚀 Server running on http://localhost:3000
📡 Image generation endpoint: http://localhost:3000/generate-image
✅ Cloudflare Account ID: a1b2c3d4...
```

---

## Step 7: Use the Application

1. Open your browser and go to [http://localhost:8000](http://localhost:8000)
2. Enter a text prompt describing the image you want to generate
3. Click **"Generate Image"**
4. Wait for the loading animation (the image takes ~10-20 seconds to generate)
5. Your generated image will appear on the canvas!

---

## Troubleshooting

### Error: "Missing Cloudflare credentials"
- Check that your `.env` file has both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
- Make sure there are no extra spaces or quotes around the values
- Restart the server after updating the `.env` file

### Error: "Failed to generate image" (401 Unauthorized)
- Your API token may be invalid or expired
- Create a new API token following Step 3
- Make sure the token has Workers AI permissions

### Error: "Failed to generate image" (403 Forbidden)
- Your API token doesn't have the right permissions
- Recreate the token with Workers AI → Edit permissions
- Make sure you selected the correct account in the token configuration

### Server won't start / Port already in use
- Another application is using port 3000 or 8000
- Stop other applications or change the port in `server.js` (line 5) and `package.json`

### CORS errors in the browser
- Make sure both servers are running (backend on 3000, frontend on 8000)
- Don't open `index.html` directly - use the http-server URL

---

## Cost & Rate Limits

**Cloudflare Workers AI Pricing:**
- Free tier: 10,000 Neurons per day (each Stable Diffusion XL request uses neurons)
- Paid tier: Pay-as-you-go pricing

Check current pricing: [https://developers.cloudflare.com/workers-ai/platform/pricing/](https://developers.cloudflare.com/workers-ai/platform/pricing/)

---

## Additional Resources

- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Stable Diffusion XL Model Details](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-base-1.0/)
- [API Authentication Guide](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

## Security Notes

- **NEVER** commit your `.env` file to version control
- **NEVER** share your API token publicly
- The `.gitignore` file is configured to prevent accidental commits
- If you accidentally expose your token, revoke it immediately in the Cloudflare dashboard

---

Enjoy generating images with AI!
