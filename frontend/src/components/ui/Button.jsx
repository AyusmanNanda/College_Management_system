/*
  Button Component
  ----------------
  Standard button styling
*/

const Button = ({ children, onClick, type = "button" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-black transition"
        >
            {children}
        </button>
    );
};

export default Button;
