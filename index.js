const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const WORK_DIR = path.join(__dirname, 'code');
const TIMEOUT = 5000;

if (!fs.existsSync(WORK_DIR)) {
    fs.mkdirSync(WORK_DIR);
}

// Compile and run C++ code
app.post('/run', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const filename = path.join(WORK_DIR, `temp.cpp`);
    const outputFilename = path.join(WORK_DIR, `output`);

    fs.writeFileSync(filename, code);

    exec(`g++ ${filename} -o ${outputFilename}`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: 'Compilation error', details: stderr });
        }

        exec(`${outputFilename}`, { timeout: TIMEOUT }, (err, stdout, stderr) => {
            if (err) {
                if (err.killed) {
                    return res.status(500).json({ error: 'Execution timed out' });
                }
                return res.status(500).json({ error: 'Runtime error', details: stderr });
            }

            res.json({ output: stdout });
        });
    });
});

// Analyze C++ code using OpenAI
app.post('/analyze', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const pythonScript = path.join(__dirname, 'analyze_code.py');

    exec(`python3 ${pythonScript} "${code.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: 'Analysis error', details: stderr });
        }

        res.json({ analysis: stdout });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Compiler server is running on http://localhost:${PORT}`);
});
