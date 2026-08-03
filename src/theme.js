const themes = new Set(["light", "dark", "system"]);
const menu = document.querySelector("[data-theme-menu]");
const options = [...document.querySelectorAll("[data-theme]")];

function resolve(preference) {
  return preference === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
}

function apply(preference) {
  if (!themes.has(preference)) preference = "system";
  localStorage.setItem("projects-theme", preference);
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolve(preference);
  document.documentElement.style.colorScheme = resolve(preference);
  for (const option of options) option.setAttribute("aria-checked", String(option.dataset.theme === preference));
}

for (const option of options) option.addEventListener("click", () => {
  apply(option.dataset.theme);
  menu?.removeAttribute("open");
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (document.documentElement.dataset.themePreference === "system") apply("system");
});

apply(localStorage.getItem("projects-theme") || "system");
