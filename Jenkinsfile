pipeline {
    agent any
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Verify Tools') {
            steps {
                echo 'Verifying installed tools...'
                bat 'terraform --version'
                bat 'ansible --version'
            }
        }
        
        stage('Terraform Init') {
            steps {
                echo 'Initializing Terraform...'
                dir('terraform') {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        bat 'terraform init'
                    }
                }
            }
        }
        
        stage('Terraform Plan') {
            steps {
                echo 'Planning Terraform changes...'
                dir('terraform') {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        bat 'terraform plan -out=tfplan'
                    }
                }
            }
        }
        
        stage('Terraform Apply') {
            steps {
                echo 'Applying Terraform changes...'
                dir('terraform') {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        bat 'terraform apply -auto-approve tfplan'
                        script {
                            env.EC2_IP = bat(
                                returnStdout: true, 
                                script: 'terraform output -raw ec2_public_ip'
                            ).trim()
                            echo "EC2 Instance IP: ${env.EC2_IP}"
                        }
                    }
                }
            }
        }
        
        stage('Wait for EC2 Initialization') {
            steps {
                echo 'Waiting for EC2 instance to initialize...'
                sleep(time: 90, unit: 'SECONDS')
            }
        }
        
        stage('Generate Ansible Inventory') {
            steps {
                echo 'Generating Ansible inventory file...'
                script {
                    def inventoryContent = """[webservers]
${env.EC2_IP} ansible_user=ec2-user ansible_ssh_private_key_file=C:/jenkins-ssh-keys/ec2-key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
"""
                    writeFile file: 'ansible/inventory.ini', text: inventoryContent
                    echo "Inventory created with IP: ${env.EC2_IP}"
                }
            }
        }
        
        stage('Ansible Deployment') {
            steps {
                echo 'Deploying application with Ansible...'
                dir('ansible') {
                    bat 'ansible-playbook -i inventory.ini playbook.yml'
                }
            }
        }
        
        stage('Verification') {
            steps {
                echo 'Verifying deployment...'
                script {
                    echo "Application should be accessible at: http://${env.EC2_IP}"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Access your application at: http://${env.EC2_IP}"
        }
        failure {
            echo 'Pipeline failed! Rolling back...'
            dir('terraform') {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    bat 'terraform destroy -auto-approve'
                }
            }
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}