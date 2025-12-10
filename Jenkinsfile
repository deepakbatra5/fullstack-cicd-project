pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git'
            }
        }

        stage('Terraform Init/Plan/Apply') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials'
                ]]) {

                    dir('infra/terraform') {

                        bat 'terraform init'

                        bat '''
                            terraform plan ^
                            -var "ami_id=ami-03deb8c961063af8c" ^
                            -var "key_name=fullstack-cicd"
                        '''

                        bat '''
                            terraform apply -auto-approve ^
                            -var "ami_id=ami-03deb8c961063af8c" ^
                            -var "key_name=fullstack-cicd"
                        '''
                    }
                }
            }
        }

        stage('Wait for EC2 Server') {
            steps {
                echo "Waiting 60 seconds for EC2 to boot..."
                sleep(time: 60, unit: "SECONDS")
            }
        }

        stage('Run Ansible Deployment') {
            steps {

                // Use SSH private key saved in Jenkins
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {

                    dir('infra/ansible') {
                        bat '''
                            ansible-playbook -i inventory.ini deploy.yml ^
                            --private-key "%SSH_KEY%"
                        '''
                    }
                }
            }
        }
    }
}
