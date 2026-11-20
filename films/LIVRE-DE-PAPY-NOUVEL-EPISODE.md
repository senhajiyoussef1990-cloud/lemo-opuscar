# Le Livre de Papy — faire un nouvel épisode (guide pas à pas)

Passation (ChatGPT / autre session) : `LIVRE-DE-PAPY-POUR-CHATGPT.md`.
Règles de style : `LIVRE-DE-PAPY-DIRECTION-ARTISTIQUE.md` (à respecter sans qu'on le redemande).
Modèle à copier : **`films/papy-lunettes/`** (le plus récent : figurants à l'échelle, pas de temps mort, version sans la voix de Papy).

## 1. Copier le modèle
```sh
cd films && mkdir papy-<objet> && cd papy-lunettes
cp -r toon.js chars.js story.js main.js worlds.js people.js index.html fonts tools ../papy-<objet>/
cp specs.js ../papy-<objet>/<objet>.js        # le fichier des décors, à réécrire
```

## 2. Écrire le texte — `lines.json` + `SOURCES.md`
- ~37 répliques, mêmes identifiants : `h1…h7` (maison), `a…g` (7 époques), `z1…z3` (retour), `o1 o2` (fin).
- Papy : `fr-CH-FabriceNeural`, rate `+0%` ; Malik : `fr-FR-EloiseNeural`, rate `+14%`.
- Les années et les noms difficiles : champ `say` écrit en toutes lettres / phonétique (le sous-titre garde `text`).
- Une réplique sèche de Papy à la 2ᵉ époque (`b4`) : la musique s'y coupe (`tools/score.py`, chercher `VO['b4']`).
- Faits vérifiés, notés dans `SOURCES.md`. Pas de logo de marque.

## 3. Le déroulé — `story.js`
- `PLAN` : une ligne par monde (`home`, `w1`…`w7`, `home2`) avec le plan de chaque réplique (`two`, `wide`, `cuP`, `cuM`, `ins` = gros plan sur l'objet). **Pas de `STARE`.**
- `TAGS` : l'étiquette de chaque époque (lieu · date, sous-titre, couleurs).

## 4. Les décors et l'objet — `<objet>.js`
Exporter : `home`, `w1`…`w7`, `titleProp`, `darkness`, `SUN`, `VIEW`, la fonction de l'objet (très détaillée) et `held…(w, t)` (l'objet de chaque époque, tenu par Papy).
Chaque époque : architecture et objets d'époque, figurants `figure(x, y, s, t, { era })` (people.js : `antique`, `monk`, `medieval`, `chinese`, `georgian`, `guard18`, `victorian`, `vlady`, `thirties`, `t_lady`, `fifties`, `f_lady`, `swim`, `lab`, `modern`, `m_lady`), gros plan de l'objet vers x ≈ 960 sur une table. Passants qui marchent : `FLOOR - 300, .44` et dessinés **avant** la table du gros plan.

## 5. Brancher — `main.js`
- `import * as Wd from './<objet>.js';`
- titre : chercher `L’HISTOIRE DES LUNETTES` et le remplacer.
- `duo()` : remplacer `Wd.heldSpecs` par la fonction de l'objet ; enlever les lignes `glasses` / `sun` si l'épisode n'en a pas besoin.
- `shotLine()` : les petites réactions par réplique (`if (id === '…')`) à adapter au nouveau texte.
- `INS` : position du gros plan de chaque époque.

## 6. Fabriquer (depuis la racine du dépôt)
```sh
D=films/papy-<objet>
sh $D/tools/fonts.sh
wss_proxy=$HTTPS_PROXY .venv/bin/python core/tts/tts_zh.py $D/lines.json $D/raw   # relancer s'il manque une réplique
.venv/bin/python $D/tools/voice.py
node core/render/still.mjs $D <temps…> --size 1080x1920 --out $D/stills           # vérifier une image par plan
node core/render/events.mjs $D --size 1080x1920
.venv/bin/python $D/tools/score.py
.venv/bin/python $D/tools/mix.py
NO_PAPY=1 MIX_OUT=mix-sans-papy.wav .venv/bin/python $D/tools/mix.py
node core/render/video.mjs $D --fps 24 --workers 4 --size 1080x1920 --out $D/out/video.mp4
sh core/render/mux.sh $D/out/video.mp4 $D/out/mix-sans-papy.wav $D/le-livre-de-papy-<objet>-sans-voix-papy.mp4 24 0
sh core/render/mux.sh $D/out/video.mp4 $D/out/mix.wav $D/le-livre-de-papy-<objet>.mp4 24 0
```
Puis écrire `papy-texte-timeline.txt` (début → fin + réplique de Papy, depuis `events.json`, `lines.json`, `voices/dur.json`).

## 7. Livrer
1. la vidéo **sans la voix de Papy** ; 2. `papy-texte-timeline.txt` ; 3. la publication (titre YouTube Shorts, texte TikTok/Instagram/Facebook, description YouTube).
Enregistrer sur la branche `le-livre-de-papy` (`git add -f` : le dossier `films/` est ignoré par défaut).

## Contrôle qualité obligatoire des images Story (yeux ouverts)
- **Ne jamais utiliser un photogramme aléatoire** pour la Story : Papy et Malik peuvent cligner des yeux.
- Les personnages doivent avoir des **pupilles clairement visibles**, les paupières ouvertes et le regard expressif.
- Intégrer dans `chars.js` un mode URL `cover=1` qui force `blink=false`, une ouverture de paupière suffisante (Papy `lid=.06`, `lower=.02`, Malik `lid=0`) et désactive `closed` durant la capture **uniquement**.
- Créer l'image avec `node films/story-eye-open.mjs "$D" "$D/story-base.jpg"` (plan `home.TITLE`), qui passe `cover=1` automatiquement. Ajouter l'encart de publication.
- Vérifier visuellement **le visuel Story final** avant de créer le ZIP. Ce mode n'affecte pas le clignement naturel des vidéos.
- Si seul le visuel Story est à corriger, **conserver les MP4 déjà rendus** et reconditionner le ZIP : ne pas refaire 30 minutes de rendu pour une image.

## Voix enregistrée par l'auteur (CapCut)
Si l'auteur envoie sa voix : la découper réplique par réplique sur la timeline, la nettoyer, et la mettre à la place de `raw/<id>.wav` des répliques de Papy (en gardant une copie des fichiers de synthèse). Puis relancer `voice.py` (durées et bouche), events → score → mix → vidéo. Si son débit diffère, recaler toute la vidéo sur sa voix.
