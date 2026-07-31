const fs = require("fs");
let content = fs.readFileSync(
  "src/core/components/layout/sidebar/components/SidebarNav.tsx",
  "utf8",
);

content = content.replace(
  /import { NavItem, NavGroup, NavGroupItem } from "\.\/SidebarPrimitives";/,
  'import { NavItem, NavGroup, NavGroupItem, NavSection } from "./SidebarPrimitives";',
);

content = content.replace(
  /<div className="sidebar-nav-section py-2">\s*<div className="sidebar-label-el[^>]+>\s*\{([^}]+)\}\s*<\/div>/g,
  "<NavSection collapsed={c} label={$1}>",
);

content = content.replace(
  /<div className="sidebar-nav-section py-2">\s*<NavItem/g,
  "<NavSection collapsed={c}>\n          <NavItem",
);

content = content.replace(
  /          <\/div>\n        \)}/g,
  "          </NavSection>\n        )}",
);

content = content.replace(
  /        <\/div>\n      \)}/g,
  "        </NavSection>\n      )}",
);

fs.writeFileSync(
  "src/core/components/layout/sidebar/components/SidebarNav.tsx",
  content,
);
console.log("Done");
