(function () {
  "use strict";

  const body = document.body;
  const root = body.dataset.root || "./";
  const page = body.dataset.page || "home";
  const routes = {
    home: { title: "Knight Game Helper", label: "Home", path: "./" },
    weapons: { title: "Weapons", label: "Weapons", path: "equipment/weapons/" },
    shields: { title: "Shields", label: "Shields", path: "equipment/shields/" },
    armour: { title: "Armour", label: "Armour", path: "equipment/armour/" },
    premium: { title: "Premiums", label: "Premiums", path: "equipment/premiums/" },
    vassals: { title: "Vassals", label: "Vassals", path: "vassals/" },
    basics: { title: "Basics", label: "Basics", path: "tips/" },
    tools: { title: "Tools", label: "Tools", path: "tools/" },
    bestValueIncome: { title: "Best Value Vassals", label: "Best Value Vassals", path: "tools/best-value-income/" },
    priceIncome: { title: "Price Prediction Income", label: "Price Predict (Income)", path: "tools/price-prediction-income/" }
  };
  const groups = {
    home: [],
    weapons: ["home", "weapons", "shields", "armour", "premium"],
    shields: ["home", "weapons", "shields", "armour", "premium"],
    armour: ["home", "weapons", "shields", "armour", "premium"],
    premium: ["home", "weapons", "shields", "armour", "premium"],
    vassals: ["home", "vassals"],
    basics: ["home", "basics"],
    tools: ["home", "bestValueIncome", "priceIncome"],
    bestValueIncome: ["home", "bestValueIncome", "priceIncome"],
    priceIncome: ["home", "bestValueIncome", "priceIncome"]
  };

  const headerMount = document.querySelector("[data-site-header]");
  if (headerMount) {
    const current = routes[page] || routes.home;
    const tabs = (groups[page] || []).map((key) => {
      const item = routes[key];
      const active = key === page ? ' class="active"' : "";
      const currentAttr = key === page ? ' aria-current="page"' : "";
      const href = `${root}${item.path}`;
      return `<li${active}><a href="${href}" data-tab="${key}"${currentAttr}>${item.label}</a></li>`;
    }).join("");
    headerMount.innerHTML = `
      <header class="site-header">
        <div class="header-text">${current.title}</div>
        <div class="header-row">
          <div class="header_ext"></div>
          <div class="header" aria-hidden="true"></div>
          <div class="header_ext"></div>
        </div>
      </header>
      ${tabs ? `<nav class="tabsOuter" aria-label="Section navigation"><div class="tabsWrap"><ul class="tabs">${tabs}</ul></div></nav>` : ""}
    `;
    const main = document.querySelector(".page-main, .equipment-main, .game-list-main");
    const tabBar = headerMount.querySelector(".tabsOuter");
    if (main && tabBar) {
      const bottomTabs = tabBar.cloneNode(true);
      bottomTabs.setAttribute("aria-label", "Section navigation, bottom");
      main.after(bottomTabs);
    }
  }

  const footerMount = document.querySelector("[data-site-footer]");
  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="site-footer">
        <p>&copy; 2025 Knight Game Helper. Visual assets and CSS styles used on this site are the property of <a href="https://evilgrog.com" target="_blank" rel="noopener noreferrer">Evil Grog Games</a> and are used with permission. These assets are protected by copyright and may not be copied, redistributed, or reused without explicit consent.</p>
        <p class="footer-about-link"><a href="${root}tips/">About Knight Game by Evil Grog Games</a></p>
      </footer>`;
  }

  document.querySelectorAll(".menuItem > .toggle").forEach((button) => {
    button.addEventListener("click", function () {
      const menuItem = this.parentElement;
      const content = menuItem.querySelector(".menuContent");
      document.querySelectorAll(".menuItem").forEach((item) => {
        if (item !== menuItem) {
          item.classList.remove("active");
          const otherContent = item.querySelector(".menuContent");
          if (otherContent) otherContent.style.display = "none";
          const otherToggle = item.querySelector(".toggle");
          if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
        }
      });
      const isOpen = menuItem.classList.toggle("active");
      this.setAttribute("aria-expanded", String(isOpen));
      if (content) content.style.display = isOpen ? "block" : "none";
    });
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = document.querySelector(this.dataset.scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  if (window.location.hash === "#equipment") {
    const equipmentMenu = document.querySelector("#equipment");
    if (equipmentMenu) equipmentMenu.click();
  }
})();
