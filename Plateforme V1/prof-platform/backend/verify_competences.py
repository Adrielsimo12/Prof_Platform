#!/usr/bin/env python
"""Vérification rapide des compétences intégrées"""

from app import app

with app.app_context():
    from models import DomaineCompetence
    
    domaine = DomaineCompetence.query.filter_by(code='CIEL').first()
    
    if domaine:
        result = domaine.to_dict(with_competences=True)
        print('✓ Domaine CIEL récupéré')
        print(f'  Nombre de compétences: {len(result["competences"])}')
        print('\n  Liste des compétences:')
        for comp in result['competences']:
            nom_court = comp['nom'][:60] + '...' if len(comp['nom']) > 60 else comp['nom']
            print(f'    - {comp["code"]}: {nom_court}')
    else:
        print('✗ Domaine CIEL non trouvé')
