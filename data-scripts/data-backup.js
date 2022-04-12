const upload = async (req, res) => {
    try {
        let responseObject = {
            fileUploaded: false,
            fileRestored: false,
            message: ''
        }

        if(!req.files) {
            console.log('No File Received')
            responseObject.fileRestored = false;
            responseObject.fileUploaded = false;
            responseObject.message = `No File Received`;
            res.status(500).send(responseObject);
        } else {
            let dumpFile = req.files.dumpFile;
            dumpFile.mv('../data-backups/' + dumpFile.name);

            responseObject.fileUploaded = true;
            responseObject.fileRestored = false;
            responseObject.message = `File Uploaded`;

            res.status(200).send(responseObject);

            // const { exec } = require('child_process');
            // const fileName = '../data-backups/' + dumpFile.name;

            // let importTo = {
            //     host: "localhost",
            //     user: "root",
            //     password: "7SlQOqaDnfEp",
            //     database: "akram-zarai-markaz"
            // }

            // exec(`mysql -h ${importTo.host} -u${importTo.user} -p${importTo.password} ${importTo.database} < ${fileName}`, 
            // (err, stdout, stderr) => {
            //     if (err) { 
            //         responseObject.fileRestored = false;
            //         responseObject.message = `${err}`;
            //         res.status(500).send(responseObject);
            //         return; 
            //     }

            //     responseObject.fileRestored = true;
            //     res.status(200).send(responseObject);
            // });
        }
    } catch (err) {
        console.log(err)
        responseObject.fileUploaded = false;
        responseObject.fileRestored = false;
        responseObject.message = err;
        res.status(500).send(responseObject);
    }
}

const backup = async (req, res) => {
    const { exec } = require('child_process');
    const date = req.body.date;
    const dumpFileName = `${date}.dump.sql`
    let exportFrom = {
        host: "localhost",
        user: "azmuser1",
        password: "azmuser1",
        database: "akram-zarai-markaz"
    }

    let responseObject = {
        fileCreated: false,
        fileUploaded: false,
        fileRestored: false,
        message: ''
    }

    exec(`/Applications/MAMP/Library/bin/mysqldump --add-drop-table -u${exportFrom.user} -p${exportFrom.password} -h${exportFrom.host} ${exportFrom.database} > ${dumpFileName}`, 
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
                responseObject.fileRestored = false;
                responseObject.message = error;
                res.status(500).send(responseObject);
            }

            responseObject.fileUploaded = response.fileUploaded;
            responseObject.fileRestored = response.fileRestored;
            responseObject.message = response.message;

            console.log(responseObject);
            res.status(200).send(responseObject)
        });
    });
}

module.exports = {
    backup,
    upload,
}


       