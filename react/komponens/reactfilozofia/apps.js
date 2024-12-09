const btn = document.createElement('button')

btn.onclick = function(){
    alert('egy egy nativ gomb')
}

btn.innerHTML = "nativ gomb"

document.getElementById("nativ-button-container").appendChild(btn);

const gomb = React.createElement("button",{
    onclick:function(){
        alert("ez egy nativ kod")
    },
},
"React gomb"
)


ReactDOM.render(gomb,document.getElementById("react-button-container"));