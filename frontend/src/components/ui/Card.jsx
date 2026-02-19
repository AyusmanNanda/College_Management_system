/*
  Card Component
  --------------
  Reusable content block
*/

const Card = ({ children }) => {
    return (
        <div className="bg-gray-50 rounded-md border border-gray-200 p-6">
            {children}
        </div>
    );
};

export default Card;
