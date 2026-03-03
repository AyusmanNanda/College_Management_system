import TakeAttendance from "./TakeAttendance";
import EditAttendance from "./EditAttendance";

const MarkAttendance = () => {
    return (
        <div className="space-y-12">

            {/* PAGE HEADER */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Attendance Management
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Take new attendance and edit previously recorded classes.
                </p>
            </div>

            {/* TAKE ATTENDANCE SECTION */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-12">
                <TakeAttendance />
            </div>

            {/* EDIT ATTENDANCE SECTION */}
            <div>
                <EditAttendance />
            </div>

        </div>
    );
};

export default MarkAttendance;