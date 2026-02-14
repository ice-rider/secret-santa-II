variable "DEFAULT_TAG" {
  default = "latest"
}

group "default" {
  targets = ["frontend", "backend"]
}

target "backend" {
  context = "./SecretSantaServer/SecretSantaServer"
  dockerfile = "Dockerfile"
  tags = ["secret-santa-ii-backend:${DEFAULT_TAG}"]
}

target "frontend" {
  context = "./secret-santa"
  dockerfile = "Dockerfile"
  tags = ["secret-santa-ii-frontend:${DEFAULT_TAG}"]
  args = {
    VITE_API_BASE_URL = "/api"
    VITE_SIGNALR_HUB_URL = "/hubs/game"
    VITE_OAUTH_REDIRECT_URI = "/auth/callback"
  }
}

target "nginx" {
  context = "."
  dockerfile = "nginx-fixed.Dockerfile"
  tags = ["secret-santa-ii-nginx:${DEFAULT_TAG}"]
}

# Общий таргет для всего приложения
group "app" {
  targets = ["backend", "frontend"]
}