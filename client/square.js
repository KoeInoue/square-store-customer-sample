// TODO Your application ID
const appId = '';
// TODO your location ID
const locationId = '';
// TODO Style for Card Form
const darkModeCardStyle = {
  '.input-container': {
    borderColor: '#2D2D2D',
    borderRadius: '6px',
  },
  '.input-container.is-focus': {
    borderColor: '#006AFF',
  },
  '.input-container.is-error': {
    borderColor: '#ff1600',
  },
  '.message-text': {
    color: '#999999',
  },
  '.message-icon': {
    color: '#999999',
  },
  '.message-text.is-error': {
    color: '#ff1600',
  },
  '.message-icon.is-error': {
    color: '#ff1600',
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    fontFamily: 'helvetica neue, sans-serif',
  },
  'input::placeholder': {
    color: '#999999',
  },
  'input.is-error': {
    color: '#ff1600',
  },
  '@media screen and (max-width: 600px)': {
    input: {
      fontSize: '12px',
    },
  },
};

// initialize Card Form
async function initializeCard(payments) {
  const card = await payments.card({
    style: darkModeCardStyle,
  });
  await card.attach('#card-container');

  return card;
}

// verificationToken can be undefined, as it does not apply to all payment methods.
async function sendSourceId(token) {
  const bodyParameters = {
    locationId,
    sourceId: token,
    familyName: document.getElementById('familyName').value,
    givenName: document.getElementById('givenName').value,
    companyName: document.getElementById('companyName').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    addressLine1: document.getElementById('addressLine1').value,
    addressLine2: document.getElementById('addressLine2').value,
    addressLine3: document.getElementById('addressLine3').value,
    emailAddress: document.getElementById('emailAddress').value,
  };

  const body = JSON.stringify(bodyParameters);

  // TODO change to your end point
  const paymentResponse = await fetch('/store-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (paymentResponse.ok) {
    return paymentResponse;
  }

  const errorBody = await paymentResponse.text();
  throw new Error(errorBody);
}

// get token from card data
async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    throw new Error(
      `Tokenization errors: ${JSON.stringify(tokenResult.errors)}`,
    );
  }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
  const statusContainer = document.getElementById('payment-status-container');
  if (status === 'SUCCESS') {
    // show success message
    statusContainer.classList.remove('is-failure');
    statusContainer.classList.add('is-success');
  } else {
    // show error message
    statusContainer.classList.remove('is-success');
    statusContainer.classList.add('is-failure');
  }

  statusContainer.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', async function () {
  if (!window.Square) {
    throw new Error('Square.js failed to load properly');
  }

  let payments;
  try {
    payments = window.Square.payments(appId, locationId);
  } catch {
    const statusContainer = document.getElementById('payment-status-container');
    statusContainer.className = 'missing-credentials';
    statusContainer.style.visibility = 'visible';
    return;
  }

  let card;
  try {
    card = await initializeCard(payments);
  } catch (e) {
    console.error('Initializing Card failed', e);
    return;
  }

  async function handlePaymentMethodSubmission(event, paymentMethod) {
    event.preventDefault();

    try {
      // disable the submit button as we await tokenization and make a payment request.
      cardButton.disabled = true;
      const token = await tokenize(paymentMethod);

      const paymentResults = await sendSourceId(token);

      displayPaymentResults('SUCCESS');
      console.debug('Payment Success', paymentResults);
      cardButton.disabled = false;
    } catch (e) {
      cardButton.disabled = false;
      displayPaymentResults('FAILURE');
      console.error(e.message);
    }
  }

  const cardButton = document.getElementById('card-button');
  cardButton.addEventListener('click', async function (event) {
    // SCA only needs to be run for Card Payments. All other payment methods can be set to false.
    handlePaymentMethodSubmission(event, card, false);
  });
});
