const db = require('../db');
const XLSX = require('xlsx');
const path = require('path');

// Функция для преобразования даты из формата Excel в нормальную дату
const excelDateToJSDate = (serial) => {
    const days = Math.floor(serial - 25569);
    const value = days * 86400;
    const date = new Date(value * 1000);
    const hours = Math.floor((serial % 1) * 24);
    const minutes = Math.floor(((serial * 24) % 1) * 60);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toISOString().split('T')[0];
};

// Функция для обрезки строки до 1200 символов
const truncateString = (str) => {
    return str && str.length > 1200 ? str.substring(0, 1200) : str;
};

exports.parseAndSave = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../', req.file.path);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const insertQuery = `
            INSERT INTO zakup (country, city, terminal, stock, numcont, tip, photo, yom, sost, vidras, costzak, nds, gtd, podryad, dataprih, statusopl, termhran, rprcon, prr, izder, comm, maneger) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        `;

        const insertQuery2 = `
            INSERT INTO svod (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;

        const insertQuery3 = `
            INSERT INTO kpclients (country, city, terminal, numcont, photo, yom, tip, score) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        await db.query('BEGIN');

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            const [
                , 
                country = 'Неизвестно',
                city = 'Неизвестно',
                terminal = 'Неизвестно',
                stock = 'Неизвестно',
                numcont = 'Неизвестно',
                tip = 'Неизвестно',
                photo = 'Неизвестно',
                yom = 'Неизвестно',
                sost = 'Неизвестно',
                vidras = 'Неизвестно',
                costzak = 'Неизвестно',
                nds = 'Неизвестно',
                gtd = 'Неизвестно',
                podryad = 'Неизвестно',
                dataprih = 'Неизвестно',
                statusopl = 'Неизвестно',
                termhran = 'Неизвестно',
                rprcon = 'Неизвестно',
                prr = 'Неизвестно',
                izder = 'Неизвестно',
                comm = 'Неизвестно',
                maneger = 'Неизвестно'
            ] = row;

            // Прекратить парсинг, если city равно "Неизвестно"
            if (city === 'Неизвестно') {
                break;
            }

            // Преобразуем только поле P (dataprih), если оно является числом
            const formattedDataprih = isNaN(dataprih) ? 'Неизвестно' : excelDateToJSDate(dataprih);

            await db.query(insertQuery, [
                truncateString(country),
                truncateString(city),
                truncateString(terminal),
                truncateString(stock),
                truncateString(numcont),
                truncateString(tip),
                truncateString(photo),
                truncateString(yom),
                truncateString(sost),
                truncateString(vidras),
                truncateString(costzak),
                truncateString(nds),
                truncateString(gtd),
                truncateString(podryad),
                formattedDataprih,
                truncateString(statusopl),
                truncateString(termhran),
                truncateString(rprcon),
                truncateString(prr),
                truncateString(izder),
                truncateString(comm),
                truncateString(maneger)
            ]);

            await db.query(insertQuery2, [
                truncateString(country),
                truncateString(city),
                truncateString(terminal),
                truncateString(stock),
                truncateString(numcont),
                truncateString(photo),
                truncateString(yom),
                truncateString(tip),
                truncateString(sost),
                truncateString(parseInt(costzak)),
                truncateString(podryad),
                formattedDataprih,
                truncateString(),
                truncateString(null),
                truncateString(statusopl),
            ]);

            await db.query(insertQuery3, [
                truncateString(country),
                truncateString(city),
                truncateString(terminal),
                truncateString(numcont),
                truncateString(photo),
                truncateString(yom),
                truncateString(tip),
                truncateString(""),
            ]);
        }

        await db.query('COMMIT');

        res.status(200).json({ message: 'File processed and data saved successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error processing file' });
    }
};
