interface ButtonProps {
    type: 'button' | 'submit' | 'reset';
    children: React.ReactNode;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ type, children, onClick }) => {
    return <button type={type} onClick={onClick}>{children}</button>
}