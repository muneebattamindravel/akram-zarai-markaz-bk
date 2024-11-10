const { exec } = require('child_process');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
    database: 'akram-zarai-markaz',
    username: 'root',
    password: 'root',
    host: 'localhost',
    port: 8889
};

// Function to create a database dump
const backup = async (req, res) => {
    try {
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // e.g., '2024-08-11'
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // e.g., '14-35-07'
        const dumpFileName = `${date}-${time}-${dbConfig.database}.dump.sql`;

        const localDataBackups = '../local-data-backups'
        const dumpFilePath = path.join(__dirname, localDataBackups, dumpFileName);

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, localDataBackups))) {
            fs.mkdirSync(path.join(__dirname, localDataBackups));
        }

        // Determine the correct mysqldump command based on the platform
        const mysqldumpPath = process.platform === 'win32' || process.platform === 'win64'
            ? 'mysqldump' // On Windows, assuming mysqldump is in PATH
            : '/Applications/MAMP/Library/bin/mysql80/bin/mysqldump'; // MAMP's mysqldump path on macOS

        // Construct the dump command
        const dumpCommand = `${mysqldumpPath} --protocol=tcp -u${dbConfig.username} -p${dbConfig.password} -h${dbConfig.host} --port=${dbConfig.port} ${dbConfig.database} > ${dumpFilePath}`;

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
    }

    // form.submit('http://localhost:6969/data/upload/', function (error, response) {
    form.submit('http://18.140.71.84:6969/data/upload/', function (error, response) {
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
            responseObject.message = error;
            res.status(500).send(responseObject);

            return;
        }

        responseObject.fileUploaded = true;
        responseObject.message = 'File Uploaded';

        console.log(responseObject);
        res.status(200).send(responseObject)
    });
};

// Function to restore a database dump from the uploaded file
const upload = async (req, res) => {
    try {
        if (!req.files) {
            res.status(500).send(`No File Received`);
            return;
        }

        const dumpFile = req.files.dumpFile;

        const uploadedDataBackups = '../uploaded-data-backups'
        const dumpFilePath = path.join(__dirname, uploadedDataBackups, dumpFile.name);

        // Save the uploaded file
        await dumpFile.mv(dumpFilePath);

        // Execute the SQL file to restore the database
        const restoreCommand = process.platform === 'win32' || process.platform === 'win64'
            ? `mysql -h${dbConfig.host} -u${dbConfig.username} -p${dbConfig.password} ${dbConfig.database} < ${dumpFilePath}`
            : `/Applications/MAMP/Library/bin/mysql80/bin/mysql -h${dbConfig.host} -u${dbConfig.username} -p${dbConfig.password} --port=${dbConfig.port} ${dbConfig.database} < ${dumpFilePath}`;

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