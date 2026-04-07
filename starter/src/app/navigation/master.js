import { HomeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { getRoleId } from 'utils/auth'

const ROOT_DASHBOARDS = '/teacher'
const roleId = getRoleId()
const path = (root, item) => `${root}${item}`;

export const master = 
    roleId === 2 ?
{
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: ROOT_DASHBOARDS,
    title: 'Teacher Menu',
    Icon: AcademicCapIcon,
    childs: [
        {
            id: 'dashboards.questionbank',
            path: path(ROOT_DASHBOARDS, '/exam'),
            type: NAV_TYPE_ITEM, 
            title: 'Manage Question Bank',
            Icon: HomeIcon,
        },
        {
            id: 'dashboards.assignedexams',
            path: path(ROOT_DASHBOARDS, '/assigned-exams'),
            type: NAV_TYPE_ITEM, 
            title: 'Assigned Exams',
            Icon: HomeIcon,
        },
    ]

}
: null
