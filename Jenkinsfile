pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION    = 'ap-south-1'   // change if needed
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    bat "terraform init"
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    bat "terraform plan -out=tfplan"
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    bat "terraform apply -auto-approve tfplan"
                }
            }
        }

        stage('Read EC2 IP from Terraform') {
            steps {
                script {
                    def output = bat(
                        script: "cd terraform && terraform output -raw ec2_public_ip",
                        returnStdout: true
                    ).trim()

                    echo "EC2 Public IP: ${output}"
                    env.EC2_IP = output
                }
            }
        }

        stage('Run Ansible (via WSL)') {
            steps {
                script {
                    // WSL command runs ansible-playbook inside Ubuntu
                    // Note the dynamic inventory: "<ip>,"
                    def cmd = """
wsl ansible-playbook -i ${env.EC2_IP}, -u ubuntu \\
  --private-key ~/.ssh/jenkins-key.pem \\
  ansible/deploy.yml
"""
                    bat cmd
                }
            }
        }
    }

    post {
        success {
            echo "✅ Full CI/CD finished: Terraform created infra, Ansible configured EC2, app deployed."
        }
        failure {
            echo "❌ Pipeline failed. Check Terraform or Ansible logs in Jenkins console."
        }
    }
}
                                                 