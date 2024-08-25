import http from 'k6/http';
import { check, sleep, fail } from 'k6';

// Configuration options for the test
export let options = {
    vus: 5, // Number of virtual users
    duration: '30s', // Duration of the test
};

// Main function where the test execution begins
export default function () {
    const nodeURL = 'Provide Node URL';
    let latestBlockNumber;
    let transactionHash;

    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        // Step 1: Get Block Number
        const getBlockNumberPayload = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
        });

        let getBlockNumberRes = http.post(nodeURL, getBlockNumberPayload, { headers: headers });

        // Check the status of the response
        const blockNumberCheck = check(getBlockNumberRes, {
            'status is 200': (r) => r.status === 200,
        });

        if (!blockNumberCheck) {
            console.error("Failed to get block number. Status:", getBlockNumberRes.status);
            fail("Terminating test: unable to retrieve block number.");
        }

        const blockNumberData = JSON.parse(getBlockNumberRes.body);
        latestBlockNumber = blockNumberData.result;
        console.log("Block Number (Hex):", latestBlockNumber);

        sleep(1); 

        // Step 2: Fetch Block Details Using Latest Block Number
        const fetchBlockDetailsPayload = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [latestBlockNumber, false],
            id: 1,
        });

        let fetchBlockDetailsRes = http.post(nodeURL, fetchBlockDetailsPayload, { headers: headers });

        const blockDetailsCheck = check(fetchBlockDetailsRes, {
            'status is 200': (r) => r.status === 200,
        });

        if (!blockDetailsCheck) {
            console.error("Failed to fetch block details. Status:", fetchBlockDetailsRes.status);
            fail("Terminating test: unable to retrieve block details.");
        }

        const blockDetailsData = JSON.parse(fetchBlockDetailsRes.body);
        console.log(`Block Details: ${JSON.stringify(blockDetailsData.result)}`);

        // Assuming the block has at least one transaction, get its hash
        if (blockDetailsData.result.transactions.length > 0) {
            transactionHash = blockDetailsData.result.transactions[0];
            console.log(`Transaction Hash: ${transactionHash}`);
        } else {
            console.warn('No transactions found in the block.');
            return;
        }

        sleep(1);

        // Step 3: Fetch Transaction Details Using Transaction Hash
        const fetchTransactionDetailsPayload = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [transactionHash],
            id: 1,
        });

        let fetchTransactionDetailsRes = http.post(nodeURL, fetchTransactionDetailsPayload, { headers: headers });

        const transactionDetailsCheck = check(fetchTransactionDetailsRes, {
            'status is 200': (r) => r.status === 200,
        });

        if (!transactionDetailsCheck) {
            console.error("Failed to fetch transaction details. Status:", fetchTransactionDetailsRes.status);
            fail("Terminating test: unable to retrieve transaction details.");
        }

        const transactionDetailsData = JSON.parse(fetchTransactionDetailsRes.body);
        console.log(`Transaction Details: ${JSON.stringify(transactionDetailsData.result)}`);

    } catch (error) {
        console.error("An error occurred during the test execution:", error.message);
        fail("Test execution failed due to an unexpected error.");
    }

    sleep(1);
}
