
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from demandes.models import Demande
from users.models import User
from parametres.models import Session, Laboratoire, pays, typeSejour
from demandes.models import StatutDemande
from users.permission import IsAdminDPGR, IsAssistantDPGR, IsChercheur
from rest_framework.permissions import IsAuthenticated
# importer count
from django.db.models import Count, Sum
from django.db.models import Sum
from users.permission import IsSuperAdmin, IsAdminDPGR, IsAssistantDPGR, IsChercheur


# Model or class: DashboardChercheurView.

# API views and request handlers for this Django app.

# DashboardChercheurView: API view handler for incoming requests.
class DashboardChercheurView(APIView):
    permission_classes = [IsChercheur]

# Method: get.
# Method: get.
    def get(self, request):
        demandes = Demande.objects.filter(chercheur=request.user.profil)
        demandes_recentes = demandes.order_by('-date_soumission')[:5]

        return Response({
            'total_demandes': demandes.count(),
            'demandes_approuvees': demandes.filter(statut='APPROUVE').count(),
            'demandes_en_cours': demandes.filter(statut='SOUMIS').count(),
            'demandes_rejetees': demandes.filter(statut='REJETE').count(),
            'demandes_brouillon': demandes.filter(statut='BROUILLON').count(),
            'total_jours_sejour': demandes.filter(
                statut='APPROUVE'
            ).aggregate(Sum('duree_jours'))['duree_jours__sum'] or 0,
            'demandes_recentes': [
                {
                    'id': d.id,
                    'numero_demande': d.numero_demande,
                    'statut': d.statut,
                    'destination': d.destination,
                    'date_debut': d.date_debut,
                    'date_fin': d.date_fin,
                }
                for d in demandes_recentes
            ]
        })



      


from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta





# Model or class: DashboardAssistantView.
# DashboardAssistantView: API view handler for incoming requests.
class DashboardAssistantView(APIView):
    permission_classes = [IsAssistantDPGR]

# Method: get.
# Method: get.
    def get(self, request):
        now = timezone.now()
        debut_mois = now.replace(day=1, hour=0, minute=0, second=0)
        mois_precedent = debut_mois - timedelta(days=1)
        debut_mois_prec = mois_precedent.replace(day=1)

        # ── KPIs ──
        demandes_ce_mois = Demande.objects.filter(date_soumission__gte=debut_mois).count()
        demandes_mois_prec = Demande.objects.filter(
            date_soumission__gte=debut_mois_prec,
            date_soumission__lt=debut_mois
        ).count()

        demandes_traitees = Demande.objects.filter(
            date_soumission__gte=debut_mois,
            statut__in=['APPROUVEE', 'REJETEE', 'CLOTUREE']
        ).count()
        demandes_traitees_prec = Demande.objects.filter(
            date_soumission__gte=debut_mois_prec,
            date_soumission__lt=debut_mois,
            statut__in=['APPROUVEE', 'REJETEE', 'CLOTUREE']
        ).count()

        chercheurs_actifs = Demande.objects.filter(
            date_soumission__gte=debut_mois
        ).values('chercheur').distinct().count()
        chercheurs_actifs_prec = Demande.objects.filter(
            date_soumission__gte=debut_mois_prec,
            date_soumission__lt=debut_mois
        ).values('chercheur').distinct().count()

        # delai moyen en jours
        delai_moyen = Demande.objects.filter(
            date_soumission__gte=debut_mois,
            statut__in=['APPROUVEE', 'REJETEE']
        ).aggregate(avg=Avg('duree_jours'))['avg'] or 0

        delai_moyen_prec = Demande.objects.filter(
            date_soumission__gte=debut_mois_prec,
            date_soumission__lt=debut_mois,
            statut__in=['APPROUVEE', 'REJETEE']
        ).aggregate(avg=Avg('duree_jours'))['avg'] or 0

# Method: delta.
# Method: delta.
        def delta(current, previous):
            if previous == 0:
                return 0
            return round(((current - previous) / previous) * 100, 1)

        kpis = {
            'demandes_ce_mois': {
                'value': demandes_ce_mois,
                'delta': delta(demandes_ce_mois, demandes_mois_prec)
            },
            'demandes_traitees': {
                'value': demandes_traitees,
                'delta': delta(demandes_traitees, demandes_traitees_prec)
            },
            'chercheurs_actifs': {
                'value': chercheurs_actifs,
                'delta': delta(chercheurs_actifs, chercheurs_actifs_prec)
            },
            'delai_moyen': {
                'value': round(delai_moyen, 1),
                'delta': delta(delai_moyen, delai_moyen_prec)
            },
        }

        # ── Évolution mensuelle (6 derniers mois) ──
        evolution_mensuelle = []
        for i in range(5, -1, -1):
            d = now - timedelta(days=30 * i)
            debut = d.replace(day=1, hour=0, minute=0, second=0)
            fin = (debut + timedelta(days=32)).replace(day=1)
            count = Demande.objects.filter(
                date_soumission__gte=debut,
                date_soumission__lt=fin
            ).count()
            evolution_mensuelle.append({
                'label': debut.strftime('%b'),
                'value': count
            })

        # ── Répartition par statut ──
        repartition_statut = {
            'en_attente': Demande.objects.filter(statut='EN_ATTENTE').count(),
            'approuvees': Demande.objects.filter(statut='APPROUVEE').count(),
            'en_cs': Demande.objects.filter(statut='DELIBERATION_CS').count(),
            'rejetees': Demande.objects.filter(statut='REJETEE').count(),
        }

       # Par type de séjour
        par_type = list(
    Demande.objects.filter(date_soumission__gte=debut_mois)
    .values(label=F('type_sejour__code'))
    .annotate(value=Count('id'))
    .order_by('-value')
)

