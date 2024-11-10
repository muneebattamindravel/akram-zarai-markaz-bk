const { exec } = require('child_process');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Determine the correct mysqldump and mysql paths based on the platform
const isWindows = process.platform === 'win32' || process.platform === 'win64';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

const mysqldumpPath = isWindows
    ? 'C:\\MAMP\\bin\\mysql\\bin\\mysqldump' // Path for MAMP on Windows
    : isMac
    ? '/Applications/MAMP/Library/bin/mysql80/bin/mysqldump' // Path for MAMP on macOS
    : '/opt/bitnami/mariadb/bin/mysqldump'; // Path for Linux (AWS Lightsail)

const mysqlPath = isWindows
    ? 'C:\\MAMP\\bin\\mysql\\bin\\mysql' // Path for MAMP on Windows
    : isMac
    ? '/Applications/MAMP/Library/bin/mysql80/bin/mysql' // Path for MAMP on macOS
    : '/opt/bitnami/mariadb/bin/mysql'; // Path for Linux (AWS Lightsail)

// Example usage
console.log("mysqldump path:", mysqldumpPath);
console.log("mysql path:", mysqlPath);


// Function to create a database dump
const backup = async (req, res) => {
    try {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const dumpFileName = `${date}-${time}-${process.env.DB_NAME}.dump.sql`;

        const localDataBackups = '../local-data-backups';
        const dumpFilePath = path.join(__dirname, localDataBackups, dumpFileName);

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, localDataBackups))) {
            fs.mkdirSync(path.join(__dirname, localDataBackups), { recursive: true });
        }

        // Construct the dump command using process.env variables directly
        const dumpCommand = `${mysqldumpPath} --protocol=tcp -u${process.env.DB_USER} -p${process.env.DB_PASSWORD} -h${process.env.DB_HOST} --port=${process.env.DB_PORT} ${process.env.DB_NAME} > "${dumpFilePath}"`;

        // Execute the dump command
        exec(dumpCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating database dump: ${error.message}`);
                res.status(500).send(`Error creating database dump: ${error.message}`);
                return;
            }

            console.log('Database dump created successfully.');
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

    form.submit(process.env.UPLOAD_URL_SERVER, (error, response) => {
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
        console.log("1");
        if (!req.files || !req.files.dumpFile) {
            res.status(400).send('No file received');
            return;
        }

        console.log("2");
        const dumpFile = req.files.dumpFile;
        const uploadedDataBackups = '../uploaded-data-backups';
        const dumpFilePath = path.join(__dirname, uploadedDataBackups, dumpFile.name);

        console.log("3");

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, uploadedDataBackups))) {
            fs.mkdirSync(path.join(__dirname, uploadedDataBackups), { recursive: true });
        }

        console.log("4");
        // Save the uploaded file
        await dumpFile.mv(dumpFilePath);

        console.log("5");
        // Construct the restore command using process.env variables directly
        const restoreCommand = `${mysqlPath} -h${process.env.DB_HOST} -u${process.env.DB_USER} -p${process.env.DB_PASSWORD} --port=${process.env.DB_PORT} ${process.env.DB_NAME} < "${dumpFilePath}"`;

        console.log("6 Restore Command = " + restoreCommand);
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
