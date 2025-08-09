# Guide d'Utilisation - Portfolio Dynamique

Ce guide explique comment utiliser toutes les fonctionnalités du portfolio dynamique professionnel.

## Accès au Système

### Site Public
- **URL** : http://localhost:4200
- **Accès** : Libre, aucune authentification requise

### Panel d'Administration
- **URL** : http://localhost:4200/admin/login
- **Identifiants par défaut** :
  - Email : `aymen.bh94@gmail.com`
  - Mot de passe : `admin123`

## Navigation Publique

### Sections Disponibles

1. **Accueil** (`/home`) : Page principale avec présentation personnelle
2. **CV** (`/cv`) : Curriculum vitae détaillé
3. **Recherche** (`/research`) : Projets de recherche
4. **Publications** (`/publications`) : Articles et publications scientifiques
5. **Conférences** (`/talks`) : Présentations et séminaires
6. **Enseignement** (`/teaching`) : Activités pédagogiques
7. **Photos** (`/photos`) : Galerie d'images
8. **Contact** (`/contact`) : Informations de contact

## Panel d'Administration

### Connexion

1. Accédez à `/admin/login`
2. Saisissez vos identifiants
3. Cliquez sur "Se connecter"
4. Vous êtes redirigé vers le dashboard

### Dashboard Administrateur

Le dashboard affiche :
- **Statistiques** : Nombre d'éléments par section
- **Actions rapides** : Boutons d'accès direct aux fonctions principales
- **Activité récente** : Historique des dernières modifications

### Gestion des Sections

#### 1. Gestion de la Page d'Accueil (`/admin/home`)

**Informations principales** :
- Titre principal (ex: "Dr. Nom Prénom")
- Sous-titre (ex: "Bienvenue sur mon portfolio")
- Description professionnelle

**Images** :
- **Photo de profil** : Cliquez sur "Changer la photo de profil" pour uploader une nouvelle image
- **Image d'arrière-plan** : Cliquez sur "Changer l'arrière-plan" pour modifier l'image de fond

**Expériences** :
- Cliquez sur "+" pour ajouter une nouvelle expérience
- Remplissez : Poste, Institution, Période, Description, Lien (optionnel)
- Cliquez sur l'icône "poubelle" pour supprimer une expérience

**Événements à venir** :
- Ajoutez des conférences, workshops, ou autres événements
- Champs : Titre, Date, Lieu, Description, Lien

**Séminaires en ligne** :
- Ajoutez des séminaires web ou webinaires
- Champs : Titre, Description, Lien principal, Chaîne YouTube

#### 2. Gestion des Contacts (`/admin/contact`)

**Informations de contact** :
- Email principal (obligatoire)
- Téléphone
- Bureau
- Adresse complète (rue, ville, code postal, pays)

**Liens sociaux** :
- LinkedIn
- Twitter
- ResearchGate
- ORCID
- Google Scholar

#### 3. Gestion du CV (`/admin/cv`)

**Formation** :
- Diplôme, Institution, Année, Description, Lieu

**Emplois** :
- Poste, Institution, Période, Description, Lieu

**Postes de visite** :
- Poste, Institution, Période, Description, Lieu

**Récompenses** :
- Titre, Institution, Année, Description

**Compétences** :
- Catégorie et liste des compétences

**Langues** :
- Langue et niveau

**Fichier CV** :
- Upload d'un fichier PDF du CV complet

#### 4. Gestion de la Recherche (`/admin/research`)

**Création d'un projet** :
- Titre du projet
- Description détaillée
- Catégorie
- Statut (en cours, terminé, planifié)
- Dates de début et fin
- Collaborateurs (nom, institution, rôle)
- Financement (source, montant, période)
- Publications liées
- Liens externes
- Tags/mots-clés

**Upload d'images** :
- Ajoutez des images illustrant le projet de recherche

#### 5. Gestion des Publications (`/admin/publications`)

