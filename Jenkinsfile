#!groovy

// Uses the Jenkins Declarative Pipeline -
// https://jenkins.io/doc/book/pipeline/syntax/#declarative-pipeline

// ProTip: If you're debugging changes to this file, use the replay feature in
// Jenkins rather than the commit/watch/fix cycle:
//   1. Go to https://jenkins.zooniverse.org/job/Zooniverse%20GitHub/job/front-end-monorepo/
//   2. Find your branch and click on it
//   3. Pick a build from the list in the sidebar
//   4. Click 'Replay' in the sidebar
//   5. You should get an editor where you can modify the pipeline and run it
//      again immediately <3

pipeline {
  agent none

  options {
    quietPeriod(120) // builds happen at least 120 seconds apart
    disableConcurrentBuilds()
  }

  stages {

    // Right now, we're *only* building and deploying on the `master` branch;
    // longer-term, we'll want to deploy feature branches as well.

    stage('Build base Docker image') {
      when { branch 'master' }
      agent any
      steps {
        script {
          def dockerRepoName = 'zooniverse/front-end-monorepo'
          def dockerImageName = "${dockerRepoName}:${BRANCH_NAME}"
          def newImage = docker.build(dockerImageName, "--target bootstrap ./")
          newImage.push()
          newImage.push('latest')
        }
      }
    }

    stage('Build app images') {
      when {
        anyOf {
          branch 'master'
          tag 'production-release'
        }
      }

      parallel {
        stage('Build @zooniverse/fe-content-pages') {
          agent any

          environment {
            APP_ENV = "${env.TAG_NAME == "production-release" ? "production" : "staging"}"
            ASSET_PREFIX = "${env.TAG_NAME == "production-release" ? "https://fe-content-pages.zooniverse.org" : "https://fe-content-pages.preview.zooniverse.org"}"
            COMMIT_ID = "${GIT_COMMIT}"
            CONTENTFUL_ACCESS_TOKEN = credentials('contentful-access-token')
            CONTENTFUL_SPACE_ID = credentials('contentful-space-ID')
            SENTRY_DSN = 'https://1f0126a750244108be76957b989081e8@sentry.io/1492498'
          }

          steps {
            dir ('packages/app-content-pages') {
              script {
                def dockerRepoName = 'zooniverse/fe-content-pages-${APP_ENV}'
                def dockerImageName = "${dockerRepoName}:${GIT_COMMIT}"
                def buildArgs = "--build-arg APP_ENV --build-arg ASSET_PREFIX --build-arg COMMIT_ID --build-arg CONTENTFUL_ACCESS_TOKEN --build-arg CONTENTFUL_SPACE_ID --build-arg SENTRY_DSN ."
                def newImage = docker.build(dockerImageName, buildArgs)
                newImage.push()
                newImage.push('latest')
              }
            }
          }
        }
        stage('Build @zooniverse/fe-project') {
          agent any

          environment {
            APP_ENV = "${env.TAG_NAME == "production-release" ? "production" : "staging"}"
            ASSET_PREFIX = "${env.TAG_NAME == "production-release" ? "https://fe-project.zooniverse.org" : "https://fe-project.preview.zooniverse.org"}"
            COMMIT_ID = "${GIT_COMMIT}"
            SENTRY_DSN = 'https://2a50683835694829b4bc3cccc9adcc1b@sentry.io/1492691'
          }

          steps {
            dir ('packages/app-project') {
              script {
                def dockerRepoName = 'zooniverse/fe-project-${APP_ENV}'
                def dockerImageName = "${dockerRepoName}:${GIT_COMMIT}"
                def buildArgs = "--build-arg APP_ENV --build-arg ASSET_PREFIX --build-arg COMMIT_ID --build-arg SENTRY_DSN ."
                def newImage = docker.build(dockerImageName, buildArgs)
                newImage.push()
                newImage.push('latest')
              }
            }
          }
        }
      }
    }

    stage('Dry run deployments') {
       agent any
       steps {
         sh "sed 's/__IMAGE_TAG__/${GIT_COMMIT}/g' kubernetes/deployment-staging.tmpl | kubectl --context azure apply --dry-run=client --record -f -"
         sh "sed 's/__IMAGE_TAG__/${GIT_COMMIT}/g' kubernetes/deployment-production.tmpl | kubectl --context azure apply --dry-run=client --record -f -"
       }
     }

    stage('Deploy production to Kubernetes') {
      when { tag 'production-release' }
      agent any
      steps {
        sh "sed 's/__IMAGE_TAG__/${GIT_COMMIT}/g' kubernetes/deployment-production.tmpl | kubectl --context azure apply --record -f -"
      }
    }

    stage('Deploy staging to Kubernetes') {
      when { branch 'master' }
      agent any
      steps {
        sh "sed 's/__IMAGE_TAG__/${GIT_COMMIT}/g' kubernetes/deployment-staging.tmpl | kubectl --context azure apply --record -f -"
      }
    }
  }

  post {
    unsuccessful {
      slackSend (
        color: '#FF0000',
        message: "DEPLOY FAILED: Job '${JOB_NAME} [${BUILD_NUMBER}]' (${BUILD_URL})",
        channel: "#frontend-rewrite"
      )
    }
  }
}
