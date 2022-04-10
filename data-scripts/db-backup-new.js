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
    let importTo = {
        host: "http://13.213.139.143",
        user: "azmuser1",
        password: "azmuser1",
        database: "akram-zarai-markaz"
    }

    // mysqldump -u root -ptmppassword sugarcrm | mysql \
    //              -u root -ptmppassword --host=remote-server -C sugarcrm1

    console.log(`Starting exporting data from the ${exportFrom.database} database`);
    // Execute a MySQL Dump and redirect the output to the file in dumpFile variable.
    exec(`/Applications/MAMP/Library/bin/mysqldump --add-drop-table -u${exportFrom.user} -p${exportFrom.password} -h${exportFrom.host} ${exportFrom.database} > ${dumpFileName}`, 
    (err, stdout, stderr) => {
        if (err) 
        { 
            console.error(`exec error: ${err}`); 
            res.status(500).send();
            return; 
        }
        
        console.log(`Now, importing data to the ${importTo.database} database`);
        // Import the database.
        exec(`mysql -u${importTo.user} -p${importTo.password} -h${importTo.host} -p 3306 ${importTo.database} < ${dumpFileName}`, (err, stdout, stderr) => {
            if (err) { 
                console.error(`exec error: ${err}`);
                res.status(500).send();
                return; 
            }

            console.log(`The import has finished.`);
            res.status(200).send();
        });
    });
}

module.exports = {
    backup,
}


       