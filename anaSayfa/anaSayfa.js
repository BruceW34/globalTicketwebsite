let allTickets = [];
let currentUser = null;



document.addEventListener("DOMContentLoaded",()=>{
    console.log("=== SAYFA YÜKLENDİ ===");
    
    // Önce mevcut durumu kontrol et
    const initialTickets = loadTickets();
    console.log("Sayfa yüklendiğinde mevcut ticket sayısı:", initialTickets.length);
    
    addMissingData(); // Test verilerini ekle
    updateTicketDisplay();
    displayRecentTickets();
    loadCurrentUser();
    addEventListeners();
    addFilterAndSearchListeners();
    
    // Eğer az ticket varsa örnek veri butonunu göster
    const tickets = loadTickets();
    console.log("addMissingData sonrası ticket sayısı:", tickets.length);
    
    if(tickets.length < 10) {
        const addSampleBtn = document.getElementById("add-sample-btn");
        if(addSampleBtn) {
            addSampleBtn.style.display = "block";
            console.log("Örnek veri butonu gösterildi");
        }
    }
    
    console.log("=== SAYFA YÜKLEME TAMAMLANDI ===");
});

function loadTickets(){
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    return tickets;
}

function displayTicket(ticket){
    const ticketDiv = document.createElement("div");
    ticketDiv.className = "tickets";

    ticketDiv.innerHTML = `
        <span class="user"> ${ticket.username || 'Anonim'}</span>
        <h4>${ticket.title}</h4>
        <p>${ticket.description}</p>
        <div class="ticket-info">
            <span class="date"> ${ticket.date || 'Tarih yok'}</span>
            <span class="category"> ${ticket.category || 'Kategori yok'}</span>
        </div>`;

    // Ticket'a tıklama olayı
    ticketDiv.addEventListener("click", function(e) {
        showTicketDetail(ticket);
    });

    return ticketDiv;
}

function showTicketDetail(ticket) {
    const modalOverlay = document.getElementById("modal-overlay");
    const ticketDetailModal = document.getElementById("ticket-detail-modal");
    const ticketDetailContent = document.getElementById("ticket-detail-content");

    // Ticket detaylarını hazırla
    const userInitial = ticket.username ? ticket.username.charAt(0).toUpperCase() : 'A';
    
    ticketDetailContent.innerHTML = `
        <div class="ticket-detail-header">
            <div>
                <h2 class="ticket-detail-title">${ticket.title}</h2>
                <div class="ticket-detail-meta">
                    <span>${ticket.category || 'Kategori yok'}</span>
                    <span>${ticket.date || 'Tarih yok'}</span>
                    <span>${ticket.status === 'approved' ? 'Onaylandı' : 'Beklemede'}</span>
                </div>
            </div>
        </div>
        
        <div class="ticket-detail-description">
            ${ticket.description}
        </div>
        
        <div class="ticket-detail-user">
            <div class="user-avatar">${userInitial}</div>
            <div class="user-info">
                <div class="username">${ticket.username || 'Anonim Kullanıcı'}</div>
                <div class="date">Oluşturulma: ${ticket.date || 'Tarih yok'}</div>
            </div>
        </div>
    `;

    // Modal'ı aç
    modalOverlay.classList.add("active");
    ticketDetailModal.classList.add("active");
}

function updateTicketDisplay(filteredTickets = null){
    const ticketsGrid = document.getElementById("tickets-grid");
    let tickets = filteredTickets || loadTickets();

    // Eğer filtreleme yapılmamışsa, sadece onaylanmış ticket'ları göster
    if (!filteredTickets) {
        tickets = tickets.filter(ticket => ticket.status === "approved");
    }

    console.log("Yüklenen ticket'lar:", tickets); // Debug için

    ticketsGrid.innerHTML=``;

    if(!tickets || tickets.length===0){
        ticketsGrid.innerHTML= `<p style="text-align:center; color:#999; grid-column: 1 / -1;">Hiç şikayet bulunamadı.</p>`;
        return;
    }
    tickets.forEach((ticket) =>{
        const ticketElement = displayTicket(ticket);
        ticketsGrid.appendChild(ticketElement);
    });
}

