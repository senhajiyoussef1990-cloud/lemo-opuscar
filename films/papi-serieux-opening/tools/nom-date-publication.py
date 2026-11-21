#!/usr/bin/env python3
"""Nommage cohérent des dossiers et ZIP « Papi, sérieux ? » (épisodes 12 à 50).

Exemples :
  python nom-date-publication.py 12 QR-codes
  python nom-date-publication.py 50 Lunettes-connectees --zip
La date désigne le jour de publication prévu (18 h Europe/Brussels).
"""
from __future__ import annotations
from datetime import date, timedelta
from argparse import ArgumentParser
import re
import unicodedata

START_EPISODE = 12
START_DATE = date(2026, 11, 22)
END_EPISODE = 50

def publication_date(episode: int) -> date:
    if episode < START_EPISODE or episode > END_EPISODE:
        raise ValueError("Planning défini pour les épisodes 12 à 50 uniquement")
    return START_DATE + timedelta(days=episode - START_EPISODE)

def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")
    return text or "Sans-titre"

def dated_name(episode: int, short_title: str, is_zip: bool = False) -> str:
    name = f"{publication_date(episode):%Y-%m-%d}_EP{episode:02d}_{slug(short_title)}"
    return name + ".zip" if is_zip else name

if __name__ == "__main__":
    p = ArgumentParser(description=__doc__)
    p.add_argument("episode", type=int, help="Numéro de l’épisode (12 à 50)")
    p.add_argument("titre_court", help="Titre court dans le nom du dossier")
    p.add_argument("--zip", action="store_true", help="Ajouter l’extension .zip")
    args = p.parse_args()
    print(dated_name(args.episode, args.titre_court, args.zip))
