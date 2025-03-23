const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

// Tạo Cypress test từ test case
const generateCypressTest = async (testCase) => {
  const testContent = `
describe('${testCase.scenarioName}', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('${testCase.scenarioName}', () => {
    ${testCase.steps
      .map((step) => {
        // Chuyển đổi các bước test thành Cypress commands
        return `// Step ${step.stepNumber}: ${step.action}
      // Test Data: ${step.testData}
      // Expected: ${step.expectedResult}
      cy.log('Executing step ${step.stepNumber}: ${step.action}')
      ${generateCypressCommand(step)}
      `;
      })
      .join("\n")}
  })
})
`;

  const testFilePath = path.join(
    __dirname,
    "..",
    "..",
    "cypress",
    "e2e",
    `${testCase.id}.cy.js`
  );
  await fs.writeFile(testFilePath, testContent);
  return testFilePath;
};

// Helper function để chuyển đổi test step thành Cypress command
const generateCypressCommand = (step) => {
  // Đây là logic đơn giản, bạn có thể mở rộng nó dựa trên các loại action khác nhau
  const action = step.action.toLowerCase();
  if (action.includes("click")) {
    return `cy.get('[data-testid="${step.testData}"]').click()`;
  }
  if (action.includes("type")) {
    return `cy.get('[data-testid="${step.testData}"]').type('${step.testData}')`;
  }
  if (action.includes("check") || action.includes("verify")) {
    return `cy.get('[data-testid="${step.testData}"]').should('contain', '${step.expectedResult}')`;
  }
  // Default command
  return `cy.log('Custom step: ${step.action}')`;
};

router.post("/run-test", async (req, res) => {
  try {
    const testCase = req.body;
    const testFilePath = await generateCypressTest(testCase);

    // Chạy Cypress test
    exec(
      `npx cypress run --spec "${testFilePath}"`,
      {
        cwd: path.join(__dirname, "..", ".."),
      },
      (error, stdout, stderr) => {
        if (error) {
          return res.json({
            status: "failed",
            duration: "0s",
            error: error.message,
            logs: stderr.split("\n"),
          });
        }

        res.json({
          status: "passed",
          duration: "1s", // Thời gian thực tế sẽ được lấy từ Cypress results
          logs: stdout.split("\n"),
          screenshots: [], // Cypress sẽ lưu screenshots nếu test fail
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      status: "failed",
      duration: "0s",
      error: error.message,
      logs: ["Error generating or running test"],
    });
  }
});

module.exports = router;