function addMissingData(){
    const tickets = loadTickets();
    
    console.log("addMissingData - mevcut ticket'lar:", tickets.length); // Debug için
    
    // Eğer hiç ticket yoksa veya çok az varsa (5'ten az) otomatik kayıtları ekle
    if(!tickets || tickets.length < 5){
        console.log("Örnek veriler ekleniyor...");
        
        try {
            const testTickets = generateSampleTickets();
            console.log("generateSampleTickets tamamlandı, ticket sayısı:", testTickets.length);
            
            // Eğer mevcut ticket'lar varsa, onları koru ve yeni olanları ekle
            if(tickets && tickets.length > 0) {
                const allTickets = [...tickets, ...testTickets];
                localStorage.setItem("tickets", JSON.stringify(allTickets));
                console.log("Mevcut ticket'lar korundu, yeni ticket'lar eklendi. Toplam:", allTickets.length);
            } else {
                localStorage.setItem("tickets", JSON.stringify(testTickets));
                console.log("Yeni test ticket'ları eklendi:", testTickets.length);
            }
            
            // localStorage'ı kontrol et
            const savedTickets = JSON.parse(localStorage.getItem("tickets"));
            console.log("localStorage'da kayıtlı ticket sayısı:", savedTickets ? savedTickets.length : 0);
            
            // Sayfayı yenile
            setTimeout(() => {
                location.reload();
            }, 2000);
        } catch (error) {
            console.error("Örnek veriler eklenirken hata:", error);
        }
    } else {
        console.log("Yeterli ticket var, örnek veriler eklenmedi. Mevcut:", tickets.length);
    }
}

function generateSampleTickets() {
    console.log("generateSampleTickets başladı");
    const tickets = [];
    const categories = ['daily', 'siradan', 'naturaly', 'kaza', 'acil'];
    const statuses = ['approved', 'pending', 'rejected'];
    
    // Türkçe isimler
    const turkishNames = [
        'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Veli', 'Zeynep', 'Elif', 'Mustafa', 'Hasan',
        'Hüseyin', 'İbrahim', 'Osman', 'Yusuf', 'Murat', 'Özlem', 'Selin', 'Deniz', 'Burak', 'Emre',
        'Can', 'Cem', 'Ece', 'Gizem', 'Kemal', 'Leyla', 'Mert', 'Nur', 'Ozan', 'Pınar'
    ];
    
    // Türkçe başlıklar
    const turkishTitles = [
        'Yol çukuru sorunu', 'Çöp kutusu taşması', 'Sokak lambası arızası', 'Su kesintisi',
        'Trafik ışığı bozuk', 'Park yeri yetersiz', 'Gürültü kirliliği', 'Hava kirliliği',
        'Toplu taşıma sorunu', 'Eğitim kalitesi', 'Sağlık hizmeti', 'Güvenlik problemi',
        'İnternet kesintisi', 'Elektrik kesintisi', 'Doğalgaz sorunu', 'Telefon hattı',
        'Posta hizmeti', 'Banka şubesi', 'Eczane açık değil', 'Market fiyatları'
    ];
    
    // Türkçe açıklamalar
    const turkishDescriptions = [
        'Bu sorun günlük hayatımızı etkiliyor ve acil çözüm gerekiyor.',
        'Uzun süredir bu problem devam ediyor, yetkililerin müdahale etmesi gerekiyor.',
        'Bu durum güvenlik riski oluşturuyor, hemen düzeltilmeli.',
        'Vatandaşlar olarak bu konuda endişeliyiz, çözüm bekliyoruz.',
        'Bu problem çevre sağlığını tehdit ediyor, acil önlem alınmalı.',
        'Toplum olarak bu konuda hassasiyet gösteriyoruz.',
        'Bu durum ekonomik kayıplara neden oluyor.',
        'Çocuklarımızın güvenliği için bu sorun çözülmeli.',
        'Yaşlı vatandaşlarımız için bu problem büyük zorluk yaratıyor.',
        'Bu konuda bilgilendirme yapılması gerekiyor.'
    ];
    
    // İngilizce isimler
    const englishNames = [
        'John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Mary',
        'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia', 'Christopher', 'Barbara',
        'Daniel', 'Elizabeth', 'Matthew', 'Susan', 'Anthony', 'Jessica', 'Mark', 'Sarah',
        'Donald', 'Karen', 'Steven', 'Nancy', 'Paul', 'Betty', 'Andrew', 'Helen', 'Joshua', 'Sandra'
    ];
    
    // İngilizce başlıklar
    const englishTitles = [
        'Road pothole issue', 'Garbage bin overflow', 'Street light malfunction', 'Water outage',
        'Traffic light broken', 'Insufficient parking', 'Noise pollution', 'Air pollution',
        'Public transport problem', 'Education quality', 'Healthcare service', 'Security issue',
        'Internet outage', 'Power outage', 'Natural gas problem', 'Phone line issue',
        'Postal service', 'Bank branch', 'Pharmacy closed', 'Market prices'
    ];
    
    // İngilizce açıklamalar
    const englishDescriptions = [
        'This issue is affecting our daily lives and needs immediate solution.',
        'This problem has been ongoing for a long time, authorities need to intervene.',
        'This situation creates a security risk and should be fixed immediately.',
        'As citizens, we are concerned about this issue and waiting for a solution.',
        'This problem threatens environmental health and urgent measures should be taken.',
        'As a society, we are sensitive about this issue.',
        'This situation is causing economic losses.',
        'This problem should be solved for the safety of our children.',
        'This problem creates great difficulty for our elderly citizens.',
        'Information should be provided about this issue.'
    ];
    
    // Son 30 gün içinde rastgele tarihler oluştur
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // 500 İngilizce + 1000 Türkçe = 1500 ticket oluştur
    for (let i = 0; i < 1500; i++) {
        const isEnglish = i < 500;
        const names = isEnglish ? englishNames : turkishNames;
        const titles = isEnglish ? englishTitles : turkishTitles;
        const descriptions = isEnglish ? englishDescriptions : turkishDescriptions;
        
        // Rastgele tarih oluştur
        const randomTime = thirtyDaysAgo.getTime() + Math.random() * (today.getTime() - thirtyDaysAgo.getTime());
        const randomDate = new Date(randomTime);
        const dateString = randomDate.toISOString().split('T')[0];
        
        const ticket = {
            id: Date.now() + i,
            username: names[Math.floor(Math.random() * names.length)],
            title: titles[Math.floor(Math.random() * titles.length)] + (i > 0 ? ` #${i + 1}` : ''),
            description: descriptions[Math.floor(Math.random() * descriptions.length)] + 
                        (isEnglish ? ' This is an English ticket.' : ' Bu bir Türkçe ticket.'),
            category: categories[Math.floor(Math.random() * categories.length)],
            date: dateString,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: randomDate.toISOString()
        };
        
        tickets.push(ticket);
    }
    
    console.log("generateSampleTickets tamamlandı, oluşturulan ticket sayısı:", tickets.length);
    return tickets;
}

