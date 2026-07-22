const API_BASE_URL = 'http://localhost:3000/api';

// Show/Hide Sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    event.target.classList.add('active');
    
    const titles = {
        'dashboard': 'Dashboard',
        'drivers': 'Drivers Management',
        'equipment': 'Equipment Management',
        'loads': 'Loads Management',
        'billing': 'Billing Management',
        'reports': 'Reports'
    };
    
    document.getElementById('page-title').textContent = titles[sectionId] || sectionId;
    
    // Load data when section is shown
    if (sectionId === 'drivers') loadDrivers();
    else if (sectionId === 'equipment') loadEquipment();
    else if (sectionId === 'loads') loadLoads();
    else if (sectionId === 'billing') loadBilling();
    else if (sectionId === 'dashboard') loadDashboard();
}

// ============ DASHBOARD ============
async function loadDashboard() {
    try {
        const [drivers, equipment, loads, billing] = await Promise.all([
            fetch(`${API_BASE_URL}/drivers`).then(r => r.json()),
            fetch(`${API_BASE_URL}/equipment`).then(r => r.json()),
            fetch(`${API_BASE_URL}/loads`).then(r => r.json()),
            fetch(`${API_BASE_URL}/billing`).then(r => r.json())
        ]);
        
        document.getElementById('driver-count').textContent = drivers.length || 0;
        document.getElementById('equipment-count').textContent = equipment.length || 0;
        document.getElementById('loads-count').textContent = loads.filter(l => l.status === 'pending').length || 0;
        
        const revenue = billing.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
        document.getElementById('revenue-total').textContent = '$' + revenue.toFixed(2);
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

// ============ DRIVERS ============
async function loadDrivers() {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers`);
        const drivers = await response.json();
        
        const tbody = document.getElementById('drivers-tbody');
        tbody.innerHTML = '';
        
        drivers.forEach(driver => {
            const row = `
                <tr>
                    <td>${driver.id}</td>
                    <td>${driver.name}</td>
                    <td>${driver.phone || 'N/A'}</td>
                    <td>${driver.email || 'N/A'}</td>
                    <td>${driver.license_number || 'N/A'}</td>
                    <td><span class="status ${driver.status}">${driver.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="editDriver(${driver.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteDriver(${driver.id})">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading drivers:', err);
    }
}

function showAddDriverForm() {
    document.getElementById('add-driver-modal').classList.add('active');
}

async function addDriver(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    
    const data = {
        name: inputs[0].value,
        phone: inputs[1].value,
        email: inputs[2].value,
        license_number: inputs[3].value,
        status: inputs[4].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Driver added successfully!');
            closeModal('add-driver-modal');
            form.reset();
            loadDrivers();
        }
    } catch (err) {
        alert('❌ Error adding driver: ' + err.message);
    }
}

async function deleteDriver(id) {
    if (confirm('Are you sure you want to delete this driver?')) {
        try {
            await fetch(`${API_BASE_URL}/drivers/${id}`, { method: 'DELETE' });
            alert('✅ Driver deleted!');
            loadDrivers();
        } catch (err) {
            alert('❌ Error deleting driver');
        }
    }
}

// ============ EQUIPMENT ============
async function loadEquipment() {
    try {
        const response = await fetch(`${API_BASE_URL}/equipment`);
        const equipment = await response.json();
        
        const tbody = document.getElementById('equipment-tbody');
        tbody.innerHTML = '';
        
        equipment.forEach(item => {
            const row = `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.make}</td>
                    <td>${item.model}</td>
                    <td>${item.year}</td>
                    <td>${item.license_plate}</td>
                    <td><span class="status ${item.status}">${item.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="editEquipment(${item.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEquipment(${item.id})">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading equipment:', err);
    }
}

function showAddEquipmentForm() {
    document.getElementById('add-equipment-modal').classList.add('active');
}

async function addEquipment(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input');
    
    const data = {
        make: inputs[0].value,
        model: inputs[1].value,
        year: parseInt(inputs[2].value),
        vin: inputs[3].value,
        license_plate: inputs[4].value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/equipment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Equipment added successfully!');
            closeModal('add-equipment-modal');
            form.reset();
            loadEquipment();
        }
    } catch (err) {
        alert('❌ Error adding equipment: ' + err.message);
    }
}

async function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        try {
            await fetch(`${API_BASE_URL}/equipment/${id}`, { method: 'DELETE' });
            alert('✅ Equipment deleted!');
            loadEquipment();
        } catch (err) {
            alert('❌ Error deleting equipment');
        }
    }
}

// ============ LOADS ============
async function loadLoads() {
    try {
        const response = await fetch(`${API_BASE_URL}/loads`);
        const loads = await response.json();
        
        const tbody = document.getElementById('loads-tbody');
        tbody.innerHTML = '';
        
        loads.forEach(load => {
            const row = `
                <tr>
                    <td>${load.load_number}</td>
                    <td>${load.shipper_name}</td>
                    <td>${load.receiver_name}</td>
                    <td>${load.pickup_location}</td>
                    <td>${load.delivery_location}</td>
                    <td>$${parseFloat(load.rate || 0).toFixed(2)}</td>
                    <td><span class="status ${load.status}">${load.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="editLoad(${load.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteLoad(${load.id})">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading loads:', err);
    }
}

function showAddLoadForm() {
    document.getElementById('add-load-modal').classList.add('active');
}

async function addLoad(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input');
    
    const data = {
        load_number: inputs[0].value,
        shipper_name: inputs[1].value,
        receiver_name: inputs[2].value,
        pickup_location: inputs[3].value,
        delivery_location: inputs[4].value,
        rate: parseFloat(inputs[5].value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/loads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Load added successfully!');
            closeModal('add-load-modal');
            form.reset();
            loadLoads();
        }
    } catch (err) {
        alert('❌ Error adding load: ' + err.message);
    }
}

async function deleteLoad(id) {
    if (confirm('Are you sure you want to delete this load?')) {
        try {
            await fetch(`${API_BASE_URL}/loads/${id}`, { method: 'DELETE' });
            alert('✅ Load deleted!');
            loadLoads();
        } catch (err) {
            alert('❌ Error deleting load');
        }
    }
}

// ============ BILLING ============
async function loadBilling() {
    try {
        const response = await fetch(`${API_BASE_URL}/billing`);
        const billing = await response.json();
        
        const tbody = document.getElementById('billing-tbody');
        tbody.innerHTML = '';
        
        billing.forEach(invoice => {
            const row = `
                <tr>
                    <td>${invoice.invoice_number}</td>
                    <td>${invoice.load_id}</td>
                    <td>$${parseFloat(invoice.amount || 0).toFixed(2)}</td>
                    <td>${invoice.invoice_date || 'N/A'}</td>
                    <td><span class="status ${invoice.status}">${invoice.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="editBilling(${invoice.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteBilling(${invoice.id})">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error loading billing:', err);
    }
}

function showAddBillingForm() {
    document.getElementById('add-billing-modal').classList.add('active');
}

async function addBilling(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input');
    
    const data = {
        invoice_number: inputs[0].value,
        load_id: parseInt(inputs[1].value),
        amount: parseFloat(inputs[2].value)
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/billing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('✅ Invoice added successfully!');
            closeModal('add-billing-modal');
            form.reset();
            loadBilling();
        }
    } catch (err) {
        alert('❌ Error adding invoice: ' + err.message);
    }
}

async function deleteBilling(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        try {
            await fetch(`${API_BASE_URL}/billing/${id}`, { method: 'DELETE' });
            alert('✅ Invoice deleted!');
            loadBilling();
        } catch (err) {
            alert('❌ Error deleting invoice');
        }
    }
}

// ============ MODALS ============
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
