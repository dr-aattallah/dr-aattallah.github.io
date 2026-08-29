(() => {
  if (sessionStorage.getItem("cpcs351_access") !== "granted") { window.location.href = "../../access.html"; return; }
  const pages=[["index.html","01 Derivation Map"],["actors-and-boundaries.html","02 Actors & Boundaries"],["finding-candidates.html","03 Find Candidates"],["validating-use-cases.html","04 Validate & Refine"],["abstraction-levels.html","05 Abstraction Levels"],["requirements-traceability.html","06 Traceability"],["worked-example.html","07 Worked Example"]];
  const current=location.pathname.split("/").pop()||"index.html";
  const links=pages.map(([href,label])=>`<a href="${href}"${href===current?' class="active" aria-current="page"':""}>${label}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin",`<header class="top"><a class="brand" href="../../index.html"><span class="mark">+</span><span>The Educator</span></a><nav class="links"><a href="../../index.html">CPCS 351</a><a href="../../resources/">Resources</a><a href="../../../../index.html">All Courses</a></nav></header><nav class="mobile-topic-nav" aria-label="Topic 06 lesson navigation">${links}</nav><div class="layout"><aside class="side"><div class="course"><small>CPCS 351 · Topic 06</small><strong>Deriving Use Cases from Requirements</strong></div><div class="label">Topic 06</div>${links}<div class="label">Course</div><a href="../../index.html">Course Home</a></aside><main id="lesson-main"></main></div>`);
  document.getElementById("lesson-main").append(document.querySelector("body > article"));
})();
