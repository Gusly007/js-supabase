const { createClient } = supabase;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Variables pour les pages
const authPage = document.getElementById('authPage');
const profilePage = document.getElementById('profilePage');
const signupFields = document.getElementById('signupFields');
const updateProfil = document.getElementById("updateProfil2");

// Variables pour les boutons
const btninscription = document.getElementById("inscription");
const btnConnection = document.getElementById("connection");
const btnDeconnexion = document.getElementById("deconnexion");
const btnUpdateProfil = document.getElementById("updateProfil");
const btnDelete = document.getElementById("delete");

// ======================
// FONCTIONS DE GESTION DU LOADING
// ======================
function setButtonLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = "⏳ Chargement...";
        button.disabled = true;
        button.style.opacity = "0.6";
        button.style.cursor = "not-allowed";
    } else {
        button.textContent = originalText || button.dataset.originalText;
        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    }
}

function showNotification(message, type = 'success') {
    // Supprimer les anciennes notifications
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Styles inline
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Disparition automatique après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ======================
// GESTION DE L'INSCRIPTION
// ======================
btninscription.addEventListener("click", async (event) => {
    event.preventDefault();
    
    if (signupFields.style.display === 'none') {
        // Passer en mode inscription
        signupFields.style.display = 'block';
        authPage.classList.add('signup-mode');
        btninscription.textContent = "S'inscrire";
        btnConnection.textContent = "Retour Connexion";
    } else {
        // Logique d'inscription
        const emailt = document.getElementById("email").value.trim();
        const passwordt = document.getElementById("password").value.trim();
        const confirmPasswordt = document.getElementById("confirmPassword").value.trim();
        
        // Validation
        if (!emailt || !passwordt) {
            showNotification("Veuillez remplir tous les champs obligatoires", "error");
            return;
        }
        
        if (passwordt !== confirmPasswordt) {
            showNotification("Les mots de passe ne correspondent pas", "error");
            return;
        }
        
        if (passwordt.length < 6) {
            showNotification("Le mot de passe doit contenir au moins 6 caractères", "error");
            return;
        }
        
        // Activer le loading
        setButtonLoading(btninscription, true);
        
        try {
            await signUp(emailt, passwordt);
        } catch(error) {
            console.error("Erreur signup:", error);
            showNotification("Erreur lors de l'inscription: " + error.message, "error");
        } finally {
            setButtonLoading(btninscription, false);
        }
    }
});

// ======================
// GESTION DE LA CONNEXION
// ======================
btnConnection.addEventListener("click", async (event) => {
    event.preventDefault();
    
    if (signupFields.style.display !== 'none') {
        // Retour au mode connexion
        signupFields.style.display = 'none';
        authPage.classList.remove('signup-mode');
        btninscription.textContent = "Inscription";
        btnConnection.textContent = "Connexion";
    } else {
        // Logique de connexion
        const emailt = document.getElementById("email").value.trim();
        const passwordt = document.getElementById("password").value.trim();
        
        if (!emailt || !passwordt) {
            showNotification("Veuillez remplir tous les champs", "error");
            return;
        }
        
        // Activer le loading
        setButtonLoading(btnConnection, true);
        
        try {
            await signIn(emailt, passwordt);
        } catch(error) {
            console.error("Erreur connexion:", error);
            showNotification("Erreur lors de la connexion: " + error.message, "error");
        } finally {
            setButtonLoading(btnConnection, false);
        }
    }
});

// ======================
// FONCTIONS D'AUTHENTIFICATION
// ======================
async function signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });
    
    if (error) {
        throw error;
    } else {
        showNotification("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.", "success");
        // Revenir au mode connexion
        signupFields.style.display = 'none';
        authPage.classList.remove('signup-mode');
        btninscription.textContent = "Inscription";
        btnConnection.textContent = "Connexion";
        
        // Vider les champs
        document.getElementById("email").value = '';
        document.getElementById("password").value = '';
        document.getElementById("confirmPassword").value = '';
    }
    console.log('Signup data:', data);
}

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });    
    
    if (error) {
        throw error;
    } else {
        showNotification("Connexion réussie !", "success");
        await showProfilePage();
    }
    console.log('Signin data:', data);
}

