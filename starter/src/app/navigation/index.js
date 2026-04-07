import { dashboards } from "./dashboards"
import { exam } from "./exam"
import { master } from "./master"
import { student } from "./student"

export const navigation = [
  dashboards,
  master,
  exam,
  student

].filter(Boolean)   

export { baseNavigation } from './baseNavigation'
