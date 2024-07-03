const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Route to handle file upload
app.post('/upload', upload.single('document'), (req, res) => {
  // Here you can add your document processing logic
  console.log(`File uploaded successfully: ${req.file.path}`);
  
  //connecting python script
  const pythonProcess = spawn('python', ['main.py', req.file.path]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Python script executed successfully');
      res.send(`${"File processed"},${req.file.filename}`);
    } else {
      console.error(`Python script exited with code ${code}`);
      res.status(500).send('Error processing document with Python script');
    }
  });
});

// Route to serve the uploaded file for download
app.get('/download/:filename', (req, res) => {
    const filePath = `./uploads/${req.params.filename}`;
    console.log(filePath);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
