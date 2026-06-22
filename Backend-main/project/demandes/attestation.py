
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from django.core.files.base import ContentFile


# Method: generer_attestation.
def generer_attestation(demande):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    titre_style = ParagraphStyle(
        'titre',
        parent=styles['Title'],
        fontSize=16,
        alignment=TA_CENTER,
        spaceAfter=20,
    )
    normal_style = ParagraphStyle(
        'normal',
        parent=styles['Normal'],
        fontSize=12,
        alignment=TA_LEFT,
        spaceAfter=10,
    )

    chercheur = demande.chercheur.user
    contenu = []

    # Titre
    contenu.append(Paragraph("ATTESTATION DE MOBILITÉ ACADÉMIQUE", titre_style))
    contenu.append(Spacer(1, 1*cm))

    # Corps
    contenu.append(Paragraph(
        f"Nous attestons que <b>{chercheur.nom} {chercheur.prenom}</b> a été autorisé(e) "
        f"à effectuer un séjour de mobilité académique dans le cadre de la demande "
        f"<b>{demande.numero_demande}</b>.",
        normal_style
    ))
    contenu.append(Spacer(1, 0.5*cm))

    contenu.append(Paragraph(f"<b>Pays de destination :</b> {demande.pays.name}", normal_style))
    contenu.append(Paragraph(f"<b>Institution d'accueil :</b> {demande.institution_accueil}", normal_style))
    contenu.append(Paragraph(f"<b>Ville d'accueil :</b> {demande.ville_accueil}", normal_style))
    contenu.append(Paragraph(f"<b>Type de séjour :</b> {demande.type_sejour}", normal_style))
    contenu.append(Paragraph(f"<b>Date de début :</b> {demande.date_debut.strftime('%d/%m/%Y')}", normal_style))
    contenu.append(Paragraph(f"<b>Date de fin :</b> {demande.date_fin.strftime('%d/%m/%Y')}", normal_style))
    contenu.append(Paragraph(f"<b>Durée :</b> {demande.duree_jours} jours", normal_style))
    contenu.append(Paragraph(f"<b>Objectifs scientifiques :</b> {demande.objectifs_scientifiques}", normal_style))

    if demande.montant_indemnite:
        contenu.append(Paragraph(f"<b>Montant de l'indemnité :</b> {demande.montant_indemnite} DA", normal_style))

    contenu.append(Spacer(1, 1*cm))
    contenu.append(Paragraph(
        "Cette attestation est délivrée pour servir et valoir ce que de droit.",
        normal_style
    ))

    doc.build(contenu)
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"attestation_{demande.numero_demande}.pdf")