// ======================
// AFFICHAGE DU PROFIL
// ======================
async function showProfilePage() {
    // Afficher un loader pendant le chargement
    authPage.style.display = 'none';
    profilePage.style.display = 'block';
    profilePage.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>⏳ Chargement du profil...</h2></div>';
    
    // Récupérer les informations de l'utilisateur
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        showNotification("Erreur: utilisateur non trouvé", "error");
        return;
    }
    
    // Essayer de récupérer les données du profil depuis la table profiles
    const { data: profileData, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // Restaurer le contenu HTML de la page profil
    profilePage.innerHTML = `
        <h1>Mon Profil</h1>
        
        <div class="profile-header">
            <div class="avatar">
                <span id="userInitials">JD</span>
            </div>
            <h2 id="profileUsername">John Doe</h2>
            <p id="profileEmail">john@example.com</p>
        </div>
        
        <div class="profile-info">
            <div class="info-card">
                <h3>Informations personnelles</h3>
                <div class="info-row">
                    <span class="label">Nom complet:</span>
                    <span id="displayName">John Doe</span>
                </div>
                <div class="info-row">
                    <span class="label">Téléphone:</span>
                    <span id="displayPhone">+33 6 12 34 56 78</span>
                </div>
                <div class="info-row">
                    <span class="label">Date de naissance:</span>
                    <span id="displayBirth">1990-01-01</span>
                </div>
                <div class="info-row">
                    <span class="label">Genre:</span>
                    <span id="displayGender">Homme</span>
                </div>
            </div>
            
            <div class="info-card">
                <h3>Bio</h3>
                <p id="displayBio">Développeur passionné par les nouvelles technologies...</p>
            </div>
        </div>
        
        <div class="button-group">
            <button type="button" id="updateProfil">Modifier Profil</button>
            <button type="button" id="deconnexion">Déconnexion</button>
            <button type="button" id="delete" class="danger">Supprimer Compte</button>
        </div>
    `;
    
    // Réattacher les event listeners
    document.getElementById("updateProfil").addEventListener("click", handleUpdateProfileClick);
    document.getElementById("deconnexion").addEventListener("click", handleDeconnexion);
    document.getElementById("delete").addEventListener("click", handleDeleteAccount);
    
    // Préparer les données d'affichage
    const userData = {
        username: profileData?.username || user.email.split('@')[0],
        email: user.email,
        firstName: profileData?.prenom || 'Non renseigné',
        lastName: profileData?.nom || 'Non renseigné',
        phone: profileData?.phone || 'Non renseigné',
        birthDate: profileData?.naissance || 'Non renseigné',
        gender: profileData?.genre || 'Non renseigné',
        bio: profileData?.bio || 'Aucune bio'
    };
    
    updateProfileDisplay(userData);
}

function updateProfileDisplay(userData) {
    document.getElementById('profileUsername').textContent = userData.username;
    document.getElementById('profileEmail').textContent = userData.email;
    
    // Initiales (gestion des cas où les données ne sont pas disponibles)
    const firstInitial = userData.firstName !== 'Non renseigné' ? userData.firstName[0] : 'U';
    const lastInitial = userData.lastName !== 'Non renseigné' ? userData.lastName[0] : 'S';
    document.getElementById('userInitials').textContent = (firstInitial + lastInitial).toUpperCase();
    
    document.getElementById('displayName').textContent = userData.firstName + ' ' + userData.lastName;
    document.getElementById('displayPhone').textContent = userData.phone;
    document.getElementById('displayBirth').textContent = userData.birthDate;
    document.getElementById('displayGender').textContent = userData.gender;
    document.getElementById('displayBio').textContent = userData.bio;
}

