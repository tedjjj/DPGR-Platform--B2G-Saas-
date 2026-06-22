# Système de Gestion des Mobilités Académiques

Plateforme backend de gestion des demandes de mobilité académique, permettant aux chercheurs de soumettre et suivre leurs demandes de séjour à l'étranger, et aux administrateurs de les traiter selon un workflow défini.

---

## Technologies utilisées

- **Python 3.x**
- **Django 6.x**
- **Django REST Framework**
- **Simple JWT** — authentification par token JWT
- **drf-nested-routers** — routes imbriquées
- **SQLite** — base de données (développement)

---

## Structure du projet

```
project/
├── manage.py
├── .gitignore
├── README.md
├── project/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/
│   ├── models.py        # User, ProfilChercheur
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── permission.py    # IsChercheur, IsAdminDPGR, IsAssistantDPGR, IsSuperAdmin
├── demandes/
│   ├── models.py        # Demande, Document, Decision, Rapport, Log, CoutDemande
│   ├── serializers.py
│   ├── views.py         # DemandeViewSet
│   ├── document.py      # DocumentViewSet
│   ├── rapport.py       # RapportViewSet
│   ├── workflow.py      # Logique métier et transitions de statut
│   └── urls.py
├── parametres/
│   ├── models.py        # TypeSejour, Session, Pays, Zone, Grade, Laboratoire
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── evaluations/
├── notifications/
├── logs/
└── dashboard/
```

---

## Installation et configuration

### 1. Cloner le projet

```bash
git clone <url_du_repo>
cd project
```

### 2. Créer et activer l'environnement virtuel

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / Mac
source .venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install django djangorestframework djangorestframework-simplejwt drf-nested-routers
```

### 4. Configurer les variables dans `settings.py`

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
AUTH_USER_MODEL = 'users.User'
```

### 5. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 7. Lancer le serveur

```bash
python manage.py runserver
```

---

## Workflow des demandes

```
BROUILLON → SOUMISE → VERIFICATION_AUTOMATIQUE → PREPARATION_CS
                                               → DELIBERATION_CS → APPROUVEE → TERMINEE → CLOTUREE
                                                                 → REJETEE
                                                                 → EN_ATTENTE
APPROUVEE → DEMANDE_ANNULATION → DELIBERATION_CS_FIN
```

---

## Rôles utilisateurs

| Rôle | Description |
|---|---|
| `CHERCHEUR` | Soumet et gère ses demandes |
| `ASSISTANT_DPGR` | Vérifie et prépare les dossiers |
| `ADMIN_DPGR` | Traite et décide sur les demandes |
| `SUPER_ADMIN` | Gère les utilisateurs et la configuration |

---

## Authentification

L'API utilise **JWT**. Pour obtenir un token :

```
POST /api/auth/login/
{
    "email": "user@example.com",
    "password": "motdepasse"
}
```

Ajoute le token dans le header de chaque requête :

```
Authorization: Bearer <access_token>
```
