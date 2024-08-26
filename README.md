This README includes sections on project setup, usage, and test descriptions to ensure that others can understand and run your tests effectively.

---

# Testing Suite for Moralis API

This repository contains a suite of automated tests for Moralis APIs using Playwright and K6. The tests cover both positive and negative scenarios for various endpoints, including Moralis node creation and NFT retrieval.

## Table of Contents

- [Project Setup](#project-setup)
- [Test Cases](#test-cases)
- [Running the Tests](#running-the-tests)
- [Environment Variables](#environment-variables)

## Project Setup

### Prerequisites

Ensure you have Node.js and npm installed on your machine. You will also need to install Playwright and K6.

1. **Install Node.js and npm**: Follow the [official installation guide](https://nodejs.org/).

2. **Install Playwright**: 

   ```bash
   npm install @playwright/test
   ```

3. **Install K6**: Follow the [official K6 installation guide](https://k6.io/docs/getting-started/installation/).

### Install Dependencies

Run the following command to install required Node.js packages:

```bash
npm install
```

## Test Cases

### Playwright Tests

**Taks1: Login into Moralis and call RPC Methods**

**Positive Test Cases:**
1. *Login to Moralis*: Logs in to Moralis, creates a new node, and retrieves the node URL.
2. *Get Block Number*: Fetches the latest block number from the created node.
3. *Fetch Block Details Using Latest Block Number*: Retrieves details of the latest block using its block number.
4. *Fetch Transaction Details Using Transaction Hash*: Fetches transaction details using a transaction hash from the block details.

**Negative Test Cases**:
- *Login with Invalid Credentials*: Tests login with incorrect credentials.
- *Get Block Number with Missing Node URL*: Tests block number retrieval with a missing node URL.

**Task2: Login into Moralis to get the API key and fetch getWalletNFTs endpoints**

**Positive Test Cases:**
1. *Login to Moralis*: Logs in to Moralis, get the valid API Key.
2. *Fetch NFTs for a Valid Wallet Address*: Tests retrieval of NFTs for a valid wallet address using a valid API key.

**Negative Test Cases**:
- *Fetch NFTs with Invalid API Key*: Tests NFT retrieval with an invalid API key.
- *Fetch NFTs with Invalid Wallet Address*: Tests NFT retrieval with an invalid wallet address.
- *Fetch NFTs with Incorrect Chain Parameter*: Tests NFT retrieval with an incorrect chain parameter.

**Please refer to the MoralisTaskTestcases.xls file in the repository to find the step by step execution for both tasks and the k6 tests.**

## Running the Tests

### Playwright Tests

To run the Playwright tests, use the following command:

```bash
npx playwright test path/to/your/test.spec.js
```

### K6 Tests

To run the K6 tests, use the following command:

```bash
k6 run path/to/your/k6/test.js
```

## Environment Variables

Create a `.env` file in the root directory of the project and add the following variables:

```
USERNAME=your_moralis_username
PASSWORD=your_moralis_password
```

Replace `your_moralis_username` and `your_moralis_password` with your actual Moralis credentials.

**Please feel free to reach out to me if any information required about this task.**