// ======================
// MODIFICATION DU PROFIL
// ======================
async function handleUpdateProfileClick(event) {
    event.preventDefault();
    
    const button = event.target;
    setButtonLoading(button, true);
    
    try {
        // Masquer la page profil et afficher le formulaire de modification
        profilePage.style.display = 'none';
        updateProfil.style.display = 'block';
        
        // Pré-remplir le formulaire avec les données actuelles
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        
        const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileData) {
            document.getElementById("username").value = profileData.username || '';
            document.getElementById("firstName").value = profileData.prenom || '';
            document.getElementById("lastName").value = profileData.nom || '';
            document.getElementById("phone").value = profileData.phone || '';
            document.getElementById("birthDate").value = profileData.naissance || '';
            document.getElementById("gender").value = profileData.genre || '';
            document.getElementById("bio").value = profileData.bio || '';
        }
    } finally {
        setButtonLoading(button, false);
    }
}

// Écouteur pour le bouton "Mettre à jour" dans le formulaire de modification
const btnUpdate = document.getElementById("update");
btnUpdate.addEventListener("click", async (event) => {
    event.preventDefault();
    
    setButtonLoading(btnUpdate, true);
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        
        const username = document.getElementById("username").value.trim();
        const prenom = document.getElementById("firstName").value.trim();
        const nom = document.getElementById("lastName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const naissance = document.getElementById("birthDate").value;
        const genre = document.getElementById("gender").value;
        const bio = document.getElementById("bio").value.trim();
        
        const { error } = await supabaseClient
            .from("profiles")
            .upsert({
                id: user.id,
                username,
                bio,
                prenom,
                nom,
                naissance,
                genre,
                phone,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            showNotification("Erreur lors de la modification: " + error.message, "error");
        } else {
            showNotification("Profil modifié avec succès !", "success");
            // Retour à la page profil
            updateProfil.style.display = 'none';
            await showProfilePage();
        }
    } finally {
        setButtonLoading(btnUpdate, false);
    }
});

// ======================
// SUPPRESSION DU COMPTE
// ======================
async function handleDeleteAccount(event) {
    event.preventDefault();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        return;
    }
    
    const button = event.target;
    setButtonLoading(button, true, "Suppression...");
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;
        
        // Supprimer d'abord le profil
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', user.id);
        
        if (profileError) {
            showNotification("Erreur lors de la suppression du profil: " + profileError.message, "error");
            return;
        }
        
        showNotification("Compte supprimé avec succès", "success");
        
        // Déconnexion et retour à la page d'accueil
        await supabaseClient.auth.signOut();
        profilePage.style.display = 'none';
        authPage.style.display = 'block';
        signupFields.style.display = 'none';
        authPage.classList.remove('signup-mode');
    } catch(error) {
        showNotification("Erreur: " + error.message, "error");
    } finally {
        setButtonLoading(button, false);
    }
}

// ======================
// DÉCONNEXION
// ======================
async function handleDeconnexion(event) {
    const button = event.target;
    setButtonLoading(button, true);
    
    try {
        console.log('Déconnexion...');
        
        // Déconnexion Supabase
        await supabaseClient.auth.signOut();
        
        showNotification("Déconnexion réussie", "info");
        
        // Retour à la page d'authentification
        profilePage.style.display = 'none';
        authPage.style.display = 'block';
        
        // Réinitialiser le formulaire
        signupFields.style.display = 'none';
        authPage.classList.remove('signup-mode');
        btninscription.textContent = 'Inscription';
        btnConnection.textContent = 'Connexion';
        
        // Vider les champs
        document.getElementById("email").value = '';
        document.getElementById("password").value = '';
        document.getElementById("confirmPassword").value = '';
    } finally {
        setButtonLoading(button, false);
    }
}

// ======================
// VÉRIFICATION DE SESSION AU CHARGEMENT
// ======================
window.addEventListener('DOMContentLoaded', async () => {
    // Afficher un loader global
    document.body.style.opacity = '0.5';
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            // L'utilisateur est déjà connecté
            await showProfilePage();
        }
    } finally {
        document.body.style.opacity = '1';
    }
});