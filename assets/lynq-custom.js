class ProductCard extends HTMLElement {
    constructor() {
        super();

        this.querySelector(".quick_add_toggle")?.addEventListener(
            "click",
            (e) => this.toggleQuickView(e),
        );
    }

    toggleQuickView(e) {
        if (window.innerWidth < 768) {
            const sheet = document.querySelector(".size-select-sheet-js");
            this.updateHTML(sheet);
            if (!sheet) return;

            this.dragMove(sheet);

            sheet.classList.add("active");
            sheet.setAttribute("aria-hidden", "false");
            document.body.classList.add("overflow-hidden");
        } else {
            this.querySelector(
                ".product-size-swatch-wrapper",
            )?.classList.toggle("active");
        }
    }

    dragMove(sheet) {
        // Prevent registering listeners more than once
        if (sheet.dataset.dragInitialized === "true") return;

        const handle = sheet.querySelector(".size-select-sheet__handle-js");
        const panel = sheet.querySelector(".size-select-sheet__panel");
        const overlay = sheet.querySelector(".size-select-sheet__overlay-js");

        if (!handle || !panel) return;

        sheet.dataset.dragInitialized = "true";
        if (!sheet.dataset.optionSelectInit) this.optionSelectInit(sheet);

        let startY = 0;
        let distance = 0;
        let dragging = false;

        const closeSheet = () => {
            sheet.classList.remove("active");
            sheet.setAttribute("aria-hidden", "true");
            document.body.classList.remove("overflow-hidden");
        };

        handle.addEventListener(
            "touchstart",
            (event) => {
                dragging = true;
                startY = event.touches[0].clientY;
                distance = 0;

                panel.style.transition = "none";
            },
            { passive: true },
        );

        handle.addEventListener(
            "touchmove",
            (event) => {
                if (!dragging) return;

                distance = Math.max(0, event.touches[0].clientY - startY);

                panel.style.transform = `translateY(${distance}px)`;
            },
            { passive: true },
        );

        const endDrag = () => {
            if (!dragging) return;

            dragging = false;

            const shouldClose = distance > 100;

            if (shouldClose) {
                // Animate the panel down before closing it
                panel.style.transition = "transform 0.25s ease";
                panel.style.transform = `translateY(${panel.offsetHeight}px)`;

                panel.addEventListener(
                    "transitionend",
                    () => {
                        closeSheet();
                        panel.style.transform = "";
                        panel.style.transition = "";
                    },
                    { once: true },
                );
            } else {
                // Return to its original position
                panel.style.transition = "transform 0.25s ease";
                panel.style.transform = "translateY(0)";

                panel.addEventListener(
                    "transitionend",
                    () => {
                        panel.style.transform = "";
                        panel.style.transition = "";
                    },
                    { once: true },
                );
            }

            distance = 0;
        };

        handle.addEventListener("touchend", endDrag);
        handle.addEventListener("touchcancel", endDrag);

        overlay?.addEventListener("click", closeSheet);
    }
    updateHTML(sheet) {
        const size_options = this.querySelector(
            ".product-card__sizes",
        ).cloneNode(true);
        sheet.querySelector(".size-select-sheet__options-js").innerHTML =
            size_options.innerHTML;
    }
    optionSelectInit(sheet) {
        sheet
            .querySelector(".size-select-sheet__options-js")
            .addEventListener("click", (e) => {
                const selectedOption = e?.target?.closest("li");
                if (selectedOption) {
                    sheet
                        .querySelectorAll(".size-select-sheet__options-js li")
                        .forEach((elem) => elem.classList.remove("selected"));
                    selectedOption.classList.add("selected");
                }
            });
    }
}

customElements.define("product-card", ProductCard);

// custom js

