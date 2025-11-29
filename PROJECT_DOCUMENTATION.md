# READY PLAYER SANTA™ - Documentation Technique Complète

## 📊 MÉTADONNÉES DU PROJET

**Nom** : Ready Player Santa™  
**Type** : Application web gamifiée pour Secret Santa  
**Client** : Équipe DRCI - GHICL (Groupement des Hôpitaux de l'Institut Catholique de Lille)  
**Date de lancement prévu** : 2 décembre 2025  
**Événement final** : 11 décembre 2025 à 11h30  
**Développeur** : François  
**Dernière mise à jour** : 29 novembre 2025  
**Statut** : En développement actif - Frontend complet, Backend configuré

---

## 🎯 CONCEPT ET OBJECTIF

### Vision
Transformer le Secret Santa traditionnel en expérience gamifiée cyberpunk où les participants :
1. Uploadent un cadeau (~10€) avec photo et description
2. Choisissent un avatar unique
3. Likent les cadeaux qui les intéressent
4. Participent à des mini-jeux le jour J pour gagner leurs cadeaux préférés

### Parcours utilisateur complet
```
Phase 1 (2-10 déc) : Inscription → Choix avatar → Upload cadeau → Like wishlist
Phase 2 (11 déc 11h30) : Batailles dans l'Arène → Attribution des cadeaux
```

### Règles du jeu
- Budget cadeau : ~10€
- 1 avatar unique par personne (first-come, first-served)
- Les likes déterminent qui participe aux batailles pour chaque cadeau
- Mini-jeux accessibles à tous (quiz, memory, réflexes)

---

## 🏗️ STACK TECHNIQUE

### Frontend
- **Framework** : Next.js 16.0.3 (App Router)
- **Langage** : TypeScript / React 18
- **Styling** : Tailwind CSS + CSS Variables custom (cyberpunk.css)
- **Animations** : CSS Animations + React state management
- **Fonts** : JetBrains Mono (mono), System fonts (sans)

### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (Magic Links par email)
- **Storage** : Supabase Storage (bucket "gifts" public)
- **API Client** : @supabase/supabase-js

### Déploiement
- **Plateforme** : Vercel (production)
- **CI/CD** : GitHub → Vercel (auto-deploy sur push master)
- **Environnement local** : Windows PowerShell, VSCode, npm run dev

---

## 📁 ARCHITECTURE DU PROJET

```
READY_PLAYER_SANTA/
├── app/
│   ├── styles/
│   │   └── cyberpunk.css          # Système de design complet
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation authentifiée
│   │   ├── Particles.tsx          # Particules flottantes interactives
│   │   ├── CountdownTimer.tsx     # Compte à rebours vers 11.12.25 11:30
│   │   └── Mission1Modal.tsx      # ⚠️ OBSOLÈTE (ne plus utiliser)
│   ├── page.tsx                   # Page d'accueil (avec loading screen + typing effect)
│   ├── layout.tsx                 # Layout global (imports CSS, Navbar)
│   ├── globals.css                # Styles Tailwind de base
│   ├── login/
│   │   └── page.tsx               # Authentification (Magic Link)
│   ├── onboarding/
│   │   └── page.tsx               # Choix du pseudo après première connexion
│   ├── dashboard/
│   │   └── page.tsx               # Hub principal (4 boutons : Avatar, Cadeau, Wishlist, Arène)
│   ├── avatars/
│   │   └── page.tsx               # Galerie d'avatars avec réservation temps réel
│   ├── gift/
│   │   └── page.tsx               # Upload/édition du cadeau
│   ├── wishlist/
│   │   └── page.tsx               # Liste des cadeaux avec système de likes
│   ├── mission1/
│   │   └── page.tsx               # Page Mission 1 (story typing effect)
│   └── briefing/
│       └── page.tsx               # Page Briefing (règles du jeu)
├── lib/
│   └── supabaseClient.ts          # Configuration Supabase
├── .env.local                     # Variables d'environnement Supabase
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── PROJECT_DOCUMENTATION.md       # Ce fichier
```

---

## 🎨 SYSTÈME DE DESIGN - CYBERPUNK CHRISTMAS

### Palette de couleurs (CSS Variables)
```css
--bg-deep: #000000       /* Fond le plus sombre */
--bg-dark: #020617       /* Fond principal */
--bg-mid: #0f172a        /* Fond panels */
--primary: #7dd3fc       /* Cyan néon (titres, accents) */
--accent: #f97373        /* Rouge (badges, alertes) */
--success: #22c55e       /* Vert (validations) */
--text: #e5f3ff          /* Texte principal */
--muted: #94a3b8         /* Texte secondaire */
--muted-dark: #64748b    /* Texte tertiaire */
```

### Effets visuels globaux
1. **Scanlines CRT** : `body::before` - lignes horizontales animées
2. **Snow effect** : `body::after` - particules subtiles en mouvement
3. **Particules interactives** : Composant `<Particles />` - réagit au curseur
4. **Grille néon** : Background pattern sur les panels
5. **Glow effects** : Box-shadows avec couleurs primaires

### Composants CSS réutilisables
- `.cyberpunk-panel` : Panel principal avec effets de glow
- `.cyberpunk-btn` : Bouton avec hover effects et shine animation
- `.countdown-*` : Éléments de compte à rebours
- `.hud-title` : Titres style HUD
- `.main-title` : Titre principal avec animation glow

### Animations clés
- `fadeInUp` : Apparition depuis le bas (0.6s)
- `particleFloat` : Mouvement des particules (20s loop)
- `scanlineShift` : Mouvement des scanlines (8s loop)
- `titleGlow` : Pulsation du glow sur titres (3s loop)
- `badgePulse` : Pulsation des badges NEW (2s loop)
- `bootLine` : Apparition des lignes de boot (0.4s)

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES (SUPABASE)

### Table : `profiles`
Profil utilisateur créé après authentification.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | ID Supabase Auth |
| pseudo | text | UNIQUE, NOT NULL | Pseudo choisi (onboarding) |
| avatar_id | uuid | FOREIGN KEY → avatars(id) | Avatar réservé |
| email | text | NOT NULL | Email de connexion |
| created_at | timestamptz | DEFAULT now() | Date de création |
| gift_name | text | NULL | Titre du cadeau uploadé |
| gift_description | text | NULL | Description du cadeau |

**RLS Policies :**
- SELECT : Public (tous peuvent voir tous les profils)
- INSERT : Users can create own profile (`auth.uid() = id`)
- UPDATE : Users can update own profile (`auth.uid() = id`)

---

### Table : `avatars`
Avatars disponibles pour les participants.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | ID unique |
| name | text | UNIQUE, NOT NULL | Nom de l'avatar |
| description | text | NOT NULL | Description courte |
| image_url | text | NOT NULL | URL de l'image |
| taken_by_user_id | uuid | FOREIGN KEY → profiles(id) | User qui a réservé (NULL si dispo) |

**RLS Policies :**
- SELECT : Public
- UPDATE : Authenticated users pour réservation

**Note importante** : Système de réservation = UPDATE du `taken_by_user_id`. Pas de double réservation possible grâce aux contraintes DB.

---

### Table : `gifts`
Cadeaux uploadés par les participants.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | ID unique |
| user_id | uuid | FOREIGN KEY → profiles(id) | Propriétaire du cadeau |
| title | text | NOT NULL | Titre du cadeau |
| description | text | NOT NULL | Description |
| image_url | text | NOT NULL | URL de l'image (Supabase Storage) |
| created_at | timestamptz | DEFAULT now() | Date de création |
| winner_player_id | uuid | FOREIGN KEY → profiles(id) | Gagnant final (NULL avant le 11 déc) |

**RLS Policies :**
- SELECT : Public
- INSERT : Authenticated users
- UPDATE : Users can update own gifts (`auth.uid() = user_id`)

---

### Table : `gift_likes`
Système de likes sur les cadeaux (wishlist).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | ID unique |
| user_id | uuid | FOREIGN KEY → profiles(id) ON DELETE CASCADE | User qui like |
| gift_id | uuid | FOREIGN KEY → gifts(id) ON DELETE CASCADE | Cadeau liké |
| created_at | timestamptz | DEFAULT now() | Date du like |

**Contrainte unique** : `UNIQUE(user_id, gift_id)` - Un user ne peut liker un cadeau qu'une fois

**Index** :
- `idx_gift_likes_user` sur `user_id`
- `idx_gift_likes_gift` sur `gift_id`

**RLS Policies :**
- SELECT : Public
- INSERT : Authenticated users (`auth.uid() = user_id`)
- DELETE : Users can delete own likes (`auth.uid() = user_id`)

---

### Table : `admins`
Liste des administrateurs (pour gestion future).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | ID unique |
| user_id | uuid | FOREIGN KEY → profiles(id) | User admin |
| created_at | timestamptz | DEFAULT now() | Date d'ajout |

---

### Storage Bucket : `gifts`
Stockage des images de cadeaux.

**Configuration** :
- Type : Public bucket
- Path pattern : `{user_id}/{filename}`
- File size limit : 5 MB
- Allowed MIME types : image/jpeg, image/png, image/webp

**RLS Policies :**
- SELECT : Public (tout le monde peut voir)
- INSERT : Authenticated users
- UPDATE : Users can update own files
- DELETE : Users can delete own files

---

## 🔐 AUTHENTIFICATION ET SÉCURITÉ

### Flow d'authentification
```
1. User arrive sur /login
2. Entre son email
3. Reçoit Magic Link par email
4. Clique sur le lien
5. Vérifie si profil existe :
   - OUI → Redirect vers /dashboard
   - NON → Redirect vers /onboarding
6. Sur /onboarding : choix du pseudo
7. Création du profil dans `profiles`
8. Redirect vers /dashboard
```

### Variables d'environnement (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-clé-anon]
```

### Protection des routes
- **Pages publiques** : `/`, `/mission1`, `/briefing`
- **Pages authentifiées** : Toutes les autres
- **Méthode** : `supabase.auth.getUser()` en début de page, redirect si non connecté

---

## 🎭 FONCTIONNALITÉS IMPLÉMENTÉES

### ✅ Complètes et testées

1. **Page d'accueil** (`/`)
   - Loading screen animé avec boot sequence
   - Typing effect sur titre "READY PLAYER SANTA™"
   - 3 sections : Panel principal, Auth, Countdown
   - Boutons vers Mission 1 et Briefing
   - Particules interactives

2. **Mission 1** (`/mission1`)
   - Loading screen dédié
   - Story avec typing effect caractère par caractère
   - Panel "Mission 1 - Paramètres" qui apparaît après le typing
   - Bouton retour vers accueil

3. **Briefing** (`/briefing`)
   - Loading screen dédié
   - Documentation complète du jeu
   - 4 sections : Concept, Missions, Jour J, Stratégies
   - Bouton retour vers accueil

4. **Authentification** (`/login`)
   - Magic Link par email
   - Gestion de session Supabase
   - Redirect intelligent (onboarding ou dashboard)

5. **Onboarding** (`/onboarding`)
   - Choix du pseudo unique
   - Création du profil en base
   - Validation et redirect

6. **Dashboard** (`/dashboard`)
   - 4 boutons stylisés : Avatar, Mon cadeau, Liste au Père Noël, L'Arène
   - Navigation fonctionnelle
   - Affichage conditionnel (navbar visible uniquement si authentifié)

7. **Choix d'avatar** (`/avatars`)
   - Galerie d'avatars
   - Système de réservation temps réel
   - Visual feedback (avatar réservé = grisé)

8. **Upload de cadeau** (`/gift`)
   - Formulaire : titre, description, image
   - Upload vers Supabase Storage
   - Modification possible du cadeau
   - Preview de l'image uploadée

9. **Wishlist** (`/wishlist`)
   - Affichage de tous les cadeaux sauf le sien
   - Système de likes/unlikes
   - Compteur de likes visible
   - Affichage du créateur (pseudo + avatar)

10. **Navbar**
    - Visible uniquement si authentifié
    - Logo cliquable → Dashboard
    - Liens : Dashboard, Avatars, Cadeau
    - Bouton déconnexion

11. **Composants réutilisables**
    - `<Particles />` : Particules interactives
    - `<CountdownTimer />` : Compte à rebours vers 11.12.25 11:30

---

### ⏳ En cours / À faire

1. **L'Arène** (`/arena`)
   - Page non créée
   - Système de mini-jeux à implémenter
   - Attribution des cadeaux
   - À développer pour le 11 décembre

2. **Missions 2 et 3**
   - Contenu non défini
   - À créer si nécessaire

3. **Admin panel**
   - Gestion des avatars
   - Monitoring des participants
   - Gestion des mini-jeux

4. **Notifications**
   - Rappels par email
   - Notifications in-app

---

## 🐛 BUGS CONNUS ET SOLUTIONS

### Bug résolu : Caractères mal encodés dans Mission 1
**Problème** : Le typing effect affichait "DRCC" au lieu de "DRCI", caractères bizarres
**Cause** : Méthode `charAt()` ne gère pas bien les caractères Unicode
**Solution** : Utiliser `substring()` au lieu de concaténation caractère par caractère

```typescript
// ❌ Mauvais
setStoryText((prev) => prev + fullStory[index]);

// ✅ Bon
setStoryText(fullStory.substring(0, index));
```

### Bug résolu : Upload de cadeau échoue
**Problème** : Erreur "row violates row-level security policy"
**Cause** : Bucket Storage "gifts" non configuré avec les bonnes RLS policies
**Solution** : Créer le bucket en mode Public + configurer les 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Bug résolu : Dashboard n'affiche que 3 boutons au lieu de 4
**Problème** : Code partiellement commenté dans VSCode
**Cause** : Confusion entre versions
**Solution** : Remplacement complet du fichier avec le bon code

---

## 🎯 PROCHAINES ÉTAPES PRIORITAIRES

### Avant le 2 décembre (lancement)
1. ✅ Vérifier que la table `gift_likes` est bien créée
2. ✅ Corriger la politique INSERT sur `gift_likes` (utiliser `auth.uid()`)
3. ⏳ Configurer le bucket Storage "gifts" en production
4. ⏳ Ajouter 8-10 avatars dans la base de données
5. ⏳ Déployer sur Vercel
6. ⏳ Tester le parcours complet en production
7. ⏳ Préparer le message de communication

### Suggestions d'avatars cyberpunk Christmas
1. Neon Elf - L'elfe du Père Noël version 2077
2. Cyber Santa - Santa augmenté, livraison par drones
3. Gift Guardian - Gardien des présents numériques
4. Snow Hacker - Pirate des flocons de neige
5. Reindeer Rider - Pilote de renne augmenté
6. Digital Spirit - Esprit de Noël digitalisé
7. Frost Mage - Mage des glaces cybernétiques
8. Gift Ninja - Ninja des cadeaux furtifs
9. Holly Bot - Robot décoré de houx synthétique
10. Star Traveler - Voyageur des cieux étoilés

**Générateurs recommandés :**
- DiceBear Avatars : https://www.dicebear.com/
- MidJourney / DALL-E avec prompts cyberpunk Christmas

### Pour le 11 décembre (événement)
1. Développer la page `/arena`
2. Implémenter les mini-jeux
3. Système d'attribution des cadeaux
4. Écran de résultats final

---

## 💡 CONVENTIONS DE CODE

### Nomenclature
- **Composants React** : PascalCase (`CountdownTimer.tsx`)
- **Fonctions** : camelCase (`typeTitle()`)
- **CSS Variables** : kebab-case (`--primary-glow`)
- **Fichiers de page** : lowercase (`page.tsx`)

### Structure des composants
```typescript
"use client"; // Pour les composants avec hooks

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComponentName() {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Functions
  // 5. Return JSX
}
```

### Gestion des erreurs
- Toujours wrapper les appels Supabase dans try/catch
- Afficher des messages d'erreur user-friendly
- Logger les erreurs en console pour debug

### Performance
- Utiliser `useCallback` pour les fonctions passées en props
- Minimiser les re-renders avec `useMemo` si nécessaire
- Loading states pour toutes les opérations async

---

## 🚀 COMMANDES UTILES

### Développement local
```bash
npm run dev          # Lance le serveur de développement
npm run build        # Build pour production
npm run start        # Lance le build en production locale
```

### Git & Déploiement
```bash
git add .
git commit -m "Description des changements"
git push origin master    # Auto-deploy sur Vercel
```

### Supabase
- Console : https://supabase.com/dashboard
- SQL Editor : Pour exécuter les requêtes SQL
- Storage : Gestion des fichiers uploadés
- Auth : Voir les utilisateurs connectés

---

## 📞 INFORMATIONS DE CONTACT

**Développeur** : François  
**Organisation** : DRCI - GHICL  
**Support Supabase** : https://supabase.com/docs  
**Support Next.js** : https://nextjs.org/docs  

---

## 📝 NOTES IMPORTANTES POUR L'IA

### Contexte de développement
- Le développeur (François) travaille sur Windows avec PowerShell et VSCode
- Le projet utilise npm (pas yarn ou pnpm)
- Les commits se font sur la branche `master`
- Le déploiement est automatique via Vercel dès le push

### Philosophie du design
- **Cyberpunk Christmas** : Mélange de néons, tech, et esprit de Noël
- **No theme, only play** : L'important c'est le gameplay, pas le thème du cadeau
- **Accessible à tous** : Les mini-jeux doivent être simples et fun

### Principes de développement
1. **Code propre et modulaire** : Composants réutilisables
2. **Performance** : Loading states, optimisations
3. **UX fluide** : Animations, feedback visuel
4. **Sécurité** : RLS Supabase strict
5. **Mobile-first** : Responsive design obligatoire

### Style de communication
- François aime le développement méthodique et sans bugs
- Il apprécie la transparence et les explications détaillées
- Il valide chaque étape avant de passer à la suivante
- Il utilise l'IA comme un partenaire de développement expert

---

## 🔄 HISTORIQUE DES VERSIONS

### v1.0 - 29 novembre 2025
- ✅ Architecture complète du projet
- ✅ Système d'authentification fonctionnel
- ✅ Pages principales créées (accueil, mission1, briefing, dashboard, avatars, gift, wishlist)
- ✅ Système de design cyberpunk implémenté
- ✅ Base de données Supabase configurée
- ✅ Système de likes sur wishlist opérationnel
- ⏳ En attente : Ajout des avatars, déploiement, développement de l'Arène

---

**FIN DE LA DOCUMENTATION - Version 1.0**

*Ce document est vivant et doit être mis à jour à chaque évolution majeure du projet.*