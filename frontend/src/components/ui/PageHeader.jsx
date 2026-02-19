/*
  PageHeader
  ----------
  Standard title for all pages
*/

const PageHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-800">
                {title}
            </h1>
            {subtitle && (
                <p className="text-sm text-gray-400 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;
