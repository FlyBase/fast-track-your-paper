const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
for (const key of [
  "FTYP_CLIENT_DIR",
  "FTYP_SHARED_JS_DIR",
  "FTYP_SHARED_STYLE_DIR",
  "FTYP_TEST_OUTPUT",
]) {
  if (!process.env[key])
    throw new Error("Required environment variable: " + key);
}
const client = path.resolve(process.env.FTYP_CLIENT_DIR);
const sharedJS = path.resolve(process.env.FTYP_SHARED_JS_DIR);
const extra = path.resolve(process.env.FTYP_EXTRA_ASSETS || sharedJS);
const sharedStyle = path.resolve(process.env.FTYP_SHARED_STYLE_DIR);
const output = path.resolve(process.env.FTYP_TEST_OUTPUT);
fs.mkdirSync(output, { recursive: true });
process.chdir(client);
const { chromium } = createRequire(path.join(client, "package.json"))(
  "playwright"
);
const baseline = process.env.FTYP_BASELINE === "1";
const build = path.resolve(process.env.FTYP_BUILD_DIR || "build");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 1366, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  const operations = [];
  const external = [];
  const missing = [];
  let submission;
  page.on("pageerror", (e) => errors.push(e.message));
  const pub = {
    uniquename: "FBrf9999999",
    miniref: "Fixture et al.",
    title: "Isolated fixture publication",
    curationStatus: null,
    hasSubmission: false,
    type: { name: "research article" },
  };
  await context.route("**/*", async (route) => {
    const req = route.request(),
      u = new URL(req.url());
    if (u.hostname !== "ftyp.test") {
      external.push(req.url());
      return route.fulfill({ status: 204 });
    }
    if (u.pathname.endsWith("/graphql")) {
      const op = req.postDataJSON();
      operations.push(op.operationName);
      let data;
      if (op.operationName === "PubQuery")
        data = { pubs: { totalCount: 1, nodes: [pub] } };
      else if (op.operationName === "GeneQuery")
        data = {
          results: {
            totalCount: 1,
            genes: [
              {
                id: "FBgn9999999",
                symbol: "fixture-gene",
                species: "Dmel",
                hasSummary: false,
                hl: { name: "Fixture gene", synonyms: [] },
              },
            ],
          },
        };
      else if (op.operationName === "GetTmFlags")
        data = { flags: { nodes: [] } };
      else if (op.operationName === "FtypSubmission") {
        submission = op.variables.submission;
        data = { submitPaper: { datetime: "2026-01-01T00:00:00Z" } };
      } else
        return route.fulfill({
          status: 400,
          json: {
            errors: [
              { message: "Unexpected fixture operation " + op.operationName },
            ],
          },
        });
      return route.fulfill({ json: { data } });
    }
    if (u.pathname === "/cgi-bin/get_dict.pl")
      return route.fulfill({
        json: [{ value: "fixture-gene", label: "Fixture gene" }],
      });
    let file;
    if (u.pathname.startsWith("/js/"))
      file = path.resolve(sharedJS, u.pathname.slice("/js/".length));
    else if (
      u.pathname.startsWith("/css/") ||
      u.pathname.startsWith("/font/") ||
      u.pathname.startsWith("/images/")
    )
      file = path.resolve(sharedStyle, u.pathname.slice(1));
    else if (u.pathname.startsWith("/submission/publication/")) {
      const rel = u.pathname.slice("/submission/publication/".length);
      file = path.resolve(build, rel || "index.html");
    }
    const supplemental = path.join(extra, u.pathname);
    if (fs.existsSync(supplemental) && fs.statSync(supplemental).isFile()) file = supplemental;
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const mime =
        {
          ".js": "application/javascript",
          ".css": "text/css",
          ".html": "text/html",
          ".json": "application/json",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".png": "image/png",
        }[path.extname(file)] || "application/octet-stream";
      return route.fulfill({ body: fs.readFileSync(file), contentType: mime });
    }
    missing.push(u.pathname);
    return route.fulfill({ status: 404, body: "Fixture not found" });
  });
  try {
    await page.goto("http://ftyp.test/submission/publication/");
    await page
      .getByText("Choose a Publication to Annotate", { exact: true })
      .waitFor();
    if (baseline)
      assert.equal(await page.evaluate(() => jQuery.fn.jquery), "1.10.2");
    else {
      assert.equal(
        await page.evaluate(() => typeof window.jQuery),
        "undefined"
      );
      assert.equal(
        await page.evaluate(() => bootstrap.Dropdown.VERSION),
        "5.3.9"
      );
      assert.equal(await page.locator('script[src^="/js/"]').count(), 3);
    }
    await page.screenshot({
      path: path.join(output, "desktop.png"),
      fullPage: true,
    });
    await page.locator("#header2023 .dropdown-toggle").filter({ hasText: "Tools" }).click();
    assert((await page.locator("li.dropdown.open").count()) > 0);
    const desktopToggle = page.locator('#header2023 .dropdown-toggle').filter({ hasText: 'Tools' });
    assert.equal(await desktopToggle.evaluate(el => getComputedStyle(el).display), 'flex');
    await page.screenshot({path:path.join(output, 'desktop-menu.png'), fullPage:true});
    await page.keyboard.press("ArrowDown");
    assert(await page.evaluate(() => Boolean(document.activeElement.closest(".dropdown-menu"))));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator('#header2023 li.dropdown.open').count(), 0);
    await page.locator("#GeneSearchSlct").selectOption("sch");
    assert.equal(
      await page.locator("#j2g_search_form").getAttribute("action"),
      "/search/"
    );
    await page.reload();
    await page
      .getByText("Choose a Publication to Annotate", { exact: true })
      .waitFor();
    assert.equal(
      await page.locator("#GeneSearch").getAttribute("name"),
      "query"
    );
    if (!baseline) {
      await page.locator("#GeneSearch").fill("fixture");
      assert.deepEqual(
        await page.evaluate(() =>
          new FormData(document.getElementById("j2g_search_form")).getAll(
            "query"
          )
        ),
        ["fixture"]
      );
      await page.locator("#GeneSearch").fill("   ");
      assert.equal(
        await page.evaluate(() =>
          document
            .getElementById("j2g_search_form")
            .dispatchEvent(new Event("submit", { cancelable: true }))
        ),
        false
      );
    }
    await page.locator('#GeneSearch').fill('')
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#hamburger').click();
    await page.waitForFunction(() => document.querySelector('#stack-nav').classList.contains('open'));
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    const mobileToggle = page.locator('#stack-nav .dropdown-toggle').filter({hasText:'Tools'});
    await mobileToggle.click();
    assert.equal(await mobileToggle.evaluate(el => getComputedStyle(el).display), 'flex');
    await page.screenshot({path:path.join(output, 'mobile-menu.png'), fullPage:true});
    await page.locator('#close-stack-nav').click({position:{x:10,y:10}});
    assert.equal(await page.locator('#stack-nav li.dropdown.open').count(), 0);
    await page.locator('#hamburger').click();
    const carousel = page.locator('#FBcarousel-mobile');
    const activeIndex = () => carousel.locator('.carousel-inner > .item').evaluateAll(items => items.findIndex(el => el.classList.contains('active')));
    assert.equal(await activeIndex(), 1);
    await carousel.locator('.right.carousel-control').click();
    await page.waitForTimeout(700);
    assert.equal(await activeIndex(), 2);
    await carousel.locator('.left.carousel-control').click();
    await page.waitForTimeout(700);
    assert.equal(await activeIndex(), 1);
    await carousel.locator('.carousel-indicators li').first().click();
    await page.waitForTimeout(700);
    assert.equal(await activeIndex(), 0);
    await carousel.locator('.left.carousel-control').click();
    await page.waitForTimeout(700);
    assert.equal(await activeIndex(), 0); // data-wrap=false must survive migration.
    await page.locator('#x-icon').click();
    await page.waitForFunction(() => !document.querySelector('#stack-nav').classList.contains('open'));
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.locator("#pub_search_keywords").fill("fixture");
    await page.locator("#pub_search").click();
    await page.getByText(pub.title, { exact: true }).click();
    await page
      .getByRole("button", {
        name: "Save Publication step and go to Contact step",
      })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Save Contact step and go to Data step" })
      .click();
    await page.locator("#name").waitFor();
    assert.equal(await page.locator("#gene").count(), 0);
    await page.locator("#name").fill("Test Curator");
    await page.locator("#email").fill("test@example.invalid");
    await page.locator("#email_verify").fill("test@example.invalid");
    await page
      .getByRole("button", { name: "Save Contact step and go to Data step" })
      .click();
    await page
      .getByRole("button", { name: "Save Data step and go to Genes step" })
      .click();
    await page.locator("#gene").fill("fixture");
    await page
      .locator("#geneSearchSuggestions")
      .getByText("fixture-gene", { exact: true })
      .click();
    await page.locator('table a[href="/reports/FBgn9999999"]').waitFor();
    if (await page.locator("#geneSearchSuggestionsDismiss").count())
      await page.locator("#geneSearchSuggestionsDismiss").click();
    await page
      .getByRole("button", {
        name: "Save Genes step and go to Confirmation step",
      })
      .click();
    await page.getByRole("button", { name: /Return to Genes step/ }).click();
    await page
      .getByRole("button", {
        name: "Save Genes step and go to Confirmation step",
      })
      .click();
    await page.screenshot({
      path: path.join(output, "confirmation.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: /Submit your paper/ }).click();
    await page.getByText("Thank you!", { exact: true }).waitFor();
    assert(submission);
    assert.equal(submission.contact.email, "test@example.invalid");
    assert.equal(submission.publication.uniquename, pub.uniquename);
    assert(JSON.stringify(submission).includes("FBgn9999999"));
    assert.equal(operations.filter((x) => x === "FtypSubmission").length, 1);
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert(external.every(url => new URL(url).hostname === 'www.google-analytics.com'), JSON.stringify(external));
    assert(
      !missing.some((p) => p.endsWith(".js") || p.endsWith(".css")),
      JSON.stringify(missing)
    );
    fs.writeFileSync(
      path.join(output, "browser-result.json"),
      JSON.stringify(
        {
          baseline,
          operations,
          submission,
          errors,
          external,
          missing,
          passed: true,
        },
        null,
        2
      )
    );
    console.log(
      "PASS production navigation, select persistence, carousel controls, gene search and fixture submission"
    );
  } catch (e) {
    fs.writeFileSync(
      path.join(output, "browser-failure.txt"),
      e.stack +
        "\n" +
        JSON.stringify({
          errors,
          state: await page.evaluate(() => localStorage.getItem("ftyp-state")),
        }) +
        "\n" +
        (await page.locator("body").innerText())
    );
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
