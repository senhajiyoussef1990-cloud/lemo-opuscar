# Le Livre de Papy — cinq épisodes en double format

Cette série de 5 épisodes est construite **séquentiellement** par le workflow GitHub Actions `.github/workflows/papy-five-dual.yml`. Chaque vidéo est entièrement racontée avec la voix de Papy (**fr-CH-FabriceNeural**) et de Malik (**fr-FR-EloiseNeural**).

## Épisodes
1. `papier` — *L'histoire du papier*.
2. `montre` — *L'histoire de la montre*.
3. `parapluie` — *L'histoire du parapluie*.
4. `cle` — *L'histoire de la clé*.
5. `crayon` — *L'histoire du crayon*.

## Contenu de chaque ZIP
- `le-livre-de-papy-<slug>-short-9x16.mp4` — 1080 × 1920, deux voix, son et sous-titres
- `le-livre-de-papy-<slug>-youtube-16x9.mp4` — 1920 × 1080 **rendu réellement en horizontal** (ni étirement, ni bandes), deux voix, son et sous-titres
- `story.jpg` — publication verticale yeux ouverts, titre, 18 h
- `publication.txt` — textes prêts à copier sur chaque réseau
- `papy-texte-timeline.txt` — texte + minutage des répliques de Papy
- `SCENARIO.md` — les 39 répliques
- `SOURCES.md` — références historiques

**La version sans voix de Papy a été supprimée de ce lot à la demande de l'auteur.** Il n'y a que deux MP4 par ZIP, tous deux avec les voix.

## Architecture

- `episodes.json` : les 39 répliques et les 7 périodes de chaque histoire
- `objects.js` : dessine en code les 5 objets et leurs variantes historiques
- `prepare.py <slug>` : prépare un dossier d'épisode à partir de la DA **Lunettes/Savon** et adapte les dimensions dynamiques du moteur
- `build-dual.sh <slug>` : produit les voix une seule fois, puis les deux cadrages successivement, et vérifie pistes audio, résolutions et ZIP
- Workflow GitHub : pré-tests des **deux formats pour les cinq sujets**, puis rendu **maximum un épisode à la fois**

### Exécution locale (dépendances comme dans le workflow)
```bash
bash films/papy-batch5/build-dual.sh papier
```

Direction artistique : Papy en blouse blanche, Malik en sweat bleu, livre magique, vortex cyan-violet, époques en parchemin beige au centre supérieur de l'image, pupilles visibles sur les Stories. Les scènes horizontales repositionnent titres, sous-titres, champs de caméra et cartouches au lieu d'étirer le portrait.
