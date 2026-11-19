# Ne suis pas les moutons — charte de personnages et style

## Intention éditoriale
La série examine comment naissent le conformisme, la pression sociale, la répétition médiatique et le contrôle de l'opinion collective. Ne pas confondre démonstration de ces mécanismes et affirmation que tous les messages ou tous les médias manipulent systématiquement. Le contenu doit faire réfléchir, avec des exemples clairs et nuancés.

- **Le Renard** : narrateur, observateur et présentateur pédagogique, jamais arnaqueur de métier ni bourreau. Renard roux, ventre et museau crème, sourcils marqués, regard posé, costume trois-pièces brun, chemise claire, cravate rousse à motif, pochette blanche, chaîne de montre dorée. Il explique ce qui se passe, sans piéger le Mouton.
- **Le Mouton** : co-observateur à part entière, lucide, intelligent, curieux et capable de questionner le narrateur. Laine crème bouclée, oreilles visibles, casquette plate en tweed, nœud papillon bordeaux, chemise claire, gilet caramel torsadé, pantalon brun. Ne jamais le dessiner comme une victime humiliée.
- **La foule** : des silhouettes de moutons graphiques uniquement pour illustrer les réactions collectives; éviter d'en faire un jugement sur des groupes humains réels.

## Style adopté : midcentury-toon
Base technique : `styles/midcentury-toon/STYLE.md`, moteur natif `styles/midcentury-toon/demo/engine/toon.js`.
Couleurs rétro crème, bleu-vert assourdi, ocre, terre cuite, brun et bordeaux. Aplats géométriques, contours encrés légèrement désalignés, grain papier subtil et personnages en animation limitée 12 dessins par seconde. Graphiques, pictogrammes, bulles de détail, flèches qui s'animent, transitions par iris. Son léger et narration claire. Décors simples inspirés des films pédagogiques des années 1950, et non plus boutique 3D.

## Démonstration
Ouvrir `films/renard-mouton/index.html` depuis un serveur HTTP à la racine du dépôt. `scene-midcentury.js` dessine une séquence d'essai de 18 secondes en 9:16 : une radio, un journal et une télévision répètent un message, des icônes de foule suivent une direction, puis une silhouette rompt le mouvement. La scène met en avant l'observation et la réflexion, pas une victime. Le rendu de test est sans voix; c'est une démonstration graphique, pas un épisode complet.

Les fichiers de référence `img/` et le test d'origine `test.js` sont conservés dans le dépôt. Les styles de la bibliothèque ne sont pas modifiés.


## Refonte visuelle détaillée — 19 novembre 2026

Le prototype original de 18 s était volontairement schématique et ne doit plus servir de référence de qualité finale. Le nouvel extrait de direction artistique (23 s) disponible avec son code Python/Pillow et ses assets dans le ZIP de livraison ChatGPT améliore fortement les détails. Pour éviter d'alourdir le dépôt, la vidéo et ses images ne sont pas intégrées aux fichiers Git à ce stade.

- **Renard 2D haute définition** : tête plus structurée, museau crème en plusieurs zones, contours encrés, mèches de fourrure, yeux expressifs, costume brun avec fines rayures, boutons, revers, gilet et chaîne de montre, cravate imprimée, pose de présentateur calme.
- **Mouton 2D haute définition** : bouclettes de laine individuelles, grandes oreilles, regard questionneur, casquette tweed quadrillée, nœud papillon bordeaux, gilet caramel à tricot torsadé, chemise à plis, pantalon chevronné, chaussures en cuir.
- **Décors** : studio d'analyse, tableau annoté, fenêtres sur ville, radio, presse, télévision, archives illustrées, groupe de moutons, matériel analogique et détails papier.
- **Mouvements** : ondulations de signaux, scintillement des écrans, documents animés, foule graphique en mouvement, apparition de repères, caméra douce, rayons et graphismes. Les protagonistes sont encore des calques illustrés à animation légère ; pour une vraie série, ajouter poses, gestes articulés et lèvres.
- **Identité** : crème, bleu-vert, brun, rouille et or, texture d'impression, dessins précis et lisibles en 9:16. Rester fidèle au langage midcentury-toon, mais éviter les personnages géométriques enfantins du premier test.
- **Editorial** : le renard et le mouton questionnent ensemble les mécanismes de répétition, influence et conformisme. Ni escroc ni victime. Distinguer communication persuasive, biais cognitif et preuves, sans prétendre qu'une répétition suffit à rendre une information fausse.

Pour un montage complet, conserver 5 parties distinctes : question initiale, démonstration sur supports médiatiques, circulation d'une même information, réaction du groupe, et conclusion invitant à vérifier avant d'adhérer. Fournir de vraies scènes différentes, pas simplement des zooms sur une affiche.
