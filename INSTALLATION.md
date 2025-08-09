# Guide d'Installation Détaillé - Portfolio Dynamique

Ce guide vous accompagne étape par étape pour installer et configurer le portfolio dynamique professionnel.

## Prérequis Système

### Logiciels Requis

1. **Node.js** (version 16 ou supérieure)
   - Téléchargez depuis : https://nodejs.org/
   - Vérifiez l'installation : `node --version`

2. **npm** (inclus avec Node.js)
   - Vérifiez l'installation : `npm --version`

3. **Angular CLI** (version 16)
   ```bash
   npm install -g @angular/cli@16
   ```
   - Vérifiez l'installation : `ng version`

4. **MongoDB**
   - **Ubuntu/Debian** :
     ```bash
     wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
     echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
     sudo apt update
     sudo apt install -y mongodb-org
     ```
   
   - **Windows** : Téléchargez depuis https://www.mongodb.com/try/download/community
   
   - **macOS** :
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community@6.0
     ```

### Démarrage de MongoDB

- **Linux** :
  ```bash
  sudo systemctl start mongod
  sudo systemctl enable mongod
  ```

- **Windows** : Démarrez le service MongoDB depuis les Services Windows

- **macOS** :
  ```bash
  brew services start mongodb/brew/mongodb-community
  ```

## Installation du Projet

### 1. Extraction du Projet

Extrayez le fichier ZIP du projet dans le répertoire de votre choix :

```bash
unzip portfolio_dynamique.zip
cd portfolio_dynamique
```

### 2. Installation du Backend

```bash
cd backend
npm install
```

**Dépendances installées** :
- express : Framework web pour Node.js
- mongoose : ODM pour MongoDB
- bcryptjs : Hachage des mots de passe
- jsonwebtoken : Authentification JWT
- dotenv : Gestion des variables d'environnement
- cors : Gestion des requêtes cross-origin
- multer : Upload de fichiers

### 3. Configuration des Variables d'Environnement

Le fichier `.env` est déjà configuré avec les valeurs par défaut :

```
MONGO_URI=mongodb://localhost:27017/portfolio_dynamique
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

**Important** : En production, modifiez `JWT_SECRET` avec une clé secrète forte et unique.

### 4. Création de l'Utilisateur Administrateur

```bash
npm run create-admin
```

Cette commande crée automatiquement l'utilisateur administrateur avec les identifiants :
- **Email** : `aymen.bh94@gmail.com`
- **Mot de passe** : `admin123`

### 5. Installation du Frontend

```bash
cd ../frontend
npm install
```

**Dépendances installées** :
- @angular/core : Framework Angular
- @angular/material : Composants Material Design
- @angular/animations : Animations Angular
- @angular/common : Modules communs Angular

## Démarrage de l'Application

### 1. Démarrage du Backend

Dans le terminal du dossier `backend` :

```bash
npm start
```

**Sortie attendue** :
```
Server running on port 5000
MongoDB connected
```

### 2. Démarrage du Frontend

Dans un nouveau terminal, dossier `frontend` :

```bash
ng serve --host 0.0.0.0 --port 4200
```

**Sortie attendue** :
```
Angular Live Development Server is listening on 0.0.0.0:4200
✔ Compiled successfully.
```

### 3. Accès à l'Application

- **Site public** : http://localhost:4200
- **Panel d'administration** : http://localhost:4200/admin/login

## Vérification de l'Installation

### Test de Connexion Admin

1. Accédez à : http://localhost:4200/admin/login
2. Connectez-vous avec :
   - Email : `aymen.bh94@gmail.com`
   - Mot de passe : `admin123`
3. Vous devriez être redirigé vers le dashboard administrateur

### Test des API Backend

Testez l'API backend avec curl ou un outil comme Postman :

```bash
# Test de l'API de base
curl http://localhost:5000/

# Test de l'API Home
curl http://localhost:5000/api/home

# Test de l'API Contact
curl http://localhost:5000/api/contact
```

## Résolution des Problèmes Courants

### Erreur : "MongoDB connection failed"

**Solution** :
1. Vérifiez que MongoDB est démarré :
   ```bash
   sudo systemctl status mongod
   ```
2. Vérifiez la chaîne de connexion dans `.env`
3. Assurez-vous que le port 27017 n'est pas bloqué

### Erreur : "Port 4200 is already in use"

**Solution** :
```bash
ng serve --port 4201
```
Puis accédez à http://localhost:4201

### Erreur : "Port 5000 is already in use"

**Solution** :
1. Modifiez le port dans `.env` :
   ```
   PORT=5001
   ```
2. Redémarrez le backend
3. Mettez à jour l'URL de l'API dans le frontend (`src/app/services/api.service.ts`)

### Erreur de compilation Angular

**Solution** :
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
ng serve
```

## Configuration pour la Production

### Backend

1. Modifiez les variables d'environnement :
   ```
   MONGO_URI=mongodb://votre-serveur-mongo/portfolio_dynamique
   JWT_SECRET=une_cle_secrete_tres_longue_et_aleatoire
   PORT=5000
   ```

2. Utilisez PM2 pour la gestion des processus :
   ```bash
   npm install -g pm2
   pm2 start server.js --name "portfolio-backend"
   ```

### Frontend

1. Construisez l'application pour la production :
   ```bash
   ng build --prod
   ```

2. Servez les fichiers statiques avec nginx ou Apache

## Support

Pour toute question ou problème :
1. Vérifiez les logs du backend et du frontend
2. Consultez la documentation MongoDB et Angular
3. Contactez le développeur : Wassim Bahloul

## Sécurité

**Recommandations importantes** :
- Changez le mot de passe administrateur par défaut
- Utilisez HTTPS en production
- Configurez un firewall approprié
- Sauvegardez régulièrement la base de données
- Mettez à jour les dépendances régulièrement

