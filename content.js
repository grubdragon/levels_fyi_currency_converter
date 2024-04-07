// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === 'convertCurrency') {
        // Convert currency upon receiving the "Convert" command
        await convertCurrency();
    }
});

async function convertCurrency() {
    // Retrieve the user's preferred currency from storage
    const data = await new Promise(resolve => {
        chrome.storage.sync.get('preferredCurrency', function(data) {
            resolve(data);
        });
    });
    const preferredCurrency = data.preferredCurrency || 'USD'; // Default to USD if not set

    // Select all elements with class .MuiTypography-subtitle1
    const elements = document.querySelectorAll('.MuiTypography-subtitle1');

    const conversionRate = await getConversionRate(preferredCurrency);

    // Iterate over each element
    elements.forEach(element => {
        // Check if innerHTML starts with '$'
        if (element.innerHTML.startsWith('$')) {
            // Extract the numeric value from the price
            const price = convertPrettifiedPriceToNumber(element.innerHTML);

            // Convert the price to the preferred currency
            const convertedPrice = price * conversionRate;

            // Update the price with the converted value
            element.innerHTML = convertNumberToPrettifiedPrice(convertedPrice, preferredCurrency);
        }
    });
}

async function getConversionRate(targetCurrency) {
    try {
        targetCurrency = targetCurrency.toLowerCase().trim();
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        const data = await response.json();
        const conversionRate = data["usd"][targetCurrency]; // Get the exchange rate for the target currency
        if (conversionRate) {
            return conversionRate;
        } else {
            throw new Error(`Exchange rate for ${targetCurrency} not found.`);
        }
    } catch (error) {
        console.error('Error fetching currency data:', error);
        // Handle error gracefully, maybe fallback to a default conversion rate
        return 1; // Return the original conversion as fallback
    }
}

function convertPrettifiedPriceToNumber(prettifiedPrice) {
    const regex = /(\d+(\.\d+)?)([KkMmBbTt])?/; // Regular expression to match the components of the prettified price
    const match = prettifiedPrice.match(regex);
    if (match) {
        const numericValue = parseFloat(match[1]); // Extract the numeric value
        const multiplier = match[3] ? getMultiplier(match[3]) : 1; // Get the multiplier based on the suffix (K, M, B, T)
        return numericValue * multiplier;
    } else {
        return NaN; // Return NaN if the prettified price format is not recognized
    }
}

function getMultiplier(suffix) {
    const multipliers = {
        'K': 1e3,
        'k': 1e3,
        'M': 1e6,
        'm': 1e6,
        'B': 1e9,
        'b': 1e9,
        'T': 1e12,
        't': 1e12
    };
    return multipliers[suffix] || 1; // Return the multiplier corresponding to the suffix, or 1 if not found
}

function convertNumberToPrettifiedPrice(number, currency = 'USD') {
    if(isNaN(number)){
        return '--';
    }
    
    let suffixes;

    if (currency === 'INR') {
        suffixes = {
            'Ar': 1e9,
            'Cr': 1e7,
            'L': 1e5,
            'K': 1e3
        };
    }
    else{
        suffixes = {
            'T': 1e12,
            'B': 1e9,
            'M': 1e6,
            'K': 1e3
        };
    }

    const absNumber = Math.abs(number);
    let suffix = '';
    let roundedNumber = absNumber;

    for (const s in suffixes) {
        if (absNumber >= suffixes[s]) {
            suffix = s;
            roundedNumber = absNumber / suffixes[s];
            break;
        }
    }

    // Round the number to two decimal places
    roundedNumber = Math.round(roundedNumber * 100) / 100;

    // Format the currency symbol
    const formattedCurrency = currency.toUpperCase() + ' ';

    // Format the rounded number with suffix and currency symbol
    const prettifiedPrice = (number < 0 ? '-' : '') + formattedCurrency + roundedNumber + suffix;

    return prettifiedPrice;
}
