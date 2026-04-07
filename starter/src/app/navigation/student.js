import { HomeIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { getRoleId } from 'utils/auth'

const ROOT_DASHBOARDS = '/student'

const path = (root, item) => `${root}${item}`

const roleId = getRoleId()

export const student =
roleId === 3
    ? {
        id: 'student',
        type: NAV_TYPE_ROOT,
        path: ROOT_DASHBOARDS,
        title: 'Student',
        Icon: AcademicCapIcon,
        childs: [
            {
                id: 'student.dashboard',
                path: path(ROOT_DASHBOARDS, '/dashboard'),
                type: NAV_TYPE_ITEM,
                title: 'Dashboard',
                Icon: HomeIcon,
            },
            {
                id: 'student.exam',
                path: path(ROOT_DASHBOARDS, '/exam'),
                type: NAV_TYPE_ITEM,
                title: 'Ujian Saya',
                Icon: AcademicCapIcon,
            },
            {
                id: 'student.history',
                path: path(ROOT_DASHBOARDS, '/history'),
                type: NAV_TYPE_ITEM,
                title: 'Riwayat',
                Icon: ClockIcon,
            },
        ],
    }
    : null
