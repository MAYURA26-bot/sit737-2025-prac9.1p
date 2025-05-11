const express = require("express");
const path = require("path");
const winston = require("winston");

const app = express();
const port = 3005;

const historyController = require("./controller/historyController");

//#region mongoose
const Calculation = require("./models/Calculation");

const mongoose = require("mongoose");

// Build MongoDB connection URI from environment variables
const mongoUri = `${process.env.MONGO_URI}`

// Connect to MongoDB
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error:", err));

//#endregion mongoose

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    ],
});

// Helper function for error messages
function errorMessage(message) {
    return `
        <div style="color: red; text-align: center;">
            <h2>Error:</h2>
            <p style="color: black;">${message}</p>
            <br>
            <a href="/" style="text-decoration: none; background-color: #007BFF; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Go Back</a>
        </div>
    `;
}

// Serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Calculator operation function
function calculate(req, res, operation) {
    try {
        const num1 = parseFloat(req.body.num1);
        const num2 = parseFloat(req.body.num2);

        if (isNaN(num1)) {
            //logger.error("Invalid input for number 1");
            logger.log({level:'error', message: `On ${operation} request, Invalid input for number 1`});
            return res.send(errorMessage(`Invalid input for number 1. Please enter a valid number.`));
        }

        if (isNaN(num2)) {
            //logger.error("Invalid input for number 2");
            logger.log({level:'error', message: `On ${operation} request, Invalid input for number 2`});
            return res.send(errorMessage("Invalid input for number 2. Please enter a valid number."));
        }

        let result;
        let symbol;

        switch (operation) {
            case "add":
                result = num1 + num2;
                symbol = "+";
                break;
            case "subtract":
                result = num1 - num2;
                symbol = "-";
                break;
            case "multiply":
                result = num1 * num2;
                symbol = "*";
                break;
            case "divide":
                if (num2 === 0) {
                    //logger.error("Attempted division by zero");
                    logger.log({level:'error', message: `On ${operation} request, Attempted division by zero`});
                    return res.send(errorMessage("Cannot divide by zero."));
                }
                result = num1 / num2;
                symbol = "/";
                break;
            case "modulo":
                if (num2 === 0) {
                    logger.log({level:'error', message: `On ${operation} request, Attempted modulo by zero`});
                    return res.send(errorMessage("Cannot perform modulo by zero."));
                }
                result = num1 % num2;
                symbol = "%";
                break;
            default:
                return res.send(errorMessage("Invalid operation."));
        }

        const calcRecord = new Calculation({
            num1,
            num2,
            result,
            operation
          });
          
          calcRecord.save()
            .then(() => {console.log("Saved to MongoDB");})
            .catch((err) => {console.log("Failed to save to MongoDB", err); });
          

        //logger.info(`${operation.toUpperCase()}: ${num1} ${symbol} ${num2} = ${result}`);
        logger.log({level:'info', message: `Requested to ${operation.toUpperCase()}: ${num1} ${symbol} ${num2} = ${result}` });
        return res.send(`
            <div style="color: green; text-align: center;">
            <h2>Calculation Result</h2>
            <p style="color:black">${num1} ${symbol} ${num2} = <b>${result}</b></p>
            <br>
            <a href="/" style="text-decoration: none; background-color: #007BFF; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Go Back</a>
            </div>
            `);
    } catch (error) {
        logger.error(error.toString());
        return res.send(errorMessage($erroe.toString()));
    }
}

// Define routes for each operation
app.post("/add", (req, res) => calculate(req, res, "add"));
app.post("/subtract", (req, res) => calculate(req, res, "subtract"));
app.post("/multiply", (req, res) => calculate(req, res, "multiply"));
app.post("/divide", (req, res) => calculate(req, res, "divide"));
app.post("/modulo", (req, res) => calculate(req, res, "modulo"));

app.get("/history", historyController.getHistory);
app.post("/delete/:id", historyController.deleteCalculation);
app.get("/edit/:id", historyController.showEditForm);
app.post("/edit/:id", historyController.updateCalculation);

// Start the server
app.listen(port, () => {
    console.log(`Calculator microservice running at http://localhost:${port}`);
});
