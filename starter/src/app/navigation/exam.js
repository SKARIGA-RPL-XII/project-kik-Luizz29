import { HomeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { getRoleId } from 'utils/auth'
const ROOT_DASHBOARDS = '/exam' 

const path = (root, item) => `${root}${item}`;
const roleId = getRoleId()
export const exam = 
roleId === 1 ?
{
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: ROOT_DASHBOARDS,
    title: 'Dashboards',
    Icon: AcademicCapIcon,
    childs: [
        {
            id: 'dashboards.exam',
            path: path(ROOT_DASHBOARDS, '/list'),
            type: NAV_TYPE_ITEM,
            title: 'Manage Exam',
            Icon: HomeIcon,
        },
    ]
}
: null
