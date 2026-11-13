const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
if (!process.env.FTYP_CLIENT_DIR)
  throw new Error("FTYP_CLIENT_DIR is required");
const { JSDOM } = createRequire(
  path.resolve(process.env.FTYP_CLIENT_DIR, "package.json")
)("jsdom");
const source = fs.readFileSync(
  path.resolve(__dirname, "../client/header/preview-header.js"),
  "utf8"
);
function setup(initialize = () => {}) {
  const dom = new JSDOM(
    `<nav><form id="j2g_search_form"><input name="caller" value="genejump">
    <input type="hidden" name="query" value=""><input id="GeneSearch" name="context">
    <button id="GeneSearchSlct"></button></form></nav>`,
    { url: "https://preview.invalid/", runScripts: "outside-only" }
  );
  initialize(dom.window);
  dom.window.eval(source);
  return dom;
}
test("migrates the old preference without changing the old session store", () => {
  const legacy = JSON.stringify({
    FlyBase_session: { j2g: "sch", reports: { example: 1 } },
  });
  const dom = setup((w) => w.localStorage.setItem("simpleStorage", legacy));
  assert.equal(dom.window.document.querySelector("#GeneSearch").name, "query");
  assert.equal(dom.window.localStorage.getItem("simpleStorage"), legacy);
  dom.window.close();
});
test("a valid new preference survives corrupted historical storage", () => {
  const dom = setup((w) => {
    w.localStorage.setItem("simpleStorage", "invalid");
    w.localStorage.setItem("ftyp-header-search-mode", "sch");
  });
  assert.equal(dom.window.document.querySelector("#GeneSearch").name, "query");
  dom.window.close();
});
test("storage denial leaves both search modes functional", () => {
  const dom = setup((w) =>
    Object.defineProperty(w, "localStorage", {
      get() {
        throw new Error("Denied");
      },
    })
  );
  const w = dom.window;
  w.j2gSearchSelector("sch");
  assert.equal(
    w.document.querySelector("form").getAttribute("action"),
    "/search/"
  );
  w.j2gSearchSelector("j2g");
  assert.equal(
    w.document.querySelector("form").getAttribute("action"),
    "/cgi-bin/uniquery.pl"
  );
  dom.window.close();
});
test("submits exactly one visible query, switches caller, and rejects whitespace", () => {
  const dom = setup(),
    w = dom.window,
    form = w.document.querySelector("form"),
    input = w.document.querySelector("#GeneSearch");
  input.value = "fixture";
  assert.equal(new w.FormData(form).get("context"), "fixture");
  assert.equal(new w.FormData(form).get("caller"), "genejump");
  w.j2gSearchSelector("sch");
  assert.deepEqual(new w.FormData(form).getAll("query"), ["fixture"]);
  assert.equal(new w.FormData(form).has("caller"), false);
  input.value = "  ";
  assert.equal(
    form.dispatchEvent(new w.Event("submit", { cancelable: true })),
    false
  );
  dom.window.close();
});