# Par zone géographique
        par_zone = list(
    Demande.objects.filter(date_soumission__gte=debut_mois)
    .values(label=F('pays__zone__name'))
    .annotate(value=Count('id'))
    .order_by('-value')
)

# Destinations les plus demandées
        top_destinations = list(
    Demande.objects.filter(date_soumission__gte=debut_mois)
    .values(label=F('pays__name'))
    .annotate(value=Count('id'))
    .order_by('-value')[:5]
)

        # ── Délai de traitement ──
        delai_traitement = {
            'moins_24h': Demande.objects.filter(
                date_soumission__gte=debut_mois, duree_jours__lt=1
            ).count(),
            '1_3_jours': Demande.objects.filter(
                date_soumission__gte=debut_mois,
                duree_jours__gte=1, duree_jours__lte=3
            ).count(),
            '3_7_jours': Demande.objects.filter(
                date_soumission__gte=debut_mois,
                duree_jours__gt=3, duree_jours__lte=7
            ).count(),
            'plus_7_jours': Demande.objects.filter(
                date_soumission__gte=debut_mois, duree_jours__gt=7
            ).count(),
        }

        

        return Response({
            'kpis': kpis,
            'evolution_mensuelle': evolution_mensuelle,
            'repartition_statut': repartition_statut,
            'par_type': par_type,
            'par_zone': par_zone,
            'top_destinations': top_destinations,
            'delai_traitement': delai_traitement,
        })
# Model or class: DashboardAdminView.
# DashboardAdminView: API view handler for incoming requests.
class DashboardAdminView(APIView):
    permission_classes = [IsAdminDPGR]

# Method: get.
# Method: get.
    def get(self, request):
        demandes = Demande.objects.all()
        demandes_a_traiter = demandes.filter(statut='APPROUVE').order_by('-date_soumission')[:5]

        return Response({
            'total_demandes': demandes.count(),
            'demandes_par_statut': {
                'BROUILLON': demandes.filter(statut='BROUILLON').count(),
                'SOUMIS': demandes.filter(statut='SOUMIS').count(),
                'APPROUVE': demandes.filter(statut='APPROUVE').count(),
                'REJETE': demandes.filter(statut='REJETE').count(),
            },
            'total_chercheurs': User.objects.filter(role='CHERCHEUR').count(),
            'budget_total': demandes.filter(
                statut='APPROUVE'
            ).aggregate(Sum('montant_indemnite'))['montant_indemnite__sum'] or 0,
            'demandes_a_traiter': [
                {
                    'id': d.id,
                    'chercheur_nom': d.chercheur.nom,
                    'statut': d.statut,
                    'montant_indemnite': d.montant_indemnite,
                    'destination': d.destination,
                }
                for d in demandes_a_traiter
            ],
            'statistiques_par_destination': list(
                demandes.values('destination').annotate(total=Sum('id')).order_by('-total')[:5]
            )
        })


# Model or class: DashboardSuperAdminView.
# DashboardSuperAdminView: API view handler for incoming requests.
class DashboardSuperAdminView(APIView):
    permission_classes = [IsSuperAdmin]

# Method: get.
# Method: get.
    def get(self, request):
        session_courante = Session.objects.filter(etat='OUVERTE').first()

        return Response({
            'total_utilisateurs': User.objects.count(),
            'utilisateurs_par_role': {
                'CHERCHEUR': User.objects.filter(role='CHERCHEUR').count(),
                'ASSISTANT_DPGR': User.objects.filter(role='ASSISTANT_DPGR').count(),
                'ADMIN_DPGR': User.objects.filter(role='ADMIN_DPGR').count(),
                'SUPER_ADMIN': User.objects.filter(role='SUPER_ADMIN').count(),
            },
            'total_demandes': Demande.objects.count(),
            'total_sessions': Session.objects.count(),
            'session_courante': {
                'id': session_courante.id,
                'annee_academique': session_courante.annee_academique,
                'etat': session_courante.etat,
            } if session_courante else None,
            'total_laboratoires': Laboratoire.objects.count(),
            'total_pays': pays.objects.count(),
            'total_types_sejour': typeSejour.objects.count(),
        })
    
from rest_framework.permissions import AllowAny

# Model or class: LandingStatsView.
# LandingStatsView: API view handler for incoming requests.
class LandingStatsView(APIView):
    permission_classes = [AllowAny]

# Method: get.
# Method: get.
    def get(self, request):
        return Response({
            'total_chercheurs': User.objects.filter(role='CHERCHEUR').count(),
            'total_demandes': Demande.objects.count(),
            'total_sejours_approuves': Demande.objects.filter(statut='APPROUVEE').count(),
        })