function displayRecentTickets(){
    const recentContainer = document.getElementById("ticket-list");
    const tickets = loadTickets();

    // Sadece onaylanmış ticket'ları al
    const approvedTickets = tickets.filter(ticket => ticket.status === "approved");
    const recentTickets = approvedTickets.slice(0,3);

    console.log("Recent tickets için yüklenen:", recentTickets); // Debug için

    recentContainer.innerHTML=``;

    if(!recentTickets || recentTickets.length===0){
        recentContainer.innerHTML =`<p style="text-align:center; color:#999; font-size:0.9rem;">Henüz şikayet yok.</p>`;
        return;
    }

    recentTickets.forEach((ticket,index)=>{
        const ticketDiv =document.createElement("div");
        ticketDiv.className="recent-ticket";

        ticketDiv.innerHTML= `
            <h5>${ticket.title}</h5>
            <p>${ticket.description.substring(0, 50)}${ticket.description.length > 50 ? '...' : ''}</p>
            <span class="category-small">${ticket.category || 'Kategori yok'}</span>
            <span class="small-user">${ticket.username|| 'Anonim'}</span>
        `;

        ticketDiv.addEventListener("click",()=>{
            highlightTicketInMain(index);
        });

        recentContainer.appendChild(ticketDiv);
    });
}

function highlightTicketInMain(ticketIndex){
    const mainTickets = document.querySelectorAll(".tickets");

    mainTickets.forEach(ticket =>{
        // Ana tema renklerine geri döndür
        ticket.style.border = "1px solid #f5c242";
        ticket.style.backgroundColor = "#222";
        ticket.style.boxShadow = "0 2px 12px #f5c24233";
    });
    if(mainTickets[ticketIndex]){
        // Vurgulanan ticket için özel renkler
        mainTickets[ticketIndex].style.border = "3px solid #f5c242";
        mainTickets[ticketIndex].style.backgroundColor = "#2a2516";
        mainTickets[ticketIndex].style.boxShadow = "0 6px 20px #f5c24255";

        mainTickets[ticketIndex].scrollIntoView({behavior:'smooth'});
    }
}
// ========================================
// OTURUM SİSTEMİ
// ========================================

