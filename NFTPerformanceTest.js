import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  vus: 5, // Number of virtual users
  duration: '30s', // Duration of the test
};

const API_KEY = 'Provide_API_Key';

export default function () {
  // Define the URL with query parameters included directly in the URL string
  const url = `https://deep-index.moralis.io/api/v2/0xff3879b8a363aed92a6eaba8f61f1a96a9ec3c1e/nft?chain=eth`;

  // Define the request headers
  const params = {
    headers: {
      'X-API-Key': API_KEY,
    },
  };

  try {
    // Make the GET request
    const response = http.get(url, params);

    // Validate the response status and content
    const isSuccessful = check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains result field': (r) => r.json().hasOwnProperty('result'),
      'NFTs were returned': (r) => r.json().result.length > 0,
    });

    if (!isSuccessful) {
      console.error('Response validation failed');
      console.error(`Response Status: ${response.status}`);
      console.error(`Response Body: ${response.body}`);
      fail('Test failed due to unexpected response'); // Fail the test if any check fails
    }

    // Log the response only if the request was successful
    console.log(`NFT Response: ${JSON.stringify(response.json().result)}`);
  } catch (error) {
    console.error('An error occurred during the request:', error.message);
    fail('Test execution failed due to an unexpected error'); // Fail the test in case of an error
  }

  sleep(1); // Pause between iterations
}
