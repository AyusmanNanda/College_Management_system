import { QRCodeCanvas } from "qrcode.react";
import api from "../../utils/api";

const MarksheetLayout = ({
                             marksheet,
                             semLabel,
                             selectedSem,
                             marksheetCode,
                             verificationUrl,
                             summary,
                             hash,
                             courseDisplay,
                             getGrade
                         }) => {

    return (

        <div
            id="marksheet"
            className="relative bg-white text-black mx-auto border border-gray-400 flex flex-col overflow-hidden"
            style={{
                width: "794px",
                height: "1123px",
                padding: "10px",
                boxSizing: "border-box"
            }}
        >

            {/* LOGO WATERMARK */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 0 }}
            >
                <img
                    src={
                        marksheet?.collegeLogo
                            ? `${api.defaults.baseURL}${marksheet.collegeLogo}`
                            : `${api.defaults.baseURL}/uploads/admin/default.png`
                    }
                    alt="watermark"
                    crossOrigin="anonymous"
                    style={{
                        width: "420px",
                        opacity: 0.06,
                        filter: "grayscale(100%)",
                        objectFit: "contain"
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col h-full">

                {/* HEADER */}
                <div className="text-center border-b border-gray-500 pb-5 mb-8">

                    <div className="flex justify-center mb-2">

                        <div className="bg-white px-2 py-1 overflow-hidden">

                            <img
                                src={
                                    marksheet?.collegeLogo
                                        ? `${api.defaults.baseURL}${marksheet.collegeLogo}`
                                        : `${api.defaults.baseURL}/uploads/admin/default.png`
                                }
                                alt="college logo"
                                className="object-contain block"
                                style={{ height: "72px" }}
                                crossOrigin="anonymous"
                            />

                        </div>

                    </div>

                    <h1 className="text-[22px] font-bold uppercase tracking-wide">
                        {marksheet?.collegeName}
                    </h1>

                    <p className="text-[12px] uppercase tracking-wider font-semibold mt-1">
                        Statement of Marks – {semLabel} Examination {selectedSem}
                    </p>

                    <p className="text-[11px] text-gray-600 mt-1">
                        Marksheet No: <span className="font-semibold">{marksheetCode}</span>
                    </p>

                </div>

                <div className="flex-1 flex flex-col justify-start">

                    {/* STUDENT INFO */}

                    <div className="grid grid-cols-3 gap-6 mb-8 items-start">

                        <div className="col-span-2">

                            <table className="w-full text-sm border border-gray-400">

                                <tbody>

                                <tr>
                                    <td className="border px-3 py-2 bg-gray-100 font-semibold w-40">
                                        Student Name
                                    </td>
                                    <td className="border px-3 py-2">
                                        {marksheet?.marks?.[0]?.firstname} {marksheet?.marks?.[0]?.lastname}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                        Roll Number
                                    </td>
                                    <td className="border px-3 py-2">
                                        {marksheet?.marks?.[0]?.rollnumber}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                        Course
                                    </td>
                                    <td className="border px-3 py-2">
                                        {courseDisplay}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                        {semLabel}
                                    </td>
                                    <td className="border px-3 py-2">
                                        {selectedSem}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border px-3 py-2 bg-gray-100 font-semibold">
                                        Issue Date
                                    </td>
                                    <td className="border px-3 py-2">
                                        {new Date().toLocaleDateString()}
                                    </td>
                                </tr>

                                </tbody>

                            </table>

                        </div>

                        {/* PHOTO + TEXT SEAL */}

                        <div className="flex justify-center items-start pt-2">

                            <div className="relative w-[180px] h-[180px] flex items-center justify-center">

                                <svg viewBox="0 0 200 200" className="absolute w-full h-full">

                                    <defs>

                                        <path
                                            id="sealCircle"
                                            d="M100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0"
                                        />

                                    </defs>

                                    <text
                                        fontSize="12"
                                        fontWeight="700"
                                        letterSpacing="3"
                                        fill="#111"
                                    >

                                        <textPath
                                            href="#sealCircle"
                                            startOffset="50%"
                                            textAnchor="middle"
                                        >

                                            {marksheet?.collegeName?.toUpperCase()} • {marksheetCode} •

                                        </textPath>

                                    </text>

                                </svg>

                                <img
                                    src={`${api.defaults.baseURL}/uploads/students/${marksheet?.marks?.[0]?.profilepic}`}
                                    alt="student"
                                    className="w-[120px] h-[150px] object-cover border-2 border-gray-700 bg-white"
                                    crossOrigin="anonymous"
                                    onError={(e) => {

                                        e.currentTarget.onerror = null;

                                        e.currentTarget.src =
                                            `${api.defaults.baseURL}/uploads/students/default.png`;

                                    }}
                                />

                            </div>

                        </div>

                    </div>

                    {/* MARKS TABLE */}

                    <table className="w-full border border-gray-400 text-sm mb-6">

                        <thead>

                        <tr className="bg-gray-200 text-center font-semibold">

                            <th className="border px-3 py-2">#</th>
                            <th className="border px-3 py-2">Code</th>
                            <th className="border px-3 py-2 text-left">Subject</th>
                            <th className="border px-3 py-2">Theory</th>
                            <th className="border px-3 py-2">Practical</th>
                            <th className="border px-3 py-2">Total</th>
                            <th className="border px-3 py-2">Grade</th>

                        </tr>

                        </thead>

                        <tbody>

                        {marksheet?.marks?.map((m, i) => {

                            const theory = m.theorymarks || 0;
                            const practical = m.practicalmarks || 0;

                            const theoryFull = m.theoryfull || 0;
                            const practicalFull = m.practicalfull || 0;

                            const total = theory + practical;
                            const maxTotal = theoryFull + practicalFull;

                            const percentage =
                                maxTotal ? (total / maxTotal) * 100 : 0;
                            const grade = getGrade(percentage);

                            return (

                                <tr key={i} className="text-center">

                                    <td className="border px-3 py-2">{i + 1}</td>
                                    <td className="border px-3 py-2">{m.subjectcode}</td>
                                    <td className="border px-3 py-2 text-left">{m.subjectname}</td>
                                    <td className="border px-3 py-2">{theory}/{theoryFull}</td>
                                    <td className="border px-3 py-2">{practical}/{practicalFull}</td>
                                    <td className="border px-3 py-2 font-semibold">{total}/{maxTotal}</td>
                                    <td className="border px-3 py-2 font-bold">{grade}</td>

                                </tr>

                            );

                        })}

                        </tbody>

                    </table>

                    {/* SUMMARY */}

                    {summary && (

                        <div className="mt-6 border border-gray-400">

                            <table className="w-full text-sm">

                                <tbody>

                                <tr className="bg-gray-100 text-center font-semibold">

                                    <td className="border px-3 py-2">Total Marks</td>
                                    <td className="border px-3 py-2">Percentage</td>
                                    <td className="border px-3 py-2">Final Grade</td>
                                    <td className="border px-3 py-2">Division</td>
                                    <td className="border px-3 py-2">Result</td>

                                </tr>

                                <tr className="text-center font-semibold">

                                    <td className="border px-3 py-3">
                                        {summary.totalObtained} / {summary.totalMaximum}
                                    </td>

                                    <td className="border px-3 py-3">
                                        {summary.percentage}%
                                    </td>

                                    <td className="border px-3 py-3">
                                        {summary.finalGrade}
                                    </td>

                                    <td className="border px-3 py-3">
                                        {summary.division}
                                    </td>

                                    <td className="border px-3 py-3 font-bold text-center">
                                        <span
                                            className={
                                                summary.result.includes("FAIL")
                                                ? "text-red-700"
                                                : summary.result.includes("DISTINCTION")
                                                ? "text-blue-700"
                                                : "text-green-700"
                                            }
                                            >
                                        {summary.result}
                                        </span>
                                    </td>

                                </tr>

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* FOOTER */}

                <div className="mt-8 pt-4 border-t border-gray-400 text-xs">

                    <div className="grid grid-cols-3 items-end">

                        {/* LEFT */}
                        <div className="space-y-1">

                            <p>
                                <span className="font-semibold">Issue Date:</span>{" "}
                                {new Date().toLocaleDateString()}
                            </p>

                            <p>
                                <span className="font-semibold">Marksheet ID:</span>{" "}
                                {marksheetCode}
                            </p>

                        </div>

                        {/* QR VERIFY */}

                        <div className="flex flex-col items-center">

                            <div className="border border-gray-500 rounded-md p-2 bg-white text-center">

                                <p className="text-[9px] font-semibold tracking-wider text-gray-700">
                                    OFFICIAL DIGITAL VERIFY
                                </p>

                                <div className="flex justify-center my-1">
                                    <QRCodeCanvas
                                        value={verificationUrl}
                                        size={85}
                                        includeMargin={false}
                                    />
                                </div>

                                <p className="text-[9px] text-gray-600">
                                    Scan to verify authenticity
                                </p>

                                <p className="text-[8px] text-gray-500 mt-1">
                                    {marksheetCode}
                                </p>

                            </div>

                        </div>

                        {/* SIGNATURE */}

                        <div className="text-center">

                            <img
                                src={`${api.defaults.baseURL}/uploads/admin/signature.png`}
                                alt="signature"
                                className="h-12 mx-auto mb-1"
                                crossOrigin="anonymous"
                            />

                            <div className="border-t border-gray-600 w-40 mx-auto pt-1">

                                <p className="font-semibold">
                                    Controller of Examinations
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* HASH */}

                    <div className="mt-6 text-center text-[10px] text-gray-600 space-y-1 break-all">

                        <p>
                            <span className="font-semibold">SHA256:</span> {hash}
                        </p>

                        <p>
                            Scan the QR code above to verify authenticity of this marksheet.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default MarksheetLayout;