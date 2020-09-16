const fs = require('fs');
const puppeteer = require('puppeteer');

// Filenames for various include files.
const head_filename = 'public/head.html';
const navbar_filename = 'public/navbar.html';
const footer_filename = 'public/footer.html';

(async () => {
    // Launch browser and navigate to FlyBase homepage.
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://flybase.org');


    // Fetch the head and modify the document title.
    const head = await page.$eval('head', head => {
      const title = head.querySelector('title')
      title.innerText = 'Fast Track Your Paper';
      return head.innerHTML
    }).catch(e => console.log(`Failed to fetch document head: ${e.message}`));

    // Fetch the html for the div with the 'navbar-wrapper' class and modify the header title.
    const navbar = await page.$eval('div.navbar-wrapper > div', navbar => {
      const headerTitle = navbar.querySelector('#headertitle');
      headerTitle.innerHTML = 'Fast-Track Your Paper';
      return navbar.outerHTML;
    }).catch(e => console.log(`Failed to fetch navbar: ${e.message}`));

    // Fetch the footer.
    const footer = await page.$eval('div.container-fluid:nth-child(3)', elm => elm.outerHTML).catch(e => console.log(`Failed to fetch footer: ${e.message}`));

    // Write header and footer to file.
    fs.writeFileSync(head_filename, head);
    fs.writeFileSync(navbar_filename, navbar);
    fs.writeFileSync(footer_filename, footer);
    await browser.close();
  }
)();