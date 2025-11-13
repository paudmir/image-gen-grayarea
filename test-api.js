require('dotenv').config();
const fetch = require('node-fetch');

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

console.log('Testing Cloudflare API...');
console.log('Account ID:', CLOUDFLARE_ACCOUNT_ID);
console.log('Token (first 10 chars):', CLOUDFLARE_API_TOKEN?.substring(0, 10) + '...');

async function testAPI() {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

    console.log('\nMaking request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "a cat",
        width: 512,
        height: 512,
        num_steps: 20,
        guidance: 7.5
      }),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\nError response:', errorText);
      return;
    }

    const contentType = response.headers.get('content-type');
    console.log('\nContent-Type:', contentType);

    const buffer = await response.buffer();
    console.log('Response size:', buffer.length, 'bytes');
    console.log('SUCCESS! API is working.');

  } catch (error) {
    console.error('\nError:', error.message);
    console.error(error);
  }
}

testAPI();
