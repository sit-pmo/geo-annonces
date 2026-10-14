# geo-annonces

Messages affichés dans les applications GEO du SIT Pôle Marennes Oléron.
Les applications lisent `annonces.json` à chaque chargement (délai de mise à jour : environ 5 minutes).

## Publier un message

Modifier `annonces.json` sur GitHub et enregistrer. Format d'un message :

| Champ       | Obligatoire | Description |
|-------------|-------------|-------------|
| `id`        | oui | Identifiant **unique** (ex. `2026-10-coupure-urba`). Ne jamais réutiliser : un utilisateur qui a fermé cet id ne reverra plus le message. |
| `texte`     | oui | Texte affiché (texte brut, pas de HTML). |
| `apps`      | non | Liste des identifiants d'applications (`APP` dans le bloc JS), ou `["*"]` pour toutes. Défaut : toutes. |
| `debut`     | non | Date de début `AAAA-MM-JJ` (incluse). |
| `fin`       | non | Date de fin `AAAA-MM-JJ` (incluse). |
| `niveau`    | non | `info` (défaut) ou `alerte` (bordure orange). |
| `lien`      | non | URL `http(s)` affichée après le texte. |
| `lienTexte` | non | Libellé du lien. Défaut : « En savoir plus ». |

Attention : un JSON mal formé (virgule en trop) masque **toutes** les annonces. Vérifier sur https://jsonlint.com en cas de doute.
