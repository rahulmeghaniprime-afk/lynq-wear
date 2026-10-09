class ProductCard extends HTMLElement{
    constructor(){
        super()
        this.querySelector('.quick_add_toggle').addEventListener('click', (e)=>this.toggleQuickView(e));
    }
    toggleQuickView(e){
        this.querySelector('.product-size-swatch-wrapper').classList.toggle('active');
    }
}
customElements.define('product-card', ProductCard)