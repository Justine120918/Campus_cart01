let users = JSON.parse(localStorage.getItem("users")) || [];
let products = JSON.parse(localStorage.getItem("products"));
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let cart = [];
let tab = "shop";

/* ================= DEFAULT PRODUCTS (RUN ONCE ONLY) ================= */

function initDefaultProducts(){
    if(localStorage.getItem("init_done")) return;

    products = [
        {
            id: 1,
            name: "Notebook",
            price: 50,
            stock: 10,
            image: "./notebook.png",
            seller: "Admin"
        },
        {
            id: 2,
            name: "Slippers",
            price: 120,
            stock: 8,
            image: "./slippers.png",
            seller: "Admin"
        },
        {
            id: 3,
            name: "School Uniform",
            price: 300,
            stock: 5,
            image: "./uniform.png",
            seller: "Admin"
        }
    ];

    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("init_done", "true");
}

initDefaultProducts();

/* ================= START ================= */

render();

/* ================= UTIL ================= */

function getVal(id){
    return document.getElementById(id).value.trim();
}

function toast(msg){
    let t=document.createElement("div");
    t.className="toast";
    t.innerText=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2000);
}

/* ================= AUTH ================= */

function loginPage(){
    document.getElementById("app").innerHTML=`
    <div class="center">
        <div class="card">

            <h2>CampusCart</h2>
            <p>Login to continue</p>

            <input id="email" placeholder="Email">
            <input id="pass" type="password" placeholder="Password">

            <button onclick="login()">Login</button>

            <p onclick="registerPage()" style="cursor:pointer;color:#4f46e5;margin-top:10px;">
                Create account
            </p>

        </div>
    </div>`;
}

function registerPage(){
    document.getElementById("app").innerHTML=`
    <div class="center">
        <div class="card">

            <h2>Create Account</h2>

            <input id="name" placeholder="Full Name">
            <input id="email" placeholder="Email">
            <input id="pass" type="password" placeholder="Password">

            <button onclick="register()">Register</button>

            <p onclick="loginPage()" style="cursor:pointer;color:#4f46e5;margin-top:10px;">
                Back
            </p>

        </div>
    </div>`;
}

function register(){
    let name=getVal("name");
    let email=getVal("email");
    let pass=getVal("pass");

    if(!name||!email||!pass) return toast("Fill all fields");
    if(users.find(u=>u.email===email)) return toast("Email already used");

    users.push({name,email,pass});
    localStorage.setItem("users",JSON.stringify(users));

    toast("Account created");
    setTimeout(loginPage,500);
}

function login(){
    let email=getVal("email");
    let pass=getVal("pass");

    let user=users.find(u=>u.email===email && u.pass===pass);
    if(!user) return toast("Invalid login");

    currentUser=user;
    localStorage.setItem("currentUser",JSON.stringify(user));

    cart=[];
    render();
}

function logout(){
    currentUser=null;
    cart=[];
    render();
}

/* ================= MAIN ================= */

function render(){
    if(!document.getElementById("app")) return;

    if(!currentUser){
        loginPage();
    }else{
        appPage();
    }
}

function appPage(){
    document.getElementById("app").innerHTML=`
    <div class="header">
        <div class="brand">CampusCart</div>

        <div class="nav">
            <button onclick="switchTab('shop')">Shop</button>
            <button onclick="switchTab('add')">Add</button>
            <button onclick="switchTab('cart')">Cart (${cart.length})</button>
            <button onclick="logout()">Logout</button>
        </div>
    </div>

    <div class="hero">
        <h1>Campus Marketplace</h1>
        <p>Buy and sell easily</p>
    </div>

    <div id="content"></div>`;

    renderTab();
}

function switchTab(t){
    tab=t;
    renderTab();
}

function renderTab(){
    let c=document.getElementById("content");

    if(tab==="shop"){
        c.innerHTML=`<div class="grid" id="list"></div>`;
        showProducts();
    }

    if(tab==="add"){
        c.innerHTML=`
        <div class="center">
            <div class="card">

                <h3>Add Product</h3>

                <input id="pname" placeholder="Product Name">
                <input id="price" placeholder="Price">
                <input id="stock" placeholder="Stock">
                <input type="file" id="img">

                <button onclick="addProduct()">Add</button>

            </div>
        </div>`;
    }

    if(tab==="cart") showCart();
}

/* ================= PRODUCTS ================= */

function addProduct(){
    let name=getVal("pname");
    let price=getVal("price");
    let stock=getVal("stock");
    let file=document.getElementById("img").files[0];

    if(!name||!price||!stock||!file) return toast("Complete all fields");

    let reader=new FileReader();

    reader.onload=()=>{
        products.unshift({
            id:Date.now(),
            name,
            price,
            stock:Number(stock),
            image:reader.result,
            seller:currentUser.name
        });

        localStorage.setItem("products",JSON.stringify(products));

        toast("Added!");
        switchTab("shop");
    };

    reader.readAsDataURL(file);
}

function showProducts(){
    let list=document.getElementById("list");
    list.innerHTML="";

    products = JSON.parse(localStorage.getItem("products")) || [];

    if(products.length===0){
        list.innerHTML="<p class='empty'>No products</p>";
        return;
    }

    products.forEach(p=>{
        list.innerHTML+=`
        <div class="product">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>PHP ${p.price}</p>
            <small>Stock: ${p.stock}</small>
            <small>${p.seller}</small>

            <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>`;
    });
}

function addToCart(id){
    let p=products.find(x=>x.id===id);
    if(!p || p.stock<=0) return toast("Out of stock");

    p.stock--;
    cart.push(p);

    localStorage.setItem("products",JSON.stringify(products));

    render();
}

/* ================= CART ================= */

function showCart(){
    let c=document.getElementById("content");

    if(cart.length===0){
        c.innerHTML=`<div class="center"><div class="card"><h3>Empty Cart</h3></div></div>`;
        return;
    }

    let total=cart.reduce((a,b)=>a+Number(b.price),0);

    c.innerHTML=`
    <div class="center">
        <div class="card">

            <h3>Your Cart</h3>

            ${cart.map(i=>`
                <div style="display:flex;gap:10px;align-items:center;margin:10px 0;">
                    <img src="${i.image}" width="45" style="border-radius:8px;">
                    <span>${i.name}</span>
                </div>
            `).join("")}

            <h3>Total: PHP ${total}</h3>

        </div>
    </div>`;
}