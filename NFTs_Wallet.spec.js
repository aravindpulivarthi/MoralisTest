const {test, expect} = require('@playwright/test')
require('dotenv').config();

let API_Key;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

test.describe('Positive Tests for getWalletNFTs endpoint',()=>{
    test('Login to Moralis', async ({page})=>{

        //test.setTimeout(75000);

        await page.goto('https://admin.moralis.io/login')
        await page.waitForTimeout(3000)
        
        try {
            await page.getByRole('button', { name: 'Accept all' }).click();
            console.log('Cookie consent accepted.');
        } catch (e) {
            console.log('Cookie consent dialog not found or failed to click.');
        }

        await page.fill("//label[@for='admin-login-email']",username)
        await page.fill("//label[@for='admin-login-password']",password)
        await page.click("//span[normalize-space()='Log in']")
        await page.waitForTimeout(3000)
        const copyButton = await page.locator("//button[@aria-label='Copy to Clipboard']");
        await copyButton.click();

        //Retrieve the copied URL from the clipboard
        API_Key = await page.evaluate(() => navigator.clipboard.readText());
        console.log('Copied API Key:', API_Key);

    })

    test('Fetch NFTs for a valid wallet address', async ({ request }) => {
        const response = await request.get('https://deep-index.moralis.io/api/v2/0xff3879b8a363aed92a6eaba8f61f1a96a9ec3c1e/nft', {
            headers: {
                'X-API-Key': API_Key,
            },
            params: {
                chain: 'eth', // Specify the blockchain network, e.g., Ethereum
                limit: 10,      //fetch only 10 NFTs
            }
        });
        expect(response.status()).toBe(200);
        const nfts = await response.json();
        console.log(`NFT Response: ${JSON.stringify(nfts.result)}`);
        expect(nfts).toHaveProperty('result'); // Ensure 'result' field exists
        //expect(nfts.result.length).toBeGreaterThan(0); // Ensure NFTs are returned
        expect(nfts.result.length).toBe(10);  //Ensure NFTs are returned exactly 10


    });
});

//*********Negative Scenarios******/

test.describe('Positive Tests for getWalletNFTs endpoint',()=>{
    //Invalid API Key
    test('Fetch NFTs with invalid API Key', async ({ request }) => {
        const invalidApiKey = 'invalid_api_key';
        
        const response = await request.get('https://deep-index.moralis.io/api/v2/0xff3879b8a363aed92a6eaba8f61f1a96a9ec3c1e/nft', {
            headers: {
                'X-API-Key': invalidApiKey,
            },
            params: {
                chain: 'eth',
                limit: 10,
            }
        });

        expect(response.status()).toBe(401); // Unauthorized
        const responseBody = await response.text();
        console.log('Error response:', responseBody);
        
    });


    //
    test('Fetch NFTs with invalid wallet address', async ({ request }) => {
        const response = await request.get('https://deep-index.moralis.io/api/v2/invalid_wallet_address/nft', {
            headers: {
                'X-API-Key': API_Key,
            },
            params: {
                chain: 'eth',
                limit: 10,
            }
        });

        expect(response.status()).toBe(400); // Bad Request
        const responseBody = await response.text();
        console.log('Error response:', responseBody);
    
    });

    //Invalid Chain Parameter
    test('Fetch NFTs with incorrect chain parameter', async ({ request }) => {
        const response = await request.get('https://deep-index.moralis.io/api/v2/0xff3879b8a363aed92a6eaba8f61f1a96a9ec3c1e/nft', {
            headers: {
                'X-API-Key': API_Key,
            },
            params: {
                chain: 'invalid_chain',
                limit: 10,
            }
        });

        expect(response.status()).toBe(400); // Bad Request
        const responseBody = await response.text();
        console.log('Error response:', responseBody);
        
    });
});