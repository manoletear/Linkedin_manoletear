"""Cliente para la API de LinkedIn."""

import requests


class LinkedInClient:
    """Maneja la comunicación con la API de LinkedIn."""

    BASE_URL = "https://api.linkedin.com/v2"
    POSTS_URL = "https://api.linkedin.com/rest/posts"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self._person_id = None

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202401",
        }

    def get_profile(self) -> dict:
        """Obtiene el perfil del usuario autenticado."""
        response = requests.get(
            f"{self.BASE_URL}/userinfo",
            headers=self._headers,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()

    def get_person_id(self) -> str:
        """Obtiene el ID (sub) del usuario autenticado."""
        if self._person_id is None:
            profile = self.get_profile()
            self._person_id = profile["sub"]
        return self._person_id

    def create_post(self, text: str) -> dict:
        """Publica un post de texto en LinkedIn.

        Args:
            text: Contenido del post.

        Returns:
            Respuesta de la API de LinkedIn.
        """
        person_id = self.get_person_id()

        payload = {
            "author": f"urn:li:person:{person_id}",
            "commentary": text,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
        }

        response = requests.post(
            self.POSTS_URL,
            headers=self._headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        return {"status": "published", "status_code": response.status_code}

    def validate_token(self) -> bool:
        """Verifica si el access token es válido."""
        try:
            self.get_profile()
            return True
        except requests.exceptions.HTTPError:
            return False
