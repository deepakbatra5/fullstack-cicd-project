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
