let tickets = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded",function(){
    console.log("page loaded");

    const form = document.getElementById("ticket-form");
    console.log(form);
    loadTicketsFromLocalStorage();
    loadCurrentUser();
    addEventListeners();
});


function addEventListeners(){
    //Şikayet formları
    const form= document.getElementById("ticket-form");
    if(form) {
        form.addEventListener("submit", handleTicketSubmit);
    }

    //Modal butonları
    const registerBtn = document.getElementById("register-btn");
    const loginBtn = document.getElementById("login-btn");

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
};


function handleTicketSubmit(event){
    event.preventDefault();

    // Kullanıcı giriş yapmış mı kontrol et
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Ticket oluşturmak için önce giriş yapmalısınız!', 'error', event.target);
        return;
    }

    const title = document.getElementById('ticket-title').value.trim();
    const description = document.getElementById('ticket-description').value.trim();
    const category = document.getElementById('priority').value;

    if (!title || !description || !category) {
        showMessage('Tüm alanları doldurmalısınız!', 'error', event.target);
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
    
    event.target.reset();
    showMessage('Ticket başarıyla oluşturuldu! Admin onayı bekleniyor.', 'success');
}

function saveTicketsToLocalStorage(){
    localStorage.setItem('tickets',JSON.stringify(tickets));
};


function loadTicketsFromLocalStorage(){
    const savedTickets = localStorage.getItem('tickets');
    if(savedTickets){
        tickets = JSON.parse(savedTickets);
    }else{
        tickets = [];
    }
};



function loadCurrentUser(){
    const savedUser = localStorage.getItem('currentUser');
    if(savedUser){
        currentUser= JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

//Modal gösterme

function showModal(type){
    console.log('Modal açılıyor:', type);
    
    const modalOverlay=document.getElementById("modal-overlay");
    const loginModal=document.getElementById("login-modal");
    const registerModal=document.getElementById("register-modal");

    //overlay açılır
    modalOverlay.classList.add("active");

    //gelecek modal seçimi

    if(type === "login"){
        loginModal.classList.add("active");
        registerModal.classList.remove("active");
    }else if(type === "register"){
        registerModal.classList.add("active");
        loginModal.classList.remove("active");
    }
}


//Modal kapatma

function closeModal(){
    const modalOverlay = document.getElementById("modal-overlay");
    const loginModal = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");

    //Tüm modallar kapatılır
    modalOverlay.classList.remove("active");
    loginModal.classList.remove("active");
    registerModal.classList.remove("active");
}

function handleRegister(event){
    event.preventDefault();

    const form = event.target;

    const formData = {
        name: document.getElementById('register-name').value.trim(),
        username: document.getElementById('register-username').value.trim(),
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value
    };

    // Boş alan kontrolü
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
        showMessage("Tüm alanları doldurmalısınız!", "error", form.parentElement);
        return;
    }

    // Kullanıcı adı kontrolü
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === formData.username)) {
        showMessage("Bu kullanıcı adı zaten kullanılıyor!", "error", form.parentElement);
        return;
    }

    // E-posta kontrolü
    if (!formData.email.includes("@")) {
        showMessage("Geçerli bir e-posta girin!", "error", form.parentElement);
        return;
    }

    // Kayıt işlemi
    users.push(formData);
    localStorage.setItem('users', JSON.stringify(users));
    closeModal();
    showMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.", "success");
}

function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showMessage("Kullanıcı adı ve şifre boş olamaz!", "error", form.parentElement);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        showMessage("Kullanıcı adı veya şifre hatalı!", "error", form.parentElement);
        return;
    }

    // Giriş yapan kullanıcıyı global değişkene ata!
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    closeModal();
    showMessage(`Hoş geldiniz, ${user.name}!`, "success");
    updateUIForLoggedInUser();

    console.log("currentUser:", currentUser);
    console.log("localStorage currentUser:", localStorage.getItem('currentUser'));
    console.log("auth-buttons:", document.querySelector('.auth-buttons'));
}

function updateUIForLoggedInUser(){
    console.log("updateUIForLoggedInUser ÇAĞRILDI", currentUser);
    if(currentUser){
        const header = document.querySelector(".header");
        const authButtons = document.querySelector(".auth-buttons");

        authButtons.innerHTML= `<span class="user-info">Hoş geldiniz, ${currentUser.name}</span>
        <button id="logout-btn" class="auth-btn">Çıkış Yap</button>`;

        //Çıkış butonu
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click",handleLogout);
    }
}

function handleLogout(){
    currentUser = null;
    localStorage.removeItem('currentUser');

    //arayüzü giriş yaomamış kullanıcı için güncelleme
    updateUIForLoggedOutUser();
    showMessage('Çıkış yapıldı. Tekrar giriş yapabilirsiniz.', 'info');
}

//çıkınca arayüz güncelleme

function updateUIForLoggedOutUser() {
    console.log('Çıkış yapıldı, arayüz güncelleniyor');
    
    // authButtons değişkenini tanımla
    const authButtons = document.querySelector('.auth-buttons');
    
    // Butonları tekrar "Kayıt Ol" ve "Giriş Yap" olarak değiştir
    authButtons.innerHTML = `
        <button id="register-btn" class="auth-btn">Kayıt Ol</button>
        <button id="login-btn" class="auth-btn">Giriş Yap</button>
    `;

    // Yeni butonlara event listener ekle
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');

    registerBtn.addEventListener('click', function() {
        showModal('register');
    });
    
    loginBtn.addEventListener('click', function() {
        showModal('login');
    });
    
    console.log('Arayüz güncellendi, kullanıcı çıkış yaptı');
}

// ========================================
// MESAJ SİSTEMİ
// ========================================
function showMessage(message, type = 'info', container = document.body) {
    // Mevcut mesajları temizle
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Yeni mesaj oluştur
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    container.prepend(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
} 
