/*
  PageContainer
  -------------
  Standard page wrapper
*/

const PageContainer = ({ children }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[80vh]">
            {children}
        </div>
    );
};

export default PageContainer;
