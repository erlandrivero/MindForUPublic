import React from 'react';

interface ButtonCheckoutProps {
  // Define props here if needed
  priceId: string;
}

const ButtonCheckout: React.FC<ButtonCheckoutProps> = ({ priceId }) => {
  return (
    <button>
      Checkout {priceId}
    </button>
  );
};

export default ButtonCheckout;
