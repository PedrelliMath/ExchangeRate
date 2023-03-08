const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]');
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]');

let internalExchangeRate = {};

const getUrl = currency => `https://v6.exchangerate-api.com/v6/9faa7d1ae3a1052d02433e94/latest/${currency}`;

const getErrormessage = errorType => ({
    'unsupported-code': 'A moeda não existe em nosso banco de dados.',
    'malformed-request': 'Alguma parte da requisição não seguiu a estrutura.',
    'invalid-key': 'Chave da API inválida.',
    'inactive-account': 'Conta inativa, Email não confirmado.',
    'quota-reached': 'Sua conta atiginiu o limite de resquisições.'
})[errorType] || 'Erro desconhecido';

const fetchExchangeRate = async url =>{
    try{
        const response = await fetch(url); 

        if(!response.ok){
            throw new Error('Falha na conexão');
    }

    const exchangeRateData = await response.json();

    if(exchangeRateData.result === 'error'){
        throw new Error(getErrormessage(exchangeRateData['error-type']));
    }

    return exchangeRateData;

    }catch(err){
        

        const div = document.createElement('div');
        const button = document.createElement('button');
        const span = document.createElement('span');

        div.textContent = err.message;
        div.setAttribute('role', 'alert');
        div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
        div.appendChild(button);

        button.setAttribute('type', 'button');
        button.setAttribute('aria-Label', 'Close');
        button.setAttribute('data-dismiss', 'alert');
        button.classList.add('close');
        button.appendChild(span);

        span.setAttribute('aria-hidden', 'true')
        span.textContent = '×';
        
        div.addEventListener('click', () =>{
            div.remove();
        })

        currenciesEl.insertAdjacentElement('afterend', div);
    }   
}

const init = async () => {
    internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD'))) };

    const getOptions =  selectedCurrency => Object.keys(internalExchangeRate.conversion_rates)
        .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
        .join('');  
    
    currencyOneEl.innerHTML = getOptions('USD');
    currencyTwoEl.innerHTML = getOptions('BRL');

    convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL;
    valuePrecisionEl.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL} BRL`;
}

timesCurrencyOneEl.addEventListener('input', e =>{
    convertedValueEl.textContent = (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2);
});

currencyTwoEl.addEventListener('input', e =>{
    const currencyTwoValue = internalExchangeRate.conversion_rates[e.target.value];

    convertedValueEl.textContent = (timesCurrencyOneEl.value * currencyTwoValue).toFixed(2);
    valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`;
});

currencyOneEl.addEventListener('input', async e =>{
    internalExchangeRate = { ...(await fetchExchangeRate(getUrl(e.target.value))) };

    convertedValueEl.textContent = (timesCurrencyOneEl.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2);
    valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`;
});

init();


