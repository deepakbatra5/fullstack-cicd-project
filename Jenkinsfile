pipeline {
    agent any
    
    
    environment {
        // Method 1: If using AWS Credentials Plugin
        AWS_DEFAULT_REGION = 'us-east-1'
        // Method 1: If using AWS Credentials Plugin
        AWS_DEFAULT_REGION = 'us-east-1'
    }
    
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git',
                        credentialsId: 'github-token'
                    ]]
                ])
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git',
                        credentialsId: 'github-token'
                    ]]
                ])
            }
        }
        
        stage('Terraform') {
        
        stage('Terraform') {
            steps {
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]
                ]) {
                    dir('terraform') {
                        bat 'terraform init'
                        bat 'terraform apply -auto-approve'
                    }
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]
                ]) {
                    dir('terraform') {
                        bat 'terraform init'
                        bat 'terraform apply -auto-approve'
                    }
                }
            }
        }
        
        stage('Ansible') {
        
        stage('Ansible') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    dir('ansible') {
                        bat 'ansible-playbook -i inventory.ini playbook.yml'
                    }
                }
            }
                sshagent(['ec2-ssh-key']) {
                    dir('ansible') {
                        bat 'ansible-playbook -i inventory.ini playbook.yml'
                    }
                }
            }
        }
    }
}