import React, { useState } from "react";
import * as XLSX from "xlsx";

const App = () => {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [redundancies, setRedundancies] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are supported.");
      return;
    }
    setFile(uploadedFile);
    readExcel(uploadedFile);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => {
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setTableData(data);
    };
  };

  const checkRedundancy = async () => {
    if (!file) {
      alert("Please upload an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/check_redundancy", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      if (result.error) {
        alert("Error: " + result.error);
      } else {
        setRedundancies(result.redundancies);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📚 Curriculum Redundancy Checker
        </h1>

        {/* File Upload */}
        <div className="mb-4 flex justify-center">
          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full max-w-xs text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={checkRedundancy}
            className="bg-green-600 text-white px-6 py-2 rounded-lg 
                      font-semibold shadow-md transition hover:bg-green-700 hover:scale-105"
          >
            🔍 Check Redundancy
          </button>
          <button
            onClick={() => setTableData([])}
            className="bg-red-600 text-white px-6 py-2 rounded-lg 
                      font-semibold shadow-md transition hover:bg-red-700 hover:scale-105"
          >
            ❌ Clear Data
          </button>
        </div>

        {/* Uploaded Excel Table */}
        <div className="mt-6 w-full">
          <h2 className="text-xl font-semibold text-gray-700">
            📄 Uploaded Dataset
          </h2>
          {tableData.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border border-gray-400 bg-white shadow-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    {tableData[0].map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-400 p-3 text-left"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border border-gray-400 ${
                        rowIndex % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                      }`}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-400 p-3"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No data to display.</p>
          )}
        </div>

        {/* Redundant Course Pairs */}
        <div className="mt-6 w-full text-left">
          <h2 className="text-xl font-semibold text-gray-700">
            🔁 Redundant Course Pairs
          </h2>
          {redundancies.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {redundancies.map((item, index) => (
                <li
                  key={index}
                  className="bg-gray-200 p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <span>
                    <strong>{item.pair[0]}</strong> ↔{" "}
                    <strong>{item.pair[1]}</strong> {"  "} 
                  </span>
                  <span className="text-blue-600 font-semibold">
                    ({item.similarity.toFixed(2)})
                  </span>


                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">No redundant subjects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
