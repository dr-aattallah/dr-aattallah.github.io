(() => {
  if (sessionStorage.getItem("cpcs351_access") !== "granted") {
    window.location.href = "../../access.html";
    return;
  }

  const pages = [
    ["index.html", "01 Foundations"],
    ["challenges-and-types.html", "02 Challenges & Types"],
    ["elicitation-process.html", "03 Elicitation Process"],
    ["use-case-foundations.html", "04 Use Case Basics"],
    ["use-case-relationships.html", "05 Relationships"],
    ["use-case-guidelines.html", "06 Guidelines"],
    ["information-collection-analysis.html", "07 Collection & Analysis"],
    ["specification-feasibility.html", "08 SRS & Feasibility"],
    ["reviews-and-agile.html", "09 Reviews & Agile"]
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const links = pages.map(([href, label]) => `<a href="${href}"${href === current ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin", `<header class="top"><a class="brand" href="../../index.html"><span class="mark">+</span><span>The Educator</span></a><nav class="links"><a href="../../index.html">CPCS 351</a><a href="../../resources/">Resources</a><a href="../../../../index.html">All Courses</a></nav></header><nav class="mobile-topic-nav" aria-label="Topic 05 lesson navigation">${links}</nav><div class="layout"><aside class="side"><div class="course"><small>CPCS 351 · Topic 05</small><strong>Software Requirements Elicitation</strong></div><div class="label">Topic 05</div>${links}<div class="label">Course</div><a href="../../index.html">Course Home</a></aside><main id="lesson-main"></main></div>`);
  const article = document.querySelector("body > article");
  document.getElementById("lesson-main").append(article);
})();