function loadCurrentUser(){
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser){
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function addEventListeners(){
    // Modal butonları
    const registerBtn = document.getElementById("register-btn");
    const loginBtn = document.getElementById("login-btn");
    const newTicketBtn = document.getElementById("new-ticket-btn");
    const adminBtn = document.getElementById("admin-btn");

    if(registerBtn) {
        registerBtn.addEventListener("click",function(){
            showModal("register");
        });
    }
    if(loginBtn) {
        loginBtn.addEventListener("click",function(){
            showModal("login");
        });
    }
    if(newTicketBtn) {
        newTicketBtn.addEventListener("click",function(){
            showModal("ticket");
        });
    }
    if(adminBtn) {
        adminBtn.addEventListener("click",function(){
            showModal("admin");
        });
    }

    // Örnek veriler butonu
    const addSampleBtn = document.getElementById("add-sample-btn");
    if(addSampleBtn) {
        addSampleBtn.addEventListener("click", addSampleData);
    }

    //x butonları
    const closeBtns = document.querySelectorAll(".close-btn");
    closeBtns.forEach(btn=>{
        btn.addEventListener("click",closeModal);
    });
    //overlay basınca kapatma
    const modalOverlay = document.getElementById("modal-overlay");
    if(modalOverlay) {
        modalOverlay.addEventListener("click",function(e){
            if(e.target === modalOverlay){
                closeModal();
            }
        });
    }
    //kayıt formu
    const registerForm = document.getElementById("register-form");
    if(registerForm) {
        registerForm.addEventListener("submit",handleRegister);
    }

    const loginForm = document.getElementById("login-form");
    if(loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const ticketForm = document.getElementById("ticket-form");
    if(ticketForm) {
        ticketForm.addEventListener("submit", handleTicketSubmit);
    }

    const adminForm = document.getElementById("admin-form");
    if(adminForm) {
        adminForm.addEventListener("submit", handleAdminLogin);
    }
}

function showModal(type){
    const modalOverlay=document.getElementById("modal-overlay");
    const loginModal=document.getElementById("login-modal");
    const registerModal=document.getElementById("register-modal");
    const ticketModal=document.getElementById("ticket-modal");
    const adminModal=document.getElementById("admin-modal");
    const ticketDetailModal=document.getElementById("ticket-detail-modal");

    modalOverlay.classList.add("active");

    // Önce tüm modalları kapat
    loginModal.classList.remove("active");
    registerModal.classList.remove("active");
    ticketModal.classList.remove("active");
    adminModal.classList.remove("active");
    ticketDetailModal.classList.remove("active");

    if(type === "login"){
        loginModal.classList.add("active");
    }else if(type === "register"){
        registerModal.classList.add("active");
    }else if(type === "ticket"){
        ticketModal.classList.add("active");
    }else if(type === "admin"){
        adminModal.classList.add("active");
    }
}

function closeModal(){
    const modalOverlay = document.getElementById("modal-overlay");
    const loginModal = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");
    const ticketModal = document.getElementById("ticket-modal");
    const adminModal = document.getElementById("admin-modal");
    const ticketDetailModal = document.getElementById("ticket-detail-modal");

    modalOverlay.classList.remove("active");
    loginModal.classList.remove("active");
    registerModal.classList.remove("active");
    ticketModal.classList.remove("active");
    adminModal.classList.remove("active");
    ticketDetailModal.classList.remove("active");
}

function handleRegister(event){
    event.preventDefault();

    const formData = {
        name: document.getElementById('register-name').value.trim(),
        username: document.getElementById('register-username').value.trim(),
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value
    };

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
        showMessage("Tüm alanları doldurmalısınız!", "error");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === formData.username)) {
        showMessage("Bu kullanıcı adı zaten kullanılıyor!", "error");
        return;
    }

    if (!formData.email.includes("@")) {
        showMessage("Geçerli bir e-posta girin!", "error");
        return;
    }

    users.push(formData);
    localStorage.setItem('users', JSON.stringify(users));
    closeModal();
    showMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.", "success");
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showMessage("Kullanıcı adı ve şifre boş olamaz!", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        showMessage("Kullanıcı adı veya şifre hatalı!", "error");
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    closeModal();
    showMessage(`Hoş geldiniz, ${user.name}!`, "success");
    updateUIForLoggedInUser();
}

function updateUIForLoggedInUser(){
    if(currentUser){
        const userInfo = document.getElementById("user-info");
        const authButtons = document.getElementById("auth-buttons");
        const newTicketBtn = document.getElementById("new-ticket-btn");

        userInfo.style.display = "flex";
        authButtons.style.display = "none";

        userInfo.innerHTML = `
            <span class="greeting">Hoş geldiniz,</span>
            <span class="username">${currentUser.name}</span>
            <button id="logout-btn" class="auth-btn">Çıkış Yap</button>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click",handleLogout);

        // Ticket butonunu güncelle
        if(newTicketBtn) {
            newTicketBtn.style.background = "linear-gradient(90deg, #f5c242 0%, #181818 100%)";
            newTicketBtn.style.color = "#181818";
            newTicketBtn.style.fontWeight = "700";
        }
    }
}

function handleLogout(){
    currentUser = null;
    localStorage.removeItem('currentUser');

    updateUIForLoggedOutUser();
    showMessage('Çıkış yapıldı. Tekrar giriş yapabilirsiniz.', 'info');
}

function updateUIForLoggedOutUser() {
    const userInfo = document.getElementById("user-info");
    const authButtons = document.getElementById("auth-buttons");
    const newTicketBtn = document.getElementById("new-ticket-btn");

    userInfo.style.display = "none";
    authButtons.style.display = "flex";

    // Ticket butonunu varsayılan haline döndür
    if(newTicketBtn) {
        newTicketBtn.style.background = "";
        newTicketBtn.style.color = "";
        newTicketBtn.style.fontWeight = "";
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #222;
        color: #f5c242;
        padding: 15px 20px;
        border-radius: 8px;
        border-left: 4px solid #f5c242;
        z-index: 2000;
        font-weight: 600;
        box-shadow: 0 4px 12px #f5c24233;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// ========================================
// FİLTRELEME VE ARAMA SİSTEMİ
// ========================================

function addFilterAndSearchListeners() {
    // Arama butonu
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('ticket-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filtreleme
    const categoryFilter = document.getElementById('category-filter');
    const timeFilter = document.getElementById('time-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (timeFilter) {
        timeFilter.addEventListener('change', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

function performSearch() {
    const searchTerm = document.getElementById('ticket-search').value.toLowerCase().trim();
    const tickets = loadTickets();
    
    if (!searchTerm) {
        updateTicketDisplay();
        return;
    }

    const filteredTickets = tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        (ticket.username && ticket.username.toLowerCase().includes(searchTerm))
    );

    updateTicketDisplay(filteredTickets);
    
    if (filteredTickets.length === 0) {
        showMessage('Arama sonucu bulunamadı.', 'info');
    }
}

function applyFilters() {
    const categoryFilter = document.getElementById('category-filter').value;
    const timeFilter = document.getElementById('time-filter').value;
    const tickets = loadTickets();

    let filteredTickets = tickets;

    // Sadece onaylanmış ticket'ları göster
    filteredTickets = filteredTickets.filter(ticket => 
        ticket.status === "approved"
    );

    // Kategori filtresi
    if (categoryFilter) {
        filteredTickets = filteredTickets.filter(ticket => 
            ticket.category === categoryFilter
        );
    }

    // Zaman filtresi
    if (timeFilter) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        filteredTickets = filteredTickets.filter(ticket => {
            const ticketDate = new Date(ticket.date);
            const daysDiff = Math.floor((today - ticketDate) / (1000 * 60 * 60 * 24));
            
            switch(timeFilter) {
                case 'today':
                    return daysDiff === 0;
                case 'week':
                    return daysDiff <= 7;
                case 'month':
                    return daysDiff <= 30;
                case 'older':
                    return daysDiff > 30;
                default:
                    return true;
            }
        });
    }

    updateTicketDisplay(filteredTickets);
}

function clearAllFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('time-filter').value = '';
    document.getElementById('ticket-search').value = '';
    updateTicketDisplay();
    showMessage('Filtreler temizlendi.', 'info');
}

// ========================================
// TICKET OLUŞTURMA SİSTEMİ
// ========================================

function handleTicketSubmit(event) {
    event.preventDefault();

    // Kullanıcı giriş yapmış mı kontrol et
    if (!currentUser) {
        showMessage('Ticket oluşturmak için önce giriş yapmalısınız!', 'error');
        return;
    }

    const title = document.getElementById('ticket-title').value.trim();
    const description = document.getElementById('ticket-description').value.trim();
    const category = document.getElementById('ticket-priority').value;

    if (!title || !description || !category) {
        showMessage('Tüm alanları doldurmalısınız!', 'error');
        return;
    }

    const ticket = {
        id: Date.now(),
        username: currentUser.username,
        title,
        description,
        category,
        date: new Date().toISOString().split('T')[0],
        status: "pending",
        createdAt: new Date().toISOString()
    };

    let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Admin'e bildirim ekle
    let adminNotifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    adminNotifications.push({
        id: ticket.id,
        message: `Yeni ticket oluşturuldu: ${title}`,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Formu temizle ve modalı kapat
    event.target.reset();
    closeModal();
    
    // Ticket listesini güncelle
    updateTicketDisplay();
    displayRecentTickets();
    
    showMessage('Ticket başarıyla oluşturuldu! Admin onayı bekleniyor.', 'success');
}

// ========================================
// ÖRNEK VERİ EKLEME
// ========================================

function addSampleData() {
    const tickets = loadTickets();
    const sampleTickets = generateSampleTickets();
    
    // Mevcut ticket'ları koru ve yeni olanları ekle
    const allTickets = [...tickets, ...sampleTickets];
    localStorage.setItem("tickets", JSON.stringify(allTickets));
    
    showMessage(`${sampleTickets.length} adet örnek ticket eklendi! Toplam: ${allTickets.length}`, 'success');
    
    // Ticket listelerini güncelle
    updateTicketDisplay();
    displayRecentTickets();
    
    // Butonu gizle
    const addSampleBtn = document.getElementById("add-sample-btn");
    if(addSampleBtn) {
        addSampleBtn.style.display = "none";
    }
}

// localStorage'ı temizle ve yeniden başlat
function resetAndAddSampleData() {
    if(confirm("Tüm mevcut ticket'ları silip yeni örnek veriler eklemek istediğinizden emin misiniz?")) {
        localStorage.removeItem("tickets");
        const sampleTickets = generateSampleTickets();
        localStorage.setItem("tickets", JSON.stringify(sampleTickets));
        
        showMessage(`${sampleTickets.length} adet yeni örnek ticket eklendi!`, 'success');
        
        // Sayfayı yenile
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

// ========================================
// ADMIN SİSTEMİ
// ========================================

function handleAdminLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    
    if (password === '1234') {
        closeModal();
        showMessage('Admin girişi başarılı! Yönlendiriliyorsunuz...', 'success');
        
        // 2 saniye sonra admin paneline yönlendir
        setTimeout(() => {
            window.open('../admin/admin.html', '_blank');
        }, 2000);
    } else {
        showMessage('Yanlış admin şifresi!', 'error');
    }
}

console.log("Form kategorileri:", ["daily", "siradan", "naturaly", "kaza", "acil"]);
console.log("Filtreleme kategorileri:", ["daily", "kaza", "acil", "naturaly"]);

// Console'dan çalıştırılabilir fonksiyonlar
window.addSampleData = addSampleData;
window.resetAndAddSampleData = resetAndAddSampleData;
window.testSampleData = testSampleData;
console.log("Örnek veriler eklemek için: addSampleData()");
console.log("Tüm verileri sıfırlamak için: resetAndAddSampleData()");
console.log("Test için: testSampleData()");

// Test fonksiyonu
function testSampleData() {
    console.log("=== TEST BAŞLADI ===");
    console.log("Mevcut localStorage:", localStorage.getItem("tickets"));
    
    const testTickets = generateSampleTickets();
    console.log("Oluşturulan test ticket'ları:", testTickets.length);
    console.log("İlk ticket örneği:", testTickets[0]);
    
    localStorage.setItem("tickets", JSON.stringify(testTickets));
    console.log("localStorage'a yazıldı");
    
    const savedTickets = JSON.parse(localStorage.getItem("tickets"));
    console.log("localStorage'dan okunan:", savedTickets ? savedTickets.length : 0);
    
    console.log("=== TEST TAMAMLANDI ===");
}