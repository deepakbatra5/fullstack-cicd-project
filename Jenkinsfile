pipeline {
    agent any

    stages {

        stage('SSH Test to EC2') {
            steps {
                sshagent(['ec2-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@18.207.136.4 'echo Connected Successfully'
                    """
                }
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

        stage('Deploy App to EC2 (Docker)') {
            steps {
                sshagent(['ec2-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@18.207.136.4 '
                            cd /home/ubuntu/fullstack-cicd-project &&
                            docker-compose pull &&
                            docker-compose up -d --build
                        '
                    """
                }
            }
        }

    }  // <-- END stages

    post {
        success {
            echo "Terraform + SSH Deployment Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
