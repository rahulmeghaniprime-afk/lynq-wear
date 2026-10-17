class ProductCard extends HTMLElement {
    constructor() {
        super();

        this.querySelector(".quick_add_toggle")
            ?.addEventListener("click", (e) => this.toggleQuickView(e));
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
            this.querySelector(".product-size-swatch-wrapper")
                ?.classList.toggle("active");
        }
    }

    dragMove(sheet) {
        // Prevent registering listeners more than once
        if (sheet.dataset.dragInitialized === "true") return;

        const handle = sheet.querySelector(
            ".size-select-sheet__handle-js"
        );
        const panel = sheet.querySelector(
            ".size-select-sheet__panel"
        );
        const overlay = sheet.querySelector(
            ".size-select-sheet__overlay-js"
        );

        if (!handle || !panel) return;

        sheet.dataset.dragInitialized = "true";
        if(!sheet.dataset.optionSelectInit) this.optionSelectInit(sheet); 

        let startY = 0;
        let distance = 0;
        let dragging = false;

        const closeSheet = () => {
            sheet.classList.remove("active");
            sheet.setAttribute("aria-hidden", "true");
            document.body.classList.remove("overflow-hidden");
        };

        handle.addEventListener("touchstart", (event) => {
            dragging = true;
            startY = event.touches[0].clientY;
            distance = 0;

            panel.style.transition = "none";
        }, { passive: true });

        handle.addEventListener("touchmove", (event) => {
            if (!dragging) return;

            distance = Math.max(
                0,
                event.touches[0].clientY - startY
            );

            panel.style.transform = `translateY(${distance}px)`;
        }, { passive: true });

        const endDrag = () => {
            if (!dragging) return;

            dragging = false;

            const shouldClose = distance > 100;

            if (shouldClose) {
                // Animate the panel down before closing it
                panel.style.transition = "transform 0.25s ease";
                panel.style.transform =
                    `translateY(${panel.offsetHeight}px)`;

                panel.addEventListener("transitionend", () => {
                    closeSheet();
                    panel.style.transform = "";
                    panel.style.transition = "";
                }, { once: true });
            } else {
                // Return to its original position
                panel.style.transition = "transform 0.25s ease";
                panel.style.transform = "translateY(0)";

                panel.addEventListener("transitionend", () => {
                    panel.style.transform = "";
                    panel.style.transition = "";
                }, { once: true });
            }

            distance = 0;
        };

        handle.addEventListener("touchend", endDrag);
        handle.addEventListener("touchcancel", endDrag);

        overlay?.addEventListener("click", closeSheet);
    }
    updateHTML(sheet){
        const size_options = this.querySelector('.product-card__sizes').cloneNode(true);
        sheet.querySelector('.size-select-sheet__options-js').innerHTML = size_options.innerHTML;
    }
    optionSelectInit(sheet){
        sheet.querySelector('.size-select-sheet__options-js').addEventListener('click', (e)=>{
            const selectedOption = e?.target?.closest('li');
            if(selectedOption){
                sheet.querySelectorAll('.size-select-sheet__options-js li').forEach(elem => elem.classList.remove('selected'));
                selectedOption.classList.add('selected');
            }
        })
    }
}

customElements.define("product-card", ProductCard);