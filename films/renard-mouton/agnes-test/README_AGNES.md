# Essai Agnes AI : animation réelle du Renard et du Mouton

Un **test de 6 secondes** (vertical 9:16, 720P) sur une seule scène : **Renard à gauche**, **Mouton à droite avec un téléphone**. Le moteur demandé est `agnes-video-2.5-flash` en mode `reference`, avec deux photos des personnages déjà présentes dans ce dépôt.

Mouvements requis : le mouton fait défiler le téléphone et regarde le renard; le renard tourne la tête et fait un geste complet du bras; yeux, épaules, mains, mâchoires et bouches s'animent réellement. Le but est de comparer les mouvements à un vrai plan animé, et non de produire un diaporama.

## Lancer sans exposer de clé

**Une clé a été copiée dans une conversation : il est prudent de la révoquer et d'en créer une nouvelle avant d'utiliser GitHub Actions.**

1. Aller dans [les secrets du dépôt](https://github.com/senhajiyoussef1990-cloud/lemo-opuscar/settings/secrets/actions).
2. Cliquer **New repository secret** et enregistrer la **nouvelle clé Agnes** sous le nom exact `AGNES_API_KEY`.
3. Ouvrir [le workflow Agnes Renard et Mouton](https://github.com/senhajiyoussef1990-cloud/lemo-opuscar/actions/workflows/agnes-renard-mouton-manuel.yml) sur la branche principale, cliquer **Run workflow**.
4. Une fois l'exécution achevée, sous **Artifacts**, télécharger `agnes-test-renard-mouton-6-secondes`. Il contient le MP4 en cas de succès.

Le script à exécuter vit dans `films/renard-mouton/agnes-test/generate.py` sur `ne-suis-pas-les-moutons`; seul le déclencheur manuel est sur `main`. Les autres séries et leurs workflows ne sont pas modifiés.

## Limitations

- Le test vérifie **mouvements et cohérence des visages**, pas la synchronisation sur les nouvelles répliques de l'épisode 02.
- Les voix de référence Mouton, Renard et JT ne sont pas publiées ici.
- L'API peut refuser une clé qui ne provient pas d'Agnes, ou être indisponible (files d'attente, quotas).
- Les offres et tarifs Agnes peuvent changer. Vérifier le coût avant de cliquer sur Run workflow.
- La vidéo produite doit être contrôlée avant d'engager les 15 scènes de l'épisode.

## Sécurité

La clé n'apparaît dans aucun script, log voulu, document ou commit. Elle passe à GitHub Actions uniquement par la variable d'environnement `AGNES_API_KEY`, injectée depuis `secrets.AGNES_API_KEY`.
