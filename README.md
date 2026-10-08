# Shortt map / Fix

Scanner web pour mappings FiveM. Glisse ton dossier `resources` et le site détecte :

- **Conflits** : même nom de fichier stream (`.ymap`, `.ytyp`, `.ydr`, `.ytd`, `.ybn`…) dans plusieurs ressources avec un contenu différent. FiveM n'en charge qu'un seul.
- **Doublons identiques** : même fichier copié dans plusieurs ressources.
- **Fichiers chiffrés / illisibles** : fichiers stream sans l'en-tête RAGE `RSC7` (vérifiés un par un, cadenas dans la liste).

Tu peux **cibler une ressource** pour ne voir que ses conflits, puis **télécharger le récapitulatif des fix à facturer** en HTML : une ligne par paire de ressources en conflit, au tarif choisi (10 € par défaut), avec le total.

Tout se passe dans le navigateur : aucun fichier n'est envoyé.

## Mettre en ligne sur GitHub Pages

1. Crée un dépôt GitHub et envoie-y le contenu de ce dossier (`index.html`, `scanner.html`, `assets/`, `.nojekyll`).
2. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site sera disponible sur `https://<ton-pseudo>.github.io/<nom-du-depot>/`.

## Structure

```
index.html          accueil (démo, avant / après, FAQ)
scanner.html        le scanner
assets/style.css    style
assets/site.js      barre du haut, lien Discord (SITE.discord), traductions FR / EN
assets/home.js      carrousels, avant / après, avis (liste REVIEWS)
assets/app.js       scan, liste des conflits, récap, tutoriel
assets/logo.png    logo / favicon
```

Navigateur conseillé : Chrome, Edge ou Firefox récent (le glisser-déposer de dossier en a besoin).
Le récap HTML contient le scan (compressé) : son bouton « Rouvrir sur Shortt map / Fix » ramène sur le site avec tous les résultats et réglages. On peut aussi glisser le récap sur la page Scanner.
