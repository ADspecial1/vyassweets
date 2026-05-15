pipeline {
    agent any

    environment {
        APP_DIR = '/home/ubuntu/sweets-app/server'
        PM2_APP  = 'vyas-sweets-api'
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins checks out the repo automatically (configured in job)
                echo "Branch: ${env.GIT_BRANCH}"
            }
        }

        stage('Install') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm ci --omit=dev'
                }
            }
        }

        stage('Type Check') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm run typecheck'
                }
            }
        }

        stage('Build') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                dir("${APP_DIR}") {
                    // Restart or start if not running
                    sh '''
                        if pm2 list | grep -q "${PM2_APP}"; then
                            pm2 restart ${PM2_APP}
                        else
                            pm2 start ecosystem.config.cjs --env production
                        fi
                        pm2 save
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployed successfully"
        }
        failure {
            echo "Build/deploy failed — check logs above"
        }
    }
}
