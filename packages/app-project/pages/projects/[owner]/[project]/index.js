import { projects } from '@zooniverse/panoptes-js'
import fetchWorkflowsHelper from '@helpers/fetchWorkflowsHelper'

export { default } from '@screens/ProjectHomePage'

export async function getServerSideProps({ params, query, req, res }) {
  const { owner, project } = params
  const { env } = query
  const projectQuery = {
    env,
    slug: `${owner}/${project}`
  }
  const response = await projects.get({ query: projectQuery })
  const [projectData] = response.body.projects
  const language = projectData.primary_language
  const { active_workflows, default_workflow } = projectData.links
  const workflows = await fetchWorkflowsHelper(language, active_workflows, default_workflow, env)
  const props = { workflows }
  return ({ props })
}