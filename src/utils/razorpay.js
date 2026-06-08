const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({ orderData, razorpayData, user, onSuccess, onError }) {
  const options = {
    key: razorpayData.keyId || RAZORPAY_KEY,
    amount: razorpayData.amount,
    currency: razorpayData.currency,
    name: 'Karyor',
    description: `Order ${orderData.orderNumber}`,
    order_id: razorpayData.orderId,
    prefill: {
      name: orderData.customer.fullName,
      email: orderData.customer.email || user?.email || '',
      contact: orderData.customer.phone,
    },
    theme: { color: '#d4af37' },
    handler(response) {
      onSuccess(response);
    },
    modal: {
      ondismiss() {
        onError(new Error('Payment cancelled'));
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onError(new Error(response.error?.description || 'Payment failed'));
  });
  rzp.open();
}