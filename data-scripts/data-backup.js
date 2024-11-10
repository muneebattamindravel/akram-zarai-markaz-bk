const { exec } = require('child_process');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../config/dbConfig'); // Import dbConfig.js

// Database configuration
const sourceDbConfig = config.GetSourceDBConfig();
const targetDbConfig = config.GetTargetDBConfig();
const uploadURL = config.GetUploadURL();

// Determine the correct mysqldump and mysql paths based on the platform
const isWindows = process.platform === 'win32' || process.platform === 'win64';
const mysqldumpPath = isWindows
  ? 'C:\\MAMP\\bin\\mysql\\bin\\mysqldump' // Path for MAMP on Windows
  : '/Applications/MAMP/Library/bin/mysql80/bin/mysqldump'; // Path for MAMP on macOS

const mysqlPath = isWindows
  ? 'C:\\MAMP\\bin\\mysql\\bin\\mysql' // Path for MAMP on Windows
  : '/Applications/MAMP/Library/bin/mysql80/bin/mysql'; // Path for MAMP on macOS

// Function to create a database dump
const backup = async (req, res) => {
    try {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const dumpFileName = `${date}-${time}-${sourceDbConfig.database}.dump.sql`;

        const localDataBackups = '../local-data-backups';
        const dumpFilePath = path.join(__dirname, localDataBackups, dumpFileName);

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, localDataBackups))) {
            fs.mkdirSync(path.join(__dirname, localDataBackups), { recursive: true });
        }

        // Construct the dump command
        const dumpCommand = `${mysqldumpPath} --protocol=tcp -u${sourceDbConfig.username} -p${sourceDbConfig.password} -h${sourceDbConfig.host} --port=${sourceDbConfig.port} ${sourceDbConfig.database} > "${dumpFilePath}"`;

        // Execute the dump command
        exec(dumpCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating database dump: ${error.message}`);
                res.status(500).send(`Error creating database dump: ${error.message}`);
                return;
            }

            console.log('Database dump created successfully.');

            // After successful backup, upload the file
            uploadFile(dumpFilePath, dumpFileName, res);
        });
    } catch (error) {
        console.error('Error during backup:', error);
        res.status(500).send({ message: 'Error during backup.', error });
    }
};

// Function to upload the dump file
const uploadFile = (filePath, fileName, res) => {
    const form = new FormData();
    const buffer = fs.createReadStream(filePath);

    form.append('dumpFile', buffer, {
        contentType: 'multipart/form-data',
        filename: fileName,
    });

    let responseObject = {
        fileCreated: false,
        fileUploaded: false,
        message: ''
    };

    form.submit(uploadURL, (error, response) => {
        if (error) {
            console.error(`Error uploading dump file: ${error.message}`);
            responseObject.fileUploaded = false;
            responseObject.message = error;
            res.status(500).send(responseObject);
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`Failed to upload dump file. Server responded with status code: ${response.statusCode}`);
            responseObject.fileUploaded = false;
            responseObject.message = `Upload failed with status ${response.statusCode}`;
            res.status(500).send(responseObject);
            return;
        }

        responseObject.fileUploaded = true;
        responseObject.message = 'File Uploaded';
        console.log(responseObject);
        res.status(200).send(responseObject);
    });
};

// Function to restore a database dump from the uploaded file
const upload = async (req, res) => {
    try {
        if (!req.files || !req.files.dumpFile) {
            res.status(400).send('No file received');
            return;
        }

        const dumpFile = req.files.dumpFile;
        const uploadedDataBackups = '../uploaded-data-backups';
        const dumpFilePath = path.join(__dirname, uploadedDataBackups, dumpFile.name);

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, uploadedDataBackups))) {
            fs.mkdirSync(path.join(__dirname, uploadedDataBackups), { recursive: true });
        }

        // Save the uploaded file
        await dumpFile.mv(dumpFilePath);

        // Construct the restore command without my.cnf
        const restoreCommand = `${mysqlPath} -h${targetDbConfig.host} -u${targetDbConfig.username} -p${targetDbConfig.password} --port=${targetDbConfig.port} ${targetDbConfig.database} < "${dumpFilePath}"`;

        exec(restoreCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restoring database: ${error.message}`);
                res.status(500).send(`Error restoring database: ${error.message}`);
                return;
            }

            console.log('Database restored successfully.');
            res.status(200).send({ message: 'Database restored successfully.' });
        });
    } catch (err) {
        console.error('Error processing upload:', err);
        res.status(500).send({ message: 'Error processing upload.', error: err });
    }
};

module.exports = {
    backup,
    upload
};
