interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export const QuantitySelector = ({ 
  quantity, 
  onIncrease, 
  onDecrease,
  disabled = false 
}: QuantitySelectorProps) => {
  return (
    <div className="quantity-selector">
      <button
        className="quantity-selector-button minus"
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span className="quantity-selector-value">{quantity}</span>
      <button
        className="quantity-selector-button plus"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  );
};
