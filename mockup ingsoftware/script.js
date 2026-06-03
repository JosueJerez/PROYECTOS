// 1. INICIALIZAR FECHA Y HORA
function updateTime() {
    const now = new Date();
    document.getElementById('current-date').innerText = now.toLocaleDateString('es-GT', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}
setInterval(updateTime, 1000);
updateTime();

// 2. NAVEGACIÓN ENTRE VISTAS
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-view');
        views.forEach(v => v.classList.add('hidden'));
        document.getElementById(target).classList.remove('hidden');

        // Actualizar título del header
        const title = this.querySelector('span').innerText;
        document.getElementById('view-title').innerText = title;
    });
});

// 3. MODAL Y REGISTRO DE BUSES
const modal = document.getElementById("modalBus");
const btnOpen = document.getElementById("openModalBus");
const btnClose = document.querySelector(".close-modal");

btnOpen.onclick = () => modal.style.display = "block";
btnClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

document.getElementById("formBus").onsubmit = function(e) {
    e.preventDefault();
    const placa = document.getElementById("busPlaca").value;
    const cap = document.getElementById("busCap").value;

    const newRow = `
        <tr>
            <td><strong>${placa}</strong></td>
            <td>${cap} pax</td>
            <td><span class="badge badge-green">Reserva</span></td>
            <td>Por asignar</td>
            <td><button class="btn-icon" onclick="this.closest('tr').remove()"><i class="fas fa-trash"></i></button></td>
        </tr>`;

    document.getElementById("fleet-table-body").insertAdjacentHTML('afterbegin', newRow);
    this.reset();
    modal.style.display = "none";
    alert("Unidad registrada exitosamente.");
};

// 4. GRÁFICA DE OCUPACIÓN
const ctx = document.getElementById('occupancyChart');
if(ctx) {
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [{
                label: 'Pasajeros en Red',
                data: [400, 3200, 2100, 1800, 2400, 4500, 3800, 900],
                borderColor: '#00d2ff',
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
        }
    });
}

// 5. SIMULADOR DE ALERTAS (RF-10)
let alertCount = 0;
function triggerAlert() {
    alertCount++;
    document.getElementById('stat-alerts').innerText = alertCount;
    const container = document.getElementById('alerts-list');
    
    if(alertCount === 1) container.innerHTML = '';

    const html = `
        <div class="alert-item">
            <strong style="color:var(--red)">⚠️ SOBRE-OCUPACIÓN CRÍTICA</strong><br>
            <small>Estación El Trébol - 158% Capacidad</small>
            <p style="font-size:0.8rem; margin-top:5px; color:#666">Unidad de refuerzo TR-2040 en camino.</p>
        </div>`;
    container.insertAdjacentHTML('afterbegin', html);
}
setTimeout(triggerAlert, 4000);