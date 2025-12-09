pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                powershell """
                    Write-Host 'Building project...'
                    # Example for NodeJS
                    npm install
                """
            }
        }

        stage('Test') {
            steps {
                powershell """
                    Write-Host 'Running tests...'
                    # Example
                    npm test
                """
            }
        }

        stage('Deploy') {
            steps {
                powershell """
                    Write-Host 'Starting Application...'
                    # Example Local Deployment
                    node app.js
                """
            }
        }
    }

    post {
        success { echo 'Pipeline Completed Successfully' }
        failure { echo 'Pipeline Failed' }
    }
}
