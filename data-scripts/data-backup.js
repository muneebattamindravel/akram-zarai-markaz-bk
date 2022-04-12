const upload = async (req, res) => {
    try {
        if(!req.files) {
            console.log('no file received')
            res.status(500).send('No file uploaded');
        } else {
            let dumpFile = req.files.dumpFile;
            dumpFile.mv('.../data-backups/' + dumpFile.name);
            console.log("here");

            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: dumpFile.name,
                    mimetype: dumpFile.mimetype,
                    size: dumpFile.size
                }
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
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
        fileUploaded: false
    }

    exec(`/Applications/MAMP/Library/bin/mysqldump --add-drop-table -u${exportFrom.user} -p${exportFrom.password} -h${exportFrom.host} ${exportFrom.database} > ${dumpFileName}`, 
    (err, stdout, stderr) => {
        if (err) 
        { 
            console.error(`exec error: ${err}`);
            res.status(500).send(responseObject);
            return; 
        }

        responseObject.fileCreated = false;

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
                res.status(500).send(responseObject);
            }

            console.log(response)
            responseObject.fileUploaded = true;
            res.status(200).send(responseObject)
        });
    });
}

module.exports = {
    backup,
    upload,
}


       