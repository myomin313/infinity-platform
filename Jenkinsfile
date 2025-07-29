pipeline {
  agent any

  parameters {
    string(name: 'BRANCH', defaultValue: 'test', description: 'Git branch to deploy (e.g., test, dev, prod)')
  }

  environment {
    DEPLOY_USER = "jenkins"  // Update if needed
    DEPLOY_HOST = "31.97.125.9"
    TARGET_DIR = "/var/www/html/${params.BRANCH}/ost-platform-api"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {

    stage('📥 Checkout from GitLab') {
      steps {
        echo "Checking out '${params.BRANCH}' branch from GitLab..."
        git branch: "${params.BRANCH}",
            credentialsId: 'gitlab-ssh',
            url: 'git@gitlab.com:myominost/ost-platform-api.git'
      }
    }

    stage('🔧 Build API') {
      steps {
        echo "Running npm install and optional build for '${params.BRANCH}'..."
        sh '''
          npm install
          npm run build || echo "⚠️  No build step defined"
        '''
      }
    }

    stage('🚀 Deploy to Server') {
      steps {
        echo "Deploying to ${DEPLOY_HOST}:${TARGET_DIR} and restarting PM2 app..."

        sshagent(credentials: ['deploy-key']) {
          sh """
            rsync -avz --delete ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${TARGET_DIR}

            ssh ${DEPLOY_USER}@${DEPLOY_HOST} bash -c '
              cd ${TARGET_DIR} &&
              if pm2 describe ost-api > /dev/null; then
                echo "🔁 Reloading PM2 process ost-api..." &&
                pm2 reload ost-api
              else
                echo "🚀 Starting new PM2 process ost-api..." &&
                pm2 start app.js --name ost-api
              fi &&
              pm2 save
            '
          """
        }
      }
    }
  }
}
