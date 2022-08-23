class App{

    constructor(){

        this.updateCart();

    }

    updateCart(){

        this.cartProducts = {};

        if(!JSON.parse(localStorage.getItem('cartProducts'))){

            localStorage.setItem('cartProducts', JSON.stringify({}));

        }else{

            this.cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

        }

        this.cartCount = document.querySelector('#cart li small');

        if(Object.keys(this.cartProducts).length > 0){

            let values = Object.values(this.cartProducts);

            let total = values.reduce((a, b) => a + b);

            this.cartCount.textContent = total;

        }else{

            this.cartCount.textContent = 0;

        }

    }

    categories(){

        fetch('https://api.escuelajs.co/api/v1/categories')
            .then(res=>res.json())
            .then(json=>{

                const container = document.querySelector('#categories ul');
                const template = document.querySelector('#categories ul template').content;
                const fragment = document.createDocumentFragment();

                json.forEach((category) => {

                    template.querySelector('li').textContent = category.name;
                    template.querySelector('li').setAttribute('onclick', `myApp.products(${category.id})`)
                    let clone = template.cloneNode(true);
                    fragment.appendChild(clone);

                });
                
                container.appendChild(fragment);

            });
        
    }

    products(idCategory){
        
        fetch(`https://api.escuelajs.co/api/v1/categories/${idCategory}/products`)
            .then(res=>res.json())
            .then(products=>{

                document.querySelector('h1').innerHTML = products[0].category.name;

                const container = document.querySelector('#products ul');
                const template = document.querySelector('#products template').content;
                const fragment = document.createDocumentFragment();
                container.innerHTML = '';
                let stockProducts = {};
                
                if(JSON.parse(localStorage.getItem('stockProducts'))){

                   stockProducts = JSON.parse(localStorage.getItem('stockProducts'));

                }

                products.forEach((product) => {

                    let stock = Number(product.id + product.category.id);

                    stockProducts[product.id] = stock;

                });

                localStorage.setItem('stockProducts', JSON.stringify(stockProducts));
                
                products.forEach((product) => {

                    if(this.stockProduct(product.id)){
                        
                        template.querySelector('li .stock').textContent = `${this.stockProduct(product.id)} unidades en Stock`;
                        template.querySelector('li input').style.visibility = 'visible';

                    }else{

                        template.querySelector('li input').style.visibility = 'hidden';
                        template.querySelector('li .stock').textContent = `Sin Stock`;

                    }

                    template.querySelector('li img').setAttribute('src', product.images[0]);
                    template.querySelector('li .title').textContent = product.title;
                    template.querySelector('li .price').textContent = `$ ${product.price}`;
                    
                    template.querySelector('li input').setAttribute('onClick', `myApp.addtoCart(${product.id}, ${product.category.id});`);
                    let clone = template.cloneNode(true);
                    fragment.appendChild(clone);
                    
                });

                container.appendChild(fragment);
                
            });

    }

    myCart(){

        this.updateCart();
        
        fetch('https://api.escuelajs.co/api/v1/products')
            .then(res=>res.json())
            .then(products => {

                let total = 0;

                products = products.filter(product => {

                    if(Object.keys(this.cartProducts).includes(product.id.toString())){

                        total += this.cartProducts[product.id] * product.price;

                        return true;

                    }else{

                        return false;

                    }

                });
                
                const container = document.querySelector('#cart-products ul');
                const template = document.querySelector('#cart-products template').content;
                const fragment = document.createDocumentFragment();
                container.innerHTML = '';

                products.forEach(product => {

                    if(this.stockProduct(product.id)){
                        
                        template.querySelector('li .stock').textContent = `${this.stockProduct(product.id)} units in Stock`;

                    }else{
                        
                        template.querySelector('li .stock').textContent = `Sin Stock`;

                    }

                    template.querySelector('li img').setAttribute('src', product.images[0]);
                    template.querySelector('li .title').textContent = product.title;
                    template.querySelector('li .price').textContent = `$ ${product.price} / unit`;
                    template.querySelector('li .subtotal').textContent = `$ ${product.price * this.cartProducts[product.id]}`;
                    template.querySelector('.rest').setAttribute('onClick', `myApp.resttoCart(${product.id} , 'cart')`);
                    template.querySelector('input[type=text]').setAttribute('value', this.cartProducts[product.id]);
                    template.querySelector('.add').setAttribute('onClick', `myApp.addtoCart(${product.id}, 'cart')`);
                    template.querySelector('.delete').setAttribute('onClick', `myApp.deleteCartProduct(${product.id})`);
                    document.querySelector('#total').textContent = total;
                    document.querySelector('#total-final').textContent = total;

                    let clone = template.cloneNode(true);
                    fragment.appendChild(clone);

                });

                container.appendChild(fragment);
                
            });

    }

    stockProduct(id){
        
        let cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

        let stockProducts = JSON.parse(localStorage.getItem('stockProducts'));

        if(cartProducts){
            
            return Number(stockProducts[id]) - Number(cartProducts[id] || 0);
            
        }else{
            
            return stockProducts[id];

        }
        
    }

    resttoCart(id, productId){

        if(JSON.parse(localStorage.getItem('cartProducts')) && this.cartProducts[id] > 0){

            let cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

            cartProducts[id] = cartProducts[id] - 1;

            localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

        }

        if(productId == 'cart'){

            this.myCart();

        }else{

            this.products(productId);

        }

        this.updateCart();

    }    
    
    addtoCart(id, productId){

        if(JSON.parse(localStorage.getItem('cartProducts')) && this.stockProduct(id) > 0){

            let cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

            cartProducts[id] = (cartProducts[id] || 0) + 1;

            localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

        }

        if(productId == 'cart'){

            this.myCart();

        }else{

            this.products(productId);

        }

        this.updateCart();

    }

    deleteCartProduct(id){

        if(JSON.parse(localStorage.getItem('cartProducts'))){

            let cartProducts = JSON.parse(localStorage.getItem('cartProducts'));

            delete cartProducts[id];

            localStorage.setItem('cartProducts', JSON.stringify(cartProducts));

        }

        this.myCart();

        this.updateCart();

    }

}