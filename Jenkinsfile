pipeline {
    agent any

    stages {

        /* -----------------------------
           1. CHECKOUT SOURCE CODE
        ------------------------------*/
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/deepakbatra5/fullstack-cicd-project.git'
            }
        }

        /* -----------------------------
           2. TERRAFORM (INIT/PLAN/APPLY)
        ------------------------------*/
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

        /* -----------------------------
           3. WAIT FOR EC2 TO BOOT
        ------------------------------*/
        stage('Wait for EC2 Server') {
            steps {
                echo "Waiting 60 seconds for EC2 to boot..."
                sleep(time: 60, unit: "SECONDS")
            }
        }

        /* -----------------------------
           4. RUN ANSIBLE USING WSL
        ------------------------------*/
        stage('Run Ansible Deployment') {
            steps {

                // Load SSH private key from Jenkins credentials
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'SSH_KEY'
                )]) {

                    dir('infra/ansible') {

                        bat """
                            echo Running Ansible via WSL...

                            REM Create SSH directory inside WSL
                            // wsl mkdir -p ~/.ssh

                            // REM Convert Windows path → WSL path & copy PEM key
                            // wsl cp "`wslpath "%SSH_KEY%"`" ~/.ssh/fullstack-cicd.pem

                            // REM Fix permissions
                            // wsl chmod 600 ~/.ssh/fullstake-cicd.pem

                            REM Run Ansible playbook
                            wsl ansible-playbook -i inventory.ini deploy.yml --private-key ~/.ssh/fullstack-cicd.pem
                        """
                    }
                }
            }
        }
    }

}
