const upload = async (req, res) => {
    try {
        if(!req.files) {
            res.status(500).send('No file uploaded');
        } else {
            let dumpFile = req.files.dumpFile;            
            dumpFile.mv('.../data-backups/' + dumpFile.name);

            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
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
    let exportFrom = {
        host: "localhost",
        user: "azmuser1",
        password: "azmuser1",
        database: "akram-zarai-markaz"
    }

    exec(`/Applications/MAMP/Library/bin/mysqldump --add-drop-table -u${exportFrom.user} -p${exportFrom.password} -h${exportFrom.host} ${exportFrom.database} > ${dumpFileName}`, 
    (err, stdout, stderr) => {
        if (err) 
        { 
            console.error(`exec error: ${err}`); 
            res.status(500).send();
            return; 
        }

        const {FormData} = require('form-data');
        const fetch = require('node-fetch');
        const fs = require('fs');
        const form = new FormData();
        const buffer = fs.createReadStream(`${dumpFileName}`);

        form.append('dumpFile', buffer, {
            contentType: 'multipart/form-data',
            filename: `${dumpFileName}`,
        });

        // form.submit('http://example.org/', function(err, res) {
        //     res.resume();
        // });

        //return fetch(`13.213.139.143:4000/data/upload/`, { method: 'POST', body: form })

        fetch('13.213.139.143:4000/data/upload/', {
            method: 'POST',
            body: form,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.json())
        .then(json => console.log(json));
    });
}

module.exports = {
    backup,
    upload,
}


       