(() => {
    function initZealSliders(root = document) {
        root.querySelectorAll("[data-zeal-slider]").forEach((slider) => {
            if (slider.dataset.initialized === "true") return;

            const slides = [...slider.querySelectorAll(".dev_Zeal-card-slide")];
            if (slides.length <= 1) return;

            slider.dataset.initialized = "true";

            const prev = slider.querySelector(".dev_Zeal-prev");
            const next = slider.querySelector(".dev_Zeal-next");
            const current = slider.querySelector("[data-current");

            let index = 0;
            let startX = 0;
            let startY = 0;

            function showSlide(newIndex) {
                index = (newIndex + slides.length) % slides.length;

                slides.forEach((slide, i) => {
                    slide.classList.toggle("is-active", i === index);
                });

                if (current) current.textContent = index + 1;
            }

            prev?.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(index - 1);
            });

            next?.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(index + 1);
            });

            slider.addEventListener(
                "touchstart",
                (e) => {
                    startX = e.changedTouches[0].screenX;
                    startY = e.changedTouches[0].screenY;
                },
                { passive: true },
            );

            slider.addEventListener(
                "touchend",
                (e) => {
                    const diffX = e.changedTouches[0].screenX - startX;
                    const diffY = e.changedTouches[0].screenY - startY;

                    if (
                        Math.abs(diffX) > 45 &&
                        Math.abs(diffX) > Math.abs(diffY)
                    ) {
                        showSlide(index + (diffX < 0 ? 1 : -1));
                    }
                },
                { passive: true },
            );

            showSlide(0);
        });
    }

    function init() {
        initZealSliders();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();


/* ==========================================================================
   LYNQ Custom Sort By Component
   ========================================================================== */
class LynqSortBy extends HTMLElement {
    constructor() {
        super();
        this.button = null;
        this.dropdown = null;
        this.header = null;
        this.options = [];
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    connectedCallback() {
        this.button = this.querySelector(".lynq-sort-by__button");
        this.dropdown = this.querySelector(".lynq-sort-by__dropdown");
        this.header = this.querySelector(".lynq-sort-by__header");
        this.options = Array.from(this.querySelectorAll(".lynq-sort-by__item"));

        if (this.button) {
            this.button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });
        }

        if (this.header) {
            this.header.addEventListener("click", (e) => {
                e.stopPropagation();
                if (this.button) {
                    this.toggle();
                }
            });
            this.header.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (this.button) this.toggle();
                }
            });
        }

        this.options.forEach((option) => {
            option.addEventListener("click", (e) =>
                this.handleOptionSelect(e, option),
            );
            option.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.handleOptionSelect(e, option);
                }
            });
        });

        document.addEventListener("click", this.onDocumentClick);
        document.addEventListener("keydown", this.onKeyDown);
    }

    disconnectedCallback() {
        document.removeEventListener("click", this.onDocumentClick);
        document.removeEventListener("keydown", this.onKeyDown);
    }

    toggle() {
        const isOpen = this.classList.contains("is-open");
        if (isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.classList.add("is-open");
        if (this.button) this.button.setAttribute("aria-expanded", "true");
    }

    close() {
        this.classList.remove("is-open");
        if (this.button) this.button.setAttribute("aria-expanded", "false");
    }

    onDocumentClick(e) {
        if (!this.contains(e.target)) {
            this.close();
        }
    }

    onKeyDown(e) {
        if (e.key === "Escape" && this.classList.contains("is-open")) {
            this.close();
            if (this.button) this.button.focus();
        }
    }

    handleOptionSelect(e, option) {
        e.preventDefault();
        e.stopPropagation();

        const radio = option.querySelector('input[type="radio"]');
        if (!radio) return;

        const wasActive = option.classList.contains("is-active");

        // Update active classes and aria-checked
        this.options.forEach((opt) => {
            opt.classList.remove("is-active");
            opt.setAttribute("aria-checked", "false");
            const r = opt.querySelector('input[type="radio"]');
            if (r) r.checked = false;
        });

        option.classList.add("is-active");
        option.setAttribute("aria-checked", "true");
        radio.checked = true;

        if (this.button) {
            this.close();
        }

        if (wasActive) return;

        // Preserve existing non-sort filters (joined with &) or use ?sort_by if no filter is active
        const params = new URLSearchParams();

        // 1. Collect non-sort query params from current URL
        const currentUrlParams = new URLSearchParams(window.location.search);
        for (const [key, val] of currentUrlParams.entries()) {
            if (key !== "sort_by" && key !== "section_id" && key !== "page") {
                params.append(key, val);
            }
        }

        // 2. Also collect any active filters from the page forms
        const isMobile = Boolean(this.closest("#FacetFiltersFormMobile"));
        const sortFilterForms = document.querySelectorAll("facet-filters-form form");
        sortFilterForms.forEach((form) => {
            if (!isMobile) {
                if (
                    form.id === "FacetSortForm" ||
                    form.id === "FacetFiltersForm" ||
                    form.id === "FacetSortDrawerForm"
                ) {
                    const fd = new FormData(form);
                    for (const [k, v] of fd.entries()) {
                        if (k !== "sort_by" && k !== "section_id" && v) {
                            if (!params.getAll(k).includes(v)) {
                                params.append(k, v);
                            }
                        }
                    }
                }
            } else if (form.id === "FacetFiltersFormMobile") {
                const fd = new FormData(form);
                for (const [k, v] of fd.entries()) {
                    if (k !== "sort_by" && k !== "section_id" && v) {
                        if (!params.getAll(k).includes(v)) {
                            params.append(k, v);
                        }
                    }
                }
            }
        });

        // 3. Set the sort_by parameter
        params.set("sort_by", radio.value);

        const searchParams = params.toString();
        const facetFiltersForm =
            this.closest("facet-filters-form") ||
            document.querySelector("facet-filters-form");
        const FacetFiltersFormClass =
            window.FacetFiltersForm ||
            customElements.get("facet-filters-form");

        if (
            facetFiltersForm &&
            typeof facetFiltersForm.onSubmitForm === "function"
        ) {
            facetFiltersForm.onSubmitForm(searchParams, e);
        } else if (
            FacetFiltersFormClass &&
            typeof FacetFiltersFormClass.renderPage === "function"
        ) {
            FacetFiltersFormClass.renderPage(searchParams, e);
        } else {
            window.location.search = `?${searchParams}`;
        }
    }
}

if (!customElements.get("lynq-sort-by")) {
    customElements.define("lynq-sort-by", LynqSortBy);
}
