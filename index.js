const puppeteer = require('puppeteer');
const moment = require('moment');
const cheerio = require('cheerio');
const fs = require('fs');



const url = 'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1800.html';

const configSelector = {
    year: 'tr > td > b',
    solarTerms: 'tr:nth-child(n+3)',
    solarTerm: 'td:nth-child(2)'
};

const solarTerms = ["Tiểu hàn", "Đại hàn", "Lập xuân", "Vũ Thủy", "Kinh trập", "Xuân phân", "Thanh minh", "Cốc vũ",
    "Lập hạ", "Tiểu mãn", "Mang chủng", "Hạ chí", "Tiểu thử", "Đại thử", "Lập thu", "Xử thử", "Bạch lộ", "Thu phân", "Hàn lộ",
    "Sương giáng", "Lập đông", "Tiểu tuyết", "Đại tuyết", "Đông chí"
];

const urls = [
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1800.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1820.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1840.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1860.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1880.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1900.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1920.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1940.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1960.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-1980.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-2000.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-2020.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-2040.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-2060.html',
    'https://www.informatik.uni-leipzig.de/~duc/amlich/DuLieu/Sun-Moon-2080.html'
];

(async () => {
    let json = [];
    for (let url of urls) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const $ = cheerio.load(await page.content());

        const parserSolarTerm = (year, el) => {
            const text = $(el).find(configSelector.solarTerm).text();
            if (text) {
                const [d, n] = text.toString().split(' - ');

                if (solarTerms.indexOf(n) >= 0) {
                    return {
                        startAt: moment(d, "DD/MM hh:mm").format(`${year}-MM-DD HH:mm:00`),
                        index: solarTerms.indexOf(n),
                        name: solarTerms[solarTerms.indexOf(n)]
                    }
                }
            }
        }

        const parserSolarTerms = (year, elements) => {
            let data = [];
            elements.map((index, el) => {
                const r = parserSolarTerm(year, el);
                if (r) data.push(r);
            })
            return data;
        }

        const tables = $('table tbody');
        // console.log(tables);

        for (let t of tables) {
            const year = $(t, configSelector.year) ? parseInt($(t, configSelector.year).text()) : null;
            json.push({
                year: year,
                solarTerms: parserSolarTerms(year, $(t).find(configSelector.solarTerms))
            })
        }

        await browser.close();
    }

    fs.writeFile('data.json', JSON.stringify(json), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
})();