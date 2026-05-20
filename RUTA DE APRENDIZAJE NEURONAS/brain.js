/*Proyecto con ayuda de IA

Josué Jerez

*/

// 1. CARGA DE DATOS SEGURA
let savedData = JSON.parse(localStorage.getItem('cyberBrainData'));

// Solo cargamos IDs y notas, dejamos que la física decida la posición inicial para evitar desclocamientos
let nodes = savedData ? savedData.nodes : [
    { id: "Ciberseguridad", color: "#00f2ff", note: "Inicio de mi ruta" }
];

// Importante: Los links deben referenciar a los IDs
let links = savedData ? savedData.links : [];
let currentNode = null;

const width = window.innerWidth;
const height = window.innerHeight;

// 2. CONFIGURACIÓN DEL LIENZO
const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .call(d3.zoom().scaleExtent([0.1, 4]).on("zoom", (e) => container.attr("transform", e.transform)));

const container = svg.append("g");
let linkLayer = container.append("g");
let nodeLayer = container.append("g");

// 3. MOTOR DE FÍSICA (AJUSTADO)
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(1))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(30));

function update() {
    // LIMPIEZA DE DATOS PARA GUARDADO (Evita errores de circularidad)
    const saveNodes = nodes.map(n => ({ id: n.id, color: n.color, note: n.note, x: n.x, y: n.y }));
    const saveLinks = links.map(l => ({ 
        source: typeof l.source === 'object' ? l.source.id : l.source, 
        target: typeof l.target === 'object' ? l.target.id : l.target 
    }));
    localStorage.setItem('cyberBrainData', JSON.stringify({ nodes: saveNodes, links: saveLinks }));

    // DIBUJAR LÍNEAS
    const link = linkLayer.selectAll(".link").data(links);
    link.exit().remove();
    const linkEnter = link.enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#00f2ff")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.5);
    
    const combinedLinks = linkEnter.merge(link);

    // DIBUJAR NODOS
    const node = nodeLayer.selectAll(".node-group").data(nodes, d => d.id);
    node.exit().remove();

    const nodeEnter = node.enter().append("g")
        .attr("class", "node-group")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle")
        .attr("r", d => d.id === "Ciberseguridad" ? 14 : 10)
        .attr("fill", d => d.id === "Ciberseguridad" ? "#00f2ff" : "#7000ff")
        .style("filter", "drop-shadow(0 0 5px #00f2ff)")
        .on("click", (e, d) => openNotePanel(d));

    nodeEnter.append("text")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .style("fill", "white")
        .style("font-size", "12px")
        .text(d => d.id);

    const combinedNodes = nodeEnter.merge(node);

    // VINCULAR FÍSICA
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.5).restart();

    simulation.on("tick", () => {
        combinedLinks
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        combinedNodes.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // SELECTOR
    const select = document.getElementById("parentNode");
    select.innerHTML = "";
    nodes.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n.id; opt.innerText = n.id;
        select.appendChild(opt);
    });
}

function addNewNode() {
    const name = document.getElementById("nodeName").value.trim();
    const parentId = document.getElementById("parentNode").value;

    if (name && !nodes.find(n => n.id === name)) {
        const parent = nodes.find(n => n.id === parentId);
        nodes.push({ id: name, x: parent.x, y: parent.y, note: "" });
        links.push({ source: parentId, target: name });
        update();
        document.getElementById("nodeName").value = "";
    }
}

// --- FUNCIONES EXTRA ---
function openNotePanel(d) {
    currentNode = d;
    document.getElementById("note-panel").classList.add("active");
    document.getElementById("note-title").innerText = d.id;
    document.getElementById("note-content").value = d.note || "";
}
function saveNote() {
    if(currentNode) {
        currentNode.note = document.getElementById("note-content").value;
        update(); // Guarda en localStorage
        alert("¡Conocimiento guardado!");
    }
}
function closePanel() { document.getElementById("note-panel").classList.remove("active"); }
function resetBrain() { if(confirm("¿Resetear?")) { localStorage.removeItem('cyberBrainData'); location.reload(); } }

function dragstarted(event) { if (!event.active) simulation.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; }
function dragged(event) { event.subject.fx = event.x; event.subject.fy = event.y; }
function dragended(event) { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null; }

update();