.PHONY: help dev deploy update stop logs restart clean ssl info

help: ## Affiche l'aide
	@echo "🕌 Quran Recitation App - Commandes Disponibles"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

dev: ## Démarrer en mode développement
	./start.sh

deploy: ## Déployer en production (Docker)
	chmod +x deploy.sh && ./deploy.sh

update: ## Mettre à jour l'application
	chmod +x update.sh && ./update.sh

stop: ## Arrêter l'application
	docker-compose -f docker-compose.prod.yml down

logs: ## Voir les logs
	docker-compose -f docker-compose.prod.yml logs -f

logs-backend: ## Voir les logs du backend uniquement
	docker-compose -f docker-compose.prod.yml logs -f backend

logs-frontend: ## Voir les logs du frontend uniquement
	docker-compose -f docker-compose.prod.yml logs -f frontend

restart: ## Redémarrer l'application
	docker-compose -f docker-compose.prod.yml restart

status: ## Voir le statut des conteneurs
	docker-compose -f docker-compose.prod.yml ps

clean: ## Nettoyer les conteneurs et images
	docker-compose -f docker-compose.prod.yml down
	docker image prune -f
	docker volume prune -f

ssl: ## Configurer SSL/HTTPS
	chmod +x setup-ssl.sh && sudo ./setup-ssl.sh

info: ## Afficher les informations de déploiement
	chmod +x show-deployment-info.sh && ./show-deployment-info.sh

backup: ## Créer une sauvegarde
	tar -czf backup-$$(date +%Y%m%d-%H%M%S).tar.gz \
		--exclude='node_modules' \
		--exclude='venv' \
		--exclude='.next' \
		--exclude='__pycache__' \
		.

install-docker: ## Installer Docker (Ubuntu/Debian)
	curl -fsSL https://get.docker.com | sh
	sudo usermod -aG docker $$USER
	@echo "⚠️  Déconnectez-vous et reconnectez-vous pour que les changements prennent effet"