**Informations de publication** :
- Titre
- Auteurs (avec indication de l'auteur principal)
- Journal/Conférence
- Année de publication
- Volume, numéro, pages
- DOI
- Résumé
- Mots-clés
- Type (journal, conférence, livre, chapitre, prépublication)
- Statut (publié, accepté, soumis, en préparation)
- Liens externes
- Nombre de citations

**Upload de fichiers** :
- Téléchargez le PDF de la publication

#### 6. Gestion des Conférences (`/admin/talks`)

**Informations de présentation** :
- Titre de la présentation
- Type (conférence, séminaire, workshop, keynote, invité)
- Événement
- Lieu et localisation
- Date
- Résumé
- Co-présentateurs
- Statut (invité, keynote)

**Fichiers associés** :
- Slides de présentation
- Lien vers la vidéo
- Liens externes

#### 7. Gestion de l'Enseignement (`/admin/teaching`)

**Informations de cours** :
- Titre du cours
- Code du cours
- Institution
- Niveau (licence, master, doctorat)
- Semestre et année
- Rôle (enseignant, assistant, conférencier invité)
- Description
- Syllabus
- Nombre d'étudiants
- Score d'évaluation
- Crédits ECTS

**Matériel pédagogique** :
- Upload de supports de cours
- Types : slides, notes, exercices, examens

#### 8. Gestion des Photos (`/admin/photos`)

**Upload de photos** :
- Sélectionnez une ou plusieurs images
- Ajoutez un titre et une description
- Choisissez une catégorie (conférence, recherche, enseignement, personnel, récompenses)
- Définissez la visibilité (public/privé)
- Ajoutez des tags
- Spécifiez le lieu et l'événement

**Organisation** :
- Réorganisez l'ordre d'affichage
- Modifiez les informations
- Supprimez les photos non désirées

## Fonctionnalités Avancées

### Upload de Fichiers

**Formats supportés** :
- Images : JPG, PNG, GIF (max 10 MB)
- Documents : PDF (max 10 MB)

**Processus d'upload** :
1. Cliquez sur le bouton d'upload
2. Sélectionnez le fichier
3. Attendez la confirmation
4. Le fichier est automatiquement lié à l'élément

### Recherche et Filtres

**Page Publications** :
- Filtrez par type de publication
- Filtrez par statut
- Recherche textuelle dans titre, auteurs, journal

**Page Photos** :
- Filtrez par catégorie
- Recherche par tags

### Gestion des Utilisateurs

**Changement de mot de passe** :
1. Accédez aux paramètres utilisateur
2. Saisissez l'ancien mot de passe
3. Définissez le nouveau mot de passe
4. Confirmez la modification

### Sauvegarde et Restauration

**Sauvegarde automatique** :
- Toutes les modifications sont sauvegardées automatiquement
- Confirmation visuelle après chaque action

**Sauvegarde manuelle** :
- Exportez les données via MongoDB
- Sauvegardez le dossier `uploads` pour les fichiers

## Bonnes Pratiques

### Gestion du Contenu

1. **Cohérence** : Maintenez un style cohérent dans les descriptions
2. **Qualité des images** : Utilisez des images haute résolution
3. **Mise à jour régulière** : Actualisez le contenu régulièrement
4. **Sauvegarde** : Effectuez des sauvegardes régulières

### Sécurité

1. **Mot de passe fort** : Utilisez un mot de passe complexe
2. **Déconnexion** : Déconnectez-vous après utilisation
3. **Accès restreint** : Ne partagez pas vos identifiants
4. **Mise à jour** : Maintenez le système à jour

### Performance

1. **Optimisation des images** : Compressez les images avant upload
2. **Contenu pertinent** : Évitez le contenu superflu
3. **Navigation claire** : Organisez le contenu logiquement

## Résolution de Problèmes

### Problèmes d'Upload

**Fichier trop volumineux** :
- Réduisez la taille du fichier (max 10 MB)
- Compressez les images

**Format non supporté** :
- Vérifiez les formats acceptés
- Convertissez le fichier si nécessaire

### Problèmes d'Affichage

**Contenu non visible** :
- Vérifiez que le contenu est publié
- Actualisez la page
- Vérifiez la connexion internet

**Images non affichées** :
- Vérifiez que l'upload s'est bien déroulé
- Contrôlez les permissions de fichiers

### Problèmes de Connexion

**Impossible de se connecter** :
- Vérifiez les identifiants
- Assurez-vous que le backend fonctionne
- Contrôlez la connexion réseau

## Support Technique

Pour toute assistance technique :
1. Consultez les logs d'erreur
2. Vérifiez la documentation
3. Contactez l'administrateur système
4. Développeur : Wassim Bahloul

