
import cloudinary
import cloudinary.api


# Utility functions and helper code.

cloudinary.config(
    cloud_name='dplaxtndw',
    api_key='656715264641373',
    api_secret='RvaJnJxy-ZsYdOTSk2t5V-DJky8'
)

# Method: unblock_all.
# Function: unblock_all.
def unblock_all():
    total = 0
    for resource_type in ['raw', 'image']:
        next_cursor = None
        while True:
            params = {
                'type': 'upload',
                'resource_type': resource_type,
                'max_results': 100,
            }
            if next_cursor:
                params['next_cursor'] = next_cursor

            result = cloudinary.api.resources(**params)
            resources = result.get('resources', [])
            print(f"[{resource_type}] Trouvé : {len(resources)} fichiers")

            for r in resources:
                public_id = r['public_id']
# Error handling block.
                try:
                    cloudinary.api.update(
                        public_id,
                        resource_type=resource_type,
                        type='upload',
                        access_control=[{"access_type": "anonymous"}]
                    )
                    print(f" Débloqué : {public_id}")
                    total += 1
                except Exception as e:
                    print(f" {public_id} : {e}")

            next_cursor = result.get('next_cursor')
            if not next_cursor:
                break

    print(f"\nTerminé ! {total} fichiers débloqués.")

unblock_all()
