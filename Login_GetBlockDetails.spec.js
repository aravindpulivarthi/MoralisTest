const {test, expect} = require('@playwright/test')
require('dotenv').config();

let nodeURL; 
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
let latestBlockNumber;
let transactionHash;

test.describe('Positive Test cases', ()=>{
    test('Login to Moralis', async ({page})=>{

        test.setTimeout(75000);

        await page.goto('https://admin.moralis.io/login')
        await page.waitForTimeout(1000)
        
        try {
            await page.getByRole('button', { name: 'Accept all' }).click();
            console.log('Cookie consent accepted.');
        } catch (e) {
            console.log('Cookie consent dialog not found or failed to click.');
        }

        await page.fill("//label[@for='admin-login-email']",username)
        await page.fill("//label[@for='admin-login-password']",password)
        await page.click("//span[normalize-space()='Log in']")
        
        await page.waitForTimeout(5000)
        await page.click("(//div[@class='_children_1qqmc_425'])[5]")    //Click Nodes
        await page.click("//button[normalize-space()='Create a New Node']//*[name()='svg']")    //Create a new node

        await page.selectOption("//span[normalize-space()='Select Protocol *']",'Base')     //Select Base protocol
        await page.waitForTimeout(2000)
        await page.selectOption("//span[normalize-space()='Select Network *']", 'Mainnet')  //Select Mainnet as Network

        await page.click("//div[@class='DivContainerStyled-sc-1jzr4nq-0 fffdlS']//button[@type='button'][normalize-space()='Create Node']")          //Create node

        await page.waitForTimeout(3000)
    
        console.log('Node created successfully')

        const copyButton = await page.locator("//body[1]/div[1]/div[5]/div[1]/div[1]/main[1]/main[1]/div[1]/div[2]/section[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/span[1]/div[1]/div[1]/button[1]"); 
        await copyButton.click();

        //Retrieve the copied URL from the clipboard
        nodeURL = await page.evaluate(() => navigator.clipboard.readText());
        console.log('Copied Node URL:', nodeURL);
        
        
    });

    

    test('Get Block Number',async ({ request }) => {
        try{
            const response = await request.post(nodeURL, {
            data: {
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1,
            },
            });

            expect(response.status()).toBe(200);
            // Step 2: Get the hex block number from the response
            const data = await response.json();
            latestBlockNumber = data.result;
            console.log("Block Number (Hex):", latestBlockNumber);

            // Step 3: Convert the hex block number to decimal
            const blockNumberDecimal = parseInt(latestBlockNumber, 16);
            console.log("Block Number (Decimal):", blockNumberDecimal);
        }
        catch {
            console.error('Failed to fetch transaction details:', error);
            throw error;
        }
    });

    // Step 2: Fetch Block Details Using Latest Block Number
    test('Fetch block details using latest block number', async ({ request }) => {
        
        //Check if we get a block number from the previous test
        if (latestBlockNumber === undefined) {
            test.skip('Skipping as latestBlockNumber is not set');
            return;
        }

        try{
            const response = await request.post(nodeURL, {
            data: {
                jsonrpc: '2.0',
                method: 'eth_getBlockByNumber',
                params: [latestBlockNumber, false], // We don't need full transaction objects
                id: 1,
            },
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            console.log(`Block Details: ${JSON.stringify(data.result)}`);
            
            // Assuming the block has at least one transaction, get its hash
            if (data.result.transactions.length > 0) {
            transactionHash = data.result.transactions[0];
            console.log(`Transaction Hash: ${transactionHash}`);
            }
            else {
                throw new Error('No transactions found in the block.');
            }
        }
        catch{
            console.error('Failed to fetch block details:', error.message);
            throw error;
        }
    });

    // Step 3: Fetch Transaction Details Using Transaction Hash
    test('Fetch transaction details using transaction hash', async ({ request }) => {
        // Check if we have a valid transaction hash from the previous test
        if (!transactionHash) {
        test.skip('No transaction hash found in the block');
        }
        try{
            const response = await request.post(nodeURL, {
            data: {
                jsonrpc: '2.0',
                method: 'eth_getTransactionByHash',
                params: [transactionHash],
                id: 1,
            },
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            console.log(`Transaction Details: ${JSON.stringify(data.result)}`);
            expect(data.result).toHaveProperty('hash', transactionHash);
        }
        catch {
            console.error('Failed to fetch transaction details:', error);
            throw error;
        } 
    }); 

});

//***************Negative scenarios*********//

test.describe('Negative Test Cases', ()=>{
    //Invalid Login Credentials
    test.setTimeout(50000);
    test('Login with Invalid Credentials', async ({ page }) => {
        await page.goto('https://admin.moralis.io/login');
        await page.waitForTimeout(3000);
        
        try {
            await page.getByRole('button', { name: 'Accept all' }).click();
            console.log('Cookie consent accepted.');
        } catch (e) {
            console.log('Cookie consent dialog not found or failed to click.');
        }

        // Use invalid credentials
        await page.fill("//label[@for='admin-login-email']", 'aravindpulivarthiv@gmail.com');
        await page.fill("//label[@for='admin-login-password']", 'sjedhbf2hieh');
        await page.click("//span[normalize-space()='Log in']");
        await page.waitForTimeout(20000);
        
        // Check for an error message
        const errorMessage = await page.locator("//span[@class='sc-DdwlG kQHBdN']").textContent();
        await expect(errorMessage).toContain('Unauthorized');  
    
    });

    //Missing Node URL
    test('Get Block Number with Missing Node URL', async ({ request }) => {
        try {
            const response = await request.post('', {
                data: {
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1,
                },
            });
            const data = await response.json();
            expect(data.error).toBeTruthy();
        } catch (error) {
            expect(error.message).toContain('Invalid URL');
        }
    });

   
})



