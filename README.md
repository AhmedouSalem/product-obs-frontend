# ProductObsFrontend

# 🖥️ Product Management – Frontend (Angular)

Frontend Angular de l’application **Product Management**, développé dans le cadre du **TP Logging & Observability**.  
Cette application consomme une API REST sécurisée (Spring Boot + JWT) et est instrumentée avec **OpenTelemetry** afin de produire des **traces frontend** visualisables dans **Jaeger**.

---

## 🎯 Objectifs du frontend

- Fournir une interface utilisateur fonctionnelle pour :
  - l’authentification
  - la gestion des **produits**
  - la gestion des **catégories**
- Vérifier la communication correcte avec le backend
- Instrumenter le frontend avec **OpenTelemetry JS**
- Générer et analyser des **traces frontend personnalisées**
- (Bonus) Participer à une corrélation **end-to-end frontend ↔ backend**

---

## 🧱 Architecture générale
```text
src/
├── app/
│ ├── core/
│ │ ├── api/ # ApiService (HTTP)
│ │ ├── auth/ # AuthService + interceptor JWT
│ │ └── otel/ # OpenTelemetry (tracing.ts, TraceService)
│ ├── features/
│ │ ├── auth/ # Login page
│ │ ├── products/ # Products page + dialogs
│ │ └── categories/ # Categories page + dialogs
│ ├── app-routing.module.ts
│ └── app.component.*
└── main.ts
```

---

## 🔐 Authentification

- Page **Login**
- Appel de `POST /api/auth/login`
- Récupération du token JWT
- Stockage en `localStorage`
- Intercepteur HTTP (`AuthInterceptor`) :
  - ajoute automatiquement  
    `Authorization: Bearer <token>` aux requêtes protégées

---

## 📦 Fonctionnalités principales

### Produits
- Chargement de tous les produits
- Filtrage par catégorie
- Recherche du produit le plus cher
- CRUD complet :
  - création
  - modification
  - suppression
- UI basée sur **Angular Material** (table, dialogs)

### Catégories
- Liste des catégories
- Création / modification / suppression
- Réutilisation des catégories dans les formulaires produits (select)

---

## 🔍 Observabilité – OpenTelemetry Frontend

### Choix techniques
- **OpenTelemetry JS**
- Export des traces via **OTLP/HTTP**
- Collecteur OpenTelemetry
- Visualisation dans **Jaeger**

### Initialisation du tracing
Le tracing est initialisé au démarrage de l’application (`main.ts`) via le fichier :

```text
src/app/core/otel/tracing.ts
```

Il configure :
- le `WebTracerProvider`
- l’exporteur OTLP HTTP
- les instrumentations automatiques
- la propagation du contexte (`traceparent`)

---

## ⚙️ Instrumentation automatique

Les instrumentations suivantes sont activées :

- `DocumentLoadInstrumentation`  
  → chargement initial de l’application
- `UserInteractionInstrumentation`  
  → clics utilisateur
- `FetchInstrumentation` / `XMLHttpRequestInstrumentation`  
  → appels HTTP vers le backend

Ces instrumentations permettent de capturer automatiquement :
- les navigations
- les interactions utilisateur
- les requêtes réseau

---

## ✍️ Instrumentation manuelle (spans personnalisés)

En complément, des **spans métier explicites** ont été ajoutés afin de mieux représenter les intentions utilisateur.

### Nomenclature utilisée

#### Authentification
- `ui.login`

#### Produits
- `ProductComponent.loadProducts`
- `ProductComponent.loadCategories`
- `ProductComponent.filterByCategory`
- `ProductComponent.mostExpensive`
- `ProductComponent.mostExpensiveByCategory`
- `ProductComponent.createProduct`
- `ProductComponent.updateProduct`
- `ProductComponent.deleteProduct`

#### Catégories
- `CategoryComponent.loadCategories`
- `CategoryComponent.createCategory`
- `CategoryComponent.updateCategory`
- `CategoryComponent.deleteCategory`

Ces spans sont créés via un service utilitaire (`TraceService`) qui encapsule les appels HTTP dans un span parent métier.

---

## 🔗 Communication avec le backend

- Base URL :
```text
http://localhost:8080
```


- Les requêtes HTTP frontend incluent automatiquement :
- le token JWT
- le header `traceparent` (propagation OpenTelemetry)

---

## 📊 Visualisation des traces

- Jaeger UI :
```text
http://localhost:16686
```

Dans Jaeger, on peut observer :
- le service `product-obs-frontend`
- les spans automatiques (`GET`, `click`, `Navigation`)
- les spans manuels métier (`ui.login`, `ProductComponent.*`, etc.)

---

## ⭐ Bonus – Corrélation frontend ↔ backend

Dans le cadre du bonus :
- le backend Spring Boot est instrumenté avec l’agent OpenTelemetry Java
- les traces backend sont exportées vers le même collecteur
- le contexte de trace est propagé automatiquement

Résultat :
- une **trace unique end-to-end**
- visualisation complète :
- action utilisateur (frontend)
- requête HTTP
- traitement backend
- accès base de données

---

## 🚀 Lancer le frontend

```bash
npm install
ng serve
```

Application disponible sur :
```text
http://localhost:4200
```