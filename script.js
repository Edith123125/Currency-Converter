// API Key to access the Exchange Rate API
const apiKey = "7643a9379eac5ef74dfef2d6";

// Base URL for the API with the API key included
const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}`;

// Function to fetch supported currency codes from the API
function fetchSupportedCurrencies() {
  const url = `${baseUrl}/codes`; // API endpoint to get a list of currency codes

  return fetch(url) // Perform a network request to the API
    .then(response => {
      // Check if the response is successful (HTTP status 200-299)
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`); // Throw an error if the response fails
      }
      return response.json(); // Parse and return the response data as JSON
    });
}

// Function to populate the dropdown menus with currency options
function populateCurrencyDropdowns(currencies) {
  const fromCurrencyDropdown = document.getElementById('from-currency'); // "From" currency dropdown element
  const toCurrencyDropdown = document.getElementById('to-currency'); // "To" currency dropdown element

  // Iterate over the array of currency codes
  currencies.forEach(code => {
    // Create a new <option> element for both dropdowns
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');

    // Set the value and text content of the option elements to the currency code
    option1.value = option2.value = code;
    option1.textContent = option2.textContent = code;

    // Append the option elements to their respective dropdowns
    fromCurrencyDropdown.appendChild(option1);
    toCurrencyDropdown.appendChild(option2);
  });
}

// Function to fetch the conversion rate and calculate the converted amount
function fetchConversionData(fromCurrency, toCurrency, amount) {
  const url = `${baseUrl}/latest/${fromCurrency}`; 
  return fetch(url) // Perform a network request to the API
    .then(response => {
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`); // Throw an error if the response fails
      }
      return response.json(); // Parse and return the response data as JSON
    })
    .then(data => {
      // Extract the conversion rate for the target currency
      const rate = data.conversion_rates[toCurrency];
      if (!rate) {
        throw new Error('Invalid currency selection'); // Throw an error if the currency code is invalid
      }
      // Calculate the converted amount and round it to 2 decimal places
      return (rate * amount).toFixed(2);
    });
}

// Function to display the converted amount on the webpage
function displayResult(amount, toCurrency) {
  const resultDiv = document.getElementById('result'); // Result display element
  resultDiv.textContent = `Converted Amount: ${amount} ${toCurrency}`; // Update the text content with the result
}

// Function to store a conversion in local storage
function storeConversion(fromCurrency, toCurrency, amount, convertedAmount) {
  const conversion = {
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount
  };

  // Retrieve the existing conversions from localStorage or initialize an empty array
  let conversions = JSON.parse(localStorage.getItem('conversions')) || [];

  // Add the new conversion to the array
  conversions.push(conversion);//adds at the end of the array

  // Save the updated conversions array back to localStorage
  localStorage.setItem('conversions', JSON.stringify(conversions));

  // Refresh the displayed list of stored conversions
  displayStoredConversions();
}

// Function to display the stored conversions
function displayStoredConversions() {
  const storedConversionsList = document.getElementById('stored-conversions');
  storedConversionsList.innerHTML = ''; // Clear the list first

  // Retrieve the stored conversions from localStorage
  const conversions = JSON.parse(localStorage.getItem('conversions')) || [];

  // Create list items for each stored conversion
  conversions.forEach((conversion, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      ${conversion.amount} ${conversion.fromCurrency} = ${conversion.convertedAmount} ${conversion.toCurrency}
      <button onclick="editConversion(${index})">Edit</button>
      <button onclick="deleteConversion(${index})">Delete</button>
    `;
    storedConversionsList.appendChild(listItem);
  });
}

// Function to edit a stored conversion
function editConversion(index) {
  const conversions = JSON.parse(localStorage.getItem('conversions')) || [];
  const conversion = conversions[index];

  // Pre-fill the form with the conversion's details
  document.getElementById('from-currency').value = conversion.fromCurrency;
  document.getElementById('to-currency').value = conversion.toCurrency;
  document.getElementById('amount').value = conversion.amount;

  // Remove the conversion from localStorage so it can be updated
  deleteConversion(index);
}

// Function to delete a stored conversion
function deleteConversion(index) {
  let conversions = JSON.parse(localStorage.getItem('conversions')) || [];

  // Remove the conversion from the array
  conversions.splice(index, 1);

  // Save the updated array back to localStorage
  localStorage.setItem('conversions', JSON.stringify(conversions));

  // Refresh the displayed list of stored conversions
  displayStoredConversions();
}

// Add an event listener for the "Convert" button click event
document.getElementById('convert-btn').addEventListener('click', () => {
  // Get the selected currencies and input amount
  const fromCurrency = document.getElementById('from-currency').value;
  const toCurrency = document.getElementById('to-currency').value;
  const amount = document.getElementById('amount').value;

  // Validate that all inputs are provided and the amount is greater than 0
  if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
    alert('Please enter valid inputs!'); // Show an alert if the inputs are invalid
    return; // Exit the function if validation fails
  }

  // Fetch the conversion rate and display the converted amount
  fetchConversionData(fromCurrency, toCurrency, amount)
    .then(convertedAmount => {
      displayResult(convertedAmount, toCurrency); // Show the converted amount
      storeConversion(fromCurrency, toCurrency, amount, convertedAmount); // Store the conversion
    })
    .catch(error => {
      console.error('Error:', error); // Log any errors to the console
      alert('Failed to fetch conversion data. Please try again.'); // Show an alert if there is an error
    });
});

// Fetch the list of supported currencies and populate the dropdown menus on page load
fetchSupportedCurrencies()
  .then(data => {
    // Extract only the currency codes from the API response
    const currencies = data.supported_codes.map(item => item[0]);
    populateCurrencyDropdowns(currencies); // Populate the dropdown menus
  })
  .catch(error => {
    console.error('Error fetching currencies:', error); // Log any errors to the console
  });

// Display stored conversions when the page loads
window.addEventListener('load', displayConversionHistory);
