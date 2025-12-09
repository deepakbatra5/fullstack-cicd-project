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
                // Check Ansible via WSL
                bat 'wsl ansible --version'
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
        
        
        }
        
        stage('Generate Ansible Inventory') {
            steps {
                echo 'Generating Ansible inventory file...'
                script {
                    // Use WSL path for SSH key
                    def inventoryContent = """[webservers]
${env.EC2_IP} ansible_user=ec2-user ansible_ssh_private_key_file=~/.ssh/fullstack-cicd.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
"""
                    writeFile file: 'ansible/inventory.ini', text: inventoryContent
                    echo "Inventory created with IP: ${env.EC2_IP}"
                }
            }
        }
        
        stage('Ansible Deployment') {
            steps {
                echo 'Deploying application with Ansible via WSL...'
                dir('ansible') {
                    bat '''
                        wsl bash -c "cd $(wslpath '%CD%') && ansible-playbook -i inventory.ini playbook.yml"
                    '''
                }
            }
        }
        
        stage('Verification') {
            steps {
                echo 'Verifying deployment...'
                script {
                    echo "========================================="
                    echo "Application deployed successfully!"
                    echo "Access your application at: http://${env.EC2_IP}"
                    echo "========================================="
                }
            }
        }
    }
    
    post {
        success {
            echo '========================================='
            echo '✅ Pipeline completed successfully!'
            echo "🌐 Access your application at: http://${env.EC2_IP}"
            echo '========================================='
        }
        failure {
            echo '❌ Pipeline failed! Rolling back...'
            script {
                try {
                    dir('terraform') {
                        withCredentials([[
                            $class: 'AmazonWebServicesCredentialsBinding',
                            credentialsId: 'aws-credentials',
                            accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                            secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                        ]]) {
                            bat 'terraform destroy -auto-approve'
                            echo 'Terraform resources destroyed successfully'
                        }
                    }
                } catch (Exception e) {
                    echo "⚠️ Rollback encountered an issue: ${e.message}"
                    echo "Please manually check and destroy resources in AWS console"
                }
            }
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
```

## Key Changes Made:

1. **Verify Tools Stage**: Changed to `wsl ansible --version` to check Ansible in Ubuntu/WSL

2. **Prepare SSH Key Stage**: Added a new stage that:
   - Copies SSH key from Windows to WSL temporary location
   - Sets proper permissions (chmod 400)

3. **Generate Inventory Stage**: Uses WSL path `/tmp/jenkins-ssh/ec2-key.pem` instead of Windows path

4. **Ansible Deployment Stage**: 
   - Uses `wsl bash -c` to run Ansible commands in WSL
   - Converts current Windows directory to WSL path using `wslpath`

5. **Better Error Handling**: Added try-catch in rollback to prevent credential errors from stopping the post actions

---

## Prerequisites Before Running:

### 1. Ensure SSH Key is in the Right Location

Make sure your EC2 `.pem` key file is here:
```
C:\jenkins-ssh-keys\ec2-key.pem