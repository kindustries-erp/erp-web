const fs = require("fs");

const files = require("child_process")
  .execSync('find src -name "*.tsx"')
  .toString()
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // Replace filterState={{ ... }} with filter={filterPanel}
  content = content.replace(
    /filterState=\{\{\s*activeFilterCount[\s\S]*?panelOpen:[^\}]+\}\}/g,
    "filter={filterPanel}",
  );

  // Replace filterState={X} with filter={X}
  content = content.replace(
    /filterState=\{([a-zA-Z0-9_\.]+)\}/g,
    "filter={$1}",
  );

  // If filter={filter.state}, change to filter={filter}
  content = content.replace(/filter=\{filter\.state\}/g, "filter={filter}");

  // Remove the extraneous props, but ONLY inside SpreadsheetPageTemplate
  // Actually, since these props were only used by SpreadsheetPageTemplate (and we removed them from its interface),
  // we can safely remove them if they appear near filterConfig
  content = content.replace(/\s*filterPanelOpen=\{[^}]+\}/g, "");
  content = content.replace(/\s*onFilterToggle=\{[^}]+\}/g, "");
  content = content.replace(/\s*activeFilterCount=\{[^}]+\}/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Fixed", file);
  }
}
