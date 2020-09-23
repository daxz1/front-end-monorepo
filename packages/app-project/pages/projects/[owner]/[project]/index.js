import { projects } from '@zooniverse/panoptes-js'
import fetchWorkflowsHelper from '@helpers/fetchWorkflowsHelper'
export { default } from '@screens/ProjectHomePage'

async function getProjectWorkflows([project], env) {
  const language = 'en'
  const { active_workflows, default_workflow } = project.links
  const workflows = await fetchWorkflowsHelper(language, active_workflows, default_workflow, env)
  return workflows
}

export async function getServerSideProps({ params, query, req, res }) {
  const { owner, project } = params
  const { env } = query
  const projectQuery = {
    env,
    slug: `${owner}/${project}`
  }
  const response = await projects.get({ query: projectQuery })
  const workflows = await getProjectWorkflows(response.body.projects, env)
  const props = { workflows }
  return ({ props })
}