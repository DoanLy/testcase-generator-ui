import React, { useState, useRef, DragEvent } from "react";
import "./FileUpload.css";
import * as XLSX from "xlsx";

interface TestResult {
  testCaseId: string;
  status: "passed" | "failed" | "running";
  duration: string;
  error?: string;
  screenshots?: string[];
  logs: string[];
}

interface TestCase {
  id: string;
  scenarioName: string;
  menu: string;
  priority: "High" | "Medium" | "Low";
  status: "Passed" | "Failed" | "Processing" | "To-Do" | "Canceled" | "N/A";
  isExpanded?: boolean;
  steps: {
    stepNumber: number;
    action: string;
    testData: string;
    expectedResult: string;
  }[];
  automationStatus?: "ready" | "running" | "completed";
}

const API_URL = "http://localhost:5000/api";

interface FileUploadProps {
  // ... existing interfaces ...
}

export const FileUpload: React.FC<FileUploadProps> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [expandedTestCases, setExpandedTestCases] = useState<string[]>([]);
  const [uploadHistory, setUploadHistory] = useState<
    { name: string; date: string }[]
  >([]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {}
  );
  const [showTestResults, setShowTestResults] = useState(false);

  const allowedFileTypes = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      extension: ".docx",
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      extension: ".xlsx",
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    "application/pdf": {
      extension: ".pdf",
      maxSize: 20 * 1024 * 1024, // 20MB
    },
    "application/json": {
      extension: ".json",
      maxSize: 5 * 1024 * 1024, // 5MB
    },
    "text/csv": {
      extension: ".csv",
      maxSize: 5 * 1024 * 1024, // 5MB
    },
  };

  const validateFile = (file: File) => {
    const fileType =
      allowedFileTypes[file.type as keyof typeof allowedFileTypes];

    if (!fileType) {
      throw new Error(
        "File format not supported. Please upload Word, Excel, PDF, JSON, or CSV files."
      );
    }

    if (file.size > fileType.maxSize) {
      throw new Error(
        `File too large. Maximum size for ${fileType.extension} files is ${
          fileType.maxSize / 1024 / 1024
        }MB`
      );
    }

    return true;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];

    try {
      if (validateFile(droppedFile)) {
        handleFile(droppedFile);
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý file"
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleFile = (selectedFile: File) => {
    setSelectedFile(selectedFile);
    // Mock test case extraction
    const mockTestCases: TestCase[] = [
      {
        id: "TC-01",
        scenarioName: "Verify Email Validation in Registration Form",
        menu: "Registration",
        priority: "High",
        status: "Passed",
        steps: [
          {
            stepNumber: 1,
            action: "Open registration page",
            testData: "N/A",
            expectedResult: "Registration form is displayed",
          },
          {
            stepNumber: 2,
            action: "Enter invalid email format",
            testData: "john.doe@com",
            expectedResult: "Error message 'Invalid email format' is displayed",
          },
          {
            stepNumber: 3,
            action: "Enter valid email format",
            testData: "john.doe@example.com",
            expectedResult: "Email field accepts the input without error",
          },
        ],
      },
      {
        id: "TC-02",
        scenarioName: "Verify Password Strength Requirements",
        menu: "Registration",
        priority: "High",
        status: "Passed",
        steps: [
          {
            stepNumber: 1,
            action: "Enter password without special character",
            testData: "Password123",
            expectedResult:
              "Error message 'Password must contain at least one special character' is displayed",
          },
          {
            stepNumber: 2,
            action: "Enter password without number",
            testData: "Password@",
            expectedResult:
              "Error message 'Password must contain at least one number' is displayed",
          },
          {
            stepNumber: 3,
            action: "Enter valid password",
            testData: "Password@123",
            expectedResult: "Password field accepts the input without error",
          },
        ],
      },
      {
        id: "TC-03",
        scenarioName: "Verify System Performance Under Load",
        menu: "System Monitoring",
        priority: "Medium",
        status: "Passed",
        steps: [
          {
            stepNumber: 1,
            action: "Generate concurrent user load",
            testData: "1000 simultaneous users",
            expectedResult: "System maintains response time under 2 seconds",
          },
          {
            stepNumber: 2,
            action: "Monitor server resources",
            testData: "CPU, Memory, Network usage",
            expectedResult: "Resource utilization remains under 80%",
          },
          {
            stepNumber: 3,
            action: "Check error rate",
            testData: "Error logs during load test",
            expectedResult: "Error rate remains under 0.1%",
          },
        ],
      },
    ];
    setTestCases(mockTestCases);
    setUploadHistory((prev) => [
      { name: selectedFile.name, date: new Date().toLocaleString() },
      ...prev,
    ]);
  };

  const handleExport = () => {
    const testCasesToExport = testCases;

    // Chuyển đổi test cases thành định dạng CSV
    const csvContent = [
      ["ID", "Scenario Name", "Menu", "Priority"],
      ...testCasesToExport.map((tc) => [
        tc.id,
        tc.scenarioName,
        tc.menu,
        tc.priority,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Tạo và tải file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `test_cases_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleExportToExcel = () => {
    // Chuẩn bị dữ liệu cho file Excel
    const workbook = XLSX.utils.book_new();

    // Tạo mảng dữ liệu với header
    const headers = [
      "ID",
      "Scenario Name",
      "Menu",
      "Priority",
      "Status",
      "Step No.",
      "Steps",
      "Test Data",
      "Expected Result",
    ];

    // Tạo dữ liệu cho từng test case và steps của nó
    const data = generatedTestCases.flatMap((tc) =>
      tc.steps.map((step, index) => ({
        ID: tc.id,
        "Scenario Name": tc.scenarioName,
        Menu: tc.menu,
        Priority: tc.priority,
        Status: tc.status,
        "Step No.": step.stepNumber,
        Steps: step.action,
        "Test Data": step.testData,
        "Expected Result": step.expectedResult,
      }))
    );

    // Tạo worksheet từ dữ liệu
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, ws, "Test Cases");

    // Tự động điều chỉnh độ rộng cột
    const max_width = headers.reduce(
      (acc, header) => Math.max(acc, header.length),
      0
    );
    const col_width = Array(headers.length).fill({ wch: max_width + 5 });
    ws["!cols"] = col_width;

    // Xuất file Excel
    XLSX.writeFile(
      workbook,
      `test_cases_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      // Add custom prompt to request if provided
      if (customPrompt.trim()) {
        formData.append("customPrompt", customPrompt.trim());
      }

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setTestCases(data.testCases);
      setGeneratedTestCases(data.testCases);
      setUploadHistory((prev) => [
        ...prev,
        { name: selectedFile.name, date: new Date().toLocaleString() },
      ]);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    testCaseId: string,
    newStatus: TestCase["status"]
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/testcases/${testCaseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update test case status");
      }

      setGeneratedTestCases((prevTestCases) =>
        prevTestCases.map((testCase) =>
          testCase.id === testCaseId
            ? { ...testCase, status: newStatus }
            : testCase
        )
      );
    } catch (error) {
      console.error("Error updating test case status:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    }
  };

  const toggleTestSteps = (testCaseId: string) => {
    setExpandedTestCases((prev) => {
      const isExpanded = prev.includes(testCaseId);
      if (isExpanded) {
        return prev.filter((id) => id !== testCaseId);
      } else {
        return [...prev, testCaseId];
      }
    });
  };

  const runAutomationTest = async (testCase: TestCase) => {
    try {
      // Cập nhật trạng thái running
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testCaseId: testCase.id,
          status: "running",
          duration: "0s",
          logs: [`Starting automation test for ${testCase.scenarioName}...`],
        },
      }));

      // Gọi API để chạy Cypress test
      const response = await fetch("http://localhost:5000/api/run-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase),
      });

      const result = await response.json();

      // Cập nhật kết quả test
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          ...result,
          testCaseId: testCase.id,
          status: result.status,
          duration: result.duration,
          logs: result.logs || [],
        },
      }));

      setShowTestResults(true);
    } catch (error) {
      console.error("Error running automation test:", error);
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testCaseId: testCase.id,
          status: "failed",
          duration: "0s",
          error: "Failed to run automation test",
          logs: ["Error occurred while running the test"],
        },
      }));
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h2>Upload File</h2>
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <p>Drag and drop your file here or</p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".docx,.xlsx,.pdf"
              className="file-input"
              ref={fileInputRef}
            />
            <p className="supported-formats">
              Supported formats: .DOCX, .XLSX, .PDF
            </p>
          </div>
        </div>

        <div className="custom-prompt-container">
          <div className="prompt-header">
            <h3 className="prompt-title">Customize Your Prompt</h3>
            <div className="prompt-actions">
              {isEditingPrompt ? (
                <button
                  className="save-prompt-button"
                  onClick={() => setIsEditingPrompt(false)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="edit-prompt-button"
                  onClick={() => setIsEditingPrompt(true)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter additional requirements for test case generation (optional)..."
            className="custom-prompt-input"
            rows={3}
            disabled={!isEditingPrompt}
            data-testid="custom-prompt-input"
          />
        </div>

        <div className="upload-actions">
          {selectedFile && (
            <div className="selected-file">
              <span>{selectedFile.name}</span>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="upload-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              "Generate Test Cases"
            )}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {generatedTestCases.length > 0 && (
        <div className="test-cases-section">
          <div className="test-cases-header">
            <h2>Generated Test Cases</h2>
            <button
              data-testid="export-excel-button"
              className="export-excel-button"
              onClick={handleExportToExcel}
            >
              <i className="fas fa-file-excel"></i>
              Export to Excel
            </button>
          </div>
          <div className="test-cases-table-container">
            <table className="test-cases-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Scenario Name</th>
                  <th>Menu</th>
                  <th>Steps Detail</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Run Auto</th>
                </tr>
              </thead>
              <tbody>
                {generatedTestCases.map((testCase) => (
                  <React.Fragment key={testCase.id}>
                    <tr className="test-case-row">
                      <td className="test-case-id">{testCase.id}</td>
                      <td>{testCase.scenarioName}</td>
                      <td>{testCase.menu}</td>
                      <td>
                        <button
                          data-testid="view-steps-button"
                          className="view-steps-button"
                          onClick={() => toggleTestSteps(testCase.id)}
                        >
                          <i
                            className={`fas fa-chevron-${
                              expandedTestCases.includes(testCase.id)
                                ? "up"
                                : "down"
                            }`}
                          ></i>
                          {expandedTestCases.includes(testCase.id)
                            ? "Hide Steps"
                            : "View Steps"}
                        </button>
                      </td>
                      <td>
                        <span
                          className={`priority ${testCase.priority.toLowerCase()}`}
                        >
                          {testCase.priority}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select ${testCase.status.toLowerCase()}`}
                          value={testCase.status}
                          onChange={(e) =>
                            handleStatusChange(
                              testCase.id,
                              e.target.value as TestCase["status"]
                            )
                          }
                        >
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Processing">Processing</option>
                          <option value="To-Do">To-Do</option>
                          <option value="Canceled">Canceled</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`run-auto-button ${
                            testResults[testCase.id]?.status === "running"
                              ? "running"
                              : ""
                          }`}
                          onClick={() => runAutomationTest(testCase)}
                          disabled={
                            testResults[testCase.id]?.status === "running"
                          }
                          data-testid="run-auto-button"
                        >
                          {testResults[testCase.id]?.status === "running" ? (
                            <>
                              <span className="spinner"></span>
                              Running...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play"></i>
                              Run Auto
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    <tr
                      className={`test-steps-row ${
                        expandedTestCases.includes(testCase.id)
                          ? "expanded"
                          : ""
                      }`}
                    >
                      <td colSpan={8}>
                        <div className="test-steps-container">
                          <table className="test-steps-table">
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>Steps</th>
                                <th>Test Data</th>
                                <th>Expected Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testCase.steps.map((step) => (
                                <tr key={step.stepNumber}>
                                  <td className="step-number">
                                    {step.stepNumber}
                                  </td>
                                  <td>{step.action}</td>
                                  <td className="test-data">{step.testData}</td>
                                  <td>{step.expectedResult}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTestResults && (
        <div className="test-results-section">
          <h2>Automation Test Results</h2>
          <div className="test-results-container">
            {Object.values(testResults).map((result) => (
              <div
                key={result.testCaseId}
                className={`test-result-card ${result.status}`}
              >
                <div className="test-result-header">
                  <h3>
                    Test Case:{" "}
                    {
                      generatedTestCases.find(
                        (tc) => tc.id === result.testCaseId
                      )?.scenarioName
                    }
                  </h3>
                  <span className={`result-badge ${result.status}`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <div className="test-result-details">
                  <p>Duration: {result.duration}</p>
                  {result.error && (
                    <div className="error-message">Error: {result.error}</div>
                  )}
                  <div className="test-logs">
                    <h4>Test Logs:</h4>
                    <pre>{result.logs.join("\n")}</pre>
                  </div>
                  {result.screenshots && result.screenshots.length > 0 && (
                    <div className="test-screenshots">
                      <h4>Screenshots:</h4>
                      <div className="screenshot-grid">
                        {result.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Test screenshot ${index + 1}`}
                            onClick={() => window.open(screenshot, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upload-history">
        <h2>Upload History</h2>
        <div className="history-list">
          {uploadHistory.map((item, index) => (
            <div key={index} className="history-item">
              <span className="file-name">{item.name}</span>
              <span className="upload-date">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
