const Calculation = require("../models/Calculation");

exports.getHistory = async (req, res) => {
  try {
    const calculations = await Calculation.find().sort({ createdAt: -1 });

    // Helper to convert operation name to symbol
    const getSymbol = (op) => {
      switch (op) {
        case "add": return "+";
        case "subtract": return "−";
        case "multiply": return "×";
        case "divide": return "÷";
        case "modulo": return "%";
        default: return op;
      }
    };

    let historyHtml = `
        <html>
          <head>
            <title>Calculation History</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body class="bg-light">
            <div class="container mt-5">
              <div class="card shadow p-4">
                <h2 class="text-center mb-4">Calculation History</h2>
                <table class="table table-striped table-hover table-bordered">
                  <thead class="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Num 1</th>
                      <th>Operation</th>
                      <th>Num 2</th>
                      <th>=</th>
                      <th>Result</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
      `;

    calculations.forEach((c, i) => {
      const symbol = getSymbol(c.operation);
      historyHtml += `
          <tr>
            <td>${i + 1}</td>
            <td>${c.num1}</td>
            <td class="text-center">${c.operation}-(${symbol})</td>
            <td>${c.num2}</td>
            <td class="text-center">=</td>
            <td><strong>${c.result}</strong></td>
            <td>
              <div class="d-flex gap-2">
                <form action="/edit/${c._id}" method="GET">
                  <button class="btn btn-outline-secondary btn-sm">Edit</button>
                </form>
                <form action="/delete/${c._id}" method="POST">
                  <button class="btn btn-outline-danger btn-sm">Delete</button>
                </form>
              </div>
            </td>
          </tr>
        `;
    });

    historyHtml += `
                  </tbody>
                </table>
                <div class="text-center mt-4">
                  <a href="/" class="btn btn-primary">← Back to Calculator</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

    res.send(historyHtml);
  } catch (err) {
    res.status(500).send("Error fetching history");
  }
};


exports.deleteCalculation = async (req, res) => {
  try {
    await Calculation.findByIdAndDelete(req.params.id);
    res.redirect("/history");
  } catch (err) {
    res.status(500).send("Error deleting record");
  }
};

exports.showEditForm = async (req, res) => {
  const calc = await Calculation.findById(req.params.id);

  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Edit Calculation</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="card shadow p-4">
            <h2 class="mb-4 text-center">Edit Calculation</h2>
            <form method="POST" action="/edit/${calc._id}">
              <div class="mb-3">
                <label for="num1" class="form-label">Number 1</label>
                <input type="number" id="num1" name="num1" value="${calc.num1}" class="form-control" required>
              </div>
              <div class="mb-3">
                <label for="num2" class="form-label">Number 2</label>
                <input type="number" id="num2" name="num2" value="${calc.num2}" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Operation</label>
                <div class="form-control-plaintext"><strong>${calc.operation.toUpperCase()}</strong></div>
              </div>
              <div class="d-flex justify-content-between">
                <button class="btn btn-success">Update</button>
                <a href="/history" class="btn btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </body>
      </html>
    `);
};



exports.updateCalculation = async (req, res) => {
  const { num1, num2 } = req.body;
  const calc = await Calculation.findById(req.params.id);

  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);
  let result;

  switch (calc.operation) {
    case "add":
      result = n1 + n2;
      break;
    case "subtract":
      result = n1 - n2;
      break;
    case "multiply":
      result = n1 * n2;
      break;
    case "divide":
      result = n2 !== 0 ? n1 / n2 : null;
      break;
    case "modulo":
      result = n2 !== 0 ? n1 % n2 : null;
      break;
    default:
      result = null;
  }

  if (result === null) {
    return res.status(400).send("Invalid operation or division by zero");
  }

  await Calculation.findByIdAndUpdate(req.params.id, {
    num1: n1,
    num2: n2,
    result
  });

  res.redirect("/history");
};