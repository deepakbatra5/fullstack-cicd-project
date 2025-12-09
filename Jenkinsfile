pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Terraform Init') {
            steps {
                bat """
                    terraform init
                """
            }
        }

        stage('Terraform Validate') {
            steps {
                bat """
                    terraform validate
                """
            }
        }

        stage('Terraform Plan') {
            steps {
                bat """
                    terraform plan -out=tfplan
                """
            }
        }

        stage('Terraform Apply') {
            steps {
                bat """
                    terraform apply -auto-approve tfplan
                """
            }
        }
    }

    post {
        success {
            echo "Terraform CICD Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
