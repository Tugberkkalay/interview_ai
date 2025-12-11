"""
Management command - DEPRECATED
Kredi sisteminde aylık reset yok, bu komut artık kullanılmıyor.
Krediler bitene kadar kullanılır, aylık sıfırlama yapılmaz.
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'DEPRECATED: Kredi sisteminde aylık reset yok. Bu komut artık kullanılmıyor.'

    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.WARNING(
                "⚠️  Bu komut artık kullanılmıyor!\n"
                "Kredi sisteminde aylık reset yok. Krediler bitene kadar kullanılır.\n"
                "Kredi eklemek için admin panelinden 'Kredi Ekle' action'ını kullanın."
            )
        )

