const usuarios = document.getElementById("usuarios"), permisos = document.getElementById("permisos"),
clientes = document.getElementById("clientes");
let subMenu = null;

usuarios.addEventListener("click", ()=> { // CLICKS IMPORTANTES DEL PROGRAMA
    if(!subMenu) {
        subMenu = document.createElement("div");
        subMenu.className = "submenu";
        subMenu.innerHTML = `<h3 id = "presioneUsuario">Lista de Usuarios</h3>
                             <h3 id = "permisos"> Lista de Permisos</h3>`
                            ;


        usuarios.insertAdjacentElement("afterend", subMenu);

        document.getElementById("presioneUsuario").addEventListener("click", ()=> {
            window.location.href = "pruebaCinco.html";
        })

        document.getElementById("permisos").addEventListener("click", ()=> {
            window.location.href = "parteCuatro.html"
        })

        
    }

    subMenu.classList.toggle("activo");
})

let otroMenu = null;

clientes.addEventListener("click", ()=> {
    if(!otroMenu) {
        otroMenu = document.createElement("div");
        otroMenu.className = "otroMenu";
        otroMenu.innerHTML = `<h3 id = "irListaClientes">Lista Clientes</h3>
                              <h3>Proveedores</h3>
                             `;

        
        clientes.insertAdjacentElement("afterend", otroMenu);

        document.getElementById("irListaClientes").addEventListener("click", ()=> {
            window.location.href = "listaClientes.html";
        })

    }

    otroMenu.classList.toggle("activo");
})


// Trabajando con el modulo de ventas
const ventas = document.getElementById("ventas");
let subMenuVentas = null;
ventas.addEventListener("click", ()=> {
    if(!subMenuVentas) {
        subMenuVentas = document.createElement("div");
        subMenuVentas.className = "subMenuVentas";
        // PARTE DIVERTIDO DEL LENGUAJE DOM
        subMenuVentas.innerHTML = `<h3 id = "aperturaCaja" >Apertura de caja</h3>
                                   
                                   <h3 id = "gestionCaja" >Gestion Caja</h3>
                                   <h3 id = "realizarVenta">Realizar Venta</h3>
                                   <h3 id = "listaVenta">Lista de Ventas</h3>`;

        ventas.insertAdjacentElement("afterend", subMenuVentas);

        document.getElementById("aperturaCaja").addEventListener("click", ()=> {
            window.location.href = "aperturaCaja.html";
        })

        document.getElementById("gestionCaja").addEventListener("click", ()=> {
            window.location.href = "gestionDeCaja.html";
        })
    }

    subMenuVentas.classList.toggle("activo");

})



