const backup = async (req, res) => {
    //mysql -h localhost -uroot -p7SlQOqaDnfEp akram-zarai-markaz-restore < dump.sql

    const { exec } = require('child_process');
    const date = req.body.date;
    const dumpFileName = `${date}.dump.sql`
    let exportFrom = {
        host: "localhost",
        user: "azmuser1",
        password: "azmuser1",
        database: "akram-zarai-markaz"
    }

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
    });
}

module.exports = {
    backup,
}


       