pipeline {
    agent any
    environment {
        PROJECT_ID = 'anom-project-444318' // Replace with your GCP project ID
        SERVICE_NAME = 'app-demo'   // Replace with your Cloud Run service name
        REGION = 'us-central1'                // Replace with your desired GCP region
        ARTIFACT_PATH = "us-central1-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}"
        CONTAINER_NAME = 'app-demo-container'
        JMETER = "/home/anomsentanu/apache-jmeter-5.6.3/bin"
        JMETER_LOG = "log-${env.BUILD_NUMBER}"
        JMETER_REPORT = "./report-${env.BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Unit Test') {
            steps {
                // Unit test
                nodejs(nodeJSInstallationName: 'node 23') {
                    sh """
                    npm install
                    npm test
                    """
                }
            } 
            // post {
            //     always {
            //     step([$class: 'CoberturaPublisher', coberturaReportFile: 'output/coverage/jest/cobertura-coverage.xml'])
            //     }
            // }
        }

        stage('Build Docker Image') {
            steps {
                // Build the Docker image
                script {
                    sh "sudo docker build -t ${SERVICE_NAME} -f Dockerfile ."
                }
            }
        }

        stage('Snyk Testing') {
            steps {
                echo 'Testing...'
                snykSecurity(
                snykInstallation: 'snyk-demo',
                snykTokenId: 'SNYK_TOKEN',
                // place other parameters here
                )
            }
        }

        stage('Run as Container Docker Image') {
            steps {
                script {
                    // Stop and remove any existing container with the same name
                    sh """
                    if [ \$(sudo docker ps -q -f name=${CONTAINER_NAME}) ]; then
                        echo "Stopping and removing existing container..."
                        sudo docker stop ${CONTAINER_NAME}
                    fi
                    """

                    // Run the new container
                    sh """
                    sudo docker run -it -d --rm --name ${CONTAINER_NAME} -p 8083:8080 ${SERVICE_NAME}
                    sudo docker image prune -f
                    """
                }
            }
        }

        stage('Jmeter Testing') {
            steps {
                script {
                    sh "sudo ${JMETER}/jmeter -n -t jmeter-demo.jmx -l ./${JMETER_LOG}.jtl -e -o ${JMETER_REPORT}"
                }
            }
        }

        stage('Jmeter Publish Report') {
            steps {
                // Archive the .jtl result file
                archiveArtifacts artifacts: "${JMETER_LOG}.jtl", fingerprint: true
                // Publish Performance Report using Jenkins Performance Plugin
                perfReport sourceDataFiles: "${JMETER_LOG}.jtl"
            }
        }

        stage('Scanning Owasp ZAP') {
            steps {
                script {
                    sh """
                        sudo docker run -dt --name owasp zaproxy/zap-stable /bin/bash
                        sudo docker exec owasp mkdir /zap/wrk
                        sudo docker exec owasp zap-baseline.py -t http://34.30.50.182:8083 -r report.html -I
                        sudo docker cp owasp:/zap/wrk/report.html ./report-zap-${env.BUILD_NUMBER}.html
                        sudo docker stop owasp
                        sudo docker rm owasp
                    """
                }
            }
        }

        stage('Publish Owasp Report') {
            steps {
                publishHTML (
                    target : [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: './',
                        reportFiles: "report-zap-${env.BUILD_NUMBER}.html",
                        reportName: 'Owasp ZAP Report',
                        reportTitles: 'ZAP Report'
                    ]
                )
            }
        }

        // stage('Restore') {
        //     steps {
        //         sh "dotnet restore ZiggyRafiqConsoleApp.sln"
        //     }
        // }

        // stage('Build') {
        //     steps {
        //         sh "dotnet build ZiggyRafiqConsoleApp.sln --no-restore -c Release"
        //     }
        // }

        // stage('Test') {
        //     steps {
        //         sh "dotnet test DotNet8App.Tests/DotNet8App.Tests.csproj --no-build -c Release --collect:\"XPlat Code Coverage\""
        //     }
        // }

        // stage('Publish') {
        //     steps {
        //         sh "dotnet publish ZiggyRafiqConsoleApp/ZiggyRafiqConsoleApp.csproj -c Release -o publish"
        //         archiveArtifacts artifacts: 'publish/**', fingerprint: true
        //     }
        // }

        // stage('Authenticate with Google Cloud') {
        //     steps {
        //         script {
        //             // Use the secret file to authenticate with Google Cloud
        //             withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_CREDENTIALS')]) {
        //                 sh "gcloud auth activate-service-account --key-file=${GOOGLE_CREDENTIALS}"
        //                 sh "gcloud config set project ${PROJECT_ID}"
        //             }
        //         }
        //     }
        // }

        // stage('Push Docker Image') {
        //     steps {
        //         script {
        //             // Push the Docker image to Google Container Registry
        //             sh "yes |sudo gcloud auth configure-docker ${ARTIFACT_PATH}"
        //             sh "sudo docker tag ${SERVICE_NAME}:latest ${ARTIFACT_PATH}/${SERVICE_NAME}:latest"
        //             sh "sudo docker push ${ARTIFACT_PATH}/${SERVICE_NAME}:latest"
        //         }
        //     }
        // }

        // stage('Deploy to Cloud Run') {
        //     steps {
        //         script {
        //             // Deploy the Docker image to Cloud Run
        //             sh "gcloud run deploy ${SERVICE_NAME} --image=${ARTIFACT_PATH}/${SERVICE_NAME} --region ${REGION} --project=${PROJECT_ID} --platform managed --use-http2 --allow-unauthenticated --port=8080"
        //         }
        //     }
        // }
    }
}