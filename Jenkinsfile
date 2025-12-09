pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Terraform Init') {
            steps {
                bat """
                    cd infra/terraform
                    terraform init
                """
            }
        }

        stage('Terraform Validate') {
            steps {
                bat """
                    cd infra/terraform
                    terraform validate
                """
            }
        }

        stage('Terraform Plan') {
            steps {
                bat """
                    cd infra/terraform
                    terraform plan -out=tfplan
                """
            }
        }

        stage('Terraform Apply') {
            steps {
                bat """
                    cd infra/terraform
                    terraform apply -auto-approve tfplan
                """
            }
        }

    }

    post {
        success {
            echo "Terraform Pipeline Completed Successfully!"
        }
        failure {
            echo "Pipeline Failed!"
        }
    }
}
