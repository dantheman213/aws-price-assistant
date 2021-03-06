const hoursInMonth = 730.001;
const hoursInYear = 8760;

let convertedElementCount = 0;
let inProgress = false;

// if a hyperlink or dropdown menu is clicked on check to see if new elements were created
// (when selecting between instance types or regions)
document.addEventListener('click', function(event) {
    if (event.target.matches('a[href], a[href] *, ul, ul *')) {
        startDelayedFunc();
    }
}, false);

function updatePricing() {
    if (!inProgress) {
        inProgress = true;

        console.log('Checking page for AWS Price Assistant hourly rates to convert...');
        const elements = document.getElementsByTagName('*');

        for (const element of elements) {
            for (const node of element.childNodes) {
                if (node.nodeType === 3) {
                    const text = node.nodeValue.toLowerCase();
                    if (text.indexOf('per hour') > -1) {
                        if (/(?=.*\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|0)?(\.\d{1,8})? per hour$/.test(text)) {
                            convertedElementCount++;

                            const hourlyPrice = parseFloat(text.substring(1, text.indexOf(' ')));
                            let maxDecimalCount = (hourlyPrice.toString().length - hourlyPrice.toString().indexOf('.') - 1);
                            if (maxDecimalCount < 2)
                                maxDecimalCount = 2;

                            const monthlyPrice = parseFloat((hourlyPrice * hoursInMonth).toFixed(maxDecimalCount));
                            const yearlyPrice = parseFloat((hourlyPrice * hoursInYear).toFixed(maxDecimalCount));

                            let payloadHTML = `<div style="text-align: left;">${convertCurrencyToPrettyFormat(hourlyPrice)} <strong>per hour</strong><br>`;
                            payloadHTML += `${convertCurrencyToPrettyFormat(monthlyPrice)} <strong>per month</strong><br>`;
                            payloadHTML += `${convertCurrencyToPrettyFormat(yearlyPrice)} <strong>per year</strong><br></div>`;

                            element.innerHTML = payloadHTML;
                        }
                    }
                }
            }
        }

        if (convertedElementCount < 1) {
            startDelayedFunc();
        }

        inProgress = false;
    }
}

// keeps all decimal places provided to input
function convertCurrencyToPrettyFormat(num) {
    let result = '$';

    const strNum = num.toString();
    const isDecimal = (strNum.indexOf('.') > -1);
    const wholeNumbers = parseFloat(strNum.substring(0, (isDecimal ? strNum.indexOf('.') : strNum.length))).toLocaleString('en');

    result += wholeNumbers.toString();

    if (isDecimal) {
        result += strNum.substring(strNum.indexOf('.'), strNum.length);

        // append 0 if decimal place only has one position
        if (result.length - result.indexOf('.') - 1 === 1) {
            result += '0';
        }
    }

    return result;
}

function startDelayedFunc() {
    setTimeout(updatePricing, 750);
}

console.log('Starting AWS Price Assistant...');
startDelayedFunc();
