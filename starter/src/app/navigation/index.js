import { dashboards } from "./dashboards"
import { exam } from "./exam"
import { master } from "./master"

export const navigation = [
  dashboards,
  master,
  exam

].filter(Boolean)   

export { baseNavigation } from './baseNavigation'
