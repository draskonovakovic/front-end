type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};
  
const Input = ({ label, ...props }: InputProps) => {
    return (
        <div>
        <label>
            {label}
            <input {...props} className="form-input" />
        </label>
        </div>
    );
};

export default Input;
  