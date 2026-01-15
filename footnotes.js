document.addEventListener("DOMContentLoaded", function () {
    var FOOTNOTE_TRUNCATE_LIMIT = 100;
    var footnoteLinks = document.querySelectorAll("a.footnote");
    var footnotes = document.querySelector(".footnotes");
    var content = document.querySelector(".content");
    var canUseSidenotes = window.matchMedia("(min-width: 1100px)").matches;
    if (!footnoteLinks.length || !footnotes || !content) {
        return;
    }

    function normalizeText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    function createExpandableContent(contentHtml, contentText) {
        var wrapper = document.createElement("span");
        wrapper.className = "footnote-content";

        var normalized = normalizeText(contentText);
        if (normalized.length <= FOOTNOTE_TRUNCATE_LIMIT) {
            wrapper.innerHTML = contentHtml;
            return wrapper;
        }

        var shortSpan = document.createElement("span");
        shortSpan.className = "footnote-short";
        shortSpan.textContent = normalized.slice(0, FOOTNOTE_TRUNCATE_LIMIT);

        var ellipsisButton = document.createElement("button");
        ellipsisButton.type = "button";
        ellipsisButton.className = "footnote-ellipsis";
        ellipsisButton.setAttribute("aria-expanded", "false");
        ellipsisButton.textContent = "... more";
        ellipsisButton.setAttribute("aria-label", "Expand footnote");
        ellipsisButton.setAttribute("title", "Expand footnote");

        var fullSpan = document.createElement("span");
        fullSpan.className = "footnote-full";
        fullSpan.style.display = "none";
        fullSpan.innerHTML = contentHtml;

        ellipsisButton.addEventListener("click", function () {
            var expanded = ellipsisButton.getAttribute("aria-expanded") === "true";
            ellipsisButton.setAttribute("aria-expanded", expanded ? "false" : "true");
            if (expanded) {
                fullSpan.style.display = "none";
                shortSpan.style.display = "inline";
                wrapper.appendChild(ellipsisButton);
                ellipsisButton.textContent = "... more";
                ellipsisButton.setAttribute("aria-label", "Expand footnote");
                ellipsisButton.setAttribute("title", "Expand footnote");
            } else {
                fullSpan.style.display = "inline";
                shortSpan.style.display = "none";
                wrapper.appendChild(ellipsisButton);
                ellipsisButton.textContent = "less";
                ellipsisButton.setAttribute("aria-label", "Collapse footnote");
                ellipsisButton.setAttribute("title", "Collapse footnote");
            }
        });

        wrapper.appendChild(shortSpan);
        wrapper.appendChild(fullSpan);
        wrapper.appendChild(ellipsisButton);
        return wrapper;
    }

    if (canUseSidenotes) {
        var sidenotes = document.createElement("div");
        sidenotes.className = "sidenotes";
        content.appendChild(sidenotes);

        var minGap = 14;
        var sidenoteItems = [];

        function layoutSidenotes() {
            var lastBottom = 0;
            var contentRect = content.getBoundingClientRect();
            sidenoteItems.forEach(function (item) {
                var linkRect = item.link.getBoundingClientRect();
                var top = linkRect.top - contentRect.top;
                if (top < lastBottom + minGap) {
                    top = lastBottom + minGap;
                }
                item.note.style.top = top + "px";
                lastBottom = top + item.note.offsetHeight;
            });
        }

        footnoteLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) {
                return;
            }
            var targetId = href.slice(1);
            var noteLi = document.getElementById(targetId);
            if (!noteLi) {
                return;
            }

            var note = document.createElement("div");
            note.className = "sidenote";

            var clone = noteLi.cloneNode(true);
            clone.querySelectorAll("a.reversefootnote, a[href^=\"#fnref\"]").forEach(function (el) {
                el.remove();
            });
            var contentHtml = clone.querySelector("p") ? clone.querySelector("p").innerHTML : clone.innerHTML;
            var contentText = clone.textContent || "";
            var number = link.textContent ? link.textContent.trim() : "";

            var numberSpan = document.createElement("span");
            numberSpan.className = "sidenote-number";
            numberSpan.textContent = number;
            note.appendChild(numberSpan);
            note.appendChild(document.createTextNode(" "));
            note.appendChild(createExpandableContent(contentHtml, contentText));
            var safeId = targetId.replace(/[^a-zA-Z0-9_-]/g, "-");
            note.id = "sidenote-" + safeId;
            link.setAttribute("href", "#" + note.id);
            sidenotes.appendChild(note);

            sidenoteItems.push({ link: link, note: note });
            note.querySelectorAll(".footnote-ellipsis").forEach(function (button) {
                button.addEventListener("click", function () {
                    window.requestAnimationFrame(layoutSidenotes);
                });
            });
        });

        layoutSidenotes();

        if (sidenotes.children.length) {
            document.body.classList.add("has-sidenotes");
        }
        return;
    }

    footnoteLinks.forEach(function (link) {
        var href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) {
            return;
        }
        var targetId = href.slice(1);
        var noteLi = document.getElementById(targetId);
        if (!noteLi) {
            return;
        }

        var clone = noteLi.cloneNode(true);
        clone.querySelectorAll("a.reversefootnote, a[href^=\"#fnref\"]").forEach(function (el) {
            el.remove();
        });
        var contentHtml = clone.querySelector("p") ? clone.querySelector("p").innerHTML : clone.innerHTML;
        var contentText = clone.textContent || "";
        var number = link.textContent ? link.textContent.trim() : "";

        var safeId = targetId.replace(/[^a-zA-Z0-9_-]/g, "-");
        var inlineId = "inline-footnote-" + safeId;

        link.setAttribute("href", "#" + inlineId);

        var toggleInlineFootnote = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.type === "click" && link.dataset.inlineTouched === "true") {
                link.dataset.inlineTouched = "false";
                return;
            }
            if (event.type === "touchend") {
                link.dataset.inlineTouched = "true";
            }

            var existing = document.getElementById(inlineId);
            if (existing) {
                existing.remove();
                return;
            }

        var inline = document.createElement("div");
        inline.className = "inline-footnote";
        inline.id = inlineId;

        var numberSpan = document.createElement("span");
        numberSpan.className = "inline-footnote-number";
        numberSpan.textContent = number;
        inline.appendChild(numberSpan);
        inline.appendChild(createExpandableContent(contentHtml, contentText));

        var anchor = link.closest("p, li, blockquote") || link;
        anchor.insertAdjacentElement("afterend", inline);
        };

        link.addEventListener("click", toggleInlineFootnote);
        link.addEventListener("touchend", toggleInlineFootnote);
    });

    document.body.classList.add("has-inline-footnotes");
});
