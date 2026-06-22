
from rest_framework import serializers
from .models import User,ProfilChercheur
from parametres.models import Grade

# Model or class: UserSerializer.

# Serializers for converting between model instances and JSON data.

# UserSerializer: Model class for database operations.
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    grade = serializers.SerializerMethodField()
    grade_id = serializers.PrimaryKeyRelatedField(
        queryset=Grade.objects.all(),
        source='profil.grade',
        write_only=True,
        required=False,
        allow_null=True,
    )
    laboratoire = serializers.SerializerMethodField()
    anciennete = serializers.SerializerMethodField()
    nombre_sejours_effectues = serializers.SerializerMethodField()

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'nom', 'prenom', 'role',
            'date_joined', 'is_active','telephone',
            'grade', 'grade_id', 'laboratoire', 'anciennete', 'nombre_sejours_effectues'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active']

# Method: create.
# Handler for creating new records: create.
    def create(self, validated_data):
        profil_data = validated_data.pop('profil', {})
        grade = profil_data.get('grade')
        user = User.objects.create_user(**validated_data)

        if user.role == 'CHERCHEUR' and grade:
            profil, _ = ProfilChercheur.objects.get_or_create(user=user)
            profil.grade = grade
            profil.save(update_fields=['grade'])

        return user

# Getter method: get_grade.
# Getter function: get_grade.
    def get_grade(self, obj):
        if hasattr(obj, 'profil') and obj.profil.grade:
            return obj.profil.grade.nom #jai supprimer le libelle  donc jai remplacer par nom
        return None

# Getter method: get_laboratoire.
# Getter function: get_laboratoire.
    def get_laboratoire(self, obj):
        if hasattr(obj, 'profil') and obj.profil.laboratoire:
            return obj.profil.laboratoire.name
        return None

# Getter method: get_anciennete.
# Getter function: get_anciennete.
    def get_anciennete(self, obj):
        if hasattr(obj, 'profil'):
            return obj.profil.anciennete
        return None

# Getter method: get_nombre_sejours_effectues.
# Getter function: get_nombre_sejours_effectues.
    def get_nombre_sejours_effectues(self, obj):
        if hasattr(obj, 'profil'):
            return obj.profil.nombre_sejours_effectues
        return None



# Model or class: ProfilChercheurSerializer.
# ProfilChercheurSerializer: Model class for database operations.
class ProfilChercheurSerializer(serializers.ModelSerializer):
    laboratory_name = serializers.SerializerMethodField()
    
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = ProfilChercheur
        fields = '__all__'
        read_only_fields = ['id', 'matricule_esi', 'email_professionnel']

# Getter method: get_laboratory_name.
# Getter function: get_laboratory_name.
    def get_laboratory_name(self, obj):
        if obj.laboratoire:
            return obj.laboratoire.name
        return None
