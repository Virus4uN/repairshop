export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TgCuxW7ocdMADs';

/**
 * Dynamically loads the Razorpay checkout.js script
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Checkout Modal
 * @param {Object} params
 * @param {number} params.amount - Total amount in INR
 * @param {string} params.invoiceNumber - Invoice identifier
 * @param {string} params.repairId - Repair ID
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @returns {Promise<{ razorpay_payment_id: string }>}
 */
export async function initiateRazorpayPayment({
  amount,
  invoiceNumber = '',
  repairId = '',
  customerName = '',
  customerEmail = '',
  customerPhone = ''
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
  }

  // Minimum payable amount check (in paise, min 1 INR)
  const amountInPaise = Math.max(100, Math.round(Number(amount) * 100));

  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Smart Hub Repair',
      description: `Payment for ${invoiceNumber ? `Invoice #${invoiceNumber}` : `Repair #${repairId}`}`,
      image: 'https://cdn-icons-png.flaticon.com/512/3655/3655581.png',
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || ''
      },
      notes: {
        invoice_number: invoiceNumber || '',
        repair_id: repairId || '',
        service: 'Smart Hub Repair Services'
      },
      theme: {
        color: '#2563eb' // Brand blue
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user.'));
        }
      },
      handler: function (response) {
        if (response && response.razorpay_payment_id) {
          resolve(response);
        } else {
          reject(new Error('Payment failed or transaction ID not received.'));
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        reject(new Error(response?.error?.description || 'Payment transaction failed.'));
      });
      rzp.open();
    } catch (err) {
      reject(err);
    }
  });
}
