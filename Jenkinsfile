pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git'
            }
        }

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

