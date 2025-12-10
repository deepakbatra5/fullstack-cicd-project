pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git'
            }
        }

        stage('Terraform Init') {
            steps {
                dir('infra/terraform') {
                    bat 'terraform init'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('infra/terraform') {
                    bat '''
                        terraform plan ^
                        -var "ami_id=ami-03deb8c961063af8c" ^
                        -var "key_name=fullstack-cicd"
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('infra/terraform') {
                    bat '''
                        terraform apply -auto-approve ^
                        -var "ami_id=ami-03deb8c961063af8c" ^
                        -var "key_name=fullstack-cicd"
                    '''
                }
            }
        }
    }
}
