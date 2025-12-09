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
                bat 'wsl ansible --version'
            }
        }

        /* ------------------ TERRAFORM STAGES ------------------ */

        stage('Terraform Init') {
            steps {
                echo 'Initializing Terraform...'
                dir('infra/terraform') {
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
                dir('infra/terraform') {
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
                dir('infra/terraform') {
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

        /* ------------------ ANSIBLE / DEPLOYMENT ------------------ */

        stage('Prepare SSH Key for WSL') {
            steps {
                echo 'Preparing SSH key for Ansible inside WSL...'

                bat '''
                    mkdir C:\\jenkins-ssh-keys || exit 0
                    copy C:\\Users\\Deepa\\.ssh\\fullstack-cicd.pem C:\\jenkins-ssh-keys\\ec2-key.pem
                    wsl mkdir -p /tmp/jenkins-ssh
                    wsl cp /mnt/c/jenkins-ssh-keys/ec2-key.pem /tmp/jenkins-ssh/ec2-key.pem
                    wsl chmod 400 /tmp/jenkins-ssh/ec2-key.pem
                '''
            }
        }

        stage('Generate Ansible Inventory') {
            steps {
                echo 'Generating Ansible inventory file...'

                script {
                    def inventory = """[webservers]
${env.EC2_IP} ansible_user=ubuntu ansible_ssh_private_key_file=/tmp/jenkins-ssh/ec2-key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
"""
                    writeFile file: 'ansible/inventory.ini', text: inventory
                }

                echo "Inventory created with IP: ${env.EC2_IP}"
            }
        }

        stage('Ansible Deployment') {
            steps {
                echo 'Deploying application to EC2 using Ansible (WSL)...'

                dir('ansible') {
                    bat '''
                        wsl bash -c "cd $(wslpath '%CD%') && ansible-playbook -i inventory.ini playbook.yml"
                    '''
                }
            }
        }

        stage('Verification') {
            steps {
                echo "Application deployed successfully!"
                echo "URL: http://${env.EC2_IP}"
            }
        }

    }  // END STAGES

    post {
        success {
            echo '========================================='
            echo 'PIPELINE COMPLETED SUCCESSFULLY'
            echo "APP URL: http://${env.EC2_IP}"
            echo '========================================='
        }
        failure {
            echo '❌ Pipeline failed! Attempting rollback...'
            script {
                try {
                    dir('infra/terraform') {
                        withCredentials([[
                            $class: 'AmazonWebServicesCredentialsBinding',
                            credentialsId: 'aws-credentials',
                            accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                            secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                        ]]) {
                            bat 'terraform destroy -auto-approve'
                        }
                    }
                } catch (Exception e) {
                    echo "Rollback failed: ${e.message}"
                }
            }
        }
        always {
            echo 'Cleaning workspace...'
            cleanWs()
        }
    }
}
