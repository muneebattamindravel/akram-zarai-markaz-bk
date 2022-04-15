const upload = async (req, res) => {
    try {
        if(!req.files) {
            res.status(500).send(`No File Received`);
        } else {
            let dumpFile = req.files.dumpFile;
            dumpFile.mv('../data-backups/' + dumpFile.name);

            const { exec } = require('child_process');
            const fileName = '../data-backups/' + dumpFile.name;

            exec(`mysql -hlocalhost -uroot -p7SlQOqaDnfEp akram-zarai-markaz < ${fileName}`, 
            (err, stdout, stderr) => {
                if (err) { 
                    console.log(err);
                    res.status(500).send(err);
                    return; 
                }

                console.log('File Restored');
                res.status(200).send();
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

const backup = async (req, res) => {
    const { exec } = require('child_process');
    const date = req.body.date;
    const dumpFileName = `${date}.dump.sql`

    let responseObject = {
        fileCreated: false,
        fileUploaded: false,
        message: ''
    }

    exec(`/Applications/MAMP/Library/bin/mysqldump --add-drop-table -uazmuser1 -pazmuser1 -hlocalhost akram-zarai-markaz > ${dumpFileName}`, 
    //exec(`C:\MAMP\bin\mysql\bin\mysqldump --add-drop-table -uazmuser1 -pazmuser1 -hlocalhost akram-zarai-markaz > ${dumpFileName}`, 
    (err, stdout, stderr) => {
        if (err) 
        { 
            console.error(`exec error: ${err}`);
            responseObject.message = err;
            res.status(500).send(responseObject);
            return; 
        }

        responseObject.fileCreated = true;

        var FormData = require('form-data');
        var fs = require('fs');
        var form = new FormData();
        var buffer = fs.createReadStream(`${dumpFileName}`);

        form.append('dumpFile', buffer, {
            contentType: 'multipart/form-data',
            filename: `${dumpFileName}`,
        });

        form.submit('http://13.213.139.143:4000/data/upload/', function(error, response) {
            if (err) {
                console.error(`exec error: ${error}`);
                responseObject.fileUploaded = false;
                responseObject.message = error;
                res.status(500).send(responseObject);
            }

            responseObject.fileUploaded = true;
            responseObject.message = 'File Uploaded';

            console.log(responseObject);
            res.status(200).send(responseObject)
        });
    });
}

module.exports = {
    backup,
    upload,
}


       