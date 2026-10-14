# geo-annonces

Messages affichés en fenêtre modale dans les applications GEO du SIT Pôle Marennes Oléron.
Les applications lisent `annonces.json` à chaque chargement (délai de mise à jour : environ 5 minutes).

## Publier un message

Modifier `annonces.json` sur GitHub et enregistrer. Format d'un message :

| Champ       | Obligatoire | Description |
|-------------|-------------|-------------|
| `id`        | oui | Identifiant **unique** (ex. `2026-10-coupure-urba`). Ne jamais réutiliser : un utilisateur qui a fermé cet id ne reverra plus le message. |
| `titre`     | non | Titre de la fenêtre. Défaut : « Information ». |
| `texte`     | oui | Texte affiché (texte brut, pas de HTML). Pour plusieurs paragraphes : une liste `["Paragraphe 1", "Paragraphe 2"]` (ou `\n` dans une seule chaîne). |
| `image`     | non | URL `http(s)` d'une image (PNG ou JPG). Pour une image du dépôt : la déposer dans `images/` et utiliser `https://raw.githubusercontent.com/sit-pmo/geo-annonces/main/images/<fichier>`. Pas de SVG (GitHub le sert en texte brut). |
| `imageAlt`  | non | Description de l'image pour l'accessibilité. |
| `apps`      | non | Liste des identifiants d'applications (`APP` dans le bloc JS), ou `["*"]` pour toutes. Défaut : toutes. |
| `debut`     | non | Date de début `AAAA-MM-JJ` (incluse). |
| `fin`       | non | Date de fin `AAAA-MM-JJ` (incluse). |
| `niveau`    | non | `info` (défaut) ou `alerte` (en-tête orange). |
| `lien`      | non | URL `http(s)` affichée après le texte. |
| `lienTexte` | non | Libellé du lien. Défaut : « En savoir plus ». |

Attention : un JSON mal formé (virgule en trop) masque **toutes** les annonces. Vérifier sur https://jsonlint.com en cas de doute.

## Installer dans une application GEO

Copier tout le contenu de [`geo-annonces.js`](geo-annonces.js) dans le champ JavaScript de l'application, puis adapter la ligne `var APP = '...';` (identifiant de l'application, utilisé dans `apps`).
