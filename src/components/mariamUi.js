import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css"; // Import external CSS file

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
    <div className="container">
      <div className="card">
        <h1>📚 Curriculum Redundancy Checker</h1>

        <div className="file-upload">
          <input type="file" onChange={handleFileUpload} />
        </div>

        <div className="button-group">
          <button onClick={checkRedundancy}>🔍 Check Redundancy</button>
          <button onClick={() => setTableData([])}>❌ Clear Data</button>
        </div>

        <div className="table-section">
          <h2>📄 Uploaded Dataset</h2>
          {tableData.length > 0 ? (
            <table className="dataset-table">

              <thead>
                <tr>
                  {tableData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data to display.</p>
          )}
        </div>

        <div className="redundancy-section">
          <h2>🔁 Redundant Course Pairs</h2>
          {redundancies.length > 0 ? (
            <table className="redundant-table">
              <tbody>
                {redundancies.map((item, index) => (
                  <tr key={index}>
                    <td>{item.pair[0]}</td>
                    <td className="centered-column">↔</td>
                    <td>{item.pair[1]}</td>
                    <td className="centered-column">{item.similarity.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No redundant subjects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
