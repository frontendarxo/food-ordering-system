import './style.css';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  type = 'button', 
  children, 
  className = '', 
  onClick,
  variant = 'default'
}) => {
  const variantClass = variant === 'danger' ? 'button-danger' : '';
  return (
    <button 
      type={type} 
      className={`button ${variantClass} ${className}`.trim()} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};