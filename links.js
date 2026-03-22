/* eslint-disable no-var */
(function () {
    var links = {
        "lean-kernel-overview": "https://ammkrn.github.io/type_checking_in_lean4/whats_a_kernel.html",
        "lean-kernel-reference": "https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/?utm_source=chatgpt.com#:~:text=user%20interface%20extensions.-,2.3.%C2%A0The%20Kernel,-Lean%27s%20trusted%20kernel",
        "cook-levin": "https://en.wikipedia.org/wiki/Cook%E2%80%93Levin_theorem",
        "stagira-labs": "https://www.stagiralabs.com",
        "recidivism": "https://en.wikipedia.org/wiki/Recidivism",
        "sujeonggwa": "https://en.wikipedia.org/wiki/Sujeonggwa",
        "pcp-theorem": "https://en.wikipedia.org/wiki/PCP_theorem",
        "bleu-metric": "https://en.wikipedia.org/wiki/BLEU",
        "scott-aaronson-blog": "https://scottaaronson.blog/",
        "c0-ref": "https://c0.cs.cmu.edu/docs/c0-reference.pdf"
    };

    function applyLinks() {
        var nodes = document.querySelectorAll("[data-link]");
        nodes.forEach(function (node) {
            var key = node.getAttribute("data-link");
            if (links[key]) {
                node.href = links[key];
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyLinks);
    } else {
        applyLinks();
    }
})();
