import { projects } from '@zooniverse/panoptes-js'
import fetchWorkflowsHelper from '@helpers/fetchWorkflowsHelper'
export { default } from '@screens/ProjectHomePage'

async function getProjectWorkflows([project]) {
  const workflows = await fetchWorkflowsHelper('en', project.links['active_workflows'], project.configuration['default_workflow'])
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
  const workflows = await getProjectWorkflows(response.body.projects)
  const props = { workflows }
  return ({ props })
}