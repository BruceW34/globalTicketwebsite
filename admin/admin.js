document.addEventListener("DOMContentLoaded", () => {
    fixOldTickets();
    loadNotifications();
    loadTickets();
    updateStats();
    addEventListeners();
});

function addEventListeners() {
    // Refresh butonu
    const refreshBtn = document.getElementById("refresh-btn");
    if(refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            location.reload();
        });
    }

    // Arama butonu
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("admin-search");
    
    if(searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }
    
    if(searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filtreleme
    const statusFilter = document.getElementById("status-filter");
    const categoryFilter = document.getElementById("category-filter");
    const userFilter = document.getElementById("user-filter");
    const clearFiltersBtn = document.getElementById("clear-filters");

    if(statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }
    if(categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }
    if(userFilter) {
        userFilter.addEventListener("input", applyFilters);
    }
    if(clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", clearAllFilters);
    }
}

function loadNotifications() {
    const notificationList = document.getElementById("notification-list");
    const notificationCount = document.getElementById("notification-count");
    const notifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    
    // Okunmamış bildirim sayısını güncelle
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount.textContent = unreadCount;
    
    if(notifications.length === 0) {
        notificationList.innerHTML = `<p style="color: #666; text-align: center;">Henüz bildirim yok</p>`;
        return;
    }
    
    notificationList.innerHTML = "";
    notifications.slice(0, 10).forEach((notification, index) => {
        const div = document.createElement("div");
        div.className = `notification-item ${notification.read ? 'read' : ''}`;
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${notification.message}</span>
                <small style="color: #f5c242;">${new Date(notification.timestamp).toLocaleString("tr-TR")}</small>
            </div>
        `;
        
        div.addEventListener("click", () => {
            markNotificationAsRead(index);
        });
        
        notificationList.appendChild(div);
    });
}

function markNotificationAsRead(index) {
    const notifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    if(notifications[index]) {
        notifications[index].read = true;
        localStorage.setItem("adminNotifications", JSON.stringify(notifications));
        loadNotifications();
    }
}

function updateStats() {
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    const approvedCount = tickets.filter(t => t.status === "approved").length;
    const pendingCount = tickets.filter(t => t.status === "pending").length;
    const rejectedCount = tickets.filter(t => t.status === "rejected").length;
    const totalCount = tickets.length;
    
    document.getElementById("approved-count").textContent = approvedCount;
    document.getElementById("pending-count").textContent = pendingCount;
    document.getElementById("rejected-count").textContent = rejectedCount;
    document.getElementById("total-count").textContent = totalCount;
}

function loadTickets(filteredTickets = null) {
    const ticketList = document.getElementById("ticket-list");
    const tickets = filteredTickets || JSON.parse(localStorage.getItem("tickets")) || [];

    console.log("Admin - Yüklenen ticket'lar:", tickets.length); // Debug için

    if(tickets.length === 0){
        ticketList.innerHTML = `<p class="no-tickets-message">Henüz bir şikayet yok, ne hoş!</p>`;
        return;
    }
    
    // En yeni en üstte olacak şekilde sırala
    tickets.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    
    ticketList.innerHTML = "";
    tickets.forEach((ticket, index)=>{
        const div = document.createElement("div");
        div.className = "ticket-item " + (ticket.status || "pending");
        div.innerHTML = `
        <button class="delete-btn" onclick="deleteTicket(${ticket.id})">×</button>
        <h3>${ticket.title}</h3>
        <p><strong>Kullanıcı:</strong> ${ticket.username || "Anonim"}</p>
        <p>${ticket.description}</p>
        <div class="ticket-meta">
            <span class="meta-box category">${ticket.category || "Kategori yok"}</span>
            <span class="meta-box date">${ticket.date ? ticket.date : "Tarih yok"}</span>
            <span class="meta-box time">${ticket.createdAt ? (new Date(ticket.createdAt)).toLocaleTimeString("tr-TR") : ""}</span>
            <span class="meta-box status ${ticket.status || 'pending'}">${getStatusText(ticket.status)}</span>
        </div>
        ${(!ticket.status || ticket.status === "pending") ?  
          `<button onclick="approveTicket(${ticket.id})">Onayla</button>
           <button class="reject-btn" onclick="rejectTicket(${ticket.id})">Reddet</button>`
        : ""}
        <hr>
      `;
        ticketList.appendChild(div);
    });
}

function getStatusText(status) {
    switch(status) {
        case 'approved': return 'Onaylandı';
        case 'rejected': return 'Reddedildi';
        case 'pending': return 'Beklemede';
        default: return 'Beklemede';
    }
}

function approveTicket(ticketId){
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if(ticketIndex !== -1) {
        tickets[ticketIndex].status = "approved";
        localStorage.setItem("tickets", JSON.stringify(tickets));
        
        // Bildirim ekle
        addNotification(`Ticket onaylandı: ${tickets[ticketIndex].title}`);
        
        updateStats();
        loadTickets();
    }
}

function rejectTicket(ticketId){
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if(ticketIndex !== -1) {
        tickets[ticketIndex].status = "rejected";
        localStorage.setItem("tickets", JSON.stringify(tickets));
        
        // Bildirim ekle
        addNotification(`Ticket reddedildi: ${tickets[ticketIndex].title}`);
        
        updateStats();
        loadTickets();
    }
}

function deleteTicket(ticketId){
    if(confirm("Bu ticket'ı silmek istediğinizden emin misiniz?")) {
        const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
        const ticketIndex = tickets.findIndex(t => t.id === ticketId);
        
        if(ticketIndex !== -1) {
            const ticketTitle = tickets[ticketIndex].title;
            tickets.splice(ticketIndex, 1);
            localStorage.setItem("tickets", JSON.stringify(tickets));
            
            // Bildirim ekle
            addNotification(`Ticket silindi: ${ticketTitle}`);
            
            updateStats();
            loadTickets();
        }
    }
}

function addNotification(message) {
    const notifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    notifications.unshift({
        id: Date.now(),
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    });
    
    // Sadece son 50 bildirimi tut
    if(notifications.length > 50) {
        notifications.splice(50);
    }
    
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
    loadNotifications();
}

function performSearch() {
    const searchTerm = document.getElementById("admin-search").value.toLowerCase().trim();
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    if (!searchTerm) {
        loadTickets();
        return;
    }

    const filteredTickets = tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        (ticket.username && ticket.username.toLowerCase().includes(searchTerm))
    );

    loadTickets(filteredTickets);
}

function applyFilters() {
    const statusFilter = document.getElementById("status-filter").value;
    const categoryFilter = document.getElementById("category-filter").value;
    const userFilter = document.getElementById("user-filter").value.toLowerCase().trim();
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];

    let filteredTickets = tickets;

    // Durum filtresi
    if (statusFilter) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.status === statusFilter
        );
    }

    // Kategori filtresi
    if (categoryFilter) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.category === categoryFilter
        );
    }

    // Kullanıcı filtresi
    if (userFilter) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.username && ticket.username.toLowerCase().includes(userFilter)
        );
    }

    loadTickets(filteredTickets);
}

function clearAllFilters() {
    document.getElementById("status-filter").value = "";
    document.getElementById("category-filter").value = "";
    document.getElementById("user-filter").value = "";
    document.getElementById("admin-search").value = "";
    loadTickets();
}

function fixOldTickets() {
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    tickets.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    tickets.forEach(t => {
        if (!t.category && t.priority) t.category = t.priority;
        if (!t.date && t.createdAt) t.date = t.createdAt.split('T')[0];
        if (!t.id) t.id = Date.now() + Math.random();
    });
    localStorage.setItem("tickets", JSON.stringify(tickets));
